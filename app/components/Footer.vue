<template>
  <UFooter>
    <template #default>
      <p class="text-muted text-sm">v{{ version }}</p>
    </template>

    <template #right>
      <UButton
        icon="simple-icons:github"
        color="neutral"
        variant="ghost"
        to="https://github.com/nipakke/shipped"
        target="_blank"
        aria-label="Github"
      />
    </template>
  </UFooter>
</template>

<script setup lang="ts">
import { version } from "../../package.json";
</script>