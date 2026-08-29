import { eq, like, asc } from "drizzle-orm";
import { db, type Tx } from "@/db/client";
import { categories, products } from "@/db/schema";

export type DanhMuc = {
  id: string;
  name: string;
  parentId: string | null;
  path: string;
  sortOrder: number;
};

type Handle = Tx | typeof db;
const h = (tx?: Tx): Handle => tx ?? db;

export async function layTatCa(tx?: Tx): Promise<DanhMuc[]> {
  return h(tx).select({
    id: categories.id, name: categories.name, parentId: categories.parentId,
    path: categories.path, sortOrder: categories.sortOrder,
  }).from(categories).orderBy(asc(categories.sortOrder), asc(categories.name));
}

export async function layTheoId(id: string, tx?: Tx): Promise<DanhMuc | null> {
  const [r] = await h(tx).select({
    id: categories.id, name: categories.name, parentId: categories.parentId,
    path: categories.path, sortOrder: categories.sortOrder,
  }).from(categories).where(eq(categories.id, id)).limit(1);
  return r ?? null;
}

export async function chen(
  gt: { id: string; name: string; parentId: string | null; path: string },
  tx?: Tx,
): Promise<DanhMuc> {
  const [r] = await h(tx).insert(categories).values(gt).returning({
    id: categories.id, name: categories.name, parentId: categories.parentId,
    path: categories.path, sortOrder: categories.sortOrder,
  });
  return r;
}

export async function capNhat(
  id: string,
  gt: Partial<{ name: string; parentId: string | null; path: string; sortOrder: number }>,
  tx?: Tx,
): Promise<void> {
  await h(tx).update(categories).set(gt).where(eq(categories.id, id));
}

/** Lay chinh nut va toan bo con chau — dua vao tien to path. */
export async function layCaNhanh(path: string, tx?: Tx): Promise<DanhMuc[]> {
  return h(tx).select({
    id: categories.id, name: categories.name, parentId: categories.parentId,
    path: categories.path, sortOrder: categories.sortOrder,
  }).from(categories).where(like(categories.path, `${path}%`));
}

export async function xoaNhieu(ids: string[], tx?: Tx): Promise<void> {
  if (ids.length === 0) return;
  for (const id of ids) {
    await h(tx).delete(categories).where(eq(categories.id, id));
  }
}

export async function chuyenSanPhamSangDanhMuc(
  idsDanhMucCu: string[],
  idMoi: string | null,
  tx?: Tx,
): Promise<void> {
  for (const cu of idsDanhMucCu) {
    await h(tx).update(products).set({ categoryId: idMoi }).where(eq(products.categoryId, cu));
  }
}
