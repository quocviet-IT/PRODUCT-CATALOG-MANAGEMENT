"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/auth/guard";
import { datKhoa } from "@/modules/catalogue-share/chia-se.service";

const DUONG_DAN = "/admin/catalogue";

/**
 * Khoa / mo khoa mot link catalogue.
 *
 * requireUser() goi o DAY chu khong chi dua vao khung trang: server action la
 * mot diem vao HTTP that su, goi thang duoc, khong qua giao dien.
 *
 * Quyen "chi cua minh, tru admin" nam trong datKhoa() — no gan dieu kien do
 * vao chinh cau lenh UPDATE.
 */
export async function doiKhoa(_truoc: string | null, form: FormData): Promise<string | null> {
  const user = await requireUser();
  const slug = String(form.get("slug") ?? "");
  const khoa = String(form.get("khoa") ?? "") === "1";

  try {
    const xong = await datKhoa(slug, khoa, user.id, user.role === "admin");
    if (!xong) return "loi_khoa";
  } catch (loi) {
    console.error("[catalogue] loi doi trang thai khoa:", loi);
    return "loi_khoa";
  }

  revalidatePath(DUONG_DAN);
  // Trang khach doc thang tu co so du lieu moi yeu cau, nhung Next co the giu
  // ban dung san cua duong dan do — don di de khoa co hieu luc ngay.
  revalidatePath(`/catalogue/${slug}`);
  return null;
}
