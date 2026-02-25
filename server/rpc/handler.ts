import { RatelimitHandlerPlugin } from "@orpc/experimental-ratelimit";
import { RPCHandler } from "@orpc/server/fetch";
import { StrictGetMethodPlugin } from "@orpc/server/plugins";
import { ResponseHeadersPlugin } from "@orpc/server/plugins";
import { orpcRouter } from "~~/server/rpc/router";

import { createContext } from "./context";

const handler = new RPCHandler(orpcRouter, {
  plugins: [new RatelimitHandlerPlugin(), new StrictGetMethodPlugin(), new ResponseHeadersPlugin()],
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