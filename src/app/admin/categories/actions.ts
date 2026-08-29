"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/auth/guard";
import { db } from "@/db/client";
import * as service from "@/modules/catalog/categories.service";

export async function themDanhMuc(form: FormData): Promise<void> {
  await requireAdmin();
  const name = String(form.get("name") ?? "").trim();
  if (!name) return;
  const parentId = String(form.get("parent_id") ?? "") || null;
  await service.taoDanhMuc({ name, parentId });
  revalidatePath("/admin/categories");
}

export async function doiTenDanhMuc(form: FormData): Promise<void> {
  await requireAdmin();
  const id = String(form.get("id") ?? "");
  if (!id) return;
  const name = String(form.get("name") ?? "").trim();
  if (!name) return;
  await service.doiTen(id, name);
  revalidatePath("/admin/categories");
}

export async function xoaDanhMuc(form: FormData): Promise<void> {
  await requireAdmin();
  const id = String(form.get("id") ?? "");
  if (!id) return;
  const chuyen = String(form.get("chuyen_san") ?? "") || null;
  // Xoa mot nhanh gom NHIEU lenh ghi: chuyen san pham di, roi xoa tung danh muc.
  // Phai boc trong mot giao dich — neu khong, mot lenh hong giua chung se de lai
  // trang thai nua voi: san pham da bi chuyen di trong khi danh muc van con.
  await db.transaction(async (tx) => {
    await service.xoaDanhMuc(id, chuyen, tx);
  });
  revalidatePath("/admin/categories");
}
