import * as Schema from "effect/Schema";

const Primitive = Schema.Union(Schema.String, Schema.Boolean, Schema.Number);
const Extra = Schema.Record({
  key: Schema.String,
  value: Schema.Union(Primitive, Schema.Array(Primitive)),
});

export const PackageSpec = Schema.Struct({
  name: Schema.String,
  provider: Schema.String,
  extra: Extra.pipe(Schema.optional),
});

export const PackageOverview = Schema.Struct({
  providerName: Schema.String,
  name: Schema.String,
  owner: Schema.String.pipe(Schema.optional),
  description: Schema.String.pipe(Schema.optional),
  url: Schema.String,
  avatar: Schema.String.pipe(Schema.optional),
  sourceUrl: Schema.String.pipe(Schema.optional),
  stars: Schema.Number.pipe(Schema.optional),
  extra: Schema.Unknown.pipe(Schema.optional),
});

export const PackageRelease = Schema.Struct({
  version: Schema.String,
  name: Schema.String.pipe(Schema.optional),
  tag: Schema.String.pipe(Schema.optional),
  url: Schema.String.pipe(Schema.optional),
  extra: Schema.Unknown.pipe(Schema.optional),
  createdAt: Schema.String.pipe(Schema.optional),
});

export const Package = PackageOverview.pipe(
  Schema.extend(
    Schema.Struct({
      updatedAt: Schema.String.pipe(Schema.optional),
      releases: Schema.Array(PackageRelease),
    }),
  ),
);

export type Package = Schema.Schema.Type<typeof Package>;
export type PackageOverview = Schema.Schema.Type<typeof PackageOverview>;
export type PackageRelease = Schema.Schema.Type<typeof PackageRelease>;
export type PackageSpec = Schema.Schema.Type<typeof PackageSpec>;