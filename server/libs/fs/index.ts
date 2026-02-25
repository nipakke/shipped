import { FileSystem } from "@effect/platform";
import { Effect } from "effect";

import { toBigInt } from "../numeric";

import { FileDecodeError, FileNotFoundError, FileTooBigError } from "./errors";

type ReadFileOptions = {
  maxSize?: bigint | number;
};

export const readFile = (path: string, opts?: ReadFileOptions) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;

    const stats = yield* fs
      .stat(path)
      //This might not be the best error
      .pipe(Effect.catchTag("SystemError", () => Effect.fail(new FileNotFoundError({ path }))));

    if (opts?.maxSize && stats.size > toBigInt(opts.maxSize)) {
      return yield* new FileTooBigError({ maxSize: opts.maxSize, path, size: stats.size });
    }

    return yield* fs.readFile(path);
  });

export const readFileString = (path: string, opts?: ReadFileOptions) =>
  Effect.gen(function* () {
    const str = yield* Effect.tryMap(readFile(path, opts), {
      try: (data) => new TextDecoder().decode(data),
      catch: (cause) => new FileDecodeError({ path, cause }),
    });

    return str;
  });

export { FileNotFoundError, FileTooBigError, FileDecodeError } from "./errors";