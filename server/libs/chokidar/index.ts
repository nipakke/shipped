import * as chokidar from "chokidar";
import { EVENTS } from "chokidar/handler.js";
import { Effect, PubSub, Stream } from "effect";
import { Chunk } from "effect";

type Events = (typeof EVENTS)[keyof typeof EVENTS];

type WatchOptions = {
  events?: Events[];
} & chokidar.ChokidarOptions;

export const watch = (paths: string | string[], opts?: WatchOptions) =>
  Effect.gen(function* () {
    const filesPubSub = yield* PubSub.bounded<{ event: Events; path: string }>(128);

    yield* Effect.addFinalizer(() => filesPubSub.shutdown);

    const stream = Stream.asyncScoped<{ event: Events; path: string }, unknown>((emit) =>
      Effect.acquireRelease(
        Effect.sync(() => {
          const watcher = chokidar.watch(paths, opts);
          watcher.on("all", (event, path) => {
            emit(Effect.succeed(Chunk.make({ event, path })));
          });
          return watcher;
        }).pipe(Effect.tap(() => Effect.logInfo("Initialized successfully"))),
        (watcher) =>
          Effect.promise(async () => {
            watcher.removeAllListeners();

            await watcher.close();
          }),
      ),
    ).pipe((s) => {
      const events = opts?.events;
      if (!events) return s;

      return Stream.filter(s, ({ event }) => events.some((e) => event.includes(e)));
    });

    return {
      stream,
      pubsub: filesPubSub,
    };
  });