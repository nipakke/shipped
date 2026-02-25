import { Effect, Layer, Stream, SubscriptionRef } from "effect";
import { UserConfigView } from "~~/libs/config/view";

import { ConfigViewCreateError } from "./errors";
import { UserConfigLoader, UserConfigLoaderLive } from "./loader";

export { ConfigViewCreateError } from "./errors";
export { UserConfigLoader, UserConfigLoaderLive } from "./loader";

export class UserConfigService extends Effect.Service<UserConfigService>()("userconfig-service", {
  accessors: true,
  scoped: Effect.gen(function* () {
    const loader = yield* UserConfigLoader;
    const { config } = loader;

    const initialRawConfig = yield* config.get;

    const initialView = yield* Effect.sync(() => UserConfigView.make(initialRawConfig)).pipe(
      Effect.tapError((error) => Effect.logError("Failed to create initial config view", error)),
      Effect.mapError((error) => new ConfigViewCreateError({ cause: error })),
    );

    const configView = yield* SubscriptionRef.make<UserConfigView>(initialView);

    const reloadConfigView = Effect.gen(function* () {
      const raw = yield* config.get;
      const newView = UserConfigView.make(raw);
      yield* SubscriptionRef.set(configView, newView);
      yield* Effect.logInfo("Config view updated");
    }).pipe(
      Effect.tapError((error) => Effect.logError("Failed to update config view, keeping previous", error)),
      Effect.catchAll(() => Effect.void),
    );

    yield* Stream.runForEach(config.changes, () => reloadConfigView).pipe(Effect.forkScoped);

    return {
      config,
      configView,
    };
  }),
}) {
  static live = UserConfigService.Default.pipe(Layer.provide(UserConfigLoaderLive));
}