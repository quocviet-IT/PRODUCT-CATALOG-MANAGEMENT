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

export type LoiGopY = "thieu_noi_dung" | "noi_dung_qua_dai" | "anh_qua_lon";

/**
 * Tran cho anh chup man hinh, tinh tren chuoi base64 nhan duoc.
 *
 * Server action cua Next mac dinh chi nhan than 1 MB. Anh chup o ti le 0,5 va
 * nen JPEG chat luong 0,72 thuong ra 80-250 KB, nhung mot man hinh day anh mau
 * co the vot len. 2 MB la tran that cua tuyen (xem next.config.ts) — cat o 1,5
 * MB de con cho cho phan chu va phan bao boc cua form.
 *
 * Base64 phinh khoang 4/3 so voi byte goc, nen con so nay la ~1,1 MB anh that.
 */
export const BYTE_ANH_TOI_DA = 1_500_000;

/** Chuoi data URL do canvas sinh ra, hoac chuoi rong khi khong kem anh. */
export function kiemTraAnh(base64: string): LoiGopY | null {
  if (base64 === "") return null;
  return base64.length > BYTE_ANH_TOI_DA ? "anh_qua_lon" : null;
}

/**
 * Tach phan byte ra khoi mot data URL "data:image/jpeg;base64,....".
 *
 * Tra null khi chuoi khong dung dang — KHONG nem loi: du lieu nay den tu trinh
 * duyet, va mot gop y co chu van dang gia hon mot loi 500 vi cai anh kem theo.
 */
export function tachDataUrl(tho: string): { kieu: string; byte: Buffer } | null {
  const khop = /^data:(image\/(?:png|jpeg|webp));base64,([A-Za-z0-9+/=]+)$/.exec(tho.trim());
  if (!khop) return null;
  try {
    return { kieu: khop[1], byte: Buffer.from(khop[2], "base64") };
  } catch {
    return null;
  }
}

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
