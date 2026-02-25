import { Cause } from "effect";
import { mapEffectErrorToOrpcError } from "~~/server/libs/rpc/map";

import { rpcErrors } from "./registry";

export function mapError(cause: Cause.Cause<unknown>): never {
  throw mapEffectErrorToOrpcError(cause, rpcErrors);
}

export { rpcErrors } from "./registry";

export type { ErrorMapping, MappedErrorMap, MappingsByTag } from "~~/server/libs/rpc/types";