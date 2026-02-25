import * as Schema from "effect/Schema";

export interface StateCarrierOptions<S extends Schema.Schema.Any> {
  key: string;
  schema?: S;
}

export interface StateCarrier<T> {
  inject: (obj: unknown, data: T) => boolean;
  extract: (obj: unknown) => T | undefined;
}

/**
 * Creates a state carrier for injecting/extracting typed data from objects.
 * Useful for passing state across boundaries (e.g., SSR to client).
 * When a schema is provided, data is encoded on inject and decoded on extract.
 *
 * @example
 * const carrier = createStateCarrier<UserConfig>({ key: "#CONFIG", schema: UserConfig });
 * carrier.inject(payload, config); // server
 * const config = carrier.extract(payload); // client
 */
export function createStateCarrier<S extends Schema.Schema<any, any, never>, T = Schema.Schema.Type<S>>(
  options: StateCarrierOptions<S>,
): StateCarrier<T> {
  const { key, schema } = options;

  function inject(obj: unknown, data: T): boolean {
    if (obj && typeof obj === "object") {
      const encoded = schema ? Schema.encodeSync(schema)(data) : data;
      Object.assign(obj as object, { [key]: encoded });
      return true;
    }
    return false;
  }

  function extract(obj: unknown): T | undefined {
    if (obj && typeof obj === "object" && key in obj) {
      try {
        const value = (obj as Record<string, unknown>)[key];
        if (schema) {
          return Schema.decodeUnknownSync(schema)(value);
        }
        return value as T;
      } catch (err) {
        console.warn(`Failed to extract data with key "${key}":`, obj, err);
      }
    }
    return undefined;
  }

  return { inject, extract };
}