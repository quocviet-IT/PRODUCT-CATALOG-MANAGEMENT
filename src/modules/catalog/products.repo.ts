import { and, eq, gte, lte, sql as raw, desc, inArray, type SQL } from "drizzle-orm";
import { db, type Tx } from "@/db/client";
import { products, productImages, categories } from "@/db/schema";
import type { BoLoc, ThamSoTrang } from "./search-query";

type Handle = Tx | typeof db;
const h = (tx?: Tx): Handle => tx ?? db;

export type SanPham = {
  id: string;
  sku: string;
  name: string;
  description: string;
  listPrice: string | null;
  currency: string;
  categoryId: string | null;
  attributes: Record<string, unknown>;
  status: string;
  anhDaiDien: string | null;
};

function dungDieuKien(loc: BoLoc): SQL[] {
  const dk: SQL[] = [];

  if (loc.tuKhoa) {
    dk.push(raw`${products.searchText} LIKE ${"%" + loc.tuKhoa + "%"}`);
  }
  if (loc.categoryPath) {
    dk.push(raw`${products.categoryId} IN (
      SELECT ${categories.id} FROM ${categories} WHERE ${categories.path} LIKE ${loc.categoryPath + "%"}
    )`);
  }
  if (loc.giaTu !== undefined) dk.push(gte(products.listPrice, String(loc.giaTu)));
  if (loc.giaDen !== undefined) dk.push(lte(products.listPrice, String(loc.giaDen)));
  if (loc.trangThai) dk.push(eq(products.status, loc.trangThai));
  if (loc.coAnh !== undefined) {
    const co = raw`EXISTS (SELECT 1 FROM ${productImages} WHERE ${productImages.productId} = ${products.id})`;
    dk.push(loc.coAnh ? co : raw`NOT ${co}`);
  }
  return dk;
}

export async function tim(
  loc: BoLoc, trang: ThamSoTrang, tx?: Tx,
): Promise<{ ds: SanPham[]; tong: number }> {
  const dk = dungDieuKien(loc);
  const where = dk.length ? and(...dk) : undefined;

  const [{ tong }] = await h(tx)
    .select({ tong: raw<number>`count(*)::int` })
    .from(products)
    .where(where);

  const ds = await h(tx)
    .select({
      id: products.id, sku: products.sku, name: products.name,
      description: products.description, listPrice: products.listPrice,
      currency: products.currency, categoryId: products.categoryId,
      attributes: products.attributes, status: products.status,
      // "products" va "product_images" deu co cot rieng ten "id". Ben trong subquery
      // nay pham vi FROM la product_images, nen mot the hien Column binh thuong cho
      // products.id (${products.id}) bi Drizzle in ra KHONG co tien to bang khi day
      // la truy van don-bang o tang ngoai — Postgres se hieu no la product_images.id
      // (cung ten) thay vi products.id, khien WHERE khong bao gio khop va anhDaiDien
      // luon ra null du san pham co anh that. Phai ep tien to bang tuong minh bang
      // sql.raw() de tranh dung phai toi uu hoa "don bang" nay cua Drizzle.
      anhDaiDien: raw<string | null>`(
        SELECT ${productImages.variants} ->> 'thumb' FROM ${productImages}
        WHERE ${productImages.productId} = ${raw.raw('"products"."id"')}
        ORDER BY ${productImages.isPrimary} DESC, ${productImages.sortOrder} ASC LIMIT 1
      )`,
    })
    .from(products)
    .where(where)
    .orderBy(desc(products.createdAt))
    .limit(trang.moiTrang)
    .offset((trang.trang - 1) * trang.moiTrang);

  return { ds: ds as SanPham[], tong };
}

export async function chen(gt: typeof products.$inferInsert, tx?: Tx) {
  const [r] = await h(tx).insert(products).values(gt).returning();
  return r;
}

export async function layTheoId(id: string, tx?: Tx) {
  const [r] = await h(tx).select().from(products).where(eq(products.id, id)).limit(1);
  return r ?? null;
}

export async function capNhat(
  id: string, gt: Partial<typeof products.$inferInsert>, tx?: Tx,
): Promise<void> {
  await h(tx).update(products).set({ ...gt, updatedAt: new Date() }).where(eq(products.id, id));
}

export async function capNhatNhieu(
  ids: string[], gt: Partial<typeof products.$inferInsert>, tx?: Tx,
): Promise<number> {
  if (ids.length === 0) return 0;
  const r = await h(tx).update(products)
    .set({ ...gt, updatedAt: new Date() })
    .where(inArray(products.id, ids))
    .returning({ id: products.id });
  return r.length;
}
