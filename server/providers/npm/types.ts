import { Schema } from "effect";

export const NpmPerson = Schema.Struct({
  name: Schema.String,
  email: Schema.String.pipe(Schema.optional),
  url: Schema.String.pipe(Schema.optional),
});

export const NpmDist = Schema.Struct({
  integrity: Schema.String,
  shasum: Schema.String,
  tarball: Schema.String,
  fileCount: Schema.Number.pipe(Schema.optional),
  unpackedSize: Schema.Number.pipe(Schema.optional),
  npmSignature: Schema.String.pipe(Schema.optional),
});

export const NpmRepository = Schema.Struct({
  type: Schema.String,
  url: Schema.String,
  directory: Schema.String.pipe(Schema.optional),
});

export const NpmVersion = Schema.Struct({
  name: Schema.String,
  version: Schema.String,
  description: Schema.String.pipe(Schema.optional),
  main: Schema.String.pipe(Schema.optional),
  author: Schema.Union(NpmPerson, Schema.String, Schema.Null),
  license: Schema.String.pipe(Schema.optional),
  dependencies: Schema.Record({ key: Schema.String, value: Schema.String }).pipe(Schema.optional),
  devDependencies: Schema.Record({ key: Schema.String, value: Schema.String }).pipe(Schema.optional),
  peerDependencies: Schema.Record({ key: Schema.String, value: Schema.String }).pipe(Schema.optional),
  dist: NpmDist,
  maintainers: Schema.Array(NpmPerson),
  scripts: Schema.Record({ key: Schema.String, value: Schema.String }).pipe(Schema.optional),
  repository: NpmRepository.pipe(Schema.optional),
});

export const NpmPackument = Schema.Struct({
  name: Schema.String,
  description: Schema.String.pipe(Schema.optional),
  "dist-tags": Schema.Record({ key: Schema.String, value: Schema.String }),
  versions: Schema.Record({ key: Schema.String, value: NpmVersion }),
  maintainers: Schema.Array(NpmPerson),
  time: Schema.Record({ key: Schema.String, value: Schema.String }),
  author: Schema.Union(NpmPerson, Schema.String, Schema.Null),
  license: Schema.String.pipe(Schema.optional),
  repository: NpmRepository.pipe(Schema.optional),
  readme: Schema.String.pipe(Schema.optional),
});

export type NpmPerson = Schema.Schema.Type<typeof NpmPerson>;
export type NpmDist = Schema.Schema.Type<typeof NpmDist>;
export type NpmRepository = Schema.Schema.Type<typeof NpmRepository>;
export type NpmVersion = Schema.Schema.Type<typeof NpmVersion>;
export type NpmPackument = Schema.Schema.Type<typeof NpmPackument>;