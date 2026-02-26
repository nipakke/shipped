import { osBase } from "../os";

export const contextMiddleware = osBase.middleware(async ({ context, next }) => {
  const res = await next({
    context,
  });

  return res;
});