import { expect, it, describe } from "@effect/vitest";
import { Duration, Effect } from "effect";

import { makeCoalescingCache, MockCacheBackend, Policy } from "./index";

const makeTestCache = Effect.gen(function* () {
  return yield* makeCoalescingCache(new MockCacheBackend(), {
    fiberId: yield* Effect.fiberId,
  });
});

describe("CoalescingCache", () => {
  it.effect("caches factory results", () =>
    Effect.gen(function* () {
      const cache = yield* makeTestCache;
      const factory = Effect.sync(() => "value");

      yield* cache.getOrSet({ key: "k", factory, ttl: Duration.seconds(10) });
      expect(cache.stats.misses).toBe(1);

      yield* cache.getOrSet({ key: "k", factory, ttl: Duration.seconds(10) });
      expect(cache.stats.hits).toBe(1);
    }),
  );

  it.effect("deduplicates concurrent requests", () =>
    Effect.gen(function* () {
      const cache = yield* makeTestCache;
      // yieldNow ensures other concurrent requests arrive while factory is still running,
      // so they get deferred instead of hitting the cache after factory completes
      const factory = Effect.gen(function* () {
        yield* Effect.yieldNow();
        return "x";
      });
      const prog = cache.getOrSet({ key: "k", factory, ttl: Duration.seconds(10) });

      yield* Effect.all([prog, prog, prog], { concurrency: "unbounded" });

      expect(cache.stats.misses).toBe(1);
      expect(cache.stats.deferred).toBe(2);
    }),
  );

  it.effect("does not cache errors", () =>
    Effect.gen(function* () {
      const cache = yield* makeTestCache;
      const factory = Effect.fail("error");

      yield* cache.getOrSetEither({ key: "k", factory });
      expect(cache.stats.misses).toBe(1);

      yield* cache.getOrSetEither({ key: "k", factory });
      expect(cache.stats.misses).toBe(2); // Error not cached, factory runs again
    }),
  );

  it.effect("handles nil caching based on cacheNil option", () =>
    Effect.gen(function* () {
      const cache = yield* makeTestCache;

      const cacheNilPolicy: Policy<unknown> = () => ({ cacheNil: true, ttl: Duration.seconds(10) });
      const noCacheNilPolicy: Policy<unknown> = () => ({ cacheNil: false, ttl: Duration.seconds(10) });

      // WITH cacheNil: true - nil values ARE cached
      yield* cache
        .getOrSet({ key: "cached-null", factory: Effect.succeed(null), policy: cacheNilPolicy })
        .pipe(Effect.repeat({ times: 1 }));
      expect(cache.stats.misses).toBe(1);
      expect(cache.stats.hits).toBe(1);

      yield* cache
        .getOrSet({ key: "cached-undefined", factory: Effect.succeed(undefined), policy: cacheNilPolicy })
        .pipe(Effect.repeat({ times: 1 }));
      expect(cache.stats.misses).toBe(2);
      expect(cache.stats.hits).toBe(2);

      // WITH cacheNil: false - nil values are NOT cached
      yield* cache
        .getOrSet({ key: "not-cached-null", factory: Effect.succeed(null), policy: noCacheNilPolicy })
        .pipe(Effect.repeat({ times: 1 }));
      expect(cache.stats.misses).toBe(4); // Factory ran twice, no hits

      yield* cache
        .getOrSet({
          key: "not-cached-undefined",
          factory: Effect.succeed(undefined),
          policy: noCacheNilPolicy,
        })
        .pipe(Effect.repeat({ times: 1 }));
      expect(cache.stats.misses).toBe(6); // Factory ran twice more
      expect(cache.stats.hits).toBe(2); // Still only 2 hits from the cached nils
    }),
  );
});