import { z } from "zod/v4";

import { ErrorMapping, MappedErrorMap, MappingsByTag, ORPCErrorRegistry } from "./types";

/**
 * Creates a single error mapping that connects an Effect TaggedError to an ORPC error.
 *
 * This factory function:
 * - Extracts the tag from the Effect error class prototype
 * - Associates an ORPC error code with a specific Effect error type
 * - Provides a handler to transform Effect error data into ORPC-compatible format
 * - Ensures type-safe error handling at both compile-time and runtime
 */
export function makeError<
  const Tag extends string,
  const Code extends string,
  Schema extends z.ZodTypeAny,
  ErrorClass extends new (...args: any[]) => any,
>(config: {
  code: Code;
  schema: Schema;
  status: number;
  taggedError: ErrorClass;
  handler: (error: InstanceType<ErrorClass>) => {
    data: z.input<Schema>;
    message?: string;
    cause?: unknown;
  };
}): ErrorMapping<Tag, Code, Schema, ErrorClass> {
  const tag = config.taggedError.prototype.name as Tag;

  return {
    tag,
    code: config.code,
    schema: config.schema,
    errorClass: config.taggedError,
    status: config.status,
    handler: config.handler,
  };
}

/**
 * Builds a registry from multiple error mappings, creating both an ORPC ErrorMap
 * and a discriminated record for type-safe error lookup.
 *
 * How it works:
 * 1. Each ErrorMapping connects an Effect TaggedError to an ORPC error code
 * 2. The registry maintains full type safety - when you access a mapping by tag,
 *    TypeScript knows the exact error type, code, and schema
 * 3. The errorMap is compatible with ORPC's error system and ensures every error
 *    is properly defined with its schema
 *
 * Type Safety Guarantees:
 * - Client-side: When ORPC throws an error, the client knows the exact error code
 *   and can type-narrow based on the discriminated union
 * - Server-side: Effect errors are mapped to their corresponding ORPC errors with
 *   compile-time validation that all error codes are handled
 * - Every error in the registry is a DEFINED error in ORPC, meaning the client
 *   can handle all possible error responses with full type safety
 */
export function makeErrorsRegistry<const Mappings extends readonly ErrorMapping[]>(
  mappings: Mappings,
): ORPCErrorRegistry<Mappings> {
  const result = mappings.reduce(
    (acc, mapping) => {
      (acc.errorMap as Record<string, unknown>)[mapping.code] = {
        status: mapping.status,
        data: mapping.schema,
      };

      (acc.mappings as Record<string, unknown>)[mapping.tag] = mapping;

      return acc;
    },
    {
      errorMap: {} as MappedErrorMap<Mappings>,
      mappings: {} as MappingsByTag<Mappings>,
    },
  );

  return {
    errorMap: result.errorMap,
    mappings: result.mappings,
  };
}

// Re-export types for convenience
export type { ErrorMapping, MappedErrorMap, MappingsByTag } from "./types";