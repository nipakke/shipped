import { createORPCClient } from "@orpc/client";
import { type ClientRetryPluginContext } from "@orpc/client/plugins";
import type { ErrorFromErrorMap, InferContractRouterErrorMap } from "@orpc/contract";
import { type RouterClient } from "@orpc/server";
import type { H3Event } from "h3";
import type { orpcRouter } from "~~/server/rpc/router";

import { createHTTPLink } from "./links/http";

export interface ORPCClientContext extends ClientRetryPluginContext {
  cache?: RequestCache;
}

export function createRPC(e?: H3Event) {
  const httpLink = createHTTPLink(e);

  const raw: RouterClient<typeof orpcRouter, ORPCClientContext> = createORPCClient(httpLink);
  return raw;
}

type RPC = ReturnType<typeof createRPC>;
export function useRPC(): RPC {
  return useNuxtApp().$rpcClient;
}

export type RPCError = ErrorFromErrorMap<InferContractRouterErrorMap<typeof orpcRouter>>;