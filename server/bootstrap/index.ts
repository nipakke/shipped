import { Cause, Effect, Exit } from "effect";
import type { NitroApp, NitroAppPlugin } from "nitropack";
import { inspect } from "node:util";

import { NodeEnvConfig, ServerConfig } from "../config";
import { AppRuntime } from "../main";

const program = Effect.fn("bootstrap")(function* (nitro: NitroApp) {
  //@ts-ignore
  nitro.context ||= {};
  nitro.context!.serverConfig = yield* ServerConfig;
  nitro.context!.nodeEnv = yield* NodeEnvConfig;

  yield* Effect.log(
    "ServerConfig",
    inspect(nitro.context!.serverConfig, { colors: true, depth: null, breakLength: 100 }),
  );

  yield* Effect.logInfo("Bootstrap done!");
});

const disposeRuntime = () =>
  AppRuntime.dispose().catch((err) => {
    console.error("Error disposing AppRuntime", err);
  });

// NOTE: There is a race condition here because Nitro does not await async plugins.
// To work around this, we create a promise for the bootstrap result and await it
// on every incoming request. Once the bootstrap completes, that await becomes
// a no-op (just resolving an already-resolved promise), so it's very fast and
// not a performance problem. It's a bit hacky, but it's the cleanest solution
// given Nitro's plugin architecture.
export const bootstrap: NitroAppPlugin = async (nitro) => {
  const bootstrapResPromise = AppRuntime.runPromiseExit(program(nitro));

  nitro.hooks.hook("close", async () => {
    console.info("Closing nitro...");
    await disposeRuntime();
    console.info("bye");
  });

  nitro.hooks.hook("request", async () => {
    await bootstrapResPromise;
  });

  const bootstrapRes = await bootstrapResPromise;

  if (Exit.isFailure(bootstrapRes)) {
    console.error("Boostrap:", Cause.pretty(bootstrapRes.cause));
    await disposeRuntime();

    process.exit(1);
  }
};