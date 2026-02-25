import * as Data from "effect/Data";
import { hash } from "ohash";
import type { Merge } from "type-fest";

import type { PackageSpec } from "../packages/schema";

import { deepMergeExtra } from "./extra";
import {
  ConfigWarning,
  PackageConfig,
  ProviderConfig,
  type ProvidersConfig,
  type GeneralConfig,
  type ListConfig,
  type UIConfig,
  type UserConfig,
} from "./schemas";

export class PackageConfigView extends Data.Class<
  PackageConfig & {
    providerConfig?: ProviderConfig;
  }
> {
  providerExtra = this.providerConfig?.extra;
  effectiveExtra = deepMergeExtra(this.providerExtra, this.extra);

  /**
   * A unique identifier for this package with.
   * Hash with the provider's extra config
   */
  packageId = PackageConfigView.hash(this);

  get spec(): PackageSpec {
    return {
      name: this.name,
      provider: this.provider,
      extra: this.extra,
    };
  }

  static hash(config: PackageConfigView): string {
    //in dev for debugging use a more talkative ID
    if (import.meta.dev) {
      return `${config.spec.name}:${config.spec.provider}:${hash(config.spec.extra)}:${JSON.stringify(config.providerExtra)}`;
    }

    return hash({
      spec: config.spec,
      extra: config.providerExtra,
    });
  }

  static make(config: PackageConfig, providerConfig?: ProviderConfig) {
    return new PackageConfigView({
      ...config,
      providerConfig: providerConfig,
    });
  }
}

export class GeneralConfigView extends Data.Class<GeneralConfig> {}
export class UIConfigView extends Data.Class<UIConfig> {}
export class ProvidersConfigView extends Data.Class<ProvidersConfig> {}

export class ListConfigView extends Data.Class<
  Merge<
    ListConfig,
    {
      groups: Merge<NonNullable<ListConfig["groups"]>[number], { packages: PackageConfigView[] }>[];
    }
  >
> {
  static make(config: ListConfig, providers: ProvidersConfig) {
    const groups = config.groups ?? [];

    return new ListConfigView({
      ...config,
      // oxlint-disable-next-line oxc/no-map-spread
      groups: groups.map((group) => {
        return {
          ...group,
          packages: group.packages.map((pkgRaw) => {
            const provider = providers[pkgRaw.provider.toLowerCase()];

            return PackageConfigView.make(pkgRaw, provider);
          }),
        };
      }),
    });
  }
}
export class ConfigWarningView extends Data.Class<ConfigWarning> {}

export class UserConfigView extends Data.Class<{
  general: GeneralConfigView;
  ui: UIConfigView;
  lists: ListConfigView[];
  providers: ProvidersConfigView;
  packageMap: ReadonlyMap<string, PackageConfigView>;
  warnings: ConfigWarningView[];
}> {
  static make(config: UserConfig) {
    const providers = new ProvidersConfigView(config.providers);

    const lists = config.lists.map((l) => ListConfigView.make(l, config.providers));

    const groups = lists.flatMap((l) => l.groups);

    const packageMap = new Map(
      groups?.flatMap((g) => g.packages.map((pkg) => [PackageConfigView.hash(pkg), pkg] as const)),
    );

    const general = new GeneralConfigView(config.general);
    const ui = new UIConfigView(config.ui);

    return new UserConfigView({
      general,
      ui,
      packageMap,
      lists,
      providers,
      warnings: config.warnings.map((w) => new ConfigWarningView(w)),
    });
  }
}