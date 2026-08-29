import { defineConfig } from "vitest/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

const sourceDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    setupFiles: ["tests/setup.ts"],
    // Cac test cham qua Supabase pooler (ap-southeast-1); vitest mac dinh 5000ms
    // qua ngan cho lan ket noi dau (cold start) va gay flaky that bai.
    testTimeout: 15000,
  },
  resolve: {
    alias: { "@": path.resolve(sourceDir, "src") },
  },
});
