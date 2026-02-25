export default defineAppConfig({
  appName: "shipped",

  uiPro: {},

  toaster: {
    position: "top-right" as const,
    expand: true,
    duration: 3000,
  },
  ui: {
    colors: {
      primary: "copperfield",
      // map Nuxt UI semantic colors to the custom palettes defined in CSS
      // primary: "brand",
      // secondary: "peach",
      neutral: "old-neutral",
      // register a tertiary semantic color mapped to our peach accent
      // tertiary: "peach",
    },

    card: {
      
    }
  },
});