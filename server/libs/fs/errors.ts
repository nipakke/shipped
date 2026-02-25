import { Data } from "effect";

export class FileNotFoundError extends Data.TaggedError("FileNotFound")<{
  path: string;
}> {
  message = "File not found: " + this.path;
}

export class FileTooBigError extends Data.TaggedError("FileTooBig")<{
  path: string;
  maxSize: bigint | number;
  size: bigint | number;
}> {
  message = `File is to big too load: "${this.path}" - Size: ${this.size} - Max Size: ${this.maxSize}`;
}

export class FileDecodeError extends Data.TaggedError("FileDecodeError")<{
  path: string;
  cause: unknown;
}> {
  message = `Failed to decode file contents: "${this.path}"`;
}