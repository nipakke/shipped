import { createProviderTests } from "../../create-provider-test";
import { PythonProviderLive } from "../index";

createProviderTests({
  name: "python",
  createAdapter: PythonProviderLive,
  testPackages: {
    valid: "requests",
    notFound: "nonexistent-package",
  },
});