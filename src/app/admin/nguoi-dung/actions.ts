"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/auth/guard";
import {
  MA_SALE,
  kiemTraMatKhau,
  kiemTraSuaDoi,
  kiemTraTaoTaiKhoan,
  kiemTraVaiTro,
  laMucQuyen,
  type MucQuyen,
  type ThayDoi,
} from "@/modules/nguoi-dung/nguoi-dung.model";
import {
  LoiEmailDaTonTai,
  datTrangThai,
  datVaiTro,
  doiMatKhau,
  taoTaiKhoan,
} from "@/modules/nguoi-dung/nguoi-dung.service";
import {
  LoiVaiTroDaTonTai,
  LoiVaiTroDangCoNguoiGiu,
  LoiVaiTroHeThong,
  danhSachVaiTro,
  suaVaiTro,
  themVaiTro,
  xoaVaiTro,
} from "@/modules/nguoi-dung/vai-tro.service";

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

/**
 * Ma vai tro tu form, DA DOI CHIEU voi bang.
 *
 * Khong tin gia tri gui len: server action la mot diem vao HTTP that su, nguoi
 * ta post duoc mot ma vai tro khong ton tai. Khoa ngoai se chan, nhung chan
 * bang mot loi rang buoc khoa ngoai thi man hinh chi hien duoc "loi he thong".
 * Lui ve `sale` — bac quyen thap nhat — la lua chon an toan khi khong ro.
 */
async function vaiTroTuForm(form: FormData): Promise<string> {
  const ma = chuoi(form, "vai_tro");
  const ds = await danhSachVaiTro();
  return ds.some((v) => v.ma === ma) ? ma : MA_SALE;
}

/** Muc quyen cua mot ma vai tro; `sale` khi khong tim thay. */
async function mucQuyenCua(ma: string): Promise<MucQuyen> {
  const ds = await danhSachVaiTro();
  return ds.find((v) => v.ma === ma)?.mucQuyen ?? "sale";
}

function mucQuyenTuForm(form: FormData): MucQuyen {
  const v = chuoi(form, "muc_quyen");
  return laMucQuyen(v) ? v : "sale";
}

export async function themTaiKhoan(_truoc: string | null, form: FormData): Promise<string | null> {
  await chotAdmin();
  const v = {
    email: chuoi(form, "email"),
    matKhau: chuoi(form, "mat_khau"),
    hoTen: chuoi(form, "ho_ten"),
    vaiTro: await vaiTroTuForm(form),
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
  const vaiTroMoi = await vaiTroTuForm(form);

  const loi = kiemTraSuaDoi(toi.id, id, {
    kieu: "doi-vai-tro",
    mucQuyenMoi: await mucQuyenCua(vaiTroMoi),
  });
  if (loi) return loi;

  await datVaiTro(id, vaiTroMoi);
  revalidatePath(DUONG_DAN);
  return null;
}

// ─────────────────────────────────────────────────────── quan ly vai tro

export async function themVaiTroMoi(_truoc: string | null, form: FormData): Promise<string | null> {
  await chotAdmin();
  const v = {
    ten: chuoi(form, "ten"),
    tenEn: chuoi(form, "ten_en"),
    mucQuyen: mucQuyenTuForm(form),
  };
  const loi = kiemTraVaiTro(v);
  if (loi) return loi;

  try {
    await themVaiTro(v);
  } catch (e) {
    if (e instanceof LoiVaiTroDaTonTai) return "vai_tro_da_ton_tai";
    console.error("[vai-tro] loi them:", e);
    return "loi_he_thong";
  }
  revalidatePath(DUONG_DAN);
  return null;
}

export async function luuVaiTro(_truoc: string | null, form: FormData): Promise<string | null> {
  await chotAdmin();
  const ma = chuoi(form, "ma");
  const v = {
    ten: chuoi(form, "ten"),
    tenEn: chuoi(form, "ten_en"),
    mucQuyen: mucQuyenTuForm(form),
  };
  const loi = kiemTraVaiTro(v);
  if (loi) return loi;

  try {
    await suaVaiTro(ma, v);
  } catch (e) {
    if (e instanceof LoiVaiTroHeThong) return "vai_tro_he_thong";
    console.error("[vai-tro] loi sua:", e);
    return "loi_he_thong";
  }
  revalidatePath(DUONG_DAN);
  return null;
}

export async function boVaiTro(_truoc: string | null, form: FormData): Promise<string | null> {
  await chotAdmin();
  try {
    await xoaVaiTro(chuoi(form, "ma"));
  } catch (e) {
    if (e instanceof LoiVaiTroHeThong) return "vai_tro_he_thong";
    if (e instanceof LoiVaiTroDangCoNguoiGiu) return "vai_tro_dang_co_nguoi_giu";
    console.error("[vai-tro] loi xoa:", e);
    return "loi_he_thong";
  }
  revalidatePath(DUONG_DAN);
  return null;
}
