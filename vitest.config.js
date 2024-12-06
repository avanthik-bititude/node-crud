import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    mockReset: true,
    environment: "node",
    coverage: {
      provider: "v8",
    },
  },
});
