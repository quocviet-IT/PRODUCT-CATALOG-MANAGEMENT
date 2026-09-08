import "server-only";
import { timingSafeEqual } from "node:crypto";
import { getEnv } from "@/lib/env";
import { ghiTep, taiVe } from "@/modules/media/storage";
import { KHOA_ANH_THU_MUC, KHOA_BANG, KHOA_TRANG_THAI } from "./dong-bo.khoa";

/**
 * Nhan du lieu do Google Apps Script day sang.
 *
 * VI SAO CO DUONG NAY: Workspace cua cong ty cam chia se ra ngoai ten mien, nen
 * khong moi duoc tai khoan may vao Drive; va bat uy quyen toan mien thi phai
 * vao Admin Console. Apps Script chay BEN TRONG Google voi tu cach chinh nhan
 * vien, chi goi RA ngoai — khong dinh chinh sach nao ca.
 *
 * He qua: Vercel khong giu mot thong tin dang nhap Google nao. Do la mat bao
 * mat tot hon ca hai duong kia, khong phai mot su danh doi.
 */

export { KHOA_ANH_THU_MUC, KHOA_BANG, KHOA_TRANG_THAI } from "./dong-bo.khoa";

export class LoiChuaBatDongBo extends Error {
  constructor() {
    super("Chưa khai báo DONG_BO_SECRET nên đường đồng bộ đang tắt.");
    this.name = "LoiChuaBatDongBo";
  }
}

/**
 * Kiem tra khoa bi mat trong header Authorization.
 *
 * So sanh bang timingSafeEqual chu khong bang `===`: so sanh chuoi thuong dung
 * lai o ky tu dau tien khac nhau, nen thoi gian tra loi ro ri do dai tien to
 * dung. Voi mot cong mo cong khai ra Internet thi do la mot ro ri that.
 *
 * KHONG khai DONG_BO_SECRET thi duong nay TAT han — khong bao gio duoc phep
 * hieu "thieu khoa" thanh "khong can khoa".
 */
export function kiemKhoa(req: Request): boolean {
  const mong = getEnv().DONG_BO_SECRET;
  if (!mong) throw new LoiChuaBatDongBo();

  const dua = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  const a = Buffer.from(dua, "utf8");
  const b = Buffer.from(mong, "utf8");
  // timingSafeEqual nem loi khi hai ben khac do dai, nen phai chan truoc — va
  // do dai khoa khong phai thu can giau.
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export type TrangThaiDongBo = {
  luc: string;
  soDong: number;
  soThuMuc: number;
  soAnh: number;
};

export async function ghiBang(hang: unknown[][]): Promise<void> {
  await ghiTep(KHOA_BANG, Buffer.from(JSON.stringify(hang), "utf8"), "application/json");
}

export async function ghiAnhThuMuc(bang: Record<string, unknown[]>): Promise<void> {
  await ghiTep(
    KHOA_ANH_THU_MUC,
    Buffer.from(JSON.stringify(bang), "utf8"),
    "application/json",
  );
}

export async function ghiTrangThai(t: TrangThaiDongBo): Promise<void> {
  await ghiTep(
    KHOA_TRANG_THAI,
    Buffer.from(JSON.stringify(t), "utf8"),
    "application/json",
  );
}

/**
 * Doc moc dong bo gan nhat. Tra null khi chua co lan nao — man hinh dua vao
 * day de biet nen bao "dang doc bang tinh", "dong bo luc ..." hay "du lieu mau".
 *
 * Khong bao gio nem loi: mot man hinh khong duoc trang chi vi khong doc noi
 * mot dong chu trang thai.
 */
export async function docTrangThai(): Promise<TrangThaiDongBo | null> {
  try {
    const buf = await taiVe(KHOA_TRANG_THAI);
    const t = JSON.parse(buf.toString("utf8")) as TrangThaiDongBo;
    return typeof t?.luc === "string" ? t : null;
  } catch {
    return null;
  }
}
