import * as Data from "effect/Data";

import { slugify } from "../../strings/slugify";
import { ListConfig, ProvidersConfig } from "../schemas";

import { PackageConfigView } from "./package";

export class ListConfigView extends Data.Class<
  Omit<ListConfig, "packages"> & {
    packages: PackageConfigView[];
  }
> {
  slug = slugify(this.name);

  static make(config: ListConfig, providers: ProvidersConfig) {
    return new ListConfigView({
      ...config,
      packages: config.packages.map((pkgRaw) => {
        const provider = providers[pkgRaw.provider.toLowerCase()];

        return PackageConfigView.make(pkgRaw, provider);
      }),
    });
  }
}