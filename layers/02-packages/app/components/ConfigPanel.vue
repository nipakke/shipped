<template>
  <DefineValueRow v-slot="{ icon, label, value }">
    <div class="flex items-start justify-between gap-4">
      <div class="flex items-center gap-2">
        <UIcon :name="icon" class="text-muted h-4 w-4" />
        <span class="text-muted">{{ label }}:</span>
      </div>
      <div class="flex-1 overflow-hidden text-right font-mono">
        <div class="line-clamp-3">{{ value }}</div>
      </div>
    </div>
  </DefineValueRow>

  <DefineExtraCard v-slot="{ keyName, value }">
    <UCard :ui="{ body: 'p-2 sm:p-3' }" variant="soft">
      <div class="text-muted mb-2 font-light uppercase">{{ keyName.replace(/([A-Z])/g, " $1").trim() }}</div>
      <div class="text-muted text-sm">
        <div v-if="Array.isArray(value)" class="flex flex-wrap gap-1">
          <UBadge v-for="item in value" :key="item" variant="soft" class="font-mono">
            {{ item }}
          </UBadge>
        </div>
        <UBadge
          v-else-if="typeof value === 'boolean'"
          :variant="value ? 'solid' : 'soft'"
          :color="value ? 'success' : 'neutral'"
          class="font-mono"
        >
          {{ value }}
        </UBadge>
        <span v-else class="font-mono">
          {{ value }}
        </span>
      </div>
    </UCard>
  </DefineExtraCard>

  <div class="space-y-4">
    <div v-if="data?.updatedAt" class="text-sm">
      <span class="text-muted">Last Updated:</span>
      <div class="overflow-hidden">
        <div class="line-clamp-3">{{ formatDate(data.updatedAt) }}</div>
      </div>
    </div>

    <USeparator v-if="data?.updatedAt" />

    <div>
      <h4 class="mb-3 font-light uppercase">Configuration</h4>
      <div class="space-y-4 text-sm">
        <ReuseValueRow icon="i-lucide-package" label="Name" :value="config.name" />

        <ReuseValueRow
          v-if="config.displayName"
          icon="i-lucide-type"
          label="Display Name"
          :value="config.displayName"
        />

        <ReuseValueRow icon="i-lucide-server" label="Provider" :value="config.provider" />

        <div v-if="config.extra && Object.keys(config.extra).length > 0">
          <USeparator class="my-4" />
          <div class="text-muted mb-3 font-light uppercase">Extra</div>
          <div class="space-y-3">
            <ReuseExtraCard
              v-for="[key, value] in Object.entries(config.extra).sort(([a], [b]) => a.localeCompare(b))"
              :key="key"
              :keyName="key"
              :value="value"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PackageConfigView } from "~~/libs/config/view";
import type { Package } from "~~/libs/packages";
import { createReusableTemplate } from "@vueuse/core";

const [DefineValueRow, ReuseValueRow] = createReusableTemplate({
  props: {
    icon: String,
    label: String,
    value: [String, Number, Boolean],
  },
});

const [DefineExtraCard, ReuseExtraCard] = createReusableTemplate({
  props: {
    keyName: String,
    value: [String, Number, Boolean, Array, Object],
  },
});

const props = defineProps<{
  data?: Package;
  config: PackageConfigView;
}>();

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const datePart = date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const timePart = date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${datePart} ${timePart}`;
};
</script>

<style scoped></style>