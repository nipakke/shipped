export default defineAppConfig({
  appName: "shipped",
  toaster: {
    position: "top-right" as const,
    expand: true,
    duration: 3000,
  },
  ui: {
    colors: {
      primary: "copperfield",
      neutral: "old-neutral",
    },
  },
});