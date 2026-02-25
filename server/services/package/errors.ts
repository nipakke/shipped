import { Data } from "effect";

export class UnconfiguredPackageError extends Data.TaggedError("UnconfiguredPackage")<{
  readonly hash: string;
}> {
  get message() {
    return `Package with hash ${this.hash} is not configured`;
  }
}