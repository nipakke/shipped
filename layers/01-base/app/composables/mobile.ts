import { useMediaQuery } from "@vueuse/core";
import { computed } from "vue";

// Returns true for touch devices with screens ≤767px (phones only).
// Excludes tablets like iPad (768px+) and large touch devices.
export function useIsMobile() {
  const isCoarse = useMediaQuery("(pointer: coarse)");
  const isSmall = useMediaQuery("(max-width: 767px)");
  return computed(() => isCoarse.value && isSmall.value);
}