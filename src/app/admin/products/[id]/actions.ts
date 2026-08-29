"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/auth/guard";
import { capNhatSanPham, LoiSkuTrung } from "@/modules/catalog/products.service";

export async function luuSanPham(form: FormData): Promise<void> {
  await requireUser();
  const id = String(form.get("id"));
  const gia = String(form.get("list_price") ?? "").trim();

  try {
    await capNhatSanPham(id, {
      sku: String(form.get("sku") ?? "").trim(),
      name: String(form.get("name") ?? "").trim(),
      description: String(form.get("description") ?? ""),
      listPrice: gia === "" ? null : Number(gia),
      categoryId: String(form.get("category_id") ?? "") || null,
      status: form.get("status") as "active" | "discontinued" | "draft",
    });
  } catch (e) {
    if (e instanceof LoiSkuTrung) throw new Error(e.message);
    throw e;
  }

  revalidatePath(`/admin/products/${id}`);
  revalidatePath("/admin/products");
}
