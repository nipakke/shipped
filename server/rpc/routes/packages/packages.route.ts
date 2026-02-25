import { Schema } from "effect";
import { z } from "zod/v4";
import { Package } from "~~/libs/packages/schema";
import { PackageService } from "~~/server/services/package";

import { baseProcedure } from "../..";
import { createRatelimitMiddleware } from "../../middlewares/ratelimiter";
import { runORPCEffect } from "../../run";

const OutputSchema = Schema.standardSchemaV1(Package.pipe(Schema.NullOr));

export const packagesRoute = {
  getOne: baseProcedure
    .route({ method: "GET" })
    .input(
      z.object({
        packageId: z.string(),
      }),
    )
    .output(OutputSchema)
    .meta({
      cacheControl: "public, max-age=1800, stale-while-revalidate=21600",
    })
    .use(
      createRatelimitMiddleware({
        key: () => "package",
        maxRequests: 120,
        window: 30_000,
      }),
    )
    .handler(async ({ input }) => {
      return runORPCEffect(PackageService.getOneById(input.packageId), {
        spanName: `packages.getOne:${input.packageId}`,
      });
    }),
};