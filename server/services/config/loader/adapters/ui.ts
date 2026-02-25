import { Effect, Either, Schema } from "effect";
import { toMerged } from "es-toolkit";
import { ConfigWarning, UIConfig } from "~~/libs/config/schemas";
import { formatParseError } from "~~/libs/schema";

import { createConfigAdapter, ConfigParseResult } from "../factory";

const DEFAULT_CONTENT = UIConfig.make({
  maxListsInHeader: 3,
});

const contentDecoder = Schema.decodeUnknownEither(UIConfig);

export const uiAdapter = createConfigAdapter({
  name: "ui",
  default: DEFAULT_CONTENT,
  schema: UIConfig,
  safeParse(content) {
    const contentEither = contentDecoder(content);

    if (Either.isRight(contentEither)) {
      const mergedContentEither = contentDecoder(toMerged(DEFAULT_CONTENT, contentEither.right));

      if (Either.isRight(mergedContentEither)) {
        return Effect.succeed(ConfigParseResult.make(mergedContentEither.right, []));
      } else {
        return Effect.succeed(
          ConfigParseResult.make(DEFAULT_CONTENT, [
            ConfigWarning.make({
              message: "Couldn't parse ui.yaml - using default settings",
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
          message: "Couldn't parse ui.yaml - using default settings",
          details: formatParseError(contentEither.left),
          severity: "error",
        }),
      ]),
    );
  },
});