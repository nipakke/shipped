import * as Schema from "effect/Schema";

export const UIConfig = Schema.Struct({
  maxListsInHeader: Schema.Number.pipe(Schema.optional),
});

export type UIConfig = Schema.Schema.Type<typeof UIConfig>;