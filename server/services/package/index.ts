import { Effect, Duration, pipe, Layer, TSemaphore } from "effect";
import { PackageConfigView } from "~~/libs/config/view";
import { slugify } from "~~/libs/strings/slugify";
import { ServerConfig } from "~~/server/config";
import { PackageNotFoundError } from "~~/server/libs/provider";
import { UserConfigService } from "~~/server/services/config";
import { UnconfiguredPackageError } from "~~/server/services/package/errors";

import { ProviderService } from "../provider";

import { makeCache } from "./cache";

const implVersion = 1;

export class PackageService extends Effect.Service<PackageService>()("package-service", {
  accessors: true,
  effect: Effect.gen(function* () {
    const providerRegistry = yield* ProviderService;
    const config = yield* UserConfigService;
    const serverConfig = yield* ServerConfig;
    const cache = yield* makeCache;
    const semaphore = yield* TSemaphore.make(10 /* serverConfig.packages.fetchConcurrency */);

    const packageCacheTtl = Duration.seconds(serverConfig.packages.cache.ttl);

    const getPackageConfig = (pkgOrHash: PackageConfigView | string) =>
      Effect.gen(function* () {
        const view = yield* config.configView.get;

        const hash = typeof pkgOrHash === "string" ? pkgOrHash : PackageConfigView.hash(pkgOrHash);

        const pkgConfig = view.packageMap.get(hash);

        if (!pkgConfig) {
          return yield* new UnconfiguredPackageError({
            hash,
          });
        }

        return pkgConfig;
      });

    const getOne = (pkg: PackageConfigView) =>
      Effect.gen(function* () {
        yield* Effect.logDebug("Getting package", {
          packageId: pkg.packageId,
          provider: pkg.provider,
          name: pkg.name,
        });

        const provider = yield* providerRegistry.get(pkg.provider);

        yield* Effect.logDebug("Using provider", {
          providerName: provider.info.name,
          providerVersion: provider.version,
        });

        // namespace format: <provider-name>-<provider-version>-package_v-<impl_version> (slugified)
        const namespace = slugify(
          [provider.info.name, provider.version, "package", "v", implVersion].toString(),
        );

        yield* Effect.logDebug("Checking cache", { key: pkg.packageId, namespace });

        return yield* provider.getPackage(pkg).pipe(
          TSemaphore.withPermit(semaphore),
          Effect.tap((data) => Effect.logDebug("Package fetched", { found: !!data })),
          Effect.map((data) => ({
            ...data,
            updatedAt: new Date().toISOString(),
          })),
          // Convert NotFound errors to undefined so they can be cached
          Effect.catchTag("PackageNotFound", () =>
            Effect.zipRight(
              Effect.logDebug("Package not found, caching negative result"),
              // @effect-diagnostics-next-line effectSucceedWithVoid:off
              Effect.succeed(undefined),
            ),
          ),
          // Cache both successful results and "not found" (undefined)
          cache.cached({
            key: pkg.packageId,
            namespace,
            ttl: packageCacheTtl,
            policy(data) {
              return {
                //if package is not found cache it only for a shorter time
                ttl: data === undefined ? Duration.minutes(10) : packageCacheTtl,
                cacheNil: true,
              };
            },
          }),
          // Restore the NotFound error after cache check
          Effect.filterOrFail(
            (data): data is NonNullable<typeof data> => data !== undefined,
            () =>
              new PackageNotFoundError({
                name: pkg.name,
                provider: pkg.provider,
              }),
          ),
        );
      });

    const getOneById = (id: string) => pipe(getPackageConfig(id), Effect.flatMap(getOne));

    return {
      getOne,
      getOneById,
    };
  }),
}) {
  static live = PackageService.Default.pipe(Layer.provide(ProviderService.live));
}