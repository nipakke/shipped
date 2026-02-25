import { Layer } from "effect";

import { UserConfigService } from "./config";
import { PackageService } from "./package";

export const ServicesLive = Layer.empty.pipe(
  Layer.provideMerge(PackageService.live),
  Layer.provideMerge(UserConfigService.live),
);