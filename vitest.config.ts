import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

const alias = {
  "~~": fileURLToPath(new URL(".", import.meta.url)),
  "~": fileURLToPath(new URL("./app", import.meta.url)),
  "@": fileURLToPath(new URL(".", import.meta.url)),
  "#shared": fileURLToPath(new URL("./shared", import.meta.url)),
};

export default defineConfig({
  test: {
    alias,
    coverage: {
      provider: "v8",
    },
    projects: [
      {
        test: {
          alias,
          name: {
            label: "unit",
            color: "yellow",
          },
          include: ["**/*.test.ts"],
          exclude: ["server/providers/**", "**/*.integration.test.ts", "**/node_modules/**"],
        },
      },
      {
        test: {
          alias,
          name: {
            label: "providers",
            color: "cyan",
          },
          include: ["server/providers/**/*.test.ts"],
          exclude: ["**/node_modules/**"],
          environment: "node",
          testTimeout: 10000,
          pool: "threads",
          fileParallelism: true,
          setupFiles: ["./server/tests/providers/setup.ts"],
        },
      },
      {
        test: {
          alias,
          name: {
            label: "integration",
            color: "magenta",
          },
          include: ["**/*.integration.test.ts"],
          exclude: ["**/node_modules/**"],
          environment: "node",
          testTimeout: 30000,
          pool: "threads",
        },
      },
    ],
  },
});