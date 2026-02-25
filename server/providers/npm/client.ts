import { Context, Effect, Either } from "effect";
import { NetworkError, PackageNotFoundError, type ProviderError } from "~~/server/libs/provider";
import { $fetch, FetchError } from "~~/server/providers/fetch";

import type { NpmPackument } from "./types";

export type { NpmPackument, NpmPerson, NpmDist, NpmRepository, NpmVersion } from "./types";

const NPM_REGISTRY_URL = "https://registry.npmjs.org/";

export class NpmClient extends Context.Tag("npm-client")<
  NpmClient,
  {
    readonly getPackument: (name: string) => Effect.Effect<NpmPackument, ProviderError>;
  }
>() {}

const fetchPackument = (name: string) =>
  Effect.tryPromise({
    try: () => {
      const encodedName = encodeURIComponent(name).replace(/%2F/g, "/");
      const url = new URL(encodedName, NPM_REGISTRY_URL).toString();
      return $fetch<NpmPackument>(url, {
        headers: { Accept: "application/json" },
        redirect: "follow",
      });
    },
    catch: (error) => {
      if (error instanceof FetchError && error.status === 404) {
        return new PackageNotFoundError({ name, provider: "npm" });
      }
      return new NetworkError({
        name,
        provider: "npm",
        reason: error instanceof Error ? error.message : "Unknown error",
      });
    },
  });

export const NpmClientLive = NpmClient.of({
  getPackument: Effect.fn("NpmClient.getPackument")(function* (name: string) {
    yield* Effect.logDebug("Fetching NPM packument", { name });

    const result = yield* fetchPackument(name).pipe(Effect.either);

    return yield* Effect.gen(function* () {
      if (Either.isLeft(result)) {
        const error = result.left;
        if (error._tag === "PackageNotFound") {
          yield* Effect.logDebug("NPM package not found", { name });
        } else {
          yield* Effect.logError("NPM fetch failed", error);
        }
        return yield* error;
      }
      yield* Effect.logDebug("NPM packument fetched", { name });
      return result.right;
    });
  }),
});