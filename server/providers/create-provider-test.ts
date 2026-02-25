import { it, expect, describe } from "@effect/vitest";
import { Effect, Exit } from "effect";
import nock from "nock";
import { PackageConfig } from "~~/libs/config/schemas";
import { PackageConfigView } from "~~/libs/config/view";
import type { ProviderInfo, ProviderExtraType } from "~~/libs/provider";

import type { PackageProvider } from "../libs/provider";

type ProviderTestOptions<T extends ProviderInfo = ProviderInfo> = {
  name: string;
  createAdapter: Effect.Effect<PackageProvider<T>, never>;
  testPackages: {
    valid: string;
    notFound: string;
  };
};

const withNockBack =
  (name: string) =>
  <A>(e: Effect.Effect<A>) => {
    return Effect.gen(function* () {
      const { nockDone } = yield* Effect.promise(() => nock.back(name + ".json"));

      const res = yield* e.pipe(Effect.tap(nockDone));

      nockDone();
      return res;
    });
  };

function makePackageView<T extends ProviderInfo>(config: PackageConfig) {
  return PackageConfigView.make(config) as PackageConfigView & {
    extra?: ProviderExtraType<T>;
    providerExtra?: ProviderExtraType<T>;
    effectiveExtra?: ProviderExtraType<T>;
  };
}

export function createProviderTests<T extends ProviderInfo>({
  createAdapter,
  name,
  testPackages,
}: ProviderTestOptions<T>) {
  describe(`Provider Tests - ${name}`, () => {
    describe("Real API Connectivity", () => {
      it.effect("connects to real API and retrieves valid package", () =>
        Effect.gen(function* () {
          const provider = yield* createAdapter;

          const config = makePackageView({
            name: testPackages.valid,
            provider: provider.info.id,
          });

          const result = yield* Effect.exit(provider.getPackage(config));

          expect(Exit.isSuccess(result)).toBe(true);

          if (Exit.isSuccess(result)) {
            expect(result.value).toBeDefined();
            expect(result.value.name).toBeDefined();
            expect(Array.isArray(result.value.releases)).toBe(true);
          }
        }).pipe(withNockBack(name)),
      );

      it.effect("handles real API 404 errors", () =>
        Effect.gen(function* () {
          const provider = yield* createAdapter;

          const config = makePackageView({
            name: testPackages.notFound,
            provider: provider.info.id,
          });

          const result = yield* Effect.exit(provider.getPackage(config));

          expect(Exit.isFailure(result)).toBe(true);
        }).pipe(withNockBack(`${name}-err`)),
      );
    });
  });
}