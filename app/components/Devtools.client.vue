<template>
  <UButton v-if="devtoolsClient" @click="devtoolsClient.devtools.open()"> Open DevTools </UButton>
</template>

<script setup lang="ts">
const devtoolsClient = useNuxtDevTools();
</script>