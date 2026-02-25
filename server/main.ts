import { NodeContext } from "@effect/platform-node";
import { Effect, Layer, Logger, LogLevel, ManagedRuntime, Option } from "effect";

import { ServerConfig, ServerConfigLive } from "./config";
import { ServicesLive } from "./services/layer";

export type AppRuntimeEnv = Layer.Layer.Success<typeof AppLive>;

// const LogLevelLive = Logger.minimumLogLevel(LogLevel.Debug);

// Load the log level from the configuration and apply it as a layer
const LogLevelLive = ServerConfig.pipe(
  Effect.andThen((config) =>
    // Set the minimum log level
    Logger.minimumLogLevel(Option.getOrElse(config.logLevel, () => LogLevel.Info)),
  ),
  Layer.unwrapEffect, // Convert the effect into a layer
);

export const AppLive = Layer.empty.pipe(
  Layer.provideMerge(ServicesLive),
  Layer.provide(ServerConfigLive),
  Layer.provideMerge(Layer.scope),
  Layer.provide(Logger.pretty),
  Layer.provide(LogLevelLive),
  // Layer.provide(Logger.minimumLogLevel(LogLevel.Debug)),
  Layer.provideMerge(NodeContext.layer),
);

export const AppRuntime = ManagedRuntime.make(AppLive);

export const runAppPromise = <A, E>(
  effect: Effect.Effect<A, E, AppRuntimeEnv>,
  spanName = "AppRuntime.runPromise",
  options?: Parameters<typeof AppRuntime.runPromise>[1] | undefined,
) => AppRuntime.runPromise(Effect.withSpan(effect, spanName), options);

export const runAppPromiseExit = async <A, E>(
  effect: Effect.Effect<A, E, AppRuntimeEnv>,
  spanName = "AppRuntime.runPromiseExit",
  options?: Parameters<typeof AppRuntime.runPromiseExit>[1] | undefined,
) => AppRuntime.runPromiseExit(Effect.withSpan(effect, spanName), options);