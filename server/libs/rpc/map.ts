import { ORPCError } from "@orpc/server";
import { Cause } from "effect";
import { invariant } from "es-toolkit";

import type { ORPCErrorRegistry } from "./types";

/**
 * Maps an Effect error Cause to an ORPC error.
 *
 * This function:
 * 1. Extracts error from an Effect Cause
 * 2. Looks up corresponding error mapping in registry by tag
 * 3. Validates error type at runtime using instanceof
 * 4. Transforms Effect error into an ORPC error with proper typing
 *
 * Type Safety:
 * - The registry ensures every possible error has a corresponding ORPC error code
 * - Runtime validation via instanceof guarantees type safety
 * - The ORPC error is thrown with correct schema and status code
 * - Client receives fully typed errors that can be discriminated by code
 *
 * @param cause - The Effect Cause containing error to map
 * @param registry - The error registry containing all mappings
 * @returns never - Always throws an ORPCError (use with Effect.catchAll)
 * @throws ORPCError - The mapped error with proper code, data, and status
 */
export function mapEffectErrorToOrpcError<const Registry extends ORPCErrorRegistry>(
  cause: Cause.Cause<unknown>,
  registry: Registry,
): never {
  if (Cause.isFailType(cause)) {
    const err = cause.error;
    const tag = (err as any)?._tag as string | undefined;
    invariant(tag, new ORPCError("INTERNAL_SERVER_ERROR"));

    const mapping = registry.mappings[tag];

    if (mapping && err instanceof mapping.errorClass) {
      // Cast mapping to access handler with correct error type
      // The instance check above guarantees err is right type
      const result = mapping.handler(err);

      const message = typeof err?.message === "string" ? err.message : undefined;

      throw new ORPCError(mapping.code, {
        ...result,
        status: mapping.status,
        message,
      });
    }
  }

  throw new ORPCError("INTERNAL_SERVER_ERROR");
}