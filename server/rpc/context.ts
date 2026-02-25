import { H3Event } from "#imports";
import { ResponseHeadersPluginContext } from "@orpc/server/plugins";
import { Effect } from "effect";
import type { NitroApp } from "nitropack";

import { NodeEnvConfig, ServerConfig } from "../config";

export interface ORPCContext extends ResponseHeadersPluginContext {
  nitro: NitroApp;
  event: H3Event;
  serverConfig: Effect.Effect.Success<typeof ServerConfig>;
  nodeEnv: Effect.Effect.Success<typeof NodeEnvConfig>;
}

export async function createContext(event: H3Event): Promise<ORPCContext> {
  const nitro = useNitroApp();

  return {
    event,
    nitro,
    serverConfig: nitro.context.serverConfig,
    nodeEnv: nitro.context.nodeEnv,
  };
}