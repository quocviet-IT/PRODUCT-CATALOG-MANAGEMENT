"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin, requireUser } from "@/auth/guard";
import {
  chuanHoaDuongDan,
  kiemTraGopY,
  laLoaiGopY,
  laTrangThaiGopY,
} from "@/modules/gop-y/gop-y.model";
import { datTrangThaiGopY, taoGopY } from "@/modules/gop-y/gop-y.service";

const DUONG_DAN = "/admin/gop-y";

function chuoi(form: FormData, khoa: string): string {
  return String(form.get(khoa) ?? "");
}

/**
 * Gui mot gop y. MOI nguoi dang nhap deu gui duoc — day la cho de nhan vien noi
 * he thong dang hong o dau, khoa lai theo vai tro la tu bit tai minh.
 */
export async function guiGopY(_truoc: string | null, form: FormData): Promise<string | null> {
  const toi = await requireUser();

  const noiDung = chuoi(form, "noi_dung");
  const loi = kiemTraGopY(noiDung);
  if (loi) return loi;

  const tho = chuoi(form, "loai");
  try {
    await taoGopY({
      // Gia tri la thi coi la y kien: mot gop y bi mat vi phan loai sai con te
      // hon mot gop y nam nham hang.
      loai: laLoaiGopY(tho) ? tho : "y-kien",
      noiDung,
      duongDan: chuanHoaDuongDan(chuoi(form, "duong_dan")),
      nguoiGuiId: toi.id,
      nguoiGuiEmail: toi.email,
    });
  } catch (e) {
    console.error("[gop-y] loi ghi gop y:", e);
    return "loi_he_thong";
  }
  revalidatePath(DUONG_DAN);
  return null;
}

/** Danh dau da xu ly / mo lai. Chi quan tri. */
export async function doiTrangThaiGopY(
  _truoc: string | null,
  form: FormData,
): Promise<string | null> {
  await requireAdmin();

  const tho = chuoi(form, "trang_thai");
  if (!laTrangThaiGopY(tho)) return "loi_he_thong";

  try {
    await datTrangThaiGopY(chuoi(form, "id"), tho);
  } catch (e) {
    console.error("[gop-y] loi doi trang thai:", e);
    return "loi_he_thong";
  }
  revalidatePath(DUONG_DAN);
  return null;
}
