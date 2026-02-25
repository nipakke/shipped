import { Option } from "effect";
import { getHeader, getRequestIP, H3Event } from "h3";

import { getClientAddress as getClientAddressCore, isBogon } from "../../libs/ip";

export { isBogon };

export function getClientAddress(event: H3Event): string {
  const { serverConfig } = useNitroApp().context;
  const trustProxies = Option.getOrUndefined(serverConfig.trustProxies);
  const remoteAddress = getRequestIP(event, { xForwardedFor: false }) ?? "unknown";
  const xForwardedFor = getHeader(event, "x-forwarded-for") ?? undefined;

  return getClientAddressCore({
    remoteAddress,
    xForwardedFor,
    trustProxies,
  });
}