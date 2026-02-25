<template>
  <UApp>
    <Header />

    <UMain>
      <UContainer>
        <UPage>
          <UError :error="error" :clear="!error?.fatal" />
        </UPage>
      </UContainer>
    </UMain>

    <Footer />
  </UApp>
</template>

<script setup lang="ts">
const error = useError();
</script>