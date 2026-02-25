import { deburr } from "es-toolkit/string";

export function slugify(s: string): string {
  return deburr(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}