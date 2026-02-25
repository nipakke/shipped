import { cacheMiddleware } from "./middlewares/cache";
import { contextMiddleware } from "./middlewares/context";
import { osBase } from "./os";

export const baseProcedure = osBase.use(cacheMiddleware).use(contextMiddleware);