import type { ProviderInfo } from "~~/libs/provider";

import { DockerProviderInfo } from "./providers/docker";
import { GithubProviderInfo } from "./providers/github";
import { NpmProviderInfo } from "./providers/npm";
import { PythonProviderInfo } from "./providers/python";

const allProviders = [GithubProviderInfo, NpmProviderInfo, PythonProviderInfo, DockerProviderInfo] as const;

const infos = allProviders.reduce(
  (acc, provider) => {
    acc[provider.id.toLowerCase()] = provider;
    return acc;
  },
  {} as Record<ProviderInfo["id"], ProviderInfo>,
);

export const ProviderInfosRegistry = {
  infos,
  get(id: string): ProviderInfo | undefined {
    return infos[id.toLowerCase()];
  },
  listAll() {
    return Object.values(infos);
  },
  isValid(id: string) {
    return !!infos[id];
  },
};