/**
 * Trusted proxy IP range checker.
 *
 * Used to determine if a request is coming from a known trusted proxy/CDN,
 * in which case we can trust X-Forwarded-For headers.
 *
 * Sources:
 * - Cloudflare: https://www.cloudflare.com/ips/
 */

import { Address4, Address6 } from "ip-address";

// Cloudflare IPv4 ranges (from https://www.cloudflare.com/ips-v4)
const CLOUDFLARE_IPV4_RANGES = [
  "103.21.244.0/22",
  "103.22.200.0/22",
  "103.31.4.0/22",
  "104.16.0.0/13",
  "104.24.0.0/14",
  "108.162.192.0/18",
  "131.0.72.0/22",
  "141.101.64.0/18",
  "162.158.0.0/15",
  "172.64.0.0/13",
  "173.245.48.0/20",
  "188.114.96.0/20",
  "190.93.240.0/20",
  "197.234.240.0/22",
  "198.41.128.0/17",
];

// Cloudflare IPv6 ranges (from https://www.cloudflare.com/ips-v6)
const CLOUDFLARE_IPV6_RANGES = [
  "2400:cb00::/32",
  "2606:4700::/32",
  "2803:f800::/32",
  "2405:b500::/32",
  "2405:8100::/32",
  "2a06:98c0::/29",
  "2c0f:f248::/32",
];

/**
 * List of trusted proxy IPv4 CIDR ranges.
 * Add additional trusted proxies here as needed.
 */
export const TRUSTED_PROXY_IPV4_RANGES: readonly string[] = [...CLOUDFLARE_IPV4_RANGES];

/**
 * List of trusted proxy IPv6 CIDR ranges.
 * Add additional trusted proxies here as needed.
 */
export const TRUSTED_PROXY_IPV6_RANGES: readonly string[] = [...CLOUDFLARE_IPV6_RANGES];

/**
 * Check if an IPv4 address is in a trusted proxy range
 */
function isTrustedProxyIPv4(ip: string): boolean {
  try {
    const addr = new Address4(ip);
    return TRUSTED_PROXY_IPV4_RANGES.some((cidr) => addr.isInSubnet(new Address4(cidr)));
  } catch {
    return false;
  }
}

/**
 * Check if an IPv6 address is in a trusted proxy range
 */
function isTrustedProxyIPv6(ip: string): boolean {
  try {
    const addr = new Address6(ip);
    return TRUSTED_PROXY_IPV6_RANGES.some((cidr) => addr.isInSubnet(new Address6(cidr)));
  } catch {
    return false;
  }
}

/**
 * Check if an IP address belongs to a trusted proxy (Cloudflare, etc.)
 */
export function isTrustedProxyIP(ip: string): boolean {
  return isTrustedProxyIPv4(ip) || isTrustedProxyIPv6(ip);
}