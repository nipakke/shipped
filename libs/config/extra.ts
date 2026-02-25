/**
 * Deep merges two objects with the following rules:
 * - Override value takes priority
 * - Arrays are replaced entirely (not merged)
 * - Nested objects are deep merged
 */
export function deepMergeExtra(
  base: Record<string, unknown> | undefined,
  override: Record<string, unknown> | undefined,
): Record<string, unknown> {
  if (!base) return override ?? {};
  if (!override) return base;

  const result: Record<string, unknown> = {};

  for (const key of new Set([...Object.keys(base), ...Object.keys(override)])) {
    const baseValue = base[key];
    const overrideValue = override[key];

    if (Array.isArray(overrideValue)) {
      // Arrays are replaced entirely (swap behavior)
      result[key] = overrideValue;
    } else if (
      typeof baseValue === "object" &&
      typeof overrideValue === "object" &&
      baseValue !== null &&
      overrideValue !== null &&
      !Array.isArray(baseValue)
    ) {
      // Deep merge nested objects
      result[key] = deepMergeExtra(
        baseValue as Record<string, unknown>,
        overrideValue as Record<string, unknown>,
      );
    } else {
      // Primitives and everything else: override wins
      result[key] = overrideValue ?? baseValue;
    }
  }

  return result;
}