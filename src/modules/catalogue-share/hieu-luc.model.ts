/**
 * Link catalogue con mo duoc hay khong.
 *
 * Thuan — khong cham co so du lieu, khong cham dong ho he thong: `bayGio`
 * truyen vao. Nho vay kiem duoc bang test thay vi phai doi 90 ngay.
 */

export type TrangThaiLink = "mo" | "khoa" | "het-han";

/** So ngay mot link song ke tu luc tao. Anh chot 08/09/2026. */
export const SO_NGAY_SONG = 90;

const MOT_NGAY = 24 * 60 * 60 * 1000;

export function hetHanTu(taoLuc: Date): Date {
  return new Date(taoLuc.getTime() + SO_NGAY_SONG * MOT_NGAY);
}

/**
 * KHOA duoc xet TRUOC het han.
 *
 * Hai trang thai nay doc lap nhau, nhung khi ca hai cung dung thi phai bao la
 * "khoa": do la thu nguoi dung CHU DONG lam, va man hinh quan tri phai cho ho
 * thay dung cai nut ho vua bam. Bao "het han" o day se lam ho tuong nut khoa
 * khong an gi.
 */
export function trangThaiLink(
  hetHanLuc: Date,
  khoaLuc: Date | null,
  bayGio: Date,
): TrangThaiLink {
  if (khoaLuc !== null) return "khoa";
  return bayGio.getTime() >= hetHanLuc.getTime() ? "het-han" : "mo";
}

export function conMoDuoc(
  hetHanLuc: Date,
  khoaLuc: Date | null,
  bayGio: Date,
): boolean {
  return trangThaiLink(hetHanLuc, khoaLuc, bayGio) === "mo";
}

/**
 * So ngay con lai, lam tron LEN.
 *
 * Lam tron len de "con 0 ngay" chi xuat hien khi that su da het: mot link con
 * song 3 tieng ma bao "0 ngay" thi sale se tuong no chet roi va di tao lai.
 * Da het han thi tra ve 0.
 */
export function soNgayConLai(hetHanLuc: Date, bayGio: Date): number {
  const con = hetHanLuc.getTime() - bayGio.getTime();
  return con <= 0 ? 0 : Math.ceil(con / MOT_NGAY);
}
