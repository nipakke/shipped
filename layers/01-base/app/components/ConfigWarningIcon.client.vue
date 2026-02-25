<template>
  <div>
    <UPopover mode="hover">
      <UButton variant="ghost" color="warning" icon="lucide:file-exclamation-point" />
      <template #content>
        <div class="max-w-xs space-y-4 p-4">
          <div class="space-y-2">
            <h3 class="text-warning flex items-center space-x-2 font-semibold">
              <UIcon name="lucide:alert-triangle" class="h-5 w-5" />
              <span>
                Configuration Warnings
                {{ warnings.length > 2 ? `(${warnings.length})` : undefined }}
              </span>
            </h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              The following configuration issues were detected and may affect functionality:
            </p>
          </div>
          <div class="space-y-3">
            <template v-for="(warnings, group) in groupped" :key="group">
              <div class="text-muted uppercase">
                {{ group }}
              </div>
              <template v-for="warning in warnings" :key="warning.message">
                <UAlert :color="warning.severity" variant="subtle">
                  <template #description>
                    <div class="space-y-1">
                      <p>{{ warning.message }}</p>
                      <p
                        v-if="warning.details"
                        class="border-opacity-20 mt-1 border-t border-current pt-1 text-xs opacity-75"
                      >
                        {{ warning.details }}
                      </p>
                    </div>
                  </template>
                </UAlert>
              </template>
              <USeparator class="last:hidden" />
            </template>
          </div>
        </div>
      </template>
    </UPopover>
  </div>
</template>

<script setup lang="ts">
import { groupBy } from "es-toolkit";

const userConfig = useUserConfig();

const warnings = computed(() => {
  return userConfig.data.value?.warnings ?? [];
});

const groupped = computed(() => {
  return groupBy(warnings.value, (t) => t.group ?? "other");
});
</script>