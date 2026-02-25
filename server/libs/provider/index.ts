import { Effect } from "effect";
import { Merge } from "type-fest";
import { PackageConfigView } from "~~/libs/config/view";
import { Package } from "~~/libs/packages";
import type { ProviderInfo, ProviderExtraType } from "~~/libs/provider";

import { PackageNotFoundError, NetworkError, InvalidPackageNameError } from "./errors";

/**
 * Strict set of errors that providers are allowed to throw.
 * This union type constrains what errors can be returned from provider operations.
 */
export type ProviderError = PackageNotFoundError | NetworkError | InvalidPackageNameError;

export type PackageProvider<T extends ProviderInfo = ProviderInfo> = {
  readonly info: T;
  readonly version: string | number;
  readonly getPackage: (
    opts: Merge<
      PackageConfigView,
      {
        extra?: ProviderExtraType<T>;
        providerExtra?: ProviderExtraType<T>;
        effectiveExtra?: ProviderExtraType<T>;
      }
    >,
  ) => Effect.Effect<Package, ProviderError>;
};

export { PackageNotFoundError, NetworkError, InvalidPackageNameError } from "./errors";