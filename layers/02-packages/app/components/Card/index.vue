<template>
  <UCard
    :ui="{
      body: 'p-1 sm:p-0',
    }"
    variant="subtle"
    class="group/package hover:ring-primary/30 transition-all duration-200 hover:shadow-lg"
  >
    <div class="p-2">
      <ErrorCard v-if="error?.message" :message="error.message" :config="props.package" />

      <slot v-else-if="!data" name="loading">
        <PackageSkeleton />
      </slot>

      <div v-else class="space-y-2">
        <PackageHeader :data="data" :latest-version="latestVersion" :config="props.package" />

        <USeparator />
        <div class="mt-3 space-y-3">
          <PackageReleaseHistory :releases="data.releases ?? []" />
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import PackageSkeleton from "./Skeleton.vue";
import PackageHeader from "./Header.vue";
import PackageReleaseHistory from "../ReleaseHistory.vue";
import ErrorCard from "./Error.vue";
import type { RPCError } from "~~/layers/01-base/app/libs/rpc";
import type { Package } from "~~/libs/packages";
import type { PackageConfigView } from "~~/libs/config/view";

const props = defineProps<{
  data: Package | undefined;
  error?: RPCError | null;
  package: PackageConfigView;
}>();

const latestVersion = computed(() => props.data?.releases[0]?.version);
</script>