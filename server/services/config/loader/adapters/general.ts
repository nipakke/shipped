import { Effect, Either, Schema } from "effect";
import { toMerged } from "es-toolkit";
import { ConfigWarning, GeneralConfig } from "~~/libs/config/schemas";
import { formatParseError } from "~~/libs/schema";

import { createConfigAdapter, ConfigParseResult } from "../factory";

const DEFAULT_CONTENT = GeneralConfig.make({
  streamConfigChanges: false,
});

const contentDecoder = Schema.decodeUnknownEither(GeneralConfig);

export const generalAdapter = createConfigAdapter({
  name: "general",
  default: DEFAULT_CONTENT,
  schema: GeneralConfig,
  safeParse: (content) => {
    const contentEither = contentDecoder(content);

    if (Either.isRight(contentEither)) {
      const mergedContentEither = contentDecoder(toMerged(DEFAULT_CONTENT, contentEither.right));

      if (Either.isRight(mergedContentEither)) {
        return Effect.succeed(ConfigParseResult.make(mergedContentEither.right, []));
      } else {
        return Effect.succeed(
          ConfigParseResult.make(DEFAULT_CONTENT, [
            ConfigWarning.make({
              message: "Couldn't parse general.yaml - using default settings",
              details: formatParseError(mergedContentEither.left),
              severity: "error",
            }),
          ]),
        );
      }
    }

    return Effect.succeed(
      ConfigParseResult.make(DEFAULT_CONTENT, [
        ConfigWarning.make({
          message: "Couldn't parse general.yaml - using default settings",
          details: formatParseError(contentEither.left),
          severity: "error",
        }),
      ]),
    );
  },
});