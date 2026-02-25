# Environment Variables

> [!WARNING]
> This file is auto-generated from [`../server/config.ts`](../server/config.ts). Do not edit directly.

## SERVER
| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| SERVER_TRUST_PROXIES | boolean | - | Trust reverse proxies for client IPs. 'true': always trust. 'false': never trust (always uses direct remote address). Unset (default): auto-detects based on the connection. |

## SERVER_CONFIG
General server environment and file-watching configurations.

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| SERVER_CONFIG_DIR | string | "config" | Config files folder relative to process.cwd() or absolute. Default: 'config' |
| SERVER_CONFIG_WATCH_POLLING | boolean | false | Use polling instead of native FS events for config file watching. It is typically necessary to set this to true to successfully watch files over a network |

## SERVER_PACKAGES
| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| SERVER_PACKAGES_FETCH_CONCURRENCY | integer | 10 | Maximum number of parallel package fetch requests. |

## SERVER_PACKAGES_CACHE
Package Cache settings including TTL, sizing, and persistence options.

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| SERVER_PACKAGES_CACHE_DISABLED | boolean | false | - |
| SERVER_PACKAGES_CACHE_DIR | string | "cache" | Filesystem directory for persistent L2 cache storage. |
| SERVER_PACKAGES_CACHE_TTL | integer | 10800 | Recommended to not change this. This is the main cache TTL for packages, in seconds. |
| SERVER_PACKAGES_CACHE_MAX_SIZE | string | "50mb" | Maximum size for L1 memory cache. Default: 50mb |
| SERVER_PACKAGES_CACHE_MAX_ITEMS | integer | 2000 | Maximum items for L1 memory cache. Default: 2000 |
| SERVER_PACKAGES_CACHE_PRUNE_INTERVAL | integer | 1200 | Recommended to not change this. Interval in seconds for pruning expired cache entries. Default: 1200 (20 minutes) |
