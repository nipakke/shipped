import * as Data from "effect/Data";
import * as Schema from "effect/Schema";

// export class ProviderInfo<TExtraSchema = Schema.Schema<any>> extends Data.Class<{
export class ProviderInfo<TExtraSchema = Schema.Schema<any>> extends Data.Class<{
  id: string; // pl. "npm", "github", "docker"
  name: string; // emberi név
  homepage: string; // provider URL
  icon?: string;

  // Schema for validating extra configuration
  extraSchema?: TExtraSchema;
  // extraSchema?: Schema.Schema<TExtraIn, TExtraIn, never>;
  // Default values for all extra fields
  extraDefaults: Schema.Schema.Type<TExtraSchema>;
}> {}

export * from "./types";