/**
 * Query Client Configuration
 *
 * IMPORTANT - SSR Error Hydration Limitation:
 * TanStack Query does NOT hydrate errored queries from server to client.
 * Even with proper serialization, errored queries are discarded on the client,
 * causing a hydration mismatch and triggering a refetch.
 *
 * For queries that may error (e.g., 404 not found), disable them on the server:
 *
 *   useQuery(rpc.packages.getOne.queryOptions({
 *     input: { packageId },
 *     enabled: import.meta.client,  // Only run on client
 *     retry: 0,
 *   }));
 *
 * See docs/development-notes.md for more details.
 */

import type { DehydratedState } from "@tanstack/vue-query";
import { VueQueryPlugin, hydrate, dehydrate } from "@tanstack/vue-query";
import { QueryClient } from "@tanstack/vue-query";

export default defineNuxtPlugin((nuxt) => {
  const vueQueryState = useState<DehydratedState | null>("vue-query");

  const tanstackQueryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 60 * 1000,
        refetchInterval: 60 * 1000,
        // refetchOnWindowFocus: true,
        /* queryKeyHashFn(queryKey) {
          const [json, meta] = serializer.serialize(queryKey)
          return JSON.stringify({ json, meta })
        } */
      },
    },
  });

  if (import.meta.server) {
    nuxt.hooks.hook("app:rendered", () => {
      vueQueryState.value = dehydrate(tanstackQueryClient);
    });
  }

  if (import.meta.client) {
    hydrate(tanstackQueryClient, vueQueryState.value);
  }

  nuxt.vueApp.use(VueQueryPlugin, { queryClient: tanstackQueryClient });

  return {
    provide: {
      tanstackQueryClient,
    },
  };
});