import * as Schema from "effect/Schema";

import { ProviderInfo } from "../../libs/provider";

export const GithubProviderInfo = new ProviderInfo({
  id: "github",
  name: "Github",
  homepage: "https://github.com",
  icon: "lucide:github",
  extraSchema: Schema.Struct({
    includePrereleases: Schema.Boolean.pipe(Schema.optional),
    maxReleases: Schema.Number.pipe(Schema.optional),
  }),
  extraDefaults: {
    includePrereleases: false,
    maxReleases: 3,
  },
});