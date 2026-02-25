import { ProviderInfosRegistry } from "#shared/provider-infos";
import { Effect, Either, Schema } from "effect";
import { ConfigWarning, ProviderConfig } from "~~/libs/config/schemas";
import { formatParseError } from "~~/libs/schema";

import { createConfigAdapter, ConfigParseResult } from "../factory";

const getAllProviderDefaults = (): Record<string, ProviderConfig> => {
  const defaults: Record<string, ProviderConfig> = {};
  const allProviders = ProviderInfosRegistry.listAll();

  for (const providerInfo of allProviders) {
    defaults[providerInfo.id] = {
      extra: providerInfo.extraDefaults,
    };
  }

  return defaults;
};

const DEFAULT_CONTENT = getAllProviderDefaults();

const schema = Schema.Record({ key: Schema.String, value: ProviderConfig });
const providerConfigDecoder = Schema.decodeUnknownEither(ProviderConfig);

export const providersAdapter = createConfigAdapter({
  name: "providers",
  default: DEFAULT_CONTENT,
  schema: schema,
  safeParse: (content) =>
    Effect.sync(() => {
      const warnings: ConfigWarning[] = [];
      const validatedProviders: Record<string, ProviderConfig> = {};

      const contentEither = Schema.decodeUnknownEither(schema)(content);

      if (Either.isLeft(contentEither)) {
        warnings.push(
          ConfigWarning.make({
            message: "providers.yaml has invalid format - using default provider settings",
            details: formatParseError(contentEither.left),
            severity: "error",
          }),
        );
        return {
          value: DEFAULT_CONTENT,
          warnings,
        };
      }

      const providersConfig = contentEither.right;
      const definedProviderIds = Object.keys(providersConfig);

      const allDefaults = DEFAULT_CONTENT;

      for (const providerId of definedProviderIds) {
        const providerInfo = ProviderInfosRegistry.get(providerId);

        if (!providerInfo) {
          warnings.push(
            ConfigWarning.make({
              message: `'${providerId}' is not a supported provider and will be ignored`,
              severity: "warning",
            }),
          );
          continue;
        }

        const providerConfig = providersConfig[providerId];

        const providerConfigEither = providerConfigDecoder(providerConfig);

        if (Either.isLeft(providerConfigEither)) {
          warnings.push(
            ConfigWarning.make({
              message: `Invalid settings for '${providerId}' - using defaults`,
              details: formatParseError(providerConfigEither.left),
              severity: "error",
            }),
          );
          validatedProviders[providerId] = providerInfo.extraDefaults;
          continue;
        }

        const parsedConfig = providerConfigEither.right;
        const userExtras = parsedConfig.extra || {};

        let validatedExtras = userExtras;

        if (providerInfo.extraSchema) {
          const extrasEither = Schema.decodeUnknownEither(Schema.partial(providerInfo.extraSchema))(
            userExtras,
          );

          if (Either.isLeft(extrasEither)) {
            warnings.push(
              ConfigWarning.make({
                message: `Invalid extra options for '${providerId}' - using defaults where possible`,
                details: formatParseError(extrasEither.left),
                severity: "warning",
              }),
            );
          } else {
            validatedExtras = extrasEither.right;
          }
        }

        const finalExtras = { ...providerInfo.extraDefaults, ...validatedExtras };

        validatedProviders[providerId] = ProviderConfig.make({
          extra: finalExtras,
        });
      }

      for (const [providerId, defaultConfig] of Object.entries(allDefaults)) {
        if (!(providerId in validatedProviders)) {
          validatedProviders[providerId] = defaultConfig;
        }
      }

      return ConfigParseResult.make(validatedProviders, warnings);
    }),
});