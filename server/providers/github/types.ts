import { Schema } from "effect";

export const GithubRelease = Schema.Struct({
  id: Schema.Number,
  tag: Schema.String,
  author: Schema.String,
  name: Schema.String,
  draft: Schema.Boolean,
  prerelease: Schema.Boolean,
  createdAt: Schema.String,
  publishedAt: Schema.String,
  markdown: Schema.String,
  html: Schema.String,
});

export const GithubRepo = Schema.Struct({
  id: Schema.Number,
  name: Schema.String,
  repo: Schema.String,
  description: Schema.Union(Schema.String, Schema.Null),
  createdAt: Schema.String,
  updatedAt: Schema.String,
  pushedAt: Schema.String,
  stars: Schema.Number,
  watchers: Schema.Number,
  forks: Schema.Number,
  defaultBranch: Schema.String,
});

export const GithubReleasesResponse = Schema.Struct({
  releases: Schema.Array(GithubRelease),
});

export const GithubRepoResponse = Schema.Struct({
  repo: GithubRepo,
});

export type GithubRelease = Schema.Schema.Type<typeof GithubRelease>;
export type GithubRepo = Schema.Schema.Type<typeof GithubRepo>;
export type GithubReleasesResponse = Schema.Schema.Type<typeof GithubReleasesResponse>;
export type GithubRepoResponse = Schema.Schema.Type<typeof GithubRepoResponse>;