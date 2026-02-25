import { FileSystem, Path } from "@effect/platform";
import { Effect, Schema } from "effect";
import { withRepoBase } from "~~/libs/utils/repo";
import { readFileString } from "~~/server/libs/fs";
import yaml from "~~/server/libs/yaml";

import { CONFIG_FILE_EXTENSION } from "./constants";
import type { ConfigAdapter } from "./factory";

export const createConfigLoader = <TSchema extends Schema.Schema<any, any, never>>(
  adapter: ConfigAdapter<TSchema>,
  configDir: string,
) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;
    const filePath = path.join(configDir, `${adapter.configName}.${CONFIG_FILE_EXTENSION}`);

    // Schema.transform can alter data between decoded (runtime) and encoded (persisted) forms.
    // We encode the default value to ensure the written file matches the schema's expected format.
    const encodedContent = yield* Schema.encode(adapter.schema)(adapter.default);
    const defaultYaml = yield* yaml.stringify(encodedContent);
    const schemaUrl = `${withRepoBase("docs/config-files")}/${adapter.configName}.json`;
    const defaultContent = [`# yaml-language-server: $schema: ${schemaUrl}`, defaultYaml].join("\n");

    // @effect-diagnostics-next-line returnEffectInGen:off
    return Effect.gen(function* () {
      const exists = yield* fs.exists(filePath);
      if (!exists) {
        yield* fs.writeFileString(filePath, defaultContent);
      }

      const content = yield* readFileString(filePath, { maxSize: 20_000 });

      return yield* adapter.parse(content);
    });
  });