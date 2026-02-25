import { createProviderTests } from "../../create-provider-test";
import { DockerProviderLive } from "../index";

createProviderTests({
  name: "docker",
  createAdapter: DockerProviderLive,
  testPackages: {
    valid: "node",
    notFound: "nonexistent-image-xyz",
  },
});