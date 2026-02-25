import { Context, Effect, Either } from "effect";
import { NetworkError, PackageNotFoundError, type ProviderError } from "~~/server/libs/provider";
import { $fetch, FetchError } from "~~/server/providers/fetch";

import type { PyPIResponse } from "./types";

export type { PyPIResponse, PyPIReleaseFile, PyPIInfo } from "./types";

const PYPI_BASE_URL = "https://pypi.org/pypi/";

export class PythonClient extends Context.Tag("python-client")<
  PythonClient,
  {
    readonly getPackageData: (name: string) => Effect.Effect<PyPIResponse, ProviderError>;
  }
>() {}

const fetchPackageData = (name: string) =>
  Effect.tryPromise({
    try: () => {
      const encodedName = encodeURIComponent(name);
      const url = `${PYPI_BASE_URL}${encodedName}/json`;
      return $fetch<PyPIResponse>(url, {
        headers: { Accept: "application/json" },
        redirect: "follow",
      });
    },
    catch: (error) => {
      if (error instanceof FetchError && error.status === 404) {
        return new PackageNotFoundError({ name, provider: "python" });
      }
      return new NetworkError({
        name,
        provider: "python",
        reason: error instanceof Error ? error.message : "Unknown error",
      });
    },
  });

export const PythonClientLive = PythonClient.of({
  getPackageData: Effect.fn("PythonClient.getPackageData")(function* (name: string) {
    yield* Effect.logDebug("Fetching Python package data", { name });

    const result = yield* fetchPackageData(name).pipe(Effect.either);

    return yield* Effect.gen(function* () {
      if (Either.isLeft(result)) {
        const error = result.left;
        if (error._tag === "PackageNotFound") {
          yield* Effect.logDebug("Python package not found", { name });
        } else {
          yield* Effect.logError("Python fetch failed", error);
        }
        return yield* error;
      }
      yield* Effect.logDebug("Python package data fetched", { name });
      return result.right;
    });
  }),
});