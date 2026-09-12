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
  // 12/09/2026: Bang mau cho khach si, Thu moi cho khach VIP va do cuoi.
  "bang-mau", "thu-moi",
] as const;
export type BoCuc = (typeof BO_CUC)[number];

/**
 * Tong mau.
 *
 * Bon tong sau them 11/09/2026 theo yeu cau nguoi dung — chon theo nhom san pham
 * hoac phong cach. Bon tong dau giu nguyen de catalogue da gui khong doi. THEM
 * vao cuoi chu khong chen giua: thu tu nay la thu tu hien trong o chon.
 */
export const TONE = [
  "beige", "trang", "toi", "reu",
  "hoa-van", "champagne", "bach-kim", "hong-phan",
  // Nam tong 12/09/2026 cho hang Chu de (dip, nhom hang, khach).
  "do-ruou", "than-chi", "xanh-dem", "oai-huong", "suong-bien",
] as const;
export type Tone = (typeof TONE)[number];

/**
 * Mau nhan.
 *
 * La mot DANH SACH DONG chu khong phai o chon mau tu do: cac mau nay cung do
 * sang va do tuoi trong oklch (L .58 / C toi da .19 trong gamut), chi khac sac, nen
 * ghep voi nen nao cung khong choi. Mo cho chon mau bat ky la som muon cung co mot
 * catalogue gui khach voi chu vang chanh tren nen kem. Ba mau cuoi them 12/09/2026,
 * lap ba khoang trong 25°, 150°, 258° cua vong mau.
 */
export const NHAN = ["hong", "dong", "luc", "man", "ruby", "luc-bao", "sapphire"] as const;
export type Nhan = (typeof NHAN)[number];

/**
 * Moi mau nhan co BA sac.
 *
 * `nhat` de ve chu va duong ke tren nen SANG; `dam` danh rieng cho nut co chu trang;
 * `sang` (oklch L .72 / C .15, them 12/09/2026) de ve chu tren nen TOI — sac nhat tren
 * nen toi chi con 2.89–4.15:1. Hong thuong hieu chi dat 3.81:1 tren nen kem — du cho
 * mot dong chu, khong du cho chu trang tren nut.
 */
export const MAU_NHAN: Record<Nhan, { nhat: string; dam: string; sang: string }> = {
  // Hong dung DUNG hai token dang co: catalogue khong chon gi phai ra y het
  // hom nay, khong lech mot chut nao.
  hong: { nhat: "#E91D79", dam: "#C4165F", sang: "#EF799D" },
  dong: { nhat: "#A96A00", dam: "#8A5600", sang: "#E0911B" },
  luc:  { nhat: "#00806B", dam: "#006956", sang: "#07BFA1" },
  man:  { nhat: "#A0439B", dam: "#873781", sang: "#D87FD1" },
  ruby: { nhat: "#D33A3C", dam: "#B02A2D", sang: "#F47B74" },
  "luc-bao": { nhat: "#009342", dam: "#007835", sang: "#53BE70" },
  sapphire: { nhat: "#2275E8", dam: "#145EC1", sang: "#68A5FF" },
};

/**
 * Cac tong NEN TOI. Tren cac tong nay chu mau nhan dung sac `sang`, va ban in ep ve nen
 * sang. Phai khop bo chon `.mau-nhan:is(...)` va khoi in trong globals.css — test
 * tests/app/mau-nhan-tuong-phan.test.ts doc thang CSS de doi chieu.
 */
export const TONE_TOI: readonly Tone[] = ["toi", "reu", "do-ruou", "than-chi", "xanh-dem"];

/**
 * Mau nhan GOI Y khi sale chon mot tong moi: chon tong la doi luon mau nhan cho
 * hop — dung nhu mo ta tung tong da duyet — va sale van doi lai duoc ben duoi.
 *
 * Bon tong cu KHONG co goi y: truoc nay chon tong khong dong gi toi mau nhan, va
 * chon lai chung khong duoc am tham doi mau nhan sale da chon.
 */
