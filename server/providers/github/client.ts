import { Context, Effect, Either } from "effect";
import { NetworkError, PackageNotFoundError, type ProviderError } from "~~/server/libs/provider";
import { $fetch, FetchError } from "~~/server/providers/fetch";

import type { GithubRepoResponse, GithubReleasesResponse } from "./types";

export type { GithubRepoResponse, GithubReleasesResponse, GithubRelease, GithubRepo } from "./types";

const UNGH_BASE_URL = "https://ungh.cc";

export class GithubClient extends Context.Tag("github-client")<
  GithubClient,
  {
    readonly getRepo: (owner: string, repo: string) => Effect.Effect<GithubRepoResponse, ProviderError>;
    readonly getReleases: (
      owner: string,
      repo: string,
    ) => Effect.Effect<GithubReleasesResponse, ProviderError>;
  }
>() {}

const fetchRepo = (owner: string, repo: string) =>
  Effect.tryPromise({
    try: () =>
      $fetch<GithubRepoResponse>(`${UNGH_BASE_URL}/repos/${owner}/${repo}`, {
        headers: { Accept: "application/json" },
      }),
    catch: (error) => {
      if (error instanceof FetchError && error.status === 404) {
        return new PackageNotFoundError({ name: `${owner}/${repo}`, provider: "github" });
      }
      return new NetworkError({
        name: `${owner}/${repo}`,
        provider: "github",
        reason: error instanceof Error ? error.message : "Unknown error",
      });
    },
  });

const fetchReleases = (owner: string, repo: string) =>
  Effect.tryPromise({
    try: () =>
      $fetch<GithubReleasesResponse>(`${UNGH_BASE_URL}/repos/${owner}/${repo}/releases`, {
        headers: { Accept: "application/json" },
      }),
    catch: (error) => {
      if (error instanceof FetchError && error.status === 404) {
        return new PackageNotFoundError({ name: `${owner}/${repo}`, provider: "github" });
      }
      return new NetworkError({
        name: `${owner}/${repo}`,
        provider: "github",
        reason: error instanceof Error ? error.message : "Unknown error",
      });
    },
  });

export const GithubClientLive = GithubClient.of({
  getRepo: (owner: string, repo: string) =>
    Effect.gen(function* () {
      yield* Effect.logDebug("Fetching GitHub repo", { owner, repo });

      const result = yield* fetchRepo(owner, repo).pipe(Effect.either);

      return yield* Effect.gen(function* () {
        if (Either.isLeft(result)) {
          const error = result.left;
          if (error._tag === "PackageNotFound") {
            yield* Effect.logDebug("GitHub repo not found", { owner, repo });
          } else {
            yield* Effect.logError("GitHub repo fetch failed", error);
          }
          return yield* Effect.fail(error);
        }
        yield* Effect.logDebug("GitHub repo fetched", { owner, repo });
        return result.right;
      });
    }).pipe(Effect.withSpan("GithubClient.getRepo")),

  getReleases: (owner: string, repo: string) =>
    Effect.gen(function* () {
      yield* Effect.logDebug("Fetching GitHub releases", { owner, repo });

      const result = yield* fetchReleases(owner, repo).pipe(Effect.either);

      return yield* Effect.gen(function* () {
        if (Either.isLeft(result)) {
          const error = result.left;
          if (error._tag === "PackageNotFound") {
            yield* Effect.logDebug("GitHub releases not found", { owner, repo });
          } else {
            yield* Effect.logError("GitHub releases fetch failed", error);
          }
          return yield* Effect.fail(error);
        }
        yield* Effect.logDebug("GitHub releases fetched", { owner, repo });
        return result.right;
      });
    }).pipe(Effect.withSpan("GithubClient.getReleases")),
});