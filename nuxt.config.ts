// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
  compatibilityDate: "2026-01-01",
  devtools: { enabled: true },
  telemetry: {
    enabled: false,
  },
  app: {
    pageTransition: {
      name: "slide-up",
      mode: "out-in",
    },
  },
  modules: ["@nuxtjs/robots", "nuxt-og-image"],
  fonts: {
    families: [
      { name: "Outfit", weights: [400, 600, 700], global: true },
      { name: "Geist", weights: [400, 600, 700], global: true },
    ],
  },
  site: {
    indexable: false,
  },
  ssr: true,
  typescript: {
    tsConfig: {
      compilerOptions: {
        plugins: [
          {
            name: "@effect/language-service",
          },
        ],
      },
    },
    typeCheck: false,
    shim: false
  },
  vite: {
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules")) {
              if (id.includes("effect") || id.includes("@effect/")) {
                return "effect";
              }
            }
          },
        },
      },
    },
  },
  nitro: {
    typescript: {
      tsConfig: {
        compilerOptions: {
          plugins: [
            {
              name: "@effect/language-service",
            },
          ],
        },
      },
    },
    handlers: [
      { route: "/api/rpc/**", handler: "~~/server/rpc/handler.ts", lazy: true, middleware: false },
      { route: "/api/rpc", handler: "~~/server/rpc/handler.ts", lazy: true, middleware: false },
    ],
  },
});