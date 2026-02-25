import { Context, Effect, Either } from "effect";
import { NetworkError, PackageNotFoundError, type ProviderError } from "~~/server/libs/provider";
import { $fetch, FetchError } from "~~/server/providers/fetch";

import type { DockerRepository, DockerTagsResponse, DockerTag } from "./types";

const DOCKER_HUB_BASE_URL = "https://hub.docker.com/v2/repositories/";

export type { DockerRepository, DockerTagsResponse, DockerTag } from "./types";

export class DockerClient extends Context.Tag("docker-client")<
  DockerClient,
  {
    readonly getRepository: (
      namespace: string,
      name: string,
    ) => Effect.Effect<DockerRepository, ProviderError>;
    readonly getTags: (
      namespace: string,
      name: string,
      pageSize?: number,
    ) => Effect.Effect<DockerTagsResponse, ProviderError>;
    readonly getTag: (
      namespace: string,
      name: string,
      tag: string,
    ) => Effect.Effect<DockerTag, ProviderError>;
  }
>() {}

const fetchRepository = (namespace: string, name: string) =>
  Effect.tryPromise({
    try: () => {
      const url = `${DOCKER_HUB_BASE_URL}${namespace}/${name}/`;
      return $fetch<DockerRepository>(url, {
        headers: { Accept: "application/json" },
        redirect: "follow",
      });
    },
    catch: (error) => {
      if (error instanceof FetchError && error.status === 404) {
        return new PackageNotFoundError({ name: `${namespace}/${name}`, provider: "docker" });
      }
      return new NetworkError({
        name: `${namespace}/${name}`,
        provider: "docker",
        reason: error instanceof Error ? error.message : "Unknown error",
      });
    },
  });

const fetchTags = (namespace: string, name: string, pageSize: number) =>
  Effect.tryPromise({
    try: () => {
      const url = `${DOCKER_HUB_BASE_URL}${namespace}/${name}/tags/?page_size=${pageSize}&ordering=-last_updated`;
      return $fetch<DockerTagsResponse>(url, {
        headers: { Accept: "application/json" },
        redirect: "follow",
      });
    },
    catch: (error) => {
      if (error instanceof FetchError && error.status === 404) {
        return new PackageNotFoundError({ name: `${namespace}/${name}`, provider: "docker" });
      }
      return new NetworkError({
        name: `${namespace}/${name}`,
        provider: "docker",
        reason: error instanceof Error ? error.message : "Unknown error",
      });
    },
  });

const fetchTag = (namespace: string, name: string, tag: string) =>
  Effect.tryPromise({
    try: () => {
      const url = `https://hub.docker.com/v2/namespaces/${namespace}/repositories/${name}/tags/${tag}`;
      return $fetch<DockerTag>(url, {
        headers: { Accept: "application/json" },
        redirect: "follow",
      });
    },
    catch: (error) => {
      if (error instanceof FetchError && error.status === 404) {
        return new PackageNotFoundError({ name: `${namespace}/${name}:${tag}`, provider: "docker" });
      }
      return new NetworkError({
        name: `${namespace}/${name}:${tag}`,
        provider: "docker",
        reason: error instanceof Error ? error.message : "Unknown error",
      });
    },
  });

export const DockerClientLive = DockerClient.of({
  getRepository: Effect.fn("DockerClient.getRepository")(function* (namespace: string, name: string) {
    yield* Effect.logDebug("Fetching Docker repository", { namespace, name });

    const result = yield* fetchRepository(namespace, name).pipe(Effect.either);

    return yield* Effect.gen(function* () {
      if (Either.isLeft(result)) {
        const error = result.left;
        if (error._tag === "PackageNotFound") {
          yield* Effect.logDebug("Docker repository not found", { namespace, name });
        } else {
          yield* Effect.logError("Docker repository fetch failed", error);
        }
        return yield* error;
      }
      yield* Effect.logDebug("Docker repository fetched", { namespace, name });
      return result.right;
    });
  }),

  getTags: Effect.fn("DockerClient.getTags")(function* (
    namespace: string,
    name: string,
    pageSize: number = 10,
  ) {
    yield* Effect.logDebug("Fetching Docker tags", { namespace, name, pageSize });

    const result = yield* fetchTags(namespace, name, pageSize).pipe(Effect.either);

    return yield* Effect.gen(function* () {
      if (Either.isLeft(result)) {
        const error = result.left;
        if (error._tag === "PackageNotFound") {
          yield* Effect.logDebug("Docker tags not found", { namespace, name });
        } else {
          yield* Effect.logError("Docker tags fetch failed", error);
        }
        return yield* error;
      }
      yield* Effect.logDebug("Docker tags fetched", { namespace, name, count: result.right.count });
      return result.right;
    });
  }),

  getTag: Effect.fn("DockerClient.getTag")(function* (namespace: string, name: string, tag: string) {
    yield* Effect.logDebug("Fetching Docker tag", { namespace, name, tag });

    const result = yield* fetchTag(namespace, name, tag).pipe(Effect.either);

    return yield* Effect.gen(function* () {
      if (Either.isLeft(result)) {
        const error = result.left;
        if (error._tag === "PackageNotFound") {
          yield* Effect.logDebug("Docker tag not found", { namespace, name, tag });
        } else {
          yield* Effect.logError("Docker tag fetch failed", error);
        }
        return yield* error;
      }
      yield* Effect.logDebug("Docker tag fetched", { namespace, name, tag });
      return result.right;
    });
  }),
});