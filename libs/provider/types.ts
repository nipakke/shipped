import * as Schema from "effect/Schema";

import type { ProviderInfo } from "./index";

/**
 * Extracts the extra configuration type from a ProviderInfo.
 * This helper type infers the actual TypeScript type from the provider's extraSchema.
 *
 * @example
 * ```typescript
 * type GithubExtras = ProviderExtraType<typeof GithubProviderInfo>;
 * // Result: { includePrereleases?: boolean; maxReleases?: number }
 * ```
 */
export type ProviderExtraType<T extends ProviderInfo<any>> =
  T extends ProviderInfo<infer S> ? (S extends Schema.Schema<infer A> ? A : unknown) : unknown;