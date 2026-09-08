"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/auth/guard";
import {
  kiemTraMatKhau,
  kiemTraSuaDoi,
  kiemTraTaoTaiKhoan,
  type ThayDoi,
  type VaiTro,
} from "@/modules/nguoi-dung/nguoi-dung.model";
import {
  LoiEmailDaTonTai,
  datTrangThai,
  datVaiTro,
  doiMatKhau,
  taoTaiKhoan,
} from "@/modules/nguoi-dung/nguoi-dung.service";

const DUONG_DAN = "/admin/nguoi-dung";

/**
 * MOI hanh dong o day deu goi requireAdmin() TRUOC tien.
 *
 * Server action la mot diem vao HTTP that su — nguoi ta goi thang duoc, khong
 * qua giao dien. Giau nut di khong phai la gac cua; chi dong nay moi la.
 */
async function chotAdmin() {
  return requireAdmin();
}

function chuoi(form: FormData, khoa: string): string {
  return String(form.get(khoa) ?? "");
}

function vaiTroTuForm(form: FormData): VaiTro {
  return chuoi(form, "vai_tro") === "admin" ? "admin" : "sale";
}

export async function themTaiKhoan(_truoc: string | null, form: FormData): Promise<string | null> {
  await chotAdmin();
  const v = {
    email: chuoi(form, "email"),
    matKhau: chuoi(form, "mat_khau"),
    hoTen: chuoi(form, "ho_ten"),
    vaiTro: vaiTroTuForm(form),
  };
  const loi = kiemTraTaoTaiKhoan(v);
  if (loi) return loi;

  try {
    await taoTaiKhoan(v);
  } catch (e) {
    if (e instanceof LoiEmailDaTonTai) return "email_da_ton_tai";
    console.error("[nguoi-dung] loi tao tai khoan:", e);
    return "loi_he_thong";
  }
  revalidatePath(DUONG_DAN);
  return null;
}

export async function datLaiMatKhau(_truoc: string | null, form: FormData): Promise<string | null> {
  const toi = await chotAdmin();
  const id = chuoi(form, "id");
  const matKhau = chuoi(form, "mat_khau");

  const loiDoDai = kiemTraMatKhau(matKhau);
  if (loiDoDai) return loiDoDai;
  const loiQuyen = kiemTraSuaDoi(toi.id, id, { kieu: "doi-mat-khau" });
  if (loiQuyen) return loiQuyen;

  try {
    await doiMatKhau(id, matKhau);
  } catch (e) {
    console.error("[nguoi-dung] loi doi mat khau:", e);
    return "loi_he_thong";
  }
  revalidatePath(DUONG_DAN);
  return null;
}

export async function doiTrangThai(_truoc: string | null, form: FormData): Promise<string | null> {
  const toi = await chotAdmin();
  const id = chuoi(form, "id");
  const bat = chuoi(form, "bat") === "1";

  const td: ThayDoi = bat ? { kieu: "mo-khoa" } : { kieu: "khoa" };
  const loi = kiemTraSuaDoi(toi.id, id, td);
  if (loi) return loi;

  await datTrangThai(id, bat);
  revalidatePath(DUONG_DAN);
  return null;
}

export async function doiVaiTro(_truoc: string | null, form: FormData): Promise<string | null> {
  const toi = await chotAdmin();
  const id = chuoi(form, "id");
  const vaiTroMoi = vaiTroTuForm(form);

  const loi = kiemTraSuaDoi(toi.id, id, { kieu: "doi-vai-tro", vaiTroMoi });
  if (loi) return loi;

  await datVaiTro(id, vaiTroMoi);
  revalidatePath(DUONG_DAN);
  return null;
}
