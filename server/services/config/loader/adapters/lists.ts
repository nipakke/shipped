import { ProviderInfosRegistry } from "#shared/provider-infos";
import { Effect, Either, Option, Schema } from "effect";
import { isUndefined } from "es-toolkit";
import { ListConfig, PackageConfig, ConfigWarning } from "~~/libs/config/schemas";
import { formatParseError } from "~~/libs/schema";
import { slugify } from "~~/libs/strings/slugify";

import { createConfigAdapter, ConfigParseResult } from "../factory";

const DEFAULT_CONTENT = [
  ListConfig.make({
    name: "Tech stack",
    description: "App tech stack. Edit lists.yaml to customize.",
    groups: [
      {
        name: "frameworks",
        packages: [
          {
            name: "nuxt/nuxt",
            provider: "github",
          },
          {
            name: "effect",
            provider: "npm",
            extra: {
              tags: ["latest", "beta"],
            },
          },
          {
            name: "middleapi/orpc",
            provider: "github",
            displayName: "ORPC",
          },
        ],
      },
      {
        name: "client",
        packages: [
          {
            name: "@tanstack/vue-query",
            provider: "npm",
          },
          {
            name: "nuxt/ui",
            provider: "github",
          },
          {
            name: "tailwindcss",
            provider: "npm",
          },
        ],
      },
    ],
  }),
  ListConfig.make({
    name: "Apps",
    groups: [
      {
        name: "all",
        showName: false,
        packages: [
          { name: "mifi/lossless-cut", provider: "github" },
          { name: "mealie-recipes/mealie", provider: "github" },
          { name: "n8n-io/n8n", provider: "github" },
          { name: "traefik/traefik", provider: "github" },
          { name: "coollabsio/coolify", provider: "github" },
          { name: "karakeep-app/karakeep", provider: "github" },
          {
            name: "triliumnext/trilium",
            provider: "docker",
            extra: { tags: ["main", "latest"] },
          },
        ],
      },
    ],
  }),
];

const defaultLists = Schema.decodeSync(ListConfig.pipe(Schema.Array))(DEFAULT_CONTENT);

const packageDecoder = Schema.decodeUnknownEither(PackageConfig);

export const listsAdapter = createConfigAdapter({
  name: "lists",
  default: DEFAULT_CONTENT,
  schema: ListConfig.pipe(Schema.Array),
  safeParse: (content) =>
    Effect.sync(() => {
      const validLists: ListConfig[] = [];
      const warnings: ConfigWarning[] = [];

      if (Array.isArray(content)) {
        const lists = content
          .map((list, index) => {
            if (typeof list !== "object") {
              warnings.push(
                ConfigWarning.make({
                  message: `Skipping malformed list #${index + 1} - not an object`,
                  severity: "error",
                }),
              );
            } else {
              const listName = (list as { name?: string }).name || "unnamed list";
              const rawGroups = list.groups as Partial<ListConfig["groups"]> | undefined;

              const groups = rawGroups?.map((group) => {
                const groupName = group?.name || "unnamed group";
                const rawPackages = group?.packages;
                const groupValidPackages: PackageConfig[] = [];

                if (Array.isArray(rawPackages)) {
                  const packagesResults = rawPackages.map((p) => packageDecoder(p));

                  for (const [pkgIndex, res] of packagesResults.entries()) {
                    if (Either.isLeft(res)) {
                      warnings.push(
                        ConfigWarning.make({
                          message: `Invalid package #${pkgIndex + 1} in '${listName}' → '${groupName}'`,
                          details: formatParseError(res.left),
                          severity: "warning",
                        }),
                      );
                    } else {
                      const pkg = res.right;
                      const provider = ProviderInfosRegistry.get(pkg.provider);

                      if (!provider) {
                        warnings.push(
                          ConfigWarning.make({
                            message: `Unknown provider '${pkg.provider}' for package #${pkgIndex + 1} in '${listName}' → '${groupName}' will be skipped`,
                            severity: "warning",
                          }),
                        );
                      } else {
                        const validPkg = { ...pkg };
                        if (provider.extraSchema && pkg.extra) {
                          const validExtra = Schema.decodeUnknownOption(provider.extraSchema)(pkg.extra);

                          if (Option.isSome(validExtra)) {
                            validPkg.extra = validExtra.value;
                          } else {
                            warnings.push(
                              ConfigWarning.make({
                                message: `Invalid options for ${pkg.provider}:${pkg.name} (package #${pkgIndex + 1}) in '${listName}' → '${groupName}' - using defaults`,
                                severity: "warning",
                              }),
                            );
                          }
                        }

                        groupValidPackages.push(pkg);
                      }
                    }
                  }
                } else if (rawPackages !== undefined) {
                  warnings.push(
                    ConfigWarning.make({
                      message: `Invalid packages field in '${listName}' → '${groupName}' - must be an array`,
                      severity: "warning",
                    }),
                  );
                }

                return group
                  ? Object.assign(group, {
                      packages: groupValidPackages,
                    })
                  : undefined;
              });

              return {
                ...list,
                groups,
              };
            }
          })
          .filter((l) => !isUndefined(l));

        const results = lists.map((list) => Schema.decodeUnknownEither(ListConfig)(list));

        results.forEach((result, index) => {
          if (Either.isRight(result)) {
            validLists.push(result.right);
          } else {
            warnings.push(
              ConfigWarning.make({
                message: `Skipping malformed list #${index + 1}`,
                details: formatParseError(result.left),
                severity: "warning",
              }),
            );
          }
        });
      } else {
        validLists.push(...defaultLists);
        warnings.push(
          ConfigWarning.make({
            message: "lists.yaml has errors - loading default lists instead",
            severity: "error",
          }),
        );
      }

      //detect duplicate list slugs
      const seenListSlugs = new Map<string, ListConfig>();
      for (const list of validLists) {
        const slug = slugify(list.name);
        if (seenListSlugs.has(slug)) {
          const listTwo = seenListSlugs.get(slug)!;

          warnings.push(
            ConfigWarning.make({
              message: `Lists "${listTwo.name}" and "${list.name}" share the same URL slug "${slug}"`,
              severity: "warning",
            }),
          );
        }

        seenListSlugs.set(slug, list);
      }

      return ConfigParseResult.make(validLists, warnings);
    }),
});