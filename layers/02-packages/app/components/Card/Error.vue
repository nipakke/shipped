<template>
  <div class="space-y-2 py-4">
    <div class="flex items-center gap-2">
      <div class="text-error flex">
        <UIcon class="text-4xl" name="lucide:circle-alert" />
      </div>
      <div class="grow text-xl font-medium">
        {{ message }}
      </div>
    </div>

    <USeparator />

    <ConfigPanel :config="props.config" />
  </div>
</template>

<script setup lang="ts">
import type { PackageConfigView } from "~~/libs/config/view";
import ConfigPanel from "../ConfigPanel.vue";

const props = defineProps<{
  message: string;
  // error: RPCError;
  config: PackageConfigView;
}>();
</script>