import { Data, Effect, pipe, Schema } from "effect";
import { ConfigWarning } from "~~/libs/config/schemas";

import yaml from "../../../libs/yaml";

export class ConfigParseResult<A> extends Data.Class<{
  value: A;
  warnings: ConfigWarning[];
}> {
  static make<A>(value: A, warnings: ConfigWarning[]) {
    return new ConfigParseResult({ value, warnings });
  }
}

type AdapterOptions<
  TSchema extends Schema.Schema.Any,
  SIn = Schema.Schema.Encoded<TSchema>,
  SOut = Schema.Schema.Type<TSchema>,
> = {
  name: string;
  schema: TSchema;
  default: SIn;
  safeParse: (content: unknown) => Effect.Effect<ConfigParseResult<SOut>, never>;
};

export interface ConfigAdapter<
  TSchema extends Schema.Schema.Any,
  SIn = Schema.Schema.Encoded<TSchema>,
  SOut = Schema.Schema.Type<TSchema>,
> {
  readonly configName: string;
  readonly default: SIn;
  readonly schema: TSchema;
  readonly parse: (content: string) => Effect.Effect<ConfigParseResult<SOut>, never, never>;
}

export const createConfigAdapter = <TSchema extends Schema.Schema.Any>(
  opts: AdapterOptions<TSchema>,
): ConfigAdapter<TSchema> => {
  const { safeParse } = opts;

  return {
    configName: opts.name,
    default: opts.default,
    schema: opts.schema,
    parse: (content: string) =>
      Effect.gen(function* () {
        const data = yield* pipe(
          yaml.parse(content),
          Effect.flatMap((yamlData) => safeParse(yamlData)),
          Effect.catchAll((e) => {
            return Effect.succeed(
              ConfigParseResult.make(opts.default as Schema.Schema.Type<TSchema>, [
                ConfigWarning.make({
                  message: e.message,
                  severity: "error",
                  group: opts.name,
                  details: e.cause?.message,
                }),
              ]),
            );
          }),
        );

        const warnings = data.warnings.map((w) => {
          return ConfigWarning.make({
            ...w,
            group: opts.name,
          });
        });

        return ConfigParseResult.make(data.value, warnings);
      }),
  };
};