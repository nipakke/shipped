import { Duration, Effect, Either, Schedule } from "effect";
import { isString } from "es-toolkit";
import { Package, PackageOverview, PackageRelease } from "~~/libs/packages";
import { InvalidPackageNameError, type PackageProvider } from "~~/server/libs/provider";
import { DockerProviderInfo } from "~~/shared/providers/docker";

import { DockerClient, DockerClientLive, type DockerTag } from "./client";

const DOCKER_HUB_URL = "https://hub.docker.com/r";

const parseDockerName = (name: string): { namespace: string; imageName: string } | null => {
  // Handle names like "node" (official images) -> library/node
  // Handle names like "username/image" or "org/image" -> username/image
  const parts = name.split("/");

  if (parts.length === 1 && parts[0]) {
    // Official image
    return { namespace: "library", imageName: parts[0] };
  } else if (parts.length === 2 && parts[0] && parts[1]) {
    // User/org image
    return { namespace: parts[0], imageName: parts[1] };
  }

  // Invalid format
  return null;
};

const makeDockerProvider = Effect.gen(function* () {
  const dockerClient = yield* DockerClient;

  return {
    info: DockerProviderInfo,
    version: 1,
    getPackage(opts) {
      return Effect.gen(function* () {
        const { name, effectiveExtra } = opts;

        if (!name || name.trim() === "") {
          return yield* new InvalidPackageNameError({ name, provider: "docker" });
        }

        const parsed = parseDockerName(name);

        if (!parsed) {
          return yield* new InvalidPackageNameError({ name, provider: "docker" });
        }

        const { namespace, imageName } = parsed;

        const repoData = yield* dockerClient.getRepository(namespace, imageName);

        /* const overview = PackageOverview.make({
          name: imageName,
          owner: namespace === "library" ? undefined : namespace,
          providerName: "docker",
          url: `${DOCKER_HUB_URL}/${namespace}/${imageName}`,
          description: repoData.description,
          stars: repoData.star_count,
        }); */

        // Get tags to fetch from extra or provider config, default to ["latest", "slim", "alpine"]
        const tagsToGet = Array.isArray(effectiveExtra?.tags)
          ? effectiveExtra?.tags
          : ["latest", "slim", "alpine"];

        yield* Effect.logDebug("Docker tags to fetch:", tagsToGet);

        // Fetch each tag individually using Either to handle success/failure independently
        const tagResults = yield* Effect.all(
          tagsToGet
            .filter((t): t is string => isString(t))
            .map((tagName) =>
              dockerClient.getTag(namespace, imageName, tagName).pipe(
                Effect.retry({
                  times: 2,
                  schedule: Schedule.exponential(Duration.seconds(1), 1.5),
                  while(error) {
                    return error._tag === "Network";
                  },
                }),
                Effect.either,
              ),
            ),
          { concurrency: 5 },
        );

        // Process results - only include successful ones
        const releases = tagResults
          .filter((res): res is Either.Right<never, DockerTag> => {
            return (
              Either.isRight(res) &&
              //some releases doesn't have a valid release fsr so filter those out
              !!res.right.digest
            );
          })
          .map((result) => {
            const tag = result.right;

            return PackageRelease.make({
              version: tag.name,
              name: tag.name,
              tag: tag.name,
              createdAt: tag.tag_last_pushed || tag.last_updated,
              url: `${DOCKER_HUB_URL}/${namespace}/${imageName}/tags/${tag.name}`,
            });
          });

        const overview = PackageOverview.make({
          name: imageName,
          owner: namespace === "library" ? undefined : namespace,
          providerName: "docker",
          url: `${DOCKER_HUB_URL}/${namespace}/${imageName}`,
          description: repoData.description,
          stars: repoData.star_count,
        });

        return {
          ...overview,
          releases,
        } satisfies Package;
      });
    },
  } satisfies PackageProvider<typeof DockerProviderInfo>;
});

// Pre-composed provider variants
export const DockerProviderLive = makeDockerProvider.pipe(
  Effect.provideService(DockerClient, DockerClientLive),
);