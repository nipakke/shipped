import * as Schema from "effect/Schema";

import { PackageSpec } from "../../packages/schema";

export const PackageConfig = Schema.extend(
  PackageSpec,
  Schema.Struct({
    // group: Schema.String.pipe(Schema.optional),
    icon: Schema.String.pipe(Schema.optional),
    iconDark: Schema.String.pipe(Schema.optional),
    displayName: Schema.String.pipe(Schema.optional),
  }),
);

export type PackageConfig = Schema.Schema.Type<typeof PackageConfig>;