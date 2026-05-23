<template>
  <slot :data="data" :error="query.error" :isLoading="query.pending" :isRetrying="false" :refetch="refetch"
    :canRetry="canRetryFlag" v-bind="{
      isPending: query.pending,
    }" />
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

const isPrerendering = import.meta.prerender;

console.log("VALID:", props.config.packageId)

const query = await useAsyncData(`package-${props.config.packageId}`, () => rpc.packages.getOne({
  // experimental_prefetchInRender: true,
  // refetchInterval: isPrerendering ? false : 60_000,
  // refetchOnWindowFocus: isPrerendering ? false : true,
  packageId: props.config.packageId,
  // enabled: isPrerendering ? true : import.meta.client,
}), {
  server: true,
  // server: import.meta.prerender,
})


/* const query = useQuery(
  rpc.packages.getOne.queryOptions({
    retry: 2,
    experimental_prefetchInRender: true,
    refetchInterval: isPrerendering ? false : 60_000,
    refetchOnWindowFocus: isPrerendering ? false : true,
    input: {
      packageId: props.config.packageId,
    },
    enabled: isPrerendering ? true : import.meta.client,
  }),
);

if (isPrerendering) {
  await query.suspense();
} */

watch(
  () => props.config,
  (val, oldVal) => {
    if (val.packageId != oldVal.packageId) {
      // query.refetch();
    }
  },
);

const data = computed<Package | undefined>(() => {
  return query.data.value ?? undefined; /*  ? PackageData.make(query.data.value) : undefined; */
});

const canRetryFlag = computed(() => false);

function refetch() {
  if (canRetryFlag.value) {
    // query.refetch();
  }
}
</script>