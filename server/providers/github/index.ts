import { Effect } from "effect";
import { clamp } from "es-toolkit";
import { PackageOverview, PackageRelease } from "~~/libs/packages/schema";
import { InvalidPackageNameError, PackageProvider } from "~~/server/libs/provider";
import { GithubProviderInfo } from "~~/shared/providers/github";

import { GithubClient, GithubClientLive, GithubRelease } from "./client";

const GH_BASE_URL = "https://github.com";

export const makeGithubProvider = Effect.gen(function* () {
  const githubClient = yield* GithubClient;
  return {
    info: GithubProviderInfo,
    version: 1,
    getPackage(opts) {
      const { name, effectiveExtra } = opts;

      return Effect.gen(function* () {
        const [owner, repo] = name.split("/");

        if (!owner || !repo) {
          return yield* new InvalidPackageNameError({ name, provider: "github" });
        }

        const repoData = yield* githubClient.getRepo(owner, repo);

        const overview = PackageOverview.make({
          name: repo, // Use just the repo name
          owner: owner, // Set the owner field
          providerName: "github",
          url: `https://github.com/${repoData.repo.repo}`,
          sourceUrl: `https://github.com/${repoData.repo.repo}`,
        });

        const releasesResponse = yield* githubClient.getReleases(owner, repo);

        const maxReleases = Number(effectiveExtra?.maxReleases);

        const latestReleases = releasesResponse.releases
          //if "includePreleases" flag is true then return all
          //otherwise filter out prereleases
          .filter((t: GithubRelease) => {
            return (
              !!t &&
              (effectiveExtra?.includePrereleases === true || !t.prerelease) &&
              //drafts are always out rn.
              t.draft != true
            );
          })
          .slice(0, Number.isFinite(maxReleases) ? clamp(maxReleases, 10) : 5);

        const validReleases = latestReleases.map((t: GithubRelease) =>
          PackageRelease.make({
            name: t.name,
            version: t.tag!,
            tag: t.tag,
            createdAt: t.publishedAt ? new Date(t.publishedAt).toISOString() : undefined,
            url: t.tag ? `${GH_BASE_URL}/${owner}/${repo}/releases/tag/${t.tag}` : undefined,
          }),
        );

        return {
          ...overview,
          releases: validReleases,
        };
      });
    },
  } satisfies PackageProvider<typeof GithubProviderInfo>;
});

// Pre-composed provider variants
export const GithubProviderLive = makeGithubProvider.pipe(
  Effect.provideService(GithubClient, GithubClientLive),
);