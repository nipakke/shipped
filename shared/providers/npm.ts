import * as Schema from "effect/Schema";

import { ProviderInfo } from "../../libs/provider";

export const NpmProviderInfo = new ProviderInfo({
  id: "npm",
  name: "NPM",
  homepage: "https://npm.com",
  icon: "devicon:npm",
  extraSchema: Schema.Struct({
    tags: Schema.Array(Schema.String).pipe(Schema.optional),
    npmx: Schema.Boolean.pipe(
      Schema.annotations({
        description: "Use npmx.dev instead of npmjs.com as the external link to the package",
      }),
      Schema.optional,
    ),
  }),
  extraDefaults: {
    tags: ["latest"],
  },
});