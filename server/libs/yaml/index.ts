import { Data, Effect } from "effect";
import * as yaml from "yaml";

export class YamlParseError extends Data.TaggedError("YamlParseError")<{
  readonly cause?: import("yaml").YAMLParseError;
  readonly data?: unknown;
}> {
  override get message() {
    return `Failed to parse YAML`;
  }
}

const parse = (data: string) =>
  Effect.sync(() => yaml.parse(data)).pipe(
    Effect.catchAllDefect((error) => {
      return Effect.fail(
        new YamlParseError({
          cause: error instanceof yaml.YAMLParseError ? error : undefined,
          data,
        }),
      );
    }),
  );

const stringify = (data: unknown) => {
  return Effect.sync(() => yaml.stringify(data));
};

export default {
  stringify,
  parse,
};