import { BentoCache } from "bentocache";
import { Duration, Effect } from "effect";

import { GetOptions, SetOptions, CacheBackend } from "../types";

export class BentoCacheBackend<Bento extends BentoCache<any>> implements CacheBackend {
  constructor(private bento: Bento) {}

  get<A>(options: GetOptions) {
    return Effect.promise(() => this.bento.get<A>({ key: options.key }));
  }

  set<A>(options: SetOptions<A>) {
    return Effect.promise(() =>
      this.bento.set({
        ...options,
        ttl: options.ttl ? Duration.toMillis(options.ttl) : undefined,
      }),
    );
  }
}