import * as Schema from "effect/Schema";

import {
  ProviderNotFoundDataSchema,
  UnknownPackageIdDataSchema,
  PackageNotFoundDataSchema,
  ProviderErrorDataSchema,
  RateLimitedDataSchema,
} from "./schemas";

/**
 * Creates decoder functions for both sync and either-based decoding
 */
export const createDecoder = <A>(schema: Schema.Schema<A>) => ({
  either: Schema.decodeUnknownEither(schema),
  sync: Schema.decodeUnknownSync(schema),
});

// Error data decoders
export const decodeProviderNotFoundData = createDecoder(ProviderNotFoundDataSchema);
export const decodeUnknownPackageIdData = createDecoder(UnknownPackageIdDataSchema);
export const decodePackageNotFoundData = createDecoder(PackageNotFoundDataSchema);
export const decodeProviderErrorData = createDecoder(ProviderErrorDataSchema);
export const decodeRateLimitedData = createDecoder(RateLimitedDataSchema);