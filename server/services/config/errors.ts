import { Data } from "effect";

export class ConfigViewCreateError extends Data.TaggedError("ConfigViewCreateError")<{
  readonly cause?: unknown;
}> {}

export class ConfigLoadError extends Data.TaggedError("ConfigLoadError")<{
  readonly cause?: unknown;
}> {}