import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    exclude: ["node_modules", ".next", "e2e/**"],
    coverage: {
      provider: "v8",
      include: [
        "src/lib/calc-engine.ts",
        "src/lib/rate-service.ts",
        "src/lib/validation/calc-schema.ts",
      ],
      reporter: ["text", "text-summary"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
