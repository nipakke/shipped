// oxlint-disable no-unused-vars
import { MemoryRatelimiter, MemoryRatelimiterOptions } from "@orpc/experimental-ratelimit/memory";
import { ORPCError } from "@orpc/server";
import { getClientAddress, isBogon } from "~~/server/utils/ip";

import { osBase } from "../os";

export const createRatelimitMiddleware = (
  opts: MemoryRatelimiterOptions & {
    key: () => string;
  },
) => {
  const limiter = new MemoryRatelimiter(opts);

  return osBase.middleware(async ({ context, procedure, next }) => {
    const pKey = opts.key();
    const ip = getClientAddress(context.event);

    //skip for bogon addresses
    if (!isBogon(ip)) {
      const limiterResult = await limiter.limit(`${ip}:${pKey}`);

      if (!limiterResult.success) {
        throw new ORPCError("TOO_MANY_REQUESTS", {
          data: {
            limit: limiterResult.limit,
            remaining: limiterResult.remaining,
            reset: limiterResult.reset,
          },
        });
      }
    }

    return await next({ context: context });
  });
};