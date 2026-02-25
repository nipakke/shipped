<template>
  <UPage>
    <UContainer>
      <UPageHeader>
        <template #title>
          <div class="flex gap-2">
            {{ list?.name }}
          </div>
        </template>
        <template #description>
          {{ list?.description }}
        </template>
      </UPageHeader>
    </UContainer>

    <UPageBody>
      <UContainer class="space-y-8">
        <div class="space-y-4">
          <template v-for="group in groups">
            <div class="space-y-2">
              <div class="flex items-center gap-2" v-if="group.showName !== false">
                <div class="text-muted text-2xl uppercase">
                  {{ group.displayName ?? group.name }}
                </div>
              </div>

              <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                <template v-for="(config, idx) in group.packages" :key="config.packageId">
                  <PackageDataProvider :config="config" #default="{ data, error }">
                    <PackageCard :data="data" :package="config" :error="error.value" />
                  </PackageDataProvider>
                </template>
              </div>
            </div>
            <USeparator class="last:hidden" />
          </template>
        </div>
      </UContainer>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
const config = useUserConfig();

const route = useRoute("list-listId");
const listId = route.params.listId;

const list = computed(() => {
  return config.data.value?.lists.find((l) => l.slug === listId);
});

watch(
  list,
  (l) => {
    if (!l) navigateTo("/");
  },
  { immediate: true },
);

const groups = computed(() => {
  return list.value?.groups ?? [];
});

defineOgImage("ShippedSeo", [
  {
    props: {
      title: list.value?.name ?? "List",
      description: list.value?.description,
    },
  },
  {
    props: {
      title: list.value?.name ?? "List",
      description: list.value?.description,
    },
    key: "whatsapp",
    width: 800,
    height: 800,
  },
]);

useSeoMeta({
  title: () => list.value?.name,
  ogTitle: () => list.value?.name,
  description: () => list.value?.description,
  ogDescription: () => list.value?.description,
});
</script>