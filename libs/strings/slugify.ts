import { deburr } from "es-toolkit/string";

function getShortHash(str: string) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    // Using "| 0" or ">>> 0" keeps it within 32-bit integer range
    hash = ((hash << 5) + hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash).toString(36);
}

export function slugify(
  s: string,
  opts?: {
    /**
     * Always add the hash at the end of the slug to avoid collisions
     *
     * @default false
     */
    preventCollisions?: boolean;
  },
): string {
  const baseSlug = deburr(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const hash = getShortHash(s);

  // If the string was ONLY special characters, baseSlug is empty.
  // In that case, just return the hash.

  if (opts?.preventCollisions) {
    return baseSlug ? `${baseSlug}-${hash}` : hash;
  }

  if (!baseSlug.length) return hash;
  return baseSlug;
}