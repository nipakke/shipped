import { RPCLink } from "@orpc/client/fetch";
import { TANSTACK_QUERY_OPERATION_CONTEXT_SYMBOL } from "@orpc/tanstack-query";
import type { H3Event } from "h3";

import type { ORPCClientContext } from "..";
import { PLUGINS } from "../plugins";

const GET_OPERATION_TYPE = new Set(["query", "streamed", "live", "infinite"]);

export function createHTTPLink(e?: H3Event) {
  // console.log("Create http link", e?.fetch);

  return new RPCLink<ORPCClientContext>({
    fetch: e?.fetch,
    // fetch: import.meta.server ? useRequestFetch() : undefined,
    url: `${typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"}/api/rpc`,
    headers: () => {
      const headers = new Headers(e?.headers ?? {});

      return Object.fromEntries(headers);
    },
    method: ({ context }) => {
      if (context?.cache) {
        return "GET";
      }

      const operationType = context[TANSTACK_QUERY_OPERATION_CONTEXT_SYMBOL]?.type;

      if (operationType && GET_OPERATION_TYPE.has(operationType)) {
        return "GET";
      }

      return "POST";
    },
    plugins: PLUGINS,
  });
}