import { Schema } from "effect";

export const PyPIReleaseFile = Schema.Struct({
  upload_time_iso_8601: Schema.String.pipe(Schema.optional),
  filename: Schema.String.pipe(Schema.optional),
  url: Schema.String.pipe(Schema.optional),
  size: Schema.Number.pipe(Schema.optional),
  packagetype: Schema.String.pipe(Schema.optional),
  python_version: Schema.String.pipe(Schema.optional),
  md5_digest: Schema.String.pipe(Schema.optional),
  sha256: Schema.String.pipe(Schema.optional),
  yanked: Schema.Boolean.pipe(Schema.optional),
  yanked_reason: Schema.Null,
});

export const PyPIInfo = Schema.Struct({
  name: Schema.String.pipe(Schema.optional),
  version: Schema.String.pipe(Schema.optional),
  author: Schema.Union(Schema.String, Schema.Null),
  author_email: Schema.String.pipe(Schema.optional),
  summary: Schema.String.pipe(Schema.optional),
  home_page: Schema.Union(Schema.String, Schema.Null),
  license: Schema.Union(Schema.String, Schema.Null),
  project_urls: Schema.Record({ key: Schema.String, value: Schema.String }).pipe(Schema.optional),
  description: Schema.String.pipe(Schema.optional),
});

export const PyPIResponse = Schema.Struct({
  info: PyPIInfo,
  releases: Schema.Record({ key: Schema.String, value: Schema.Array(PyPIReleaseFile) }),
  urls: Schema.Array(PyPIReleaseFile),
});

export type PyPIReleaseFile = Schema.Schema.Type<typeof PyPIReleaseFile>;
export type PyPIInfo = Schema.Schema.Type<typeof PyPIInfo>;
export type PyPIResponse = Schema.Schema.Type<typeof PyPIResponse>;