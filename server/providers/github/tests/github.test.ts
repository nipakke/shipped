import { createProviderTests } from "../../create-provider-test";
import { GithubProviderLive } from "../index";
createProviderTests({
  name: "github",
  createAdapter: GithubProviderLive,
  testPackages: {
    valid: "nuxt/nuxt",
    notFound: "nonexistent/nonexistent-owner-repo",
  },
});