import { Effect } from "effect/Effect";

import { NodeEnvConfig, ServerConfig } from "./config";

declare module "nitropack" {
  interface NitroApp {
    context: {
      serverConfig: Effect.Success<typeof ServerConfig>;
      nodeEnv: Effect.Success<typeof NodeEnvConfig>;
    };
  }
}

// oxlint-disable-next-line unicorn/require-module-specifiers
export {};