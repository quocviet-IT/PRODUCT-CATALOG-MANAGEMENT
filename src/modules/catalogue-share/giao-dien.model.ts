import { docNgonNgu, type NgonNgu } from "@/messages/ngon-ngu";

/**
 * CACH BAY mot catalogue ra cho khach xem: bo cuc, tong mau, trang bia, thong
 * so nao duoc hien, ngon ngu.
 *
 * Tach hoan toan khoi NoiDungCatalogue (mau nao, anh nao). Noi dung la ban chup
 * DONG BANG luc gui; giao dien la cach trinh bay ban chup do. Hai thu doi theo
 * hai nhip khac nhau nen nam o hai cot khac nhau.
 *
 * Tep nay THUAN: khong cham co so du lieu, khong cham React. Moi quy tac deu
 * kiem duoc bang test.
 */

export const BO_CUC = ["danh-sach", "luoi", "lookbook"] as const;
export type BoCuc = (typeof BO_CUC)[number];

export const TONE = ["beige", "trang", "toi"] as const;
export type Tone = (typeof TONE)[number];

/** Cac thong so co the bat/tat cho khach xem. Trung ten voi truong cua MucCatalogue. */
export const THONG_SO = ["loaiSp", "chatLieu", "mau", "size", "tlVang"] as const;
export type ThongSo = (typeof THONG_SO)[number];

export type Bia = { tenKhach: string; loiChao: string; tenSale: string };

export type GiaoDienCatalogue = {
  phienBan: 1;
  boCuc: BoCuc;
  tone: Tone;
  /** null = khong co trang bia. */
  bia: Bia | null;
  hien: Record<ThongSo, boolean>;
  ngonNgu: NgonNgu;
};

/**
 * Mac dinh = y HET cach catalogue hien ra truoc khi co tinh nang nay.
 *
 * Day khong phai mot lua chon tham my ma la mot rang buoc: cot giao_dien mac
 * dinh la {} nen MOI catalogue tao truoc hom nay deu doc ra dung bo nay. Doi
 * gia tri o day la doi giao dien cua nhung link da nam trong may khach.
 */
export const GIAO_DIEN_MAC_DINH: GiaoDienCatalogue = {
  phienBan: 1,
  boCuc: "danh-sach",
  tone: "beige",
  bia: null,
  hien: { loaiSp: true, chatLieu: true, mau: true, size: true, tlVang: true },
  ngonNgu: "vi",
};

export const DAI_TEN_KHACH = 80;
export const DAI_TEN_SALE = 80;
export const DAI_LOI_CHAO = 300;

function cat(tho: unknown, toiDa: number): string {
  return typeof tho === "string" ? tho.trim().slice(0, toiDa) : "";
}

function trong<T extends readonly string[]>(ds: T, tho: unknown, mac: T[number]): T[number] {
  return ds.includes(tho as string) ? (tho as T[number]) : mac;
}

function docBia(tho: unknown): Bia | null {
  if (typeof tho !== "object" || tho === null) return null;
  const o = tho as Record<string, unknown>;
  const bia: Bia = {
    tenKhach: cat(o.tenKhach, DAI_TEN_KHACH),
    loiChao: cat(o.loiChao, DAI_LOI_CHAO),
    tenSale: cat(o.tenSale, DAI_TEN_SALE),
  };
  // Bia khong co chu nao thi khong phai bia — de no lai chi tao ra mot trang
  // trang truoc mat khach.
  return bia.tenKhach || bia.loiChao || bia.tenSale ? bia : null;
}

function docHien(tho: unknown): Record<ThongSo, boolean> {
  const o = (typeof tho === "object" && tho !== null ? tho : {}) as Record<string, unknown>;
  const ra = {} as Record<ThongSo, boolean>;
  for (const k of THONG_SO) {
    // Thieu khoa thi BAT. Mot catalogue cu khong co truong nay phai hien day du
    // nhu luc no duoc gui di.
    ra[k] = o[k] === undefined ? GIAO_DIEN_MAC_DINH.hien[k] : o[k] !== false;
  }
  return ra;
}

/**
 * Doc mot gia tri khong tin duoc thanh giao dien hop le.
 *
 * Dung cho CA HAI dau: cot JSONB doc len, va goi tin tu trinh duyet gui xuong.
 * Ca hai deu khong tin duoc — mot cai co the la ban ghi cu hong, cai kia co the
 * la yeu cau nguy tao.
 *
 * KHONG BAO GIO nem loi va khong bao gio tra null: giao dien hong chi duoc phep
 * lam catalogue hien ra kieu mac dinh, tuyet doi khong duoc lam trang khach
 * dang mo bi trang.
 */
export function docGiaoDien(tho: unknown): GiaoDienCatalogue {
  if (typeof tho !== "object" || tho === null) return GIAO_DIEN_MAC_DINH;
  const o = tho as Record<string, unknown>;
  return {
    phienBan: 1,
    boCuc: trong(BO_CUC, o.boCuc, GIAO_DIEN_MAC_DINH.boCuc),
    tone: trong(TONE, o.tone, GIAO_DIEN_MAC_DINH.tone),
    bia: docBia(o.bia),
    hien: docHien(o.hien),
    ngonNgu: docNgonNgu(o.ngonNgu),
  };
}

/** Co thong so nao duoc hien khong — dung de bo han khoi bo cuc khi tat het. */
export function coThongSo(g: GiaoDienCatalogue): boolean {
  return THONG_SO.some((k) => g.hien[k]);
}

export type { NgonNgu };