export const NHAN_GOI_Y: Partial<Record<Tone, Nhan>> = {
  "hoa-van": "hong",
  champagne: "dong",
  "bach-kim": "luc",
  "hong-phan": "hong",
  // Tong 12/09/2026: dung mau nhan cua chu de dung tong do.
  "do-ruou": "hong",
  "than-chi": "sapphire",
  "xanh-dem": "dong",
  "oai-huong": "man",
  "suong-bien": "luc",
};

/** Nhom cua hang Chu de tren man hinh tao catalogue. */
export const NHOM_CHU_DE = ["dip", "nhom-hang", "khach"] as const;
export type NhomChuDe = (typeof NHOM_CHU_DE)[number];

type DinhNghiaChuDe = { khoa: string; nhom: NhomChuDe; boCuc: BoCuc; tone: Tone; nhan: Nhan };

/**
 * Chu de san (12/09/2026) — LOI TAT: bam mot lan dat bo cuc + tong + mau nhan hop nhau
 * cho mot dip, mot nhom hang hay mot kieu khach. KHONG luu xuong ban ghi: chu de "dang
 * chon" suy ra bang chuDeDangChon, nen doi hay bo chu de khong dong gi toi catalogue
 * da gui.
 *
 * Bo ba cua cac chu de khac nhau va KHONG trung mac dinh (danh-sach, beige, hong) — trung
 * thi catalogue khong chon gi se hien nhu dang chon mot chu de. Co test khoa lai.
 */
export const CHU_DE = [
  { khoa: "valentine", nhom: "dip", boCuc: "lookbook", tone: "do-ruou", nhan: "hong" },
  { khoa: "ngay-cua-me", nhom: "dip", boCuc: "trien-lam", tone: "oai-huong", nhan: "man" },
  { khoa: "giang-sinh", nhom: "dip", boCuc: "khung-co-dien", tone: "reu", nhan: "ruby" },
  { khoa: "nam", nhom: "nhom-hang", boCuc: "tap-chi", tone: "than-chi", nhan: "sapphire" },
  { khoa: "cuoi", nhom: "nhom-hang", boCuc: "thu-moi", tone: "trang", nhan: "dong" },
  { khoa: "ngoc-trai", nhom: "nhom-hang", boCuc: "lookbook", tone: "suong-bien", nhan: "luc" },
  { khoa: "khach-my", nhom: "khach", boCuc: "trien-lam", tone: "trang", nhan: "sapphire" },
  { khoa: "viet-kieu", nhom: "khach", boCuc: "danh-sach", tone: "beige", nhan: "ruby" },
  { khoa: "khach-si", nhom: "khach", boCuc: "bang-mau", tone: "trang", nhan: "hong" },
  { khoa: "vip", nhom: "khach", boCuc: "thu-moi", tone: "xanh-dem", nhan: "dong" },
] as const satisfies readonly DinhNghiaChuDe[];

export type ChuDe = (typeof CHU_DE)[number];
export type KhoaChuDe = ChuDe["khoa"];

/** Chu de khop DU ca bo cuc, tong va mau nhan dang chon; lech mot chieu thi null. */
export function chuDeDangChon(g: Pick<GiaoDienCatalogue, "boCuc" | "tone" | "nhan">): KhoaChuDe | null {
  const c = CHU_DE.find((x) => x.boCuc === g.boCuc && x.tone === g.tone && x.nhan === g.nhan);
  return c ? c.khoa : null;
}

/** Cac thong so co the bat/tat cho khach xem. Trung ten voi truong cua MucCatalogue. */
export const THONG_SO = ["loaiSp", "chatLieu", "mau", "size", "tlVang"] as const;
export type ThongSo = (typeof THONG_SO)[number];

export type Bia = { tenKhach: string; loiChao: string };

/**
 * Cach khach nhan tin cho sale, ben canh nut goi.
 *
 * Truoc 12/09/2026 nut thu hai LUON la Zalo — nhung khach o My khong dung Zalo
 * (gop y cua sale ben My). "khong" = chi co nut goi.
 */
export const CACH_NHAN = ["zalo", "tin-nhan", "whatsapp", "khong"] as const;
export type CachNhan = (typeof CACH_NHAN)[number];

