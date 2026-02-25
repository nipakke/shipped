<template>
  <div class="space-y-3">
    <div class="group space-y-1">
      <template v-if="releases.length > 0">
        <div
          v-for="(release, index) in releases"
          :key="release.version"
          class="flex items-center justify-between gap-2 rounded-xl px-3 py-1"
          :class="[getVersionColor(release.createdAt)]"
        >
          <span class="line-clamp-1 max-w-20 font-mono text-sm">
            <div class="group-hover:hidden group-active:hidden">
              {{ release.version }}
            </div>
            <div class="hidden group-hover:block group-active:block">
              {{ release.tag ?? release.version }}
            </div>
          </span>

          <div v-if="release.createdAt" class="text-sm">
            {{ formatTimeAgoIntl(new Date(release.createdAt)) }}
          </div>
        </div>
      </template>
      <div v-else class="px-3 py-4 text-center text-sm text-zinc-500">No releases found</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatTimeAgoIntl } from "@vueuse/core";
import { orderBy } from "es-toolkit";
import type { PackageRelease } from "~~/libs/packages";

const props = defineProps<{
  releases: readonly PackageRelease[];
}>();

const releases = computed(() => {
  return orderBy(props.releases, ["createdAt"], ["desc"]);
});

const getVersionColor = (createdAt?: Date | string) => {
  if (!createdAt) return "text-gray-400";

  const now = new Date();
  const diffTime = Math.abs(now.getTime() - new Date(createdAt).getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays <= 3) return "bg-emerald-500/15 text-emerald-500";
  if (diffDays <= 14) return "bg-amber-500/15 text-amber-500";
  return "dark:bg-elevated bg-accented text-muted";
};
</script>