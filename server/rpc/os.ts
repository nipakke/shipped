import { os } from "@orpc/server";

import { ORPCContext } from "./context";
import { rpcErrors } from "./errors/index";

interface ORPCMetadata {
  cacheControl?: string;
}

export const osBase = os.errors(rpcErrors.errorMap).$context<ORPCContext>().$meta<ORPCMetadata>({});