/**
 * Nguoi tu van, hien o cuoi trang khach kem nut goi va nut nhan tin.
 *
 * Day la thu bien mot catalogue dep thanh mot don hang: khach dang thich mot
 * mau ma khong biet nhan ai thi ho dong tab.
 */
export type LienHe = { ten: string; dienThoai: string; cachNhan: CachNhan };

/**
 * Loi keu goi — dong tieu de to cua khoi lien he ("Thich mau nao, nhan em giu
 * ngay").
 *
 * Gop y 11/09/2026: cho sale chon cau co san hoac tu viet. Cau co san luu bang
 * KHOA chu khong luu chu: trang khach dung chu theo ngon ngu cua catalogue, va ten
 * nguoi tu van dien vao luc hien. "tu-viet" thi hien dung chu sale go.
 */
export const LOI_KEU_GOI = ["mac-dinh", "goi-ngay", "custom", "size-mau", "hen-xem", "tu-viet"] as const;
export type MauLoiKeuGoi = (typeof LOI_KEU_GOI)[number];
export type LoiKeuGoi = { mau: MauLoiKeuGoi; tuViet: string };

export type GiaoDienCatalogue = {
  phienBan: 1;
  boCuc: BoCuc;
  tone: Tone;
  /** null = khong co trang bia. */
  bia: Bia | null;
  /** null = khong hien khoi lien he. */
  lienHe: LienHe | null;
  loiKeuGoi: LoiKeuGoi;
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
  loiKeuGoi: { mau: "mac-dinh", tuViet: "" },
  nhan: "hong",
  hien: { loaiSp: true, chatLieu: true, mau: true, size: true, tlVang: true },
  ngonNgu: "vi",
};

export const DAI_TEN_KHACH = 80;
export const DAI_TEN_SALE = 80;
export const DAI_LOI_CHAO = 300;
export const DAI_DIEN_THOAI = 24;
/** Mot cau tieu de, khong phai mot doan van: dai hon la vo khoi lien he. */
export const DAI_LOI_KEU_GOI = 120;

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
      // THIEU truong nay = catalogue tao truoc 12/09/2026, luc nut thu hai luon
      // la Zalo. Link da gui phai hien y nhu luc gui, nen mac dinh la zalo.
      cachNhan: trong(CACH_NHAN, x.cachNhan, "zalo"),
    };
    return lh.ten || lh.dienThoai ? lh : null;
  }
  const bia = goc.bia;
  const tenCu =
    typeof bia === "object" && bia !== null
      ? cat((bia as Record<string, unknown>).tenSale, DAI_TEN_SALE)
      : "";
  return tenCu ? { ten: tenCu, dienThoai: "", cachNhan: "zalo" } : null;
}

/**
 * Cach nhan tin GOI Y theo so dien thoai sale vua go.
 *
 * So Viet Nam (0... hay +84) -> Zalo; so My (+1, 10 chu so khong bat dau bang 0,
 * hay 11 chu so bat dau bang 1) -> Tin nhan. Khong nhan ra thi null: de nguyen
 * lua chon dang co, khong doan bua.
 */
export function goiYCachNhan(dienThoai: string): CachNhan | null {
  const so = soGoiDuoc(dienThoai);
  if (so.startsWith("+84") || /^0\d{8,10}$/.test(so)) return "zalo";
  if (so.startsWith("+1") || /^[2-9]\d{9}$/.test(so) || /^1[2-9]\d{9}$/.test(so)) {
    return "tin-nhan";
  }
  return null;
}

/**
 * Duong dan cua nut nhan tin, hoac null khi khong co nut (chi goi, hay so rong).
 *
 * Zalo giu Y NGUYEN cach cu (zalo.me/<so da lam sach>): link da gui khong duoc
 * doi. WhatsApp bat buoc so co ma quoc gia — xem soQuocTe.
 */
export function lienKetNhan(lh: LienHe): string | null {
  const so = soGoiDuoc(lh.dienThoai);
  if (so === "") return null;
  if (lh.cachNhan === "zalo") return `https://zalo.me/${so}`;
  if (lh.cachNhan === "tin-nhan") return `sms:${so}`;
  if (lh.cachNhan === "whatsapp") return `https://wa.me/${soQuocTe(so)}`;
  return null;
}

