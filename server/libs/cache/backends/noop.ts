import { Effect } from "effect";

import type { GetOptions, SetOptions, CacheBackend } from "../types";

/**
 * No-op cache backend that never stores or retrieves values.
 * Useful for disabling caching in development.
 */
export class NoOpCacheBackend implements CacheBackend {
  get<A>(_options: GetOptions): Effect.Effect<A> {
    return Effect.succeed(undefined as A);
  }

  set<A>(_options: SetOptions<A>) {
    return Effect.succeed(true);
  }
}