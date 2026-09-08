/**
 * Ngon ngu giao dien. Thuan — khong cham cookie, khong cham React — de dung
 * duoc ca o may chu, o trinh duyet lan trong test.
 */

export const NGON_NGU = ["vi", "en"] as const;
export type NgonNgu = (typeof NGON_NGU)[number];

export const NGON_NGU_MAC_DINH: NgonNgu = "vi";

/** Ten cookie giu lua chon cua NGUOI DUNG NOI BO. Trang khach khong dung cookie. */
export const COOKIE_NGON_NGU = "ngon-ngu";

/** Mot nam — doi ngon ngu la viec lam mot lan, khong phai moi phien. */
export const HAN_COOKIE_NGON_NGU = 60 * 60 * 24 * 365;

/**
 * Doc mot gia tri khong tin duoc thanh ngon ngu.
 *
 * Khong bao gio nem loi: gia tri nay den tu cookie, tu duong dan, tu cot JSONB
 * cu — mot gia tri la khong duoc phep lam trang trang. Khong hieu thi ve tieng
 * Viet.
 */
export function docNgonNgu(tho: unknown): NgonNgu {
  return NGON_NGU.includes(tho as NgonNgu) ? (tho as NgonNgu) : NGON_NGU_MAC_DINH;
}

/** Nhan hien cho nguoi dung thay trong nut doi ngon ngu. */
export const NHAN_NGON_NGU: Record<NgonNgu, string> = {
  vi: "Tiếng Việt",
  en: "English",
};

/** Nhan ngan cho nut gon tren thanh dieu huong. */
export const NHAN_NGAN: Record<NgonNgu, string> = {
  vi: "VI",
  en: "EN",
};

/** Ma ngon ngu cho thuoc tinh lang cua the html. */
export const MA_HTML: Record<NgonNgu, string> = {
  vi: "vi",
  en: "en",
};
