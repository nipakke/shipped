import { osBase } from "../os";

export const cacheMiddleware = osBase.middleware(async ({ next, procedure, context }) => {
  const output = await next();
  const meta = procedure["~orpc"].meta;

  //always disable cache control in dev
  if (context.nodeEnv === "development") {
    context.resHeaders?.append("Cache-Control", "no-cache, no-store");
  } else if (meta.cacheControl) {
    context.resHeaders?.append("Cache-Control", meta.cacheControl);
  }
  return output;
});