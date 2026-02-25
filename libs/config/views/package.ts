import * as Data from "effect/Data";
import { hash } from "ohash";

import { PackageSpec } from "../../packages/schema";
import { PackageConfig, ProviderConfig } from "../schemas";

export class PackageConfigView extends Data.Class<
  PackageConfig & {
    providerConfig?: ProviderConfig;
  }
> {
  providerExtra = this.providerConfig?.extra;

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