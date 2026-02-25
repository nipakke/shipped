import { Effect, Deferred, Option, Either, Exit, Data, MutableHashMap, FiberId, Duration } from "effect";
import { isNil } from "es-toolkit";
import { hash } from "ohash";

import { CacheBackend, GetOrSetOptions } from "./types";

/* @internal */
class Stats {
  hits = 0;
  misses = 0;
  deferred = 0;

  track(name: keyof Omit<Stats, "track">, n = 1) {
    this[name] += n;
  }
}

/* @internal */
interface CachedValue<A> {
  data: A;
}

/* @internal */
function cacheValue<A>(data: any): CachedValue<A> {
  return Data.struct({
    data,
  });
}

/**
 * TODO: only fail getOrSet if the value is an actual error. not on null or undefined
 */
export const makeCoalescingCache = (backend: CacheBackend, opts: { fiberId: FiberId.FiberId }) =>
  Effect.sync(() => {
    const fiberId = opts.fiberId;
    const inflight = MutableHashMap.empty<string, Deferred.Deferred<any, any>>();

    const stats = new Stats();

    /* @internal */
    const completeDeferred = <A, E>(key: string, exit: Exit.Exit<A, E>) =>
      Effect.gen(function* () {
        const deferred = MutableHashMap.get(inflight, key).pipe(Option.getOrThrow);
        yield* Deferred.completeWith(deferred, exit);
        MutableHashMap.remove(inflight, key);
      });

    const getOrSetEither = <A, E, R>(
      opts: GetOrSetOptions<A, E, R>,
    ) /* : Effect.Effect<Either.Left<E, A> | Either.Right<E, A>, never, R> */ =>
      Effect.suspend(() => {
        const { factory, ttl } = opts;

        const keyHash = hash(opts.key);
        const { namespace } = opts;
        const key = namespace ? `${namespace}:${keyHash}` : keyHash;

        let deferred = MutableHashMap.get<string, Deferred.Deferred<A, E>>(inflight, key).pipe(
          Option.getOrUndefined,
        );

        if (deferred === undefined) {
          //main
          deferred = Deferred.unsafeMake<A, E>(fiberId);
          MutableHashMap.set(inflight, key, deferred);

          return Effect.gen(function* () {
            const cachedValue = yield* backend.get<CachedValue<A>>({
              key,
            });

            if (cachedValue) {
              stats.track("hits");

              const either = Either.right(cachedValue.data);
              yield* completeDeferred(key, Exit.fromEither(either));

              return either;
            }

            stats.track("misses");

            const factoryEither = yield* Effect.either(factory);
            yield* completeDeferred(key, Exit.fromEither(factoryEither));

            if (Either.isRight(factoryEither)) {
              const policy = opts.policy?.(factoryEither.right);

              //if cacheNil is false, not caching an undefined or null value
              //but it's not a fail. factory result is returned
              if (policy?.cacheNil === true || !isNil(factoryEither.right)) {
                yield* backend.set({
                  key,
                  value: cacheValue(factoryEither.right),
                  ttl: policy?.ttl ?? ttl ?? Duration.seconds(5),
                });
              }
            }

            return factoryEither;
          });
        } else {
          //deferred
          return Effect.gen(function* () {
            stats.track("deferred");

            return yield* Effect.either(Deferred.await(deferred!));
          });
        }
      });

    const getOrSet = <A, E, R>(opts: GetOrSetOptions<A, E, R>): Effect.Effect<A, E, R> => {
      return getOrSetEither(opts).pipe(Effect.flatten);
    };

    const cached = <A, E, R>(options: Omit<GetOrSetOptions<A, E, R>, "factory">) => {
      return (e: Effect.Effect<A, E, R>) =>
        getOrSetEither({
          ...options,
          factory: e,
        }).pipe(Effect.flatten);
    };

    return {
      getOrSet,
      getOrSetEither,
      cached,
      stats,
    };
  });