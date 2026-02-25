<template>
  <UHeader :mode="isMobile ? 'drawer' : 'slideover'">
    <!--  class="bg-[#0e1010]/80" -->
    <template #title>
      <img src="/logo.svg" class="max-h-8 max-w-8" />
    </template>

    <UNavigationMenu :items="headerItems" content-orientation="vertical" class="w-full justify-center">
    </UNavigationMenu>

    <template #body>
      <UNavigationMenu :items="flatItems" orientation="vertical" class="-mx-2.5" />
    </template>

    <template #right>
      <!--
        devtools doesn't show up on the bottom fsr. manually open it
        in prod this is not shown       
      -->
      <DevOnly><Devtools /></DevOnly>

      <ConfigWarningIcon v-show="hasConfigWarnings" />
      <ConfigConnectedChip />
      <UColorModeButton />
    </template>
  </UHeader>
</template>

<script setup lang="ts">
import type { NavigationMenuItem } from "#ui/types";
import { ConfigConnectedChip, ConfigWarningIcon } from "#components";
import type { ListConfigView } from "~~/libs/config/view";
import Devtools from "./Devtools.client.vue";

const isMobile = useIsMobile();
const userConfig = useUserConfig();

function makeItem(l: ListConfigView): NavigationMenuItem {
  return {
    label: l.name,
    to: `/list/${l.slug}`,
  };
}

const flatItems = computed<NavigationMenuItem[]>(() => {
  return userConfig.data.value?.lists?.map(makeItem) ?? [];
});

const headerItems = computed<NavigationMenuItem[]>(() => {
  const maxInHeader = userConfig.data.value?.ui?.maxListsInHeader ?? 3;

  const items = flatItems.value.slice(0, maxInHeader);
  const other = flatItems.value.slice(maxInHeader);

  if (other.length > 1) {
    items.push({
      label: "Other",
      children: other,
    });
  } else {
    items.push(...other);
  }

  return items;
});

const hasConfigWarnings = computed(
  () => userConfig.data.value?.warnings && !!userConfig.data.value?.warnings.length,
);
</script>