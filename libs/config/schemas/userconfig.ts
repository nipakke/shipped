import * as Schema from "effect/Schema";

import { GeneralConfig } from "./general";
import { ListConfig } from "./list";
import { ProvidersConfig } from "./providers";
import { UIConfig } from "./ui";
import { ConfigWarning } from "./warning";

// User configuration schema
export const UserConfig = Schema.Struct({
  ui: UIConfig,
  general: GeneralConfig,
  lists: Schema.Array(ListConfig),
  providers: ProvidersConfig,
  warnings: ConfigWarning.pipe(Schema.Array),
});

export type UserConfig = Schema.Schema.Type<typeof UserConfig>;