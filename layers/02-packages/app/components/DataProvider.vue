<template>
  <slot
    :data="data"
    :error="query.error"
    :isLoading="query.pending"
    :isRetrying="false"
    v-bind="{
      isPending: query.pending,
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

const { data, ...query } = await useAsyncData(
  `package-${props.config.packageId}`,
  () =>
    rpc.packages.getOne({
      packageId: props.config.packageId,
    }),
  {
    server: !!import.meta.prerender,
  },
);
</script>