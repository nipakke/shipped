import { FileSystem } from "@effect/platform";
import { Context, Effect, Exit, Layer, Schedule, Stream, SubscriptionRef } from "effect";
import { UserConfig } from "~~/libs/config/schemas";
import { ServerConfig } from "~~/server/config";
import { watch } from "~~/server/libs/chokidar";

import { ConfigLoadError } from "../errors";

import { generalAdapter } from "./adapters/general";
import { listsAdapter } from "./adapters/lists";
import { providersAdapter } from "./adapters/providers";
import { uiAdapter } from "./adapters/ui";
import { createConfigLoader } from "./loader";

export class UserConfigLoader extends Context.Tag("infra/config-loader")<
  UserConfigLoader,
  {
    config: SubscriptionRef.SubscriptionRef<UserConfig>;
  }
>() {}

export const UserConfigLoaderLive = Layer.scoped(
  UserConfigLoader,
  Effect.gen(function* () {
    const serverConfig = yield* ServerConfig;
    const fs = yield* FileSystem.FileSystem;
    const configDir = serverConfig.userConfig.cwd;

    yield* Effect.logInfo("Initializing config loader", { configDir });

    yield* fs.makeDirectory(configDir, {
      recursive: true,
    });

    const configLoaders = yield* Effect.all({
      lists: createConfigLoader(listsAdapter, configDir),
      general: createConfigLoader(generalAdapter, configDir),
      ui: createConfigLoader(uiAdapter, configDir),
      providers: createConfigLoader(providersAdapter, configDir),
    });

    const loadConfig = Effect.gen(function* () {
      yield* Effect.logDebug("Loading config files...");

      const exit = yield* Effect.all(configLoaders, {
        concurrency: "unbounded",
      }).pipe(Effect.exit);

      if (Exit.isSuccess(exit)) {
        const { general, ui, lists, providers } = exit.value;

        const warnings = [general.warnings, ui.warnings, lists.warnings, providers.warnings].flat();

        if (warnings.length > 0) {
          yield* Effect.logWarning(`Config loaded with ${warnings.length} warning(s)`);
          for (const warning of warnings) {
            const logFn = warning.severity === "error" ? Effect.logError : Effect.logWarning;
            yield* logFn(warning.message, {
              group: warning.group,
              details: warning.details,
            });
          }
        }

        const newConfig = UserConfig.make({
          ui: ui.value,
          lists: lists.value,
          general: general.value,
          providers: providers.value,
          warnings,
        });

        yield* Effect.logInfo("Config loaded successfully", {
          hasWarnings: warnings.length > 0,
          warningCount: warnings.length,
        });

        return newConfig;
      } else {
        yield* Effect.logError("Config load failed", exit.cause);
        return yield* new ConfigLoadError({ cause: exit.cause });
      }
    }).pipe(
      Effect.tap(() => Effect.logDebug("Config parse complete")),
      Effect.catchAllDefect((e) => Effect.fail(new ConfigLoadError({ cause: e }))),
      Effect.withSpan("LoadConfig"),
      Effect.withLogSpan("loadConfig"),
    );

    const initialConfig = yield* loadConfig.pipe(
      Effect.tapError((error) => Effect.logError("Failed to load config, retrying in 2s...", error)),
      Effect.retry({
        times: 5,
        schedule: Schedule.spaced("2 second"),
      }),
      Effect.tap(() => Effect.logInfo("Initial config loaded successfully")),
    );

    const userConfig = yield* SubscriptionRef.make<UserConfig>(initialConfig);

    const applyConfig = (config: UserConfig) =>
      SubscriptionRef.set(userConfig, config).pipe(
        Effect.tap(() => Effect.logDebug("Config applied to subscription ref")),
        Effect.withSpan("ApplyConfig"),
      );

    const reloadConfig = Effect.gen(function* () {
      yield* Effect.logInfo("Reloading config due to file change...");
      const newConfig = yield* loadConfig;
      yield* applyConfig(newConfig);
      yield* Effect.logInfo("Config reloaded successfully");
    }).pipe(
      Effect.tapError((error) => Effect.logError("Failed to reload config, keeping previous config", error)),
      Effect.catchAll(() => Effect.void),
      Effect.withSpan("ReloadConfig"),
      Effect.withLogSpan("reloadConfig"),
    );

    yield* Effect.logDebug("Starting config file watcher", {
      configDir,
      usePolling: serverConfig.userConfig.usePolling,
    });

    yield* watch(".", {
      cwd: configDir,
      ignoreInitial: true,
      persistent: true,
      interval: 150,
      binaryInterval: 1000,
      usePolling: serverConfig.userConfig.usePolling,

      awaitWriteFinish: {
        pollInterval: 100,
        stabilityThreshold: 100,
      },
      events: ["add", "change", "unlink"],
      ignored: (path, stats) => !!stats?.isFile() && !path.toLowerCase().endsWith(`.yaml`),
    }).pipe(
      Effect.flatMap(({ stream }) =>
        Stream.runForEach(
          stream.pipe(
            Stream.tap((event) =>
              Effect.logDebug("Config file change detected", { event: event.event, path: event.path }),
            ),
            Stream.tapError((error) => Effect.logError("File watcher error (retrying in 2s)", error)),
            Stream.retry(Schedule.spaced("2 second")),
            Stream.debounce("0.3 seconds"),
          ),
          () => reloadConfig,
        ),
      ),
      Effect.forkScoped,
    );

    return {
      config: userConfig,
    };
  }),
);