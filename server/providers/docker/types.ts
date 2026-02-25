import { Schema } from "effect";

export const DockerImage = Schema.Struct({
  architecture: Schema.String,
  features: Schema.String,
  variant: Schema.Union(Schema.String, Schema.Null),
  digest: Schema.String,
  os: Schema.String,
  os_features: Schema.String,
  os_version: Schema.Union(Schema.String, Schema.Null),
  size: Schema.Number,
  status: Schema.String,
  last_pulled: Schema.Union(Schema.String, Schema.Null),
  last_pushed: Schema.Union(Schema.String, Schema.Null),
});

export const DockerTag = Schema.Struct({
  creator: Schema.Number,
  id: Schema.Number,
  images: Schema.Array(DockerImage),
  last_updated: Schema.String,
  last_updater: Schema.Number,
  last_updater_username: Schema.String,
  name: Schema.String,
  repository: Schema.Number,
  full_size: Schema.Number,
  v2: Schema.Boolean,
  tag_status: Schema.String,
  tag_last_pulled: Schema.Union(Schema.String, Schema.Null),
  tag_last_pushed: Schema.String,
  media_type: Schema.String,
  content_type: Schema.String,
  digest: Schema.String,
});

export const DockerTagsResponse = Schema.Struct({
  count: Schema.Number,
  next: Schema.Union(Schema.String, Schema.Null),
  previous: Schema.Union(Schema.String, Schema.Null),
  results: Schema.Array(DockerTag),
});

export const DockerRepository = Schema.Struct({
  user: Schema.String,
  name: Schema.String,
  namespace: Schema.String,
  repository_type: Schema.String,
  status: Schema.Number,
  status_description: Schema.String,
  description: Schema.String,
  is_private: Schema.Boolean,
  is_automated: Schema.Boolean,
  star_count: Schema.Number,
  pull_count: Schema.Number,
  last_updated: Schema.String,
  last_modified: Schema.String,
  date_registered: Schema.String,
  collaborator_count: Schema.Number,
  affiliation: Schema.Union(Schema.String, Schema.Null),
  hub_user: Schema.String,
  has_starred: Schema.Boolean,
  full_description: Schema.String,
});

export type DockerImage = Schema.Schema.Type<typeof DockerImage>;
export type DockerTag = Schema.Schema.Type<typeof DockerTag>;
export type DockerTagsResponse = Schema.Schema.Type<typeof DockerTagsResponse>;
export type DockerRepository = Schema.Schema.Type<typeof DockerRepository>;