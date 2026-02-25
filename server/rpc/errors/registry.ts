import z from "zod/v4";
import { InvalidPackageNameError, NetworkError, PackageNotFoundError } from "~~/server/libs/provider/errors";
import { makeError, makeErrorsRegistry } from "~~/server/libs/rpc/define";
import { UnconfiguredPackageError } from "~~/server/services/package/errors";
import { ProviderNotFoundError } from "~~/server/services/provider/errors";

export const rpcErrors = makeErrorsRegistry([
  makeError({
    taggedError: PackageNotFoundError,
    code: "PACKAGE_NOT_FOUND",
    status: 404,
    schema: z.object({
      name: z.string(),
      provider: z.string(),
    }),
    handler: (e) => ({
      data: { name: e.name, provider: e.provider },
    }),
  }),
  makeError({
    taggedError: NetworkError,
    code: "PROVIDER_ERROR",
    status: 502,
    schema: z.object({
      provider: z.string(),
    }),
    handler: (e) => ({
      data: { provider: e.provider },
    }),
  }),
  makeError({
    taggedError: InvalidPackageNameError,
    code: "INVALID_PACKAGE",
    status: 400,
    schema: z.object({
      name: z.string(),
    }),
    handler: (e) => ({
      data: { name: e.name },
    }),
  }),
  makeError({
    taggedError: UnconfiguredPackageError,
    code: "UNCONFIGURED_PACKAGE",
    status: 400,
    schema: z.object({
      hash: z.string(),
    }),
    handler: (e) => ({
      data: { hash: e.hash },
    }),
  }),
  makeError({
    taggedError: ProviderNotFoundError,
    code: "PROVIDER_NOT_FOUND",
    status: 400,
    schema: z.object({
      id: z.string(),
      supported: z.array(z.string()).readonly().optional(),
    }),
    handler: (e) => ({
      data: { id: e.id, supported: e.supported },
    }),
  }),
]);