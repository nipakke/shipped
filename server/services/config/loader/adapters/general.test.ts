import { assert, describe, expect, it } from "@effect/vitest";
import { Arbitrary, Effect, Exit, FastCheck } from "effect";
import { toMerged } from "es-toolkit";
import { GeneralConfig } from "~~/libs/config/schemas";
import yaml from "~~/server/libs/yaml";

import { generalAdapter } from "./general";
/* it.prop("ith valid config", [Arbitrary.make(GeneralConfig)], (conf) => {
  }, {
    fastCheck: {
      numRuns: 30,
      seed: 1337
    }
  }) */
describe("config general", () => {
  it.effect("with valid config", () =>
    Effect.gen(function* () {
      const validData = FastCheck.sample(Arbitrary.make(GeneralConfig), {
        seed: 1337,
        numRuns: 50,
      });

      for (const data of validData) {
        const content = yield* yaml.stringify(data);
        const exit = yield* generalAdapter.parse(content).pipe(Effect.exit);

        assert(Exit.isSuccess(exit) === true, "Wrong exit");

        expect(exit.value.warnings.length).toBe(0);

        //should just merge the default with the data
        expect(exit.value.value).toStrictEqual(GeneralConfig.make(toMerged(generalAdapter.default, data)));

        //TODO: test that it doesn't overwrite any valid values
      }
    }),
  );

  it.effect("with invalid config", () =>
    Effect.gen(function* () {
      const parsed = yield* generalAdapter.parse("invalid content");

      expect(parsed.value).toStrictEqual(GeneralConfig.make(generalAdapter.default));
      expect(parsed.warnings.length).toBe(1);
    }),
  );
});