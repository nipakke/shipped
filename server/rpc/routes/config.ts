import { eventIterator } from "@orpc/server";
import { Effect, Schedule, Schema, Stream } from "effect";
import { UserConfig } from "~~/libs/config/schemas";
import { UserConfigService } from "~~/server/services/config";

import { baseProcedure } from "..";
import { createRatelimitMiddleware } from "../middlewares/ratelimiter";
import { runORPCEffect } from "../run";

export const configRoute = {
  getStream: baseProcedure
    .route({
      method: "GET",
    })
    .output(
      eventIterator(
        Schema.standardSchemaV1(
          Schema.Union(
            Schema.Struct({
              type: Schema.Literal("config"),
              data: UserConfig,
            }),
            Schema.Struct({
              type: Schema.Literal("ping"),
            }),
          ),
        ),
      ),
    )
    .handler(async function* () {
      const configProgram = Effect.gen(function* () {
        const config = yield* UserConfigService;
        const fullConfig = yield* config.config.get;

        if (!fullConfig?.general?.streamConfigChanges) {
          return { type: "config" as const, data: fullConfig };
        }

        const configStream = config.config.changes.pipe(
          Stream.map((data) => ({ type: "config" as const, data })),
        );

        const pingInterval = import.meta.dev ? "1 second" : "5 seconds";
        const pingStream = Stream.repeatEffectWithSchedule(
          Effect.succeed({ type: "ping" as const }),
          Schedule.spaced(pingInterval),
        );

        const mergedStream = Stream.merge(configStream, pingStream);

        return Stream.toAsyncIterable(mergedStream);
      });

      const iteratorOrConfig = await runORPCEffect(configProgram, { spanName: "config.getStream" });

      if (iteratorOrConfig && Symbol.asyncIterator in iteratorOrConfig) {
        for await (const payload of iteratorOrConfig) {
          //close the stream if config changes
          if (payload.type === "config" && !payload.data?.general?.streamConfigChanges) {
            return payload;
          }
          yield payload;
        }
      }

      if (iteratorOrConfig && !(Symbol.asyncIterator in iteratorOrConfig)) {
        return iteratorOrConfig;
      }
    }),
  get: baseProcedure
    .route({
      method: "GET",
    })
    .output(Schema.standardSchemaV1(UserConfig))
    .use(
      createRatelimitMiddleware({
        key: () => "config",
        maxRequests: 200,
        window: 30000,
      }),
    )
    .handler(async () => {
      return await runORPCEffect(UserConfigService.config, { spanName: "config.get" });
    }),
};