import * as Schema from "effect/Schema";

// UI configuration schema
export const GeneralConfig = Schema.Struct({
  streamConfigChanges: Schema.Boolean.pipe(Schema.optional),
});

export type GeneralConfig = Schema.Schema.Type<typeof GeneralConfig>;