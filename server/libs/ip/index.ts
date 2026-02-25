import { isBogon } from "bogon";

import { isTrustedProxyIP } from "./trusted-proxies";

export { isBogon, isTrustedProxyIP };

export interface GetClientAddressInput {
  remoteAddress: string;
  xForwardedFor: string | undefined;
  trustProxies: boolean | undefined;
}

/**
 * Extracts the best-effort client IP address.
 *
 * Strategy:
 * - If trustProxies is explicitly true, trust X-Forwarded-For headers
 * - If trustProxies is explicitly false, use the direct remote address
 * - Otherwise, auto-detect: if remoteAddress is unknown, a bogon (private/reserved IP),
 *   or a Cloudflare IP, we're likely behind a proxy → trust XFF
 * - If remoteAddress is a public IP, use it directly (don't trust XFF, could be spoofed)
 */
export function getClientAddress(input: GetClientAddressInput): string {
  const { remoteAddress, xForwardedFor, trustProxies } = input;

  // Explicit override: user knows their setup
  if (trustProxies === true) {
    return extractFromXFF(xForwardedFor) ?? remoteAddress;
  }
  if (trustProxies === false) {
    return remoteAddress;
  }

  // Auto-detect mode (default): trust headers if remoteAddress is unknown, bogon, or trusted proxy IP
  const isTrustedProxy = remoteAddress !== "unknown" && isTrustedProxyIP(remoteAddress);
  const shouldTrustXFF = remoteAddress === "unknown" || isBogon(remoteAddress) || isTrustedProxy;

  if (shouldTrustXFF) {
    return extractFromXFF(xForwardedFor) ?? remoteAddress;
  }

  // Remote address is a public IP — client is connecting directly
  // Do NOT trust XFF (it could be spoofed)
  return remoteAddress;
}

/**
 * Extracts the leftmost IP from X-Forwarded-For header.
 * This is the original client IP when behind a proxy like Cloudflare, Nginx, or Traefik.
 */
function extractFromXFF(xff: string | undefined): string | undefined {
  if (!xff) return undefined;

  // Leftmost IP is the client (works for Cloudflare, nginx, traefik, etc.)
  const leftmost = xff.split(",")[0]?.trim();
  if (leftmost) {
    return leftmost;
  }
}