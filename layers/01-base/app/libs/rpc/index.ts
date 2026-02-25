import { createORPCClient } from "@orpc/client";
/* import { createORPCClient, DynamicLink, } from "@orpc/client"
import { RPCLink } from "@orpc/client/fetch"
import type { RouterClient } from "@orpc/server"
import type { orpcRouter } from "~~/server/rpc/router"
import { RPCLink as WSRPCLink } from '@orpc/client/websocket'
// import { WebSocket } from "partysocket";
import { useLocalStorage } from "@vueuse/core"
import { createHTTPLink } from "./rpc/http-link"
import { ClientRetryPlugin } from '@orpc/client/plugins'
import type { ClientRetryPluginContext } from '@orpc/client/plugins'
import type { ORPCClientContext } from "./rpc/context"
import { createTanstackQueryUtils } from '@orpc/tanstack-query'
interface ClientContext {
  cache?: RequestCache
} */
/* interface ClientContext extends TanstackQueryOperationContext {
  cache?: RequestCache
  streamed?: boolean;
} */
import { type ClientRetryPluginContext } from "@orpc/client/plugins";
import type { ErrorFromErrorMap, InferContractRouterErrorMap } from "@orpc/contract";
import { type RouterClient } from "@orpc/server";
import type { TanstackQueryOperationContext } from "@orpc/tanstack-query";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import type { H3Event } from "h3";
import type { orpcRouter } from "~~/server/rpc/router";

import { createHTTPLink } from "./links/http";

export interface ORPCClientContext extends TanstackQueryOperationContext, ClientRetryPluginContext {
  cache?: RequestCache;
}

export function createRPC(e?: H3Event) {
  const httpLink = createHTTPLink(e);

  const raw: RouterClient<typeof orpcRouter, ORPCClientContext> = createORPCClient(httpLink);
  const tanstack = createTanstackQueryUtils(raw);

  return tanstack;
}

// const RPC = createRPC();
type RPC = ReturnType<typeof createRPC>;
export function useRPC(): RPC {
  return useNuxtApp().$rpcClient;
}

export type RPCError = ErrorFromErrorMap<InferContractRouterErrorMap<typeof orpcRouter>>;