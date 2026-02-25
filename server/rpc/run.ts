import { Effect, Exit } from "effect";

import { AppRuntime, AppRuntimeEnv } from "../main";

import { mapError } from "./errors/index";

/**
 * Executes an Effect with AppRuntime and converts it to a Promise.
 * Used by ORPC handlers to run Effects and return results to the client.
 * Errors are mapped to ORPC errors for proper RPC error handling.
 * @param spanName - Optional custom span name for tracing (defaults to "runORPCEffect")
 */
export const runORPCEffect = async <A, E>(
  effect: Effect.Effect<A, E, AppRuntimeEnv>,
  options?: Parameters<typeof AppRuntime.runPromiseExit>[1] & {
    spanName?: string;
  },
) => {
  const spanName = options?.spanName ?? "runORPCEffect";
  const exit = await AppRuntime.runPromiseExit(effect.pipe(Effect.withSpan(spanName)), options);

  if (Exit.isSuccess(exit)) {
    return exit.value;
  }

  // Error case: map to ORPC error and throw
  throw mapError(exit.cause);
};