import * as Schema from "effect/Schema";

import { slugify } from "../../strings/slugify";

import { PackageConfig } from "./package";

const Group = Schema.Struct({
  name: Schema.Union(Schema.String, Schema.Number),
  displayName: Schema.String.pipe(Schema.optional),
  showName: Schema.Boolean.pipe(Schema.optional),
  packages: Schema.Array(PackageConfig),
});

export class ListConfig extends Schema.Class<ListConfig>("ListConfig")({
  name: Schema.String,
  description: Schema.String.pipe(Schema.optional),
  groups: Schema.Array(Group).pipe(Schema.optional),
}) {
  slug = slugify(this.name);
}

/*
export const ListConfig = Schema.transform(
  Schema.Struct({
  name: Schema.String,
  description: Schema.String.pipe(Schema.optional),
  groups: Schema.Array(Group).pipe(Schema.optional),
}),
Schema.Struct({
  name: Schema.String,
  description: Schema.String.pipe(Schema.optional),
  groups: Schema.Array(Group).pipe(Schema.optional),
  slug: Schema.String
}),
  {
    strict:true,
    decode(input) {
      return {
        ...input,
        slug: slugify(input.name)
      }
    },
    encode: o => o
  }
) */
/*
export const ListConfig = Schema.Struct({
  name: Schema.String,
  description: Schema.String.pipe(Schema.optional),
  groups: Schema.Array(Group).pipe(Schema.optional),
}) */

/* Schema.transform(
  Schema.Struct({
  name: Schema.String,
  description: Schema.String.pipe(Schema.optional),
  groups: Schema.Array(Group).pipe(Schema.optional),
}),
  {
    strict:true,
    decode(input) {
      return {
        ...input,
        slug: slugify(input.name)
      }      
    },
    encode: o => o
  }
) */

// export type ListConfig = Schema.Schema.Type<typeof ListConfig>;