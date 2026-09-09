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

export const BO_CUC = [
  "danh-sach", "luoi", "lookbook",
  "trien-lam", "khung-co-dien", "tap-chi",
] as const;
export type BoCuc = (typeof BO_CUC)[number];

export const TONE = ["beige", "trang", "toi", "reu"] as const;
export type Tone = (typeof TONE)[number];

/**
 * Mau nhan.
 *
 * La mot DANH SACH DONG chu khong phai o chon mau tu do: bon mau nay cung do
 * sang va do tuoi trong oklch (L .58 / C .19), chi khac sac, nen ghep voi nen
 * nao cung khong choi. Mo cho chon mau bat ky la som muon cung co mot catalogue
 * gui khach voi chu vang chanh tren nen kem.
 */
export const NHAN = ["hong", "dong", "luc", "man"] as const;
export type Nhan = (typeof NHAN)[number];

/**
 * Moi mau nhan co HAI sac.
 *
 * `nhat` de ve chu va duong ke tren nen; `dam` danh rieng cho nut co chu trang.
 * Hong thuong hieu chi dat 3.81:1 tren nen kem — du cho mot dong chu, khong du
 * cho chu trang tren nut.
 */
export const MAU_NHAN: Record<Nhan, { nhat: string; dam: string }> = {
  // Hong dung DUNG hai token dang co: catalogue khong chon gi phai ra y het
  // hom nay, khong lech mot chut nao.
  hong: { nhat: "#E91D79", dam: "#C4165F" },
  dong: { nhat: "#A96A00", dam: "#8A5600" },
  luc:  { nhat: "#00806B", dam: "#006956" },
  man:  { nhat: "#A0439B", dam: "#873781" },
};

/** Cac thong so co the bat/tat cho khach xem. Trung ten voi truong cua MucCatalogue. */
export const THONG_SO = ["loaiSp", "chatLieu", "mau", "size", "tlVang"] as const;
export type ThongSo = (typeof THONG_SO)[number];

export type Bia = { tenKhach: string; loiChao: string };

/**
 * Nguoi tu van, hien o cuoi trang khach kem nut goi va nut Zalo.
 *
 * Day la thu bien mot catalogue dep thanh mot don hang: khach dang thich mot
 * mau ma khong biet nhan ai thi ho dong tab.
 */
export type LienHe = { ten: string; dienThoai: string };

export type GiaoDienCatalogue = {
  phienBan: 1;
  boCuc: BoCuc;
  tone: Tone;
  /** null = khong co trang bia. */
  bia: Bia | null;
  /** null = khong hien khoi lien he. */
  lienHe: LienHe | null;
  nhan: Nhan;
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
  lienHe: null,
  nhan: "hong",
  hien: { loaiSp: true, chatLieu: true, mau: true, size: true, tlVang: true },
  ngonNgu: "vi",
};

export const DAI_TEN_KHACH = 80;
export const DAI_TEN_SALE = 80;
export const DAI_LOI_CHAO = 300;
export const DAI_DIEN_THOAI = 24;

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
  };
  // Bia khong co chu nao thi khong phai bia — de no lai chi tao ra mot trang
  // trang truoc mat khach.
  return bia.tenKhach || bia.loiChao ? bia : null;
}

/**
 * Doc khoi lien he.
 *
 * Ban ghi CU khong co truong nay: ten nguoi tu van hoi do nam trong
 * `bia.tenSale`. Lay no ra de nhung catalogue da gui khong mat mot dong thong
 * tin — do la ly do ham nay nhan ca doi tuong giao dien goc chu khong chi nhan
 * rieng phan lienHe.
 */
function docLienHe(goc: Record<string, unknown>): LienHe | null {
  const o = goc.lienHe;
  if (typeof o === "object" && o !== null) {
    const x = o as Record<string, unknown>;
    const lh: LienHe = {
      ten: cat(x.ten, DAI_TEN_SALE),
      dienThoai: cat(x.dienThoai, DAI_DIEN_THOAI),
    };
    return lh.ten || lh.dienThoai ? lh : null;
  }
  const bia = goc.bia;
  const tenCu =
    typeof bia === "object" && bia !== null
      ? cat((bia as Record<string, unknown>).tenSale, DAI_TEN_SALE)
      : "";
  return tenCu ? { ten: tenCu, dienThoai: "" } : null;
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
    lienHe: docLienHe(o),
    nhan: trong(NHAN, o.nhan, GIAO_DIEN_MAC_DINH.nhan),
    hien: docHien(o.hien),
    ngonNgu: docNgonNgu(o.ngonNgu),
  };
}

/**
 * Chi giu chu so cua so dien thoai, kem dau + neu co o dau.
 *
 * Sale go so kieu "0909 123 456" hay "(408) 555-0199" cho de doc; nhung tel:
 * va zalo.me can mot day lien. Giu nguyen chuoi sale go de HIEN, chi lam sach
 * khi dung lam duong dan.
 *
 * Tra ve chuoi rong khi khong con chu so nao — nguoi goi phai tu lo truong hop
 * do, khong the dung "tel:" rong lam duong dan.
 */
export function soGoiDuoc(dienThoai: string): string {
  const s = dienThoai.trim();
  const dauCong = s.startsWith("+") ? "+" : "";
  const so = s.replace(/\D/g, "");
  return so ? dauCong + so : "";
}

/** Co thong so nao duoc hien khong — dung de bo han khoi bo cuc khi tat het. */
export function coThongSo(g: GiaoDienCatalogue): boolean {
  return THONG_SO.some((k) => g.hien[k]);
}

export type { NgonNgu };
