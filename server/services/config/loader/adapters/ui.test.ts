import { describe, expect, it } from "@effect/vitest";
import { Effect } from "effect";
import { UIConfig } from "~~/libs/config/schemas";

import { uiAdapter } from "./ui";

describe("config providers", () => {
  /* it.effect("with empty config", () => Effect.gen(function* () {
    const content = yield* yaml.stringify({})
    const exit = yield* providersAdapter.parse(content).pipe(Effect.exit)

    assert(Exit.isSuccess(exit) === true, "Wrong exit")

    expect(exit.value.warnings.length).toBe(0)

    //should just merge the default with the data
    expect(exit.value.value).toStrictEqual(ProvidersConfig.make(toMerged(providersAdapter.defaultValue, {})))

    //TODO: test that it doesn't overwrite any valid values
  })) */

  it.effect("with invalid config", () =>
    Effect.gen(function* () {
      const parsed = yield* uiAdapter.parse("invalid content");

      expect(parsed.value).toStrictEqual(UIConfig.make(uiAdapter.default));
      expect(parsed.warnings.length).toBe(1);
    }),
  );
});