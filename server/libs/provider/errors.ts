import { Data } from "effect";

export class PackageNotFoundError extends Data.TaggedError("PackageNotFound")<{
  readonly name: string;
  readonly provider: string;
}> {
  get message() {
    return `Package '${this.name}' could not be found on provider '${this.provider}'`;
  }
}

export class NetworkError extends Data.TaggedError("Network")<{
  readonly provider: string;
  readonly reason?: string;
  readonly name?: string;
}> {
  get message() {
    return this.reason || `Network error occurred while fetching from provider '${this.provider}'`;
  }
}

export class InvalidPackageNameError extends Data.TaggedError("InvalidPackageName")<{
  readonly name: string;
  readonly provider: string;
}> {
  get message() {
    return `The package name '${this.name}' is invalid for provider '${this.provider}'`;
  }
}