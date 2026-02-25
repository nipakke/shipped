import * as Schema from "effect/Schema";

// Error data schemas for ORPC errors
export const ProviderNotFoundDataSchema = Schema.Struct({
  providerId: Schema.String,
});

export const UnknownPackageIdDataSchema = Schema.Struct({
  id: Schema.String,
});

export const PackageNotFoundDataSchema = Schema.Struct({
  provider: Schema.String,
  name: Schema.String,
  scope: Schema.String.pipe(Schema.optional),
});

export const ProviderErrorDataSchema = Schema.Struct({
  provider: Schema.String,
  message: Schema.String,
});

export const RateLimitedDataSchema = Schema.Struct({
  provider: Schema.String,
  retryAfter: Schema.Number.pipe(Schema.optional),
});

// Export inferred types
export type ProviderNotFoundData = Schema.Schema.Type<typeof ProviderNotFoundDataSchema>;
export type UnknownPackageIdData = Schema.Schema.Type<typeof UnknownPackageIdDataSchema>;
export type PackageNotFoundData = Schema.Schema.Type<typeof PackageNotFoundDataSchema>;
export type ProviderErrorData = Schema.Schema.Type<typeof ProviderErrorDataSchema>;
export type RateLimitedData = Schema.Schema.Type<typeof RateLimitedDataSchema>;