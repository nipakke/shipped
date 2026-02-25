<template>
  <div class="flex gap-2">
    <div class="flex min-w-0 grow items-center gap-1">
      <div class="truncate">
        <div class="truncate text-lg font-medium" :title="displayName">
          {{ displayName }}
        </div>
        <div class="text-dimmed h-lh truncate text-sm" :title="data.owner">
          <span v-if="data.owner">by {{ data.owner }}</span>
        </div>
      </div>
    </div>

    <div class="flex shrink-0 items-start gap-0.5">
      <!-- Hover is driven by the card’s "group/package" class -->
      <UPopover
        mode="hover"
        class="can-hover:opacity-0 opacity-50 transition-all group-hover/package:opacity-50 hover:opacity-100"
      >
        <UButton size="xs" variant="ghost" class="text-muted shrink-0" color="neutral" icon="lucide:settings">
        </UButton>

        <template #content>
          <div class="max-w-100 px-3 py-2 shadow-lg sm:min-w-60">
            <ConfigPanel :data="props.data" :config="props.config" />
          </div>
        </template>
      </UPopover>

      <UButton
        v-if="data.url"
        :to="data.url"
        target="_blank"
        size="xs"
        variant="ghost"
        color="neutral"
        :icon="providerIcon"
        class="text-muted shrink-0"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PackageConfigView } from "~~/libs/config/view";
import type { Package } from "~~/libs/packages";
import ConfigPanel from "../ConfigPanel.vue";
import { ProviderInfosRegistry } from "~~/shared/provider-infos";

const props = defineProps<{
  data: Package;
  latestVersion?: string;
  config: PackageConfigView;
}>();

const displayName = computed(() => props.config?.displayName || props.data.name);

const providerInfo = ProviderInfosRegistry.get(props.config.provider);
const providerIcon = providerInfo?.icon ?? "lucide:external-link";
</script>