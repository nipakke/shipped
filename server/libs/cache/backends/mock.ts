import { Duration, Effect } from "effect";

import { GetOptions, SetOptions, CacheBackend } from "../types";

/**
 * Mock cache backend for testing.
 * Stores data in memory with optional TTL support.
 */
export class MockCacheBackend implements CacheBackend {
  private store = new Map<string, { value: any; expiry?: number }>();

  get(options: GetOptions) {
    return Effect.sync(() => {
      const item = this.store.get(options.key);

      if (!item) return undefined;
      if (item.expiry && Date.now() > item.expiry) {
        this.store.delete(options.key);
        return undefined;
      }
      return item.value;
    });
  }

  set<A>(options: SetOptions<A>) {
    return Effect.sync(() => {
      const expiry = options.ttl ? Date.now() + Duration.toMillis(options.ttl) : undefined;
      this.store.set(options.key, { value: options.value, expiry });
      return true;
    });
  }

  // Helpers for testing
  clear() {
    this.store.clear();
  }

  size() {
    return this.store.size;
  }
}