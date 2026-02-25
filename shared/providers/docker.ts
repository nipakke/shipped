import * as Schema from "effect/Schema";

import { ProviderInfo } from "../../libs/provider";

export const DockerProviderInfo = new ProviderInfo({
  id: "docker",
  name: "Docker Hub",
  homepage: "https://hub.docker.com",
  icon: "devicon:docker",
  extraSchema: Schema.Struct({
    tags: Schema.Array(Schema.String).pipe(Schema.optional),
  }),
  extraDefaults: {
    tags: ["latest", "slim", "alpine"],
  },
});