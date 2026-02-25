import { Effect } from "effect";
import { isString } from "es-toolkit";
import { PackageOverview, PackageRelease } from "~~/libs/packages";
import { PackageProvider } from "~~/server/libs/provider";
import { NpmProviderInfo } from "~~/shared/providers/npm";

import { define } from "../../../libs/utils";

import { NpmClient, NpmClientLive } from "./client";

const makeNpmProvider = Effect.gen(function* () {
  const npmClient = yield* NpmClient;

  return {
    info: NpmProviderInfo,
    version: 2,
    getPackage(opts) {
      return Effect.gen(function* () {
        const result = yield* npmClient.getPackument(opts.name);

        let name = result.name;
        let owner: string | undefined;

        if (result.name.startsWith("@")) {
          const parts = result.name.split("/");
          if (parts && parts.length === 2) {
            owner = parts[0]?.substring(1); // Remove the @
            name = parts[1] || name;
          }
        }

        const sourceUrl = result.repository?.url?.replace(/^\+/, "").replace(/\.git$/, "");

        const urlBase = opts.effectiveExtra?.npmx ? "https://npmx.dev/package" : "https://npmjs.com";

        const overview = {
          owner: owner,
          name: name,
          providerName: "npm",
          url: `${urlBase}/${result.name}`,
          sourceUrl: sourceUrl,
        } satisfies PackageOverview;

        const tagsToGet = Array.isArray(opts.effectiveExtra?.tags) ? opts.effectiveExtra?.tags : ["latest"];

        yield* Effect.logDebug("NPM tags to fetch:", tagsToGet);

        const releases = tagsToGet
          .filter((t) => isString(t))
          .map((tag) => {
            const version = result["dist-tags"][tag];

            if (!version) return undefined;

            const versionData = result.versions[version];

            if (!versionData) return;

            const publishedAt = result.time[version];

            return define<PackageRelease>({
              version,
              createdAt: publishedAt ? new Date(publishedAt).toISOString() : undefined,
              name: versionData.name,
              tag: tag,
            });
          })
          .filter((t) => !!t);

        return {
          ...overview,
          releases,
        };
      });
    },
  } satisfies PackageProvider<typeof NpmProviderInfo>;
});

// Pre-composed provider variants
export const NpmProviderLive = makeNpmProvider.pipe(Effect.provideService(NpmClient, NpmClientLive));