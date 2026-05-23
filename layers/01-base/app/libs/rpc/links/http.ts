import { RPCLink } from "@orpc/client/fetch";
import type { H3Event } from "h3";
import { getRequestURL } from "h3";

import type { ORPCClientContext } from "..";

export function createHTTPLink(e?: H3Event) {
  // Server-side: use the request origin for constructing URLs, but strip the origin
  // from fetch requests so Nitro's internal router handles them (no HTTP required).
  // Client-side: use window.location.origin or fallback to localhost.
  const baseUrl = e
    ? getRequestURL(e).origin
    : typeof window !== "undefined"
      ? window.location.origin
      : "http://localhost:3000";

  const serverFetch = e
    ? (input: string | URL | Request, init?: RequestInit) => {
        // Strip origin from absolute URLs so Nitro routes them internally
        const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
        const relativeUrl = url.startsWith(baseUrl) ? url.slice(baseUrl.length) : url;
        return e.fetch(relativeUrl, init);
      }
    : undefined;

  return new RPCLink<ORPCClientContext>({
    fetch: serverFetch ?? e?.fetch,
    url: `${baseUrl}/api/rpc`,
    headers: () => {
      const headers = new Headers(e?.headers ?? {});

      return Object.fromEntries(headers);
    },
    method: "GET",
  });
}