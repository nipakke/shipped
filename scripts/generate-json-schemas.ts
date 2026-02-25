import Ajv from "ajv";
import { JSONSchema, Schema } from "effect";
import { writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";

import { GeneralConfig, ListConfig, UIConfig } from "../libs/config/schemas";
import { withRepoBase } from "../libs/utils/repo";
import { ProviderInfosRegistry } from "../shared/provider-infos";

const CONFIG = {
  baseUrl: withRepoBase("docs/config-files"),
  outputDir: join(process.cwd(), "docs", "config-files"),
  schemaVersion: "http://json-schema.org/draft-07/schema#",
} as const;

// UTILITIES
function createMetadata(name: string, description: string) {
  return {
    $schema: CONFIG.schemaVersion,
    $id: `${CONFIG.baseUrl}/${name}.json`,
    title: `${pascalCase(name)} Configuration`,
    description,
  };
}

function pascalCase(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function makeEffectSchema(schema: Schema.Schema.Any): unknown {
  return JSONSchema.make(schema);
}

// SCHEMA BUILDERS
interface SchemaBuilder {
  name: string;
  description: string;
  build(): unknown;
}

function buildProvidersSchema(): unknown {
  const providers = ProviderInfosRegistry.listAll();
  const properties: Record<string, unknown> = {};

  for (const provider of providers) {
    if (provider.extraSchema) {
      const extraJsonSchema = JSONSchema.make(provider.extraSchema as Schema.Schema.Any);
      properties[provider.id] = {
        type: "object",
        properties: {
          extra: extraJsonSchema,
        },
        additionalProperties: false,
      };
    } else {
      properties[provider.id] = {
        type: "object",
        additionalProperties: false,
      };
    }
  }

  return {
    type: "object",
    properties,
    additionalProperties: false,
  };
}

function buildPackageUnion(): { defs: Record<string, unknown>; oneOf: unknown[] } {
  const providers = ProviderInfosRegistry.listAll();
  const defs: Record<string, unknown> = {};
  const oneOf: Array<unknown> = [];

  for (const provider of providers) {
    const extraJsonSchema = provider.extraSchema
      ? JSONSchema.make(provider.extraSchema as Schema.Schema.Any)
      : { type: "object" };

    const packageDefName = `${pascalCase(provider.id)}Package`;
    const extraDefName = `${pascalCase(provider.id)}Extra`;

    defs[extraDefName] = extraJsonSchema;

    defs[packageDefName] = {
      type: "object",
      properties: {
        provider: { const: provider.id },
        name: { type: "string" },
        extra: { $ref: `#/$defs/${extraDefName}` },
        icon: { type: "string" },
        iconDark: { type: "string" },
        displayName: { type: "string" },
      },
      required: ["provider", "name"],
      additionalProperties: false,
    };

    oneOf.push({ $ref: `#/$defs/${packageDefName}` });
  }

  return { defs, oneOf };
}

function buildListsSchema(): unknown {
  const baseSchema = JSONSchema.make(ListConfig.pipe(Schema.Array) as Schema.Schema.Any);
  const { defs, oneOf } = buildPackageUnion();

  const listSchema = JSON.parse(JSON.stringify(baseSchema));

  function replacePackageSchema(obj: unknown): void {
    if (typeof obj !== "object" || obj === null) return;

    if (Array.isArray(obj)) {
      for (const item of obj) {
        replacePackageSchema(item);
      }
    } else {
      const record = obj as Record<string, unknown>;

      if (
        record.properties &&
        typeof record.properties === "object" &&
        "provider" in (record.properties as Record<string, unknown>) &&
        "name" in (record.properties as Record<string, unknown>)
      ) {
        const newRecord: Record<string, unknown> = { oneOf };
        for (const key of Object.keys(record)) {
          if (
            key !== "type" &&
            key !== "properties" &&
            key !== "required" &&
            key !== "additionalProperties"
          ) {
            newRecord[key] = record[key];
          }
        }
        for (const key of Object.keys(record)) {
          delete record[key];
        }
        Object.assign(record, newRecord);
        return;
      }

      for (const key of Object.keys(record)) {
        replacePackageSchema(record[key]);
      }
    }
  }

  replacePackageSchema(listSchema);

  listSchema.$defs = {
    ...listSchema.$defs,
    ...defs,
  };

  return listSchema;
}

function buildStandardSchema(schema: Schema.Schema.Any): Record<string, unknown> {
  return makeEffectSchema(schema) as Record<string, unknown>;
}

const builders: SchemaBuilder[] = [
  {
    name: "providers",
    description: "Providers configuration with provider-specific extra fields",
    build: buildProvidersSchema,
  },
  {
    name: "lists",
    description: "Lists configuration with provider-specific package extra fields",
    build: buildListsSchema,
  },
  {
    name: "general",
    description: "General configuration",
    build: () => buildStandardSchema(GeneralConfig),
  },
  {
    name: "ui",
    description: "UI configuration",
    build: () => buildStandardSchema(UIConfig),
  },
];

// VALIDATION
const ajv = new Ajv({ strict: false });

function validateSchema(name: string, schema: unknown): void {
  try {
    ajv.compile(schema as object);
  } catch (error) {
    console.error(`Validation failed for ${name}.json:`, error);
    throw new Error(`Schema validation failed for ${name}`, { cause: error });
  }
}

// MAIN
function main(): void {
  // Ensure output directory exists
  if (!existsSync(CONFIG.outputDir)) {
    mkdirSync(CONFIG.outputDir, { recursive: true });
  }

  // Step 1: Generate all schemas
  const generated = new Map<string, unknown>();

  for (const builder of builders) {
    const schema = builder.build() as Record<string, unknown>;
    const fullSchema = {
      ...createMetadata(builder.name, builder.description),
      ...schema,
    };
    generated.set(builder.name, fullSchema);
  }

  // Step 2: Validate all schemas (stop on failure)
  for (const [name, schema] of generated) {
    validateSchema(name, schema);
  }

  // Step 3: Write all schemas (only if validation passes)
  for (const [name, schema] of generated) {
    const outputPath = join(CONFIG.outputDir, `${name}.json`);
    writeFileSync(outputPath, JSON.stringify(schema, null, 2));
  }

  console.log(`Generated ${generated.size} schemas`);
}

main();