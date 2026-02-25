export function toBigInt(value: number | bigint) {
  if (typeof value === "bigint") return value;

  if (typeof value === "number") {
    if (!Number.isSafeInteger(value)) {
      throw new RangeError("Number cannot be safely converted to BigInt");
    }
    return BigInt(value);
  }

  throw new TypeError("Expected number or bigint");
}