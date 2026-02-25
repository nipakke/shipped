<template>
  <div class="space-y-4 py-2">
    <div class="flex gap-2">
      <USkeleton class="skeleton h-10 w-10 rounded-full" />

      <div class="flex-1 space-y-2">
        <USkeleton class="skeleton h-5 w-32" />
        <USkeleton class="skeleton h-4 w-24" />
      </div>
    </div>

    <div class="space-y-1">
      <div v-for="i in 3" :key="i" class="flex px-3 py-2">
        <USkeleton class="skeleton h-4 w-full" />
      </div>
    </div>
  </div>
</template>

<style>
@reference "tailwindcss";
@reference "@nuxt/ui";

.skeleton {
  @apply bg-accented;
}
</style>