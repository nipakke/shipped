import { Effect } from "effect";
import { clamp } from "es-toolkit";
import { PackageOverview, PackageRelease } from "~~/libs/packages";
import { InvalidPackageNameError, PackageProvider } from "~~/server/libs/provider";
import { PythonProviderInfo } from "~~/shared/providers/python";

import { PythonClient, PythonClientLive } from "./client";

const PYPI_PROJECT_URL = "https://pypi.org/project/";

const extractOwnerFromSourceUrl = (sourceUrl: string | undefined): string | undefined => {
  if (!sourceUrl) return undefined;

  // Try to extract owner/repo from GitHub URLs
  const githubMatch = sourceUrl.match(/github\.com\/([^/]+)/);
  if (githubMatch) {
    return githubMatch[1];
  }

  return undefined;
};

const makePythonProvider = Effect.gen(function* () {
  const pythonClient = yield* PythonClient;

  return {
    info: PythonProviderInfo,
    version: 1,
    getPackage(opts) {
      return Effect.gen(function* () {
        const { name, effectiveExtra } = opts;

        if (!name || name.trim() === "") {
          return yield* new InvalidPackageNameError({ name, provider: "python" });
        }

        const result = yield* pythonClient.getPackageData(name);

        const packageName = result.info.name || name;

        // Try to get owner from project_urls.Source (GitHub URL) or author
        const sourceUrl = result.info.project_urls?.Source || result.info.home_page || undefined;
        const owner = extractOwnerFromSourceUrl(sourceUrl) || result.info.author || undefined;

        const overview = PackageOverview.make({
          name: packageName,
          owner: owner,
          providerName: "python",
          url: `${PYPI_PROJECT_URL}${packageName}/`,
          sourceUrl: sourceUrl,
          description: result.info.summary,
        });

        // Get maxReleases from extra or provider config, default to 5, clamp to min 10
        const maxReleases = Number(effectiveExtra?.maxReleases ?? 5);
        const releasesLimit = Number.isFinite(maxReleases) ? clamp(maxReleases, 10) : 5;

        // Process releases: extract all versions with their upload times, sort by date, take last N
        const releases = Object.entries(result.releases)
          .map(([version, files]) => {
            // Get the first file's upload time (they should all be similar for a version)
            const firstFile = files[0];
            if (!firstFile?.upload_time_iso_8601) {
              return null;
            }

            return {
              version,
              createdAt: firstFile.upload_time_iso_8601,
            };
          })
          .filter((r): r is NonNullable<typeof r> => r !== null)
          // Sort by upload time descending (newest first)
          .toSorted((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          // Take the last N releases
          .slice(0, releasesLimit)
          .map((r) =>
            PackageRelease.make({
              version: r.version,
              createdAt: r.createdAt,
              name: packageName,
              tag: r.version,
            }),
          );

        return {
          ...overview,
          releases,
        };
      });
    },
  } satisfies PackageProvider<typeof PythonProviderInfo>;
});

// Pre-composed provider variants
export const PythonProviderLive = makePythonProvider.pipe(
  Effect.provideService(PythonClient, PythonClientLive),
);