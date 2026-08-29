import { describe, it, expect } from "vitest";
import { sql } from "@/db/client";
import { withRollback } from "../helpers/db";
import { categories, products, productImages } from "@/db/schema";
import { eq } from "drizzle-orm";

describe("luoc do co so du lieu", () => {
  it("co du 5 bang", async () => {
    const rows = await sql<{ table_name: string }[]>`
      select table_name from information_schema.tables where table_schema = 'public'
    `;
    const ten = rows.map((r) => r.table_name);
    for (const b of ["users", "brand_settings", "categories", "products", "product_images"]) {
      expect(ten).toContain(b);
    }
  });

  it("co chi muc trigram cho tim kiem", async () => {
    const rows = await sql<{ indexname: string }[]>`
      select indexname from pg_indexes where tablename = 'products'
    `;
    expect(rows.map((r) => r.indexname)).toContain("products_search_trgm_idx");
  });

  it("chan sku trung", async () => {
    await withRollback(async (tx) => {
      await tx.insert(categories).values({ id: "11111111-1111-1111-1111-111111111111", name: "Ghe", path: "/11111111-1111-1111-1111-111111111111/" });
      await tx.insert(products).values({ sku: "SP001", name: "Ghe go soi", searchText: "sp001 ghe go soi" });
      await expect(
        tx.insert(products).values({ sku: "SP001", name: "Ghe khac", searchText: "sp001 ghe khac" })
      ).rejects.toThrow();
    });
  });

  it("xoa san pham keo theo xoa anh", async () => {
    await withRollback(async (tx) => {
      const [sp] = await tx.insert(products)
        .values({ sku: "SP900", name: "Tam", searchText: "sp900 tam" }).returning();
      await tx.insert(productImages).values({
        productId: sp.id, storageKey: "k", variants: { thumb: "t", medium: "m", large: "l" },
        width: 100, height: 100, bytes: 1000, contentHash: "abc",
      });
      await tx.delete(products).where(eq(products.id, sp.id));
      const con_lai = await tx.select().from(productImages).where(eq(productImages.productId, sp.id));
      expect(con_lai).toHaveLength(0);
    });
  });
});
