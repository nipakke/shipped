<template>
  <UColorModeImage
    v-if="effectiveLight && effectiveDark && isUrl(effectiveLight)"
    :light="effectiveLight"
    :dark="effectiveDark"
    :class="sizeClass"
    :alt="alt"
  />
  <img
    v-else-if="effectiveLight && isUrl(effectiveLight)"
    :src="effectiveLight"
    :class="sizeClass"
    :alt="alt"
  />
  <UIcon v-else-if="effectiveLight && !isUrl(effectiveLight)" :name="effectiveLight" :class="iconSizeClass" />
  <div v-else :class="sizeClass + ' bg-muted flex items-center justify-center rounded'">
    <UIcon :name="fallbackIcon" :class="iconSizeClass + ' text-muted-foreground'" />
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  icon?: string;
  iconDark?: string;
  alt?: string;
  size?: "sm" | "md" | "lg";
  fallbackIcon?: string;
}>();

const sizeClass = computed(() => {
  switch (props.size) {
    case "sm":
      return "w-6 h-6";
    case "lg":
      return "w-12 h-12";
    default:
      return "w-10 h-10";
  }
});

const iconSizeClass = computed(() => {
  switch (props.size) {
    case "sm":
      return "w-4 h-4";
    case "lg":
      return "w-6 h-6";
    default:
      return "w-5 h-5";
  }
});

const effectiveLight = computed(() => {
  if (props.icon && props.iconDark) {
    return props.icon; // Both provided, use icon for light
  }
  return props.iconDark || props.icon; // Use whichever is available
});

const effectiveDark = computed(() => {
  if (props.icon && props.iconDark) {
    return props.iconDark; // Both provided, use iconDark for dark
  }
  return props.iconDark || props.icon; // Use whichever is available
});

function isUrl(str: string): boolean {
  return str.startsWith("http://") || str.startsWith("https://") || str.startsWith("/");
}
</script>