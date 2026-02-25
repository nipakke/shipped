export { makeCoalescingCache } from "./coalescing-cache";
export type {
  CacheBackend,
  CoalescingCache,
  GetOrSetOptions,
  Policy,
  GetOptions,
  SetOptions,
  CacheStats,
} from "./types";
export { BentoCacheBackend, MockCacheBackend, NoOpCacheBackend } from "./backends/index";