import { configRoute } from "./routes/config";
import { packagesRoute } from "./routes/packages/packages.route";

export const orpcRouter = {
  packages: packagesRoute,
  config: configRoute,
};