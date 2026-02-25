import { Duration, Effect, Either } from "effect";

/* @internal */
type CommonOptions = {
  key: string;
};

export type GetOptions = {
  key: string;
};

export type SetOptions<A> = CommonOptions & {
  value: A;
  ttl?: Duration.Duration;
};

export type Policy<A> = (data: A) => Partial<{
  ttl: Duration.Duration;
  cacheNil: boolean;
}> | void;

export type GetOrSetOptions<A, E, R> = CommonOptions & {
  factory: Effect.Effect<A, E, R>;
  ttl?: Duration.Duration;
  namespace?: string;

  /**
   * whether or not cache undefined and null
   */
  cacheNil?: boolean;

  /**
   * Dynamically overrides cache options based on the factory result.
   * Called after the factory resolves and before the value is cached.
   * Returned values override the static options for this entry only.
   */
  policy?: Policy<A>;
};

export interface CacheBackend {
  get: <A>(options: GetOptions) => Effect.Effect<A>;
  set: <A>(options: SetOptions<A>) => Effect.Effect<boolean>;
}

export interface CacheStats {
  hits: number;
  misses: number;
  deferred: number;
}

export interface CoalescingCache {
  getOrSet: <A, E, R>(opts: GetOrSetOptions<A, E, R>) => Effect.Effect<A, E, R>;
  getOrSetEither: <A, E, R>(opts: GetOrSetOptions<A, E, R>) => Effect.Effect<Either.Either<A, E>, never, R>;
  cached: <A, E, R>(
    options: Omit<GetOrSetOptions<A, E, R>, "factory">,
  ) => (e: Effect.Effect<A, E, R>) => Effect.Effect<A, E, R>;
  stats: CacheStats;
}