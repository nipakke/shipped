import { Effect, Layer } from "effect";
import type { PackageProvider } from "~~/server/libs/provider";
import { ProviderFactories } from "~~/server/providers";

import { ProviderNotFoundError } from "./errors";

export class ProviderService extends Effect.Service<ProviderService>()("provider-service", {
  effect: Effect.gen(function* () {
    const providers = yield* Effect.all(yield* ProviderFactories);

    yield* Effect.logDebug("Initializing providers", {
      count: providers.length,
      providers: providers.map((p) => p.info.id).join(", "),
    });

    const providersMap = new Map<string, PackageProvider<any>>(providers.map((p) => [p.info.id, p]));

    const get = (id: string) =>
      Effect.gen(function* () {
        const provider = providersMap.get(id);

        if (!provider) {
          yield* Effect.logWarning("Provider not found", {
            id,
            supported: Array.from(providersMap.keys()).join(", "),
          });
          return yield* new ProviderNotFoundError({
            id: id,
            supported: Array.from(providersMap.keys()),
          });
        }

        yield* Effect.logDebug("Provider selected", { id: provider.info.id, name: provider.info.name });

        return provider;
      });

    return {
      get,
    };
  }),
}) {
  static live = ProviderService.Default.pipe(Layer.provide(ProviderFactories.live));
}