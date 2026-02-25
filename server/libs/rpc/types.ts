import type z from "zod/v4";

type AnyErrorClass = new (...args: any) => any;

/**
 * Represents a single error mapping that connects an Effect TaggedError to an ORPC error.
 *
 * This ensures:
 * - Type-safe mapping between Effect errors and ORPC errors
 * - Proper schema validation for error data
 * - Runtime type checking via instanceof
 */
export interface ErrorMapping<
  Tag extends string = string,
  Code extends string = string,
  Schema extends z.ZodTypeAny = z.ZodTypeAny,
  ErrorClass extends AnyErrorClass = AnyErrorClass,
> {
  /** The tag of the Effect TaggedError (used for lookup) */
  tag: Tag;
  /** The ORPC error code (must be unique within a registry) */
  code: Code;
  /** Zod schema for validating error data */
  schema: Schema;
  /** HTTP status code for this error */
  status: number;
  /** The Effect TaggedError class constructor */
  errorClass: ErrorClass;
  /** Handler that transforms the Effect error into ORPC error data */
  handler: (error: InstanceType<ErrorClass>) => {
    data: z.input<Schema>;
    message?: string;
    cause?: unknown;
  };
}

/**
 * Creates an ORPC ErrorMap type from an array of ErrorMappings.
 *
 * This type ensures that every error code has the correct schema,
 * making the error map type-safe for both server and client.
 */
export type MappedErrorMap<Mappings extends readonly ErrorMapping[]> = {
  [K in Mappings[number]["code"]]: {
    status: number;
    data: Extract<Mappings[number], { code: K }>["schema"];
  };
};

/**
 * Creates a discriminated record type mapping tags to their ErrorMappings.
 *
 * This allows type-safe lookups of error handlers by tag at runtime,
 * with full type inference for the specific error type.
 */
export type MappingsByTag<Mappings extends readonly ErrorMapping[]> = {
  [K in Mappings[number] as K["tag"]]: Extract<Mappings[number], { tag: K["tag"] }>;
};

export type ORPCErrorRegistry<Mappings extends readonly ErrorMapping[] = ErrorMapping[]> = {
  errorMap: MappedErrorMap<Mappings>;
  mappings: MappingsByTag<Mappings>;
};