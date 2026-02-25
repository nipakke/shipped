<template>
  <UPage>
    <div class="space-y-12 py-8">
      <section class="space-y-4 text-center">
        <h1 class="text-toned text-4xl font-bold">Shipped</h1>
        <p class="text-muted text-xl">Self-hosted package release tracker for GitHub, NPM, and Docker.</p>
      </section>

      <section class="flex justify-center gap-4">
        <img :src="`https://img.shields.io/github/v/release/${repo}?label=version`" alt="Version" />
        <img :src="`https://img.shields.io/docker/v/${repo}?label=docker`" alt="Docker" />
      </section>

      <section class="mx-auto max-w-2xl">
        <h2 class="mb-8 text-center text-2xl font-semibold">Get Started</h2>
        <div class="grid gap-4 sm:grid-cols-2">
          <UButton
            variant="outline"
            size="lg"
            icon="lucide:github"
            :to="`https://github.com/${repo}`"
            external
            target="_blank"
            rel="noopener noreferrer"
            class="justify-start"
          >
            GitHub Repository
          </UButton>

          <UButton
            variant="outline"
            size="lg"
            icon="lucide:book"
            :to="`https://github.com/${repo}/blob/main/README.md`"
            external
            target="_blank"
            rel="noopener noreferrer"
            class="justify-start"
          >
            Documentation
          </UButton>

          <UButton
            variant="outline"
            size="lg"
            icon="lucide:help-circle"
            :to="`https://github.com/${repo}/issues`"
            external
            target="_blank"
            rel="noopener noreferrer"
            class="justify-start sm:col-span-2"
          >
            Support
          </UButton>
        </div>
      </section>

      <section class="mx-auto max-w-4xl">
        <h2 class="mb-8 text-center text-2xl font-semibold">Features</h2>
        <div class="grid gap-6 md:grid-cols-2">
          <UCard>
            <div class="flex items-start gap-3">
              <UIcon name="lucide:package" class="text-primary mt-1 h-6 w-6" />
              <div>
                <h3 class="font-semibold">Multi-Provider Support</h3>
                <p class="text-muted text-sm">Track packages from GitHub, NPM, PyPI, and other registries.</p>
              </div>
            </div>
          </UCard>

          <UCard>
            <div class="flex items-start gap-3">
              <UIcon name="lucide:list" class="text-primary mt-1 h-6 w-6" />
              <div>
                <h3 class="font-semibold">Customizable Lists</h3>
                <p class="text-muted text-sm">
                  Organize packages into groups and categories for efficient oversight.
                </p>
              </div>
            </div>
          </UCard>

          <UCard>
            <div class="flex items-start gap-3">
              <UIcon name="lucide:zap" class="text-primary mt-1 h-6 w-6" />
              <div>
                <h3 class="font-semibold">Real-time Updates</h3>
                <p class="text-muted text-sm">Live monitoring with recency indicators.</p>
              </div>
            </div>
          </UCard>
        </div>
      </section>
    </div>
  </UPage>
</template>

<script setup lang="ts">
const repo = "nipakke/shipped";

defineOgImage("ShippedSeo", [
  {
    props: {
      title: "shipped",
    },
  },
  {
    props: {
      title: "shipped",
    },
    key: "whatsapp",
    width: 800,
    height: 800,
  },
]);

useSeoMeta({
  title: "Getting Started",
  ogTitle: "shipped",
});
</script>