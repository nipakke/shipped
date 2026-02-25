import { ConfigProvider, Config, Layer } from "effect";
import path, { join } from "node:path";

const resolveDir = (configuredDir: string): string => {
  const isAbsolutePath = path.isAbsolute(configuredDir);
  return isAbsolutePath ? configuredDir : join(process.cwd(), configuredDir);
};

const packagesCache = Config.nested("CACHE")(
  Config.all({
    disabled: Config.boolean("DISABLED").pipe(Config.withDefault(false)),
    dir: Config.string("DIR").pipe(
      Config.withDefault("cache"),
      Config.map(resolveDir),
      Config.withDescription("Filesystem directory for persistent L2 cache storage."),
    ),
    ttl: Config.integer("TTL").pipe(
      Config.withDefault(10800),
      Config.withDescription(
        "Recommended to not change this. This is the main cache TTL for packages, in seconds.",
      ),
    ),
    maxSize: Config.string("MAX_SIZE").pipe(
      Config.withDefault("50mb"),
      Config.withDescription("Maximum size for L1 memory cache. Default: 50mb"),
    ),
    maxItems: Config.integer("MAX_ITEMS").pipe(
      Config.withDefault(2000),
      Config.withDescription("Maximum items for L1 memory cache. Default: 2000"),
    ),
    pruneIntervalSeconds: Config.integer("PRUNE_INTERVAL").pipe(
      Config.withDefault(1200),
      Config.withDescription(
        "Recommended to not change this. Interval in seconds for pruning expired cache entries. Default: 1200 (20 minutes)",
      ),
    ),
  }).pipe(Config.withDescription("Package Cache settings including TTL, sizing, and persistence options.")),
);

const packagesConfig = Config.nested("PACKAGES")(
  Config.all({
    cache: packagesCache,
    fetchConcurrency: Config.integer("FETCH_CONCURRENCY").pipe(
      Config.withDefault(10),
      Config.withDescription("Maximum number of parallel package fetch requests."),
    ),
  }),
);

const userConfig = Config.nested("CONFIG")(
  Config.all({
    cwd: Config.string("DIR").pipe(
      Config.withDefault("config"),
      Config.map(resolveDir),
      Config.withDescription("Config files folder relative to process.cwd() or absolute. Default: 'config'"),
    ),
    usePolling: Config.boolean("WATCH_POLLING").pipe(
      Config.withDefault(false),
      Config.withDescription(
        "Use polling instead of native FS events for config file watching. It is typically necessary to set this to true to successfully watch files over a network",
      ),
    ),
  }).pipe(Config.withDescription("General server environment and file-watching configurations.")),
);

export const ServerConfig = Config.nested("SERVER")(
  Config.all({
    trustProxies: Config.boolean("TRUST_PROXIES").pipe(
      Config.option,
      Config.withDescription(
        "Trust reverse proxies for client IPs. 'true': always trust. 'false': never trust (always uses direct remote address). Unset (default): auto-detects based on the connection.",
      ),
    ),
    userConfig,
    packages: packagesConfig,
    logLevel: Config.logLevel("LOG_LEVEL").pipe(Config.option),
  }),
);

export const NodeEnvConfig = Config.literal(
  "production",
  "development",
)("NODE_ENV").pipe(Config.withDefault("production"));

export const ServerConfigProviderLive = ConfigProvider.fromEnv({
  pathDelim: "_",
  seqDelim: ",",
});

export const ServerConfigLive = Layer.setConfigProvider(ServerConfigProviderLive);