/**
 * So co ma quoc gia, chi chu so — dang ma wa.me doi hoi.
 *
 * Sale go so dia phuong la chuyen thuong ("0909 123 456", "(408) 555-0199"), ma
 * wa.me/0909123456 thi WhatsApp bao so khong hop le. Chi doan ma quoc gia cho
 * DUNG hai dang so goiYCachNhan nhan ra; dang khac giu nguyen.
 */
export function soQuocTe(so: string): string {
  if (so.startsWith("+")) return so.slice(1);
  if (/^0\d{8,10}$/.test(so)) return `84${so.slice(1)}`;
  if (/^[2-9]\d{9}$/.test(so)) return `1${so}`;
  return so;
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
    loiKeuGoi: docLoiKeuGoi(o.loiKeuGoi),
    nhan: trong(NHAN, o.nhan, GIAO_DIEN_MAC_DINH.nhan),
    hien: docHien(o.hien),
    ngonNgu: docNgonNgu(o.ngonNgu),
  };
}

/**
 * Doc loi keu goi. THIEU truong (catalogue tao truoc 12/09/2026) = cau mac dinh,
 * dung cau khach da thay luc nhan link.
 */
function docLoiKeuGoi(tho: unknown): LoiKeuGoi {
  if (typeof tho !== "object" || tho === null) return GIAO_DIEN_MAC_DINH.loiKeuGoi;
  const o = tho as Record<string, unknown>;
  const tuViet = cat(o.tuViet, DAI_LOI_KEU_GOI);
  const mau = trong(LOI_KEU_GOI, o.mau, "mac-dinh");
  // "Tu viet" ma khong co chu nao thi khong phai loi keu goi: de nguyen la mot dong
  // tieu de trong truoc mat khach.
  return { mau: mau === "tu-viet" && tuViet === "" ? "mac-dinh" : mau, tuViet };
}

/** Nhung chu cauKeuGoi can — `t.chia_se` cua ca hai ngon ngu deu co du. */
export type ChuKeuGoi = Record<
  "cta_tieu_de" | "cta_goi_ngay" | "cta_goi_ngay_khong_ten" | "cta_custom" | "cta_size_mau" | "cta_hen_xem",
  string
>;

/**
 * Chu cua dong tieu de khoi lien he.
 *
 * Dung o CA trang khach lan nhan tung lua chon o trang tao, nen sale nhin thay dung
 * cau khach se doc. "Tu viet" dang rong (sale vua xoa chu) thi ve cau mac dinh —
 * cung quy tac voi docLoiKeuGoi.
 */
export function cauKeuGoi(lkg: LoiKeuGoi, tenTuVan: string, chu: ChuKeuGoi): string {
  const ten = tenTuVan.trim();
  if (lkg.mau === "tu-viet") return lkg.tuViet.trim() || chu.cta_tieu_de;
  if (lkg.mau === "goi-ngay") {
    return ten ? chu.cta_goi_ngay.replace("{ten}", ten) : chu.cta_goi_ngay_khong_ten;
  }
  if (lkg.mau === "custom") return chu.cta_custom;
  if (lkg.mau === "size-mau") return chu.cta_size_mau;
  if (lkg.mau === "hen-xem") return chu.cta_hen_xem;
  return chu.cta_tieu_de;
}

/**
 * Khoi lien he co hien ra khong.
 *
 * Co nguoi tu van hay so dien thoai thi hien, nhu truoc. VA hien ca khi sale da chon
 * mot loi keu goi khac mac dinh hay da tu viet, du chua dien lien he. Loi that
 * 12/09/2026: sale tu viet loi keu goi, bo trong ten va so, nen khoi bi an — khach
 * khong thay gi ca, du cau da luu dung. Catalogue cu (khong lien he, cau mac dinh)
 * van an nhu luc gui.
 */
export function coKhoiLienHe(g: Pick<GiaoDienCatalogue, "lienHe" | "loiKeuGoi">): boolean {
  if (g.lienHe !== null) return true;
  const { mau, tuViet } = g.loiKeuGoi;
  return mau === "tu-viet" ? tuViet.trim() !== "" : mau !== "mac-dinh";
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
