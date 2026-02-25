import { describe, expect, it } from "vitest";

import { getClientAddress, isBogon, isTrustedProxyIP } from "./index";

describe("isBogon", () => {
  it("should return true for private IPs", () => {
    expect(isBogon("192.168.1.1")).toBe(true);
    expect(isBogon("10.0.0.1")).toBe(true);
    expect(isBogon("172.16.0.1")).toBe(true);
  });

  it("should return false for public IPs", () => {
    expect(isBogon("8.8.8.8")).toBe(false);
    expect(isBogon("1.1.1.1")).toBe(false);
    expect(isBogon("104.16.0.1")).toBe(false);
  });
});

describe("isTrustedProxyIP", () => {
  it("should return true for trusted proxy IPv4 addresses", () => {
    expect(isTrustedProxyIP("104.16.0.1")).toBe(true);
    expect(isTrustedProxyIP("172.64.0.1")).toBe(true);
    expect(isTrustedProxyIP("162.158.1.1")).toBe(true);
  });

  it("should return true for trusted proxy IPv6 addresses", () => {
    expect(isTrustedProxyIP("2606:4700::1")).toBe(true);
    expect(isTrustedProxyIP("2400:cb00::1")).toBe(true);
    expect(isTrustedProxyIP("2803:f800::1")).toBe(true);
  });

  it("should return false for non-trusted proxy IPs", () => {
    expect(isTrustedProxyIP("8.8.8.8")).toBe(false);
    expect(isTrustedProxyIP("192.168.1.1")).toBe(false);
    expect(isTrustedProxyIP("1.1.1.1")).toBe(false);
  });

  it("should return false for non-trusted proxy IPv6 addresses", () => {
    expect(isTrustedProxyIP("2001:4860:4860::8888")).toBe(false);
    expect(isTrustedProxyIP("fe80::1")).toBe(false);
  });
});

describe("getClientAddress", () => {
  it("should return remoteAddress when trustProxies is false", () => {
    const result = getClientAddress({
      remoteAddress: "8.8.8.8",
      xForwardedFor: "1.2.3.4",
      trustProxies: false,
    });
    expect(result).toBe("8.8.8.8");
  });

  it("should return XFF when trustProxies is true", () => {
    const result = getClientAddress({
      remoteAddress: "8.8.8.8",
      xForwardedFor: "1.2.3.4, 5.6.7.8",
      trustProxies: true,
    });
    expect(result).toBe("1.2.3.4");
  });

  it("should return remoteAddress when trustProxies is undefined and remoteAddress is public", () => {
    const result = getClientAddress({
      remoteAddress: "8.8.8.8",
      xForwardedFor: "1.2.3.4",
      trustProxies: undefined,
    });
    expect(result).toBe("8.8.8.8");
  });

  it("should return XFF when trustProxies is undefined and remoteAddress is a bogon", () => {
    const result = getClientAddress({
      remoteAddress: "192.168.1.1",
      xForwardedFor: "1.2.3.4",
      trustProxies: undefined,
    });
    expect(result).toBe("1.2.3.4");
  });

  it("should return XFF when trustProxies is undefined and remoteAddress is trusted proxy IP", () => {
    const result = getClientAddress({
      remoteAddress: "104.16.0.1",
      xForwardedFor: "1.2.3.4",
      trustProxies: undefined,
    });
    expect(result).toBe("1.2.3.4");
  });

  it("should return XFF when trustProxies is undefined and remoteAddress is unknown", () => {
    const result = getClientAddress({
      remoteAddress: "unknown",
      xForwardedFor: "1.2.3.4",
      trustProxies: undefined,
    });
    expect(result).toBe("1.2.3.4");
  });

  it("should fall back to remoteAddress when XFF is empty", () => {
    const result = getClientAddress({
      remoteAddress: "192.168.1.1",
      xForwardedFor: undefined,
      trustProxies: true,
    });
    expect(result).toBe("192.168.1.1");
  });

  it("should handle XFF with single IP", () => {
    const result = getClientAddress({
      remoteAddress: "192.168.1.1",
      xForwardedFor: "1.2.3.4",
      trustProxies: true,
    });
    expect(result).toBe("1.2.3.4");
  });
});