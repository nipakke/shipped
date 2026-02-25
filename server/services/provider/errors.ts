import { Data } from "effect";

export class ProviderNotFoundError extends Data.TaggedError("ProviderNotFound")<{
  readonly id: string;
  readonly supported?: readonly string[];
}> {
  get message() {
    if (this.supported) {
      return `Provider '${this.id}' is not supported. Available: ${this.supported.join(", ")}`;
    }
    return `Provider '${this.id}' is not supported.`;
  }
}