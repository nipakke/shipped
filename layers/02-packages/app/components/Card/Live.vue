<template>
  <UCard
    :ui="{
      body: 'p-1 sm:p-0',
    }"
    variant="subtle"
    class="group/package hover:ring-primary/30 transition-all duration-200 hover:shadow-lg"
  >
    <div class="p-2">
      <slot v-if="query.isLoading.value" name="loading">
        <Skeleton />
      </slot>

      <ErrorCard v-else-if="query.error.value" :error="query.error.value" :config="config" />

      <div v-else-if="query.data.value" class="space-y-2">
        <Header :data="query.data.value" :latest-version="latestVersion" :config="config" />

        <USeparator />
        <div class="mt-3 space-y-3">
          <PackageReleaseHistory :releases="query.data.value.releases ?? []" />
          <!-- <slot name="releases" :releases="data.releaseHistory">
          </slot> -->

          <!-- <slot name="actions" :overview="data.overview">
            <PackageActions :overview="data.overview">
              <slot name="actions-extra" :overview="data.overview" />
            </PackageActions>
          </slot> -->
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { useQuery, type UseQueryReturnType } from "@tanstack/vue-query";
import { useRPC } from "~~/layers/01-base/app/libs/rpc";
import Header from "./Header.vue";
import ErrorCard from "./Error.vue";
import Skeleton from "./Skeleton.vue";
import type { Package } from "~~/libs/packages";
import type { PackageConfigView } from "~~/libs/config/view";
import { PackageViewModel, PackageViewModelLive } from "../../libs/view-model";

const props = defineProps<{
  config: PackageConfigView;
}>();

const rpc = useRPC();

const query = useQuery(
  rpc.packages.getOne.queryOptions({
    retry: 0,
    experimental_prefetchInRender: true,
    input: {
      packageId: props.config.packageId,
    },
    enabled: import.meta.client,
    /* gcTime: Infinity,
  staleTime: Infinity, */
  }),
);

const latestVersion = computed(() => query.data.value?.releases[0]?.version);

const viewModel = new PackageViewModelLive(props.config);

console.log(viewModel);

function testing(adsdas: PackageViewModel) {}

testing(viewModel);
</script>

<style scoped></style>