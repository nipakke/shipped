import { Context, Effect, Layer } from "effect";

import { PackageProvider } from "../libs/provider";

import { DockerProviderLive } from "./docker";
import { GithubProviderLive } from "./github";
import { NpmProviderLive } from "./npm";
import { PythonProviderLive } from "./python";

export class ProviderFactories extends Context.Tag("provider-factories")<
  ProviderFactories,
  Effect.Effect<PackageProvider>[]
>() {
  static live = Layer.succeed(
    ProviderFactories,
    ProviderFactories.of([DockerProviderLive, GithubProviderLive, NpmProviderLive, PythonProviderLive]),
  );
}