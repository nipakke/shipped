import { createProviderTests } from "../../create-provider-test";
import { NpmProviderLive } from "../index";

createProviderTests({
  name: "npm",
  createAdapter: NpmProviderLive,
  testPackages: {
    valid: "@rocicorp/zero",
    notFound: "nonexistent-package",
  },
});