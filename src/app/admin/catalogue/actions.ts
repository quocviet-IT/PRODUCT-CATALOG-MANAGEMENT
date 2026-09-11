"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/auth/guard";
import {
  DAI_TEN_TOI_DA,
  LoiTenLinkRong,
  datKhoa,
  doiTenLink,
} from "@/modules/catalogue-share/chia-se.service";

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
    const xong = await datKhoa(slug, khoa, user.id, user.mucQuyen === "admin");
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

/** Ket qua doi ten link. `slug` la duong dan MOI khi doi xong. */
export type KetQuaDoiTen = { loi: "ten_rong" | "loi" | null; slug: string | null };

/**
 * Doi ten link cua mot catalogue — giu nguyen ma o cuoi, nen link cu da gui
 * khach van mo duoc (trang khach tu chuyen sang link moi).
 *
 * Cung ly do voi doiKhoa: requireUser() o day, quyen nam trong doiTenLink().
 */
export async function luuTenLink(_truoc: KetQuaDoiTen, form: FormData): Promise<KetQuaDoiTen> {
  const user = await requireUser();
  const slug = String(form.get("slug") ?? "");
  const tenLink = String(form.get("tenLink") ?? "").slice(0, DAI_TEN_TOI_DA);

  let moi: string | null;
  try {
    moi = await doiTenLink(slug, tenLink, user.id, user.mucQuyen === "admin");
  } catch (loi) {
    if (loi instanceof LoiTenLinkRong) return { loi: "ten_rong", slug: null };
    console.error("[catalogue] loi doi ten link:", loi);
    return { loi: "loi", slug: null };
  }
  if (moi === null) return { loi: "loi", slug: null };

  revalidatePath(DUONG_DAN);
  revalidatePath(`/catalogue/${slug}`);
  revalidatePath(`/catalogue/${moi}`);
  return { loi: null, slug: moi };
}
