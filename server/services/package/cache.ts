import { BentoCache, bentostore } from "bentocache";
import { fileDriver } from "bentocache/drivers/file";
import { memoryDriver } from "bentocache/drivers/memory";
import { Duration, Effect } from "effect";
import { ServerConfig } from "~~/server/config";
import { BentoCacheBackend, NoOpCacheBackend } from "~~/server/libs/cache";
import { makeCoalescingCache } from "~~/server/libs/cache";

export const makeCache = Effect.gen(function* () {
  const config = yield* ServerConfig;
  const fiberId = yield* Effect.fiberId;

  if (config.packages.cache.disabled) {
    yield* Effect.logWarning(
      "Package caching has been turned off due to SERVER_PACKAGES_CACHE_DISABLED=true",
    );
    return yield* makeCoalescingCache(new NoOpCacheBackend(), { fiberId });
  }

  const cacheDir = config.packages.cache.dir;

  const bento = new BentoCache({
    default: "default",
    stores: {
      default: bentostore()
        .useL1Layer(
          memoryDriver({
            maxSize: config.packages.cache.maxSize,
            maxItems: config.packages.cache.maxItems,
          }),
        )
        .useL2Layer(
          fileDriver({
            //TODO: on windows this is broken bc the drive sanitizes paths
            // C:\ becomes c/\
            //https://github.com/Julien-R44/bentocache/blob/c513aef166e13c60be13f5c7571ab6ee96c94dbe/packages/bentocache/src/drivers/file/file.ts#L89
            //so we can't use absolute paths for this on windows
            directory: cacheDir,
            pruneInterval: Duration.toMillis(Duration.seconds(config.packages.cache.pruneIntervalSeconds)),
          }),
        ),
    },
  });

  const cache = yield* makeCoalescingCache(new BentoCacheBackend(bento), {
    fiberId,
  });

  return cache;
});