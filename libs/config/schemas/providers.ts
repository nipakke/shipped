import * as Schema from "effect/Schema";

export const ProviderConfig = Schema.Struct({
  // extra: Schema.Unknown.pipe(Schema.optional),
  extra: Schema.Record({
    key: Schema.String,
    value: Schema.Union(
      Schema.String,
      Schema.Boolean,
      Schema.Number,
      Schema.Array(Schema.Union(Schema.String, Schema.Boolean, Schema.Number)),
    ),
  }).pipe(Schema.optional),
});

// Provider configuration schema
export const ProvidersConfig = Schema.Record({
  key: Schema.String,
  value: ProviderConfig,
});

export type ProviderConfig = Schema.Schema.Type<typeof ProviderConfig>;
export type ProvidersConfig = Schema.Schema.Type<typeof ProvidersConfig>;