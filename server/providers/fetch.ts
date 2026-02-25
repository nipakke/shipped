import { ofetch, FetchError } from "ofetch";
import { isTest } from "std-env";

export { FetchError };

export function createFetch() {
  return (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const headers = new Headers(init?.headers);

    //gzip is needed for testing
    //nock replaying brotli compressed response breaks undici fsr
    if (isTest) headers.set("accept-encoding", "gzip");

    return fetch(input, {
      ...init,
      headers,
    });
  };
}

export const $fetch = ofetch.create({
  headers: isTest ? { "accept-encoding": "gzip" } : undefined,
});