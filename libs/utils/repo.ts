import packageJson from "../../package.json";

const repoUrl = packageJson.repository?.url?.replace("git+", "").replace(".git", "");
const repoMatch = repoUrl?.match(/github\.com\/([^/]+)\/([^/]+)/);
export const REPO_PATH = repoMatch ? `${repoMatch[1]}/${repoMatch[2]}` : undefined;

if (!REPO_PATH) {
  console.warn("Could not determine repo path from package.json repository field");
}

/**
 * Constructs a raw GitHub URL for a given path in the repository.
 * @param path - The path within the repository (e.g., "docs/config-files")
 * @returns The full raw GitHub URL (e.g., "https://raw.githubusercontent.com/owner/repo/main/docs/config-files")
 * @throws If repo path could not be determined from package.json
 */
export const withRepoBase = (path: string) => {
  if (!REPO_PATH) throw new Error("Could not determine repo path from package.json");
  return `https://raw.githubusercontent.com/${REPO_PATH}/main/${path}`;
};