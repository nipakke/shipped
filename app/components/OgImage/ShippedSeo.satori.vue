<template>
  <div class="og-container flex h-full w-full flex-col p-16">
    <!-- Top: Logo + Site Name -->
    <div class="flex items-center gap-6">
      <img src="/logo.svg" class="h-24 w-24" />
      <span class="og-site-name text-5xl font-bold text-white">
        {{ siteName }}
      </span>
    </div>

    <!-- Center: Title + Description -->
    <div class="ml-8 flex max-w-250 flex-1 flex-col items-start justify-center gap-8">
      <div class="flex items-center gap-6">
        <span v-if="icon" class="text-7xl">{{ icon }}</span>
        <h1 class="og-title text-8xl leading-tight font-bold text-white">
          {{ title }}
        </h1>
      </div>
      <p v-if="description" class="og-description max-w-212.5 text-4xl leading-relaxed text-white/95">
        {{ description }}
      </p>
    </div>

    <!-- Bottom: Decorative element -->
    <div class="flex items-center gap-2">
      <div class="h-1 w-12 rounded-full bg-white/40" />
      <div class="h-1 w-6 rounded-full bg-white/20" />
      <div class="h-1 w-3 rounded-full bg-white/10" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const { title, description, icon } = defineProps<{
  title: string;
  description?: string;
  icon?: string;
}>();

const appConfig = useAppConfig();
const siteName = computed(() => appConfig.appName ?? "Shipped");
</script>

<style>
.og-container {
  background: linear-gradient(135deg, #e56399 0%, #ffd3ac 100%);
}

.og-site-name,
.og-title,
.og-description {
  font-family: "Outfit", sans-serif;
}

.og-site-name {
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.og-title {
  text-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
}

.og-description {
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}
</style>