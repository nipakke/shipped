import * as Schema from "effect/Schema";

export const ConfigWarning = Schema.Struct({
  message: Schema.String,
  group: Schema.String.pipe(Schema.optional),
  severity: Schema.Literal("warning", "error").pipe(Schema.optional),
  path: Schema.String.pipe(Schema.optional),
  code: Schema.String.pipe(Schema.optional),
  details: Schema.String.pipe(Schema.optional),
});

export type ConfigWarning = Schema.Schema.Type<typeof ConfigWarning>;