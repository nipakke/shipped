<template>
  <slot
    :data="data"
    :error="query.error"
    :isLoading="query.isLoading"
    :isRetrying="query.isFetching"
    :refetch="refetch"
    :canRetry="canRetryFlag"
    v-bind="{
      isPending: query.isPending,
    }"
  />
</template>

<script setup lang="ts">
import { useQuery, type UseQueryReturnType } from "@tanstack/vue-query";
import { useRPC } from "~~/layers/01-base/app/libs/rpc";
import type { Package } from "~~/libs/packages";
import type { PackageConfigView } from "~~/libs/config/view";

const props = defineProps<{
  config: PackageConfigView;
}>();

const rpc = useRPC();

const query = useQuery(
  rpc.packages.getOne.queryOptions({
    retry: 2,
    experimental_prefetchInRender: true,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
    input: {
      packageId: props.config.packageId,
    },
    enabled: import.meta.client,
  }),
);

watch(
  () => props.config,
  (val, oldVal) => {
    if (val.packageId != oldVal.packageId) {
      query.refetch();
    }
  },
);

const data = computed<Package | undefined>(() => {
  return query.data.value ?? undefined; /*  ? PackageData.make(query.data.value) : undefined; */
});

const canRetryFlag = computed(() => false);

function refetch() {
  if (canRetryFlag.value) {
    query.refetch();
  }
}
</script>