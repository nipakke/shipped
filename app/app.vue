<template>
  <UApp>
    <Head>
      <Link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    </Head>

    <NuxtLoadingIndicator />

    <Header />

    <UMain>
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </UMain>

    <USeparator type="dashed" class="h-px" />

    <Footer />
  </UApp>
</template>

<script setup lang="ts">
const config = useUserConfig();

watch(
  config.error,
  (error) => {
    if (error) {
      throw createError({
        message: error,
      });
    }
  },
  { immediate: true },
);

useSeoMeta({
  titleTemplate: (title) => (title ? `${title} - Shipped` : "Shipped"),
});
</script>

<style lang="css"></style>