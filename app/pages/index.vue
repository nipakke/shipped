<template>
  <div></div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: () => {
    const userConfig = useUserConfig();
    const lists = userConfig.data.value?.lists;

    if (lists && lists.length > 0) {
      return navigateTo(`/list/${lists.at(0)!.slug}`, { replace: true });
    } else {
      return navigateTo("/getting-started", { replace: true });
    }
  },
});
</script>