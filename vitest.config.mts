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
    alias: {
      "@": path.resolve(sourceDir, "src"),
      // "server-only" nem loi ngay khi duoc nap ngoai moi truong React Server
      // Component, nen mot test node thuan khong import noi module nao co no.
      // Duoi ve ban rong: rao chan do co viec cua no o buoc build cua Next
      // (chan module bi mat lot vao goi trinh duyet) — va buoc build van chay.
      "server-only": path.resolve(sourceDir, "node_modules/server-only/empty.js"),
    },
  },
});
