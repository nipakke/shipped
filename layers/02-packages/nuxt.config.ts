import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const currentDir = dirname(fileURLToPath(import.meta.url));

export default defineNuxtConfig({
  components: {
    dirs: [
      {
        path: join(currentDir, "./app/components"),
        prefix: "Package",
      },
    ],
  },
});