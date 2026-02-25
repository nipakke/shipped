import { TreeFormatter, type ParseError } from "effect/ParseResult";

export function formatParseError(error: ParseError): string {
  return TreeFormatter.formatErrorSync(error);
}

export function formatParseErrorShort(error: ParseError): string {
  const formatted = TreeFormatter.formatErrorSync(error);
  // Take first line which typically contains the main error
  const firstLine = formatted.split("\n")[0];
  return firstLine || "Invalid configuration";
}