"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/auth/guard";
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
  const id = String(form.get("id"));
  const name = String(form.get("name") ?? "").trim();
  if (!name) return;
  await service.doiTen(id, name);
  revalidatePath("/admin/categories");
}

export async function xoaDanhMuc(form: FormData): Promise<void> {
  await requireAdmin();
  const id = String(form.get("id"));
  const chuyen = String(form.get("chuyen_san") ?? "") || null;
  await service.xoaDanhMuc(id, chuyen);
  revalidatePath("/admin/categories");
}
