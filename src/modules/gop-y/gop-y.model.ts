/**
 * Quy tac cua o gop y. Ham THUAN — khong cham co so du lieu, khong cham React.
 *
 * Ban gon nhat co the: hai loai, hai trang thai. KHONG co anh chup man hinh,
 * khong co diem uu tien nhu ben OneBook. Do la lua chon co y — mot o gop y don
 * gian ma nhan vien dung duoc ngay con hon mot he thong phan loai day du ma
 * chua len duoc he thong.
 */

export const LOAI_GOP_Y = ["hong", "y-kien"] as const;
export type LoaiGopY = (typeof LOAI_GOP_Y)[number];

export const TRANG_THAI_GOP_Y = ["moi", "da-xu-ly"] as const;
export type TrangThaiGopY = (typeof TRANG_THAI_GOP_Y)[number];

export function laLoaiGopY(v: string): v is LoaiGopY {
  return (LOAI_GOP_Y as readonly string[]).includes(v);
}

export function laTrangThaiGopY(v: string): v is TrangThaiGopY {
  return (TRANG_THAI_GOP_Y as readonly string[]).includes(v);
}

export const DAI_NOI_DUNG_TOI_THIEU = 5;
export const DAI_NOI_DUNG_TOI_DA = 4000;
/** Du cho moi duong dan trong ung dung, va chan mot chuoi dai bat thuong. */
export const DAI_DUONG_DAN_TOI_DA = 300;

export type LoiGopY = "thieu_noi_dung" | "noi_dung_qua_dai";

/**
 * Kiem mot gop y vua go.
 *
 * Doi it nhat vai ky tu: mot gop y chi co "loi" hay "." khong giup ai sua duoc
 * gi, va nguoi go se khong bao gio biet no vo ich neu he thong cu nhan.
 */
export function kiemTraGopY(noiDung: string): LoiGopY | null {
  const s = noiDung.trim();
  if (s.length < DAI_NOI_DUNG_TOI_THIEU) return "thieu_noi_dung";
  if (s.length > DAI_NOI_DUNG_TOI_DA) return "noi_dung_qua_dai";
  return null;
}

/**
 * Chi giu phan DUONG DAN, bo chuoi truy van va neo.
 *
 * Chuoi truy van chua tu khoa tim kiem, bo loc, so trang cua sale. Mot bang gop
 * y khong phai cho de luu lai thoi quen lam viec cua tung nguoi — biet gop y
 * gui tu man hinh nao la du de tim lai cho hong.
 */
export function chuanHoaDuongDan(tho: string): string {
  const s = tho.trim();
  if (s === "") return "";
  const cat = s.split(/[?#]/)[0];
  return (cat.startsWith("/") ? cat : `/${cat}`).slice(0, DAI_DUONG_DAN_TOI_DA);
}
