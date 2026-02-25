import * as Data from "effect/Data";

import { UserConfig } from "../schemas";

import { GeneralConfigView } from "./general";
import { ListConfigView } from "./list";
import { PackageConfigView } from "./package";
import { ProvidersConfigView } from "./providers";
import { UIConfigView } from "./ui";
import { ConfigWarningView } from "./warning";

export class UserConfigView extends Data.Class<{
  general: GeneralConfigView;
  ui: UIConfigView;
  lists: ListConfigView[];
  providers: ProvidersConfigView;
  packageMap?: ReadonlyMap<string, PackageConfigView>;
  warnings?: ConfigWarningView[];
}> {
  static make(config: UserConfig) {
    const providers = new ProvidersConfigView(config.providers);

    const lists = config.lists.map((l) => ListConfigView.make(l, config.providers));

    const packageMap = new Map(
      lists?.flatMap((list) => list.packages.map((pkg) => [PackageConfigView.hash(pkg), pkg] as const)),
    );

    const general = new GeneralConfigView(config.general);
    const ui = new UIConfigView(config.ui);

    const warnings = config.warnings.map((w) => new ConfigWarningView(w));

    return new UserConfigView({
      general,
      ui,
      packageMap,
      lists,
      providers,
      warnings,
    });
  }
}