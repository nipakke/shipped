import { isORPCErrorJson, isORPCErrorStatus } from "@orpc/client";
import { RatelimitHandlerPlugin } from "@orpc/experimental-ratelimit";
import { RPCHandler } from "@orpc/server/fetch";
import { StrictGetMethodPlugin } from "@orpc/server/plugins";
import { ResponseHeadersPlugin } from "@orpc/server/plugins";
import { orpcRouter } from "~~/server/rpc/router";

import { createContext } from "./context";

const handler = new RPCHandler(orpcRouter, {
  rootInterceptors: [
    async ({ next }) => {
      const result = await next();

      // const requestEtag = request.headers?.["if-none-match"];

      // if (result.response) result.response.status = 300

      if (!result.matched) {
        return result;
      }

      if (!isORPCErrorStatus(result.response.status) && !isORPCErrorJson(result.response.body)) {
        // const etag = hash(result.response.body);
        /* if (etag === requestEtag) {
          result.response.status = 304
          // result.response.body = undefined
        } else {
          result.response.headers.etag = etag
          result.response.headers["cache-control"] = "private, max-age=604800"
        } */
      }

      // if (
      //   result.matched
      //   && isORPCErrorStatus(result.response.status)
      //   && isORPCErrorJson(result.response.body)
      // ) {
      //   return {
      //     ...result,
      //     response: {
      //       ...result.response,
      //       body: {
      //         ...result.response.body,
      //         message: 'custom error shape',
      //       },
      //     },
      //   }
      // }

      return result;

      /* return {
        ...result,
        response: {
          ...result.response,
          status: 204
        }
      } */
    },
  ],
  plugins: [
    new RatelimitHandlerPlugin(),
    new StrictGetMethodPlugin(),
    new ResponseHeadersPlugin(),
    // new BatchHandlerPlugin(),
    // new ETagPlugin(),
    // new CachePlugin(),
  ],
});

export default defineEventHandler(async (event) => {
  const { response } = await handler.handle(toWebRequest(event), {
    prefix: "/api/rpc",
    context: await createContext(event),
  });

  if (response) {
    return response;
  }

  setResponseStatus(event, 404, "Not Found");
  return "Not found";
});