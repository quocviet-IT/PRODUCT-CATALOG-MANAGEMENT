import "server-only";
import { timingSafeEqual } from "node:crypto";
import { getEnv } from "@/lib/env";
import { ghiTep, taiVe } from "@/modules/media/storage";
import { KHOA_ANH_THU_MUC, KHOA_BANG, KHOA_LUC_THU_MUC, KHOA_TRANG_THAI } from "./dong-bo.khoa";
import { tronBanDo } from "./thu-muc-can-liet-ke";

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

export { KHOA_ANH_THU_MUC, KHOA_BANG, KHOA_LUC_THU_MUC, KHOA_TRANG_THAI } from "./dong-bo.khoa";

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

/**
 * So anh toi da luu cho MOT thu muc Drive.
 *
 * Day la tran tren cua "mot mau co bao nhieu anh" trong ca he thong: dong bo
 * khong bao gio ghi qua ngan nay, nen khong tuyen nao o phia sau duoc phep tu
 * choi mot con so nho hon. /api/catalogue tung dat rieng tran 40 voi ghi chu
 * "thu vien lon nhat hien co la 8" — dung o thoi bang tinh con nho, nhung sau
 * khi dong bo quet het 1.462 thu muc Drive thi thu muc lon nhat co 166 anh va
 * 112 thu muc vuot 40. Ket qua: 7,7% mau khong tao duoc link, loi 400, va
 * khong ai biet vi sao. Mot con so, mot cho.
 */
export const SO_ANH_MOI_THU_MUC = 500;

export type TrangThaiDongBo = {
  luc: string;
  soDong: number;
  soThuMuc: number;
  soAnh: number;
  /**
   * Van tay cua bang tho lan truoc. Duong dong bo chay moi phut, ma bang tinh
   * thi ca ngay khong ai dong toi — so van tay de biet co dang ghi de tep 110 KB
   * hay khong. Vang mat o cac ban chup cu, nen phai la tuy chon.
   */
  bam?: string;
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

/**
 * Doc ban do thu muc -> danh sach anh hien co. Tra {} khi chua co lan nao.
 *
 * Khong bao gio nem loi: cong gop them thu muc phai chay duoc ngay ca khi chua
 * co gi de gop vao.
 */
export async function docAnhThuMuc(): Promise<Record<string, unknown[]>> {
  try {
    const buf = await taiVe(KHOA_ANH_THU_MUC);
    const b = JSON.parse(buf.toString("utf8")) as unknown;
    return typeof b === "object" && b !== null ? (b as Record<string, unknown[]>) : {};
  } catch {
    return {};
  }
}

/**
 * Doc moc liet ke gan nhat cua tung thu muc (idThuMuc -> ISO). Tra {} khi chua co.
 *
 * Chi giu nhung gia tri la CHUOI NGAY GIO doc duoc. Tep hong hay mot gia tri la
 * thi thu muc do coi nhu chua co moc — tuc la se duoc liet ke lai, dung ve phia
 * an toan. Khong bao gio nem loi.
 */
export async function docLucThuMuc(): Promise<Record<string, string>> {
  try {
    const b = JSON.parse((await taiVe(KHOA_LUC_THU_MUC)).toString("utf8")) as unknown;
    if (typeof b !== "object" || b === null || Array.isArray(b)) return {};
    const kq: Record<string, string> = {};
    for (const [k, v] of Object.entries(b as Record<string, unknown>)) {
      if (typeof v === "string" && Number.isFinite(Date.parse(v))) kq[k] = v;
    }
    return kq;
  } catch {
    return {};
  }
}

export async function ghiLucThuMuc(luc: Record<string, string>): Promise<void> {
  await ghiTep(KHOA_LUC_THU_MUC, Buffer.from(JSON.stringify(luc), "utf8"), "application/json");
}

/**
 * GOP them thu muc vao ban do da co, khong ghi de ca ban do.
 *
 * Vi sao phai gop: bang tinh tung co 1.476 thu muc anh, ma liet ke chung bang
 * DriveApp mat khoang 1,2 giay moi cai — hon nua tieng cho ca luot, trong khi
 * Apps Script cat ngang o 6 phut. Nen viec liet ke phai chia thanh nhieu luot,
 * va moi luot chi mang ve mot phan. Ghi de o day la moi luot xoa sach cong cua
 * luot truoc, va ban do khong bao gio day.
 *
 * Tu 11/09/2026 thu muc con duoc liet ke LAI moi 30 phut (xem
 * thu-muc-can-liet-ke.ts), nen mot mang rong gui len KHONG duoc xoa danh sach
 * dang co anh — co the chi la Drive truc trac. Quy tac do nam o tronBanDo().
 */
export async function gopAnhThuMuc(
  them: Record<string, unknown[]>,
): Promise<{ tong: number; themMoi: number; soAnh: number; giuLai: number }> {
  const cu = await docAnhThuMuc();
  const { banDo, daGhi, giuLai } = tronBanDo(cu, them);
  let themMoi = 0;
  for (const k of daGhi) if (!(k in cu)) themMoi++;
  await ghiAnhThuMuc(banDo);

  // Cap moc CHI cho thu muc thuc su duoc ghi. Thu muc bi giu lai vi nhan mang
  // rong khong duoc moc — luot sau phai thu lai, bang khong mot lan Drive truc
  // trac se khoa danh sach cu them 30 phut ma khong ai biet.
  if (daGhi.length > 0) {
    const luc = await docLucThuMuc();
    const bayGio = new Date().toISOString();
    for (const k of daGhi) luc[k] = bayGio;
    await ghiLucThuMuc(luc);
  }

  // Dem NGAY TAI DAY tren ban do vua gop. Truoc day tuyen goi ham nay xong lai
  // tai VE nguyen tep mot lan nua chi de dem — ba luot cham kho thay vi hai,
  // tren mot tep chi to dan theo so thu muc (0,12 MB hoi 65 thu muc, 0,85 MB o
  // 534). Apps Script cat mot loi goi UrlFetch o khoang mot phut, nen moi giay
  // thua o day deu di ve phia lam luot dong bo chet.
  let soAnh = 0;
  for (const ds of Object.values(banDo)) soAnh += ds.length;

  return { tong: Object.keys(banDo).length, themMoi, soAnh, giuLai: giuLai.length };
}
