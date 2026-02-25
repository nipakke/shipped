import * as Schema from "effect/Schema";

import { ProviderInfo } from "../../libs/provider";

export const PythonProviderInfo = new ProviderInfo({
  id: "python",
  name: "Python",
  homepage: "https://pypi.org",
  icon: "devicon:python",
  extraSchema: Schema.Struct({
    maxReleases: Schema.Number.pipe(Schema.optional),
  }),
  extraDefaults: {
    maxReleases: 3,
  },
});