import { chuanHoaTimKiem } from "@/lib/vietnamese";
import type { CoBatThuong, DongCatalogue } from "./catalogue.mapper";

export type LoaiXoan = "lab" | "tu-nhien";

/**
 * Bay tieu chi chon-nhieu. Ten o day trung ten truong trong DongCatalogue de
 * mot chieu chi phai khai o DUNG MOT cho (bang CHIEU ben duoi) — them tieu chi
 * moi la them mot dong, khong phai sua sau ham.
 */
export type ChieuLoc =
  | "chatLieu"
  | "loaiSp"
  | "dongSp"
  | "mau"
  | "size"
  | "loaiXoan"
  | "canhBao";

export type BoLocCatalogue = {
  q: string | null;
  /** Rong = khong rang buoc. Nhieu gia tri = hop (OR) trong cung mot tieu chi. */
  chatLieu: string[];
  loaiSp: string[];
  dongSp: string[];
  mau: string[];
  size: string[];
  loaiXoan: LoaiXoan[];
  canhBao: CoBatThuong[];
  /** Khoang trong luong vang, gam. null = khong chan dau do. */
  tlTu: number | null;
  tlDen: number | null;
};

export type MucDem = { gia_tri: string; soLuong: number };

/** Bo dem cho tung o tha xuong. */
export type DemLoc = Record<ChieuLoc, MucDem[]>;

export type ThongKe = {
  tong: number;
  thieuAnh: number;
  thieuSku: number;
  tlVangLech: number;
  trung: number;
};

const CO_HOP_LE: readonly CoBatThuong[] = [
  "thieu-sku",
  "thieu-anh",
  "thieu-mo-ta",
  "trung",
  "tl-vang-lech",
];

/**
 * Khai bao mot lan cho ca ba viec: doc URL, loc, va dem. `lay` tra ve cac gia
 * tri cua mot dong theo chieu do — mang vi mot dong co the mang NHIEU canh bao
 * cung luc, khac voi cac chieu con lai moi dong mot gia tri.
 */
const CHIEU: Record<
  ChieuLoc,
  { thamSo: string; lay: (d: DongCatalogue) => readonly string[] }
> = {
  chatLieu: { thamSo: "chat_lieu", lay: (d) => (d.chatLieu ? [d.chatLieu] : []) },
  loaiSp: { thamSo: "loai_sp", lay: (d) => (d.loaiSp ? [d.loaiSp] : []) },
  dongSp: { thamSo: "dong_sp", lay: (d) => (d.dongSp ? [d.dongSp] : []) },
  mau: { thamSo: "mau", lay: (d) => (d.mau ? [d.mau] : []) },
  size: { thamSo: "size", lay: (d) => (d.size ? [d.size] : []) },
  loaiXoan: { thamSo: "loai_xoan", lay: (d) => (d.loaiXoan ? [d.loaiXoan] : []) },
  canhBao: { thamSo: "canh_bao", lay: (d) => d.co },
};

export const MOI_CHIEU = Object.keys(CHIEU) as ChieuLoc[];

/** Ten tham so URL cua mot chieu — dung o phia giao dien de dung lien ket. */
export function thamSoCua(chieu: ChieuLoc): string {
  return CHIEU[chieu].thamSo;
}

function chuoi(v: string | undefined): string | null {
  const s = v?.trim();
  return s ? s : null;
}

/** Nhieu gia tri di trong MOT tham so, ngan bang dau phay. Bo trung va bo rong. */
function danhSach(v: string | undefined): string[] {
  if (!v) return [];
  return [...new Set(v.split(",").map((x) => x.trim()).filter(Boolean))];
}

/**
 * So thap phan tu URL. Tra null khi khong doc duoc thay vi 0: "?tl_tu=abc"
 * khong duoc phep bien thanh "tu 0 gam" mot cach im lang. Chap ca dau phay
 * thap phan vi nguoi dung go tieng Viet.
 */
function so(v: string | undefined): number | null {
  const s = v?.trim().replace(",", ".");
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

export function docBoLocTuUrl(sp: Record<string, string | undefined>): BoLocCatalogue {
  return {
    q: chuoi(sp.q),
    chatLieu: danhSach(sp[CHIEU.chatLieu.thamSo]),
    loaiSp: danhSach(sp[CHIEU.loaiSp.thamSo]),
    dongSp: danhSach(sp[CHIEU.dongSp.thamSo]),
    mau: danhSach(sp[CHIEU.mau.thamSo]),
    size: danhSach(sp[CHIEU.size.thamSo]),
    loaiXoan: danhSach(sp[CHIEU.loaiXoan.thamSo]).filter(
      (x): x is LoaiXoan => x === "lab" || x === "tu-nhien",
    ),
    // Gia tri la nhan noi bo, khong phai chu nguoi dung go — chi nhan dung
    // nhung ma da biet, con lai bo qua.
    canhBao: danhSach(sp[CHIEU.canhBao.thamSo]).filter((x): x is CoBatThuong =>
      (CO_HOP_LE as readonly string[]).includes(x),
    ),
    tlTu: so(sp.tl_tu),
    tlDen: so(sp.tl_den),
  };
}

/** Gia tri dang chon cua mot chieu — doc tu bo loc theo dung ten truong. */
function daChon(loc: BoLocCatalogue, chieu: ChieuLoc): readonly string[] {
  return loc[chieu];
}

/**
 * Mot dong co qua mot chieu khong. Danh sach chon rong nghia la KHONG rang
 * buoc, khong phai "khong khop gi".
 */
function quaChieu(d: DongCatalogue, loc: BoLocCatalogue, chieu: ChieuLoc): boolean {
  const chon = daChon(loc, chieu);
  if (chon.length === 0) return true;
  return CHIEU[chieu].lay(d).some((v) => chon.includes(v));
}

/**
 * Moi cot chu deu tim duoc, khong chi ma mau va mo ta. Nguoi dung go so MO hay
 * "18KW" thi phai ra ket qua, khong phai doan xem cot nao duoc tim.
 */
function khoTimKiem(d: DongCatalogue): string {
  return chuanHoaTimKiem(
    [
      d.maMau, d.sku, d.mo, d.so, d.chiTiet,
      d.chatLieu, d.size, d.dongSp, d.loaiSp, d.mau, d.oChu,
    ]
      .filter((x): x is string => Boolean(x))
      .join(" "),
  );
}

function quaTrongLuong(d: DongCatalogue, loc: BoLocCatalogue): boolean {
  if (loc.tlTu === null && loc.tlDen === null) return true;
  // Dong khong co trong luong khong the khang dinh la nam trong khoang, nen bi
  // loai khi nguoi dung dat khoang — chu khong lang le lot qua.
  if (d.tlVang === null) return false;
  if (loc.tlTu !== null && d.tlVang < loc.tlTu) return false;
  if (loc.tlDen !== null && d.tlVang > loc.tlDen) return false;
  return true;
}

/**
 * Loc, nhung BO QUA mot chieu. Day la cach dem cho o tha xuong: con so ben
 * canh "18K" phai la "chon 18K thi con bao nhieu", nen no khong duoc tinh den
 * chinh nhung gi dang chon trong o chat lieu.
 */
function locTru(
  ds: DongCatalogue[],
  loc: BoLocCatalogue,
  tru: ChieuLoc | null,
): DongCatalogue[] {
  const tuKhoa = loc.q === null ? null : chuanHoaTimKiem(loc.q);
  return ds.filter((d) => {
    for (const chieu of MOI_CHIEU) {
      if (chieu !== tru && !quaChieu(d, loc, chieu)) return false;
    }
    if (!quaTrongLuong(d, loc)) return false;
    if (tuKhoa !== null && !khoTimKiem(d).includes(tuKhoa)) return false;
    return true;
  });
}

export function locDanhSach(ds: DongCatalogue[], loc: BoLocCatalogue): DongCatalogue[] {
  return locTru(ds, loc, null);
}

/** Size tron lan hai he: so My (5, 6.5) va so Viet (18VN). */
function laSize(chieu: ChieuLoc): boolean {
  return chieu === "size";
}

function sapSize(a: string, b: string): number {
  const soA = Number.parseFloat(a);
  const soB = Number.parseFloat(b);
  const vnA = a.toUpperCase().includes("VN");
  const vnB = b.toUpperCase().includes("VN");
  // He My truoc, he Viet sau; trong moi he thi tang dan.
  if (vnA !== vnB) return vnA ? 1 : -1;
  if (Number.isFinite(soA) && Number.isFinite(soB) && soA !== soB) return soA - soB;
  return a.localeCompare(b, "vi");
}

function demTheoChieu(ds: DongCatalogue[], chieu: ChieuLoc): MucDem[] {
  const dem = new Map<string, number>();
  for (const d of ds) {
    for (const v of CHIEU[chieu].lay(d)) dem.set(v, (dem.get(v) ?? 0) + 1);
  }
  const muc = [...dem.entries()].map(([gia_tri, soLuong]) => ({ gia_tri, soLuong }));
  if (laSize(chieu)) return muc.sort((a, b) => sapSize(a.gia_tri, b.gia_tri));
  // Nhieu nhat truoc; bang nhau thi theo bang chu cai de thu tu on dinh.
  return muc.sort((a, b) => b.soLuong - a.soLuong || a.gia_tri.localeCompare(b.gia_tri, "vi"));
}

/**
 * Dem cho tung o tha xuong, moi chieu tinh tren tap da loc boi cac chieu KHAC.
 *
 * Gia tri dang duoc chon luon co mat trong danh sach ke ca khi dem ve 0 — neu
 * khong, o tha xuong se tu bo mat lua chon cua chinh nguoi dung va ho khong
 * con cho nao de bam bo no ra.
 */
export function tinhDemLoc(ds: DongCatalogue[], loc: BoLocCatalogue): DemLoc {
  const kq = {} as DemLoc;
  for (const chieu of MOI_CHIEU) {
    const muc = demTheoChieu(locTru(ds, loc, chieu), chieu);
    const coSan = new Set(muc.map((m) => m.gia_tri));
    const thieu = daChon(loc, chieu)
      .filter((v) => !coSan.has(v))
      .map((gia_tri) => ({ gia_tri, soLuong: 0 }));
    kq[chieu] = [...muc, ...thieu];
  }
  return kq;
}

export function tinhThongKe(ds: DongCatalogue[]): ThongKe {
  return {
    tong: ds.length,
    thieuAnh: ds.filter((d) => d.co.includes("thieu-anh")).length,
    thieuSku: ds.filter((d) => d.co.includes("thieu-sku")).length,
    tlVangLech: ds.filter((d) => d.co.includes("tl-vang-lech")).length,
    trung: ds.filter((d) => d.co.includes("trung")).length,
  };
}

/** Co bat ky rang buoc nao dang bat khong — de biet nen hien nut xoa loc. */
export function dangLoc(loc: BoLocCatalogue): boolean {
  if (loc.q !== null || loc.tlTu !== null || loc.tlDen !== null) return true;
  return MOI_CHIEU.some((chieu) => daChon(loc, chieu).length > 0);
}

/** So dong moi trang. 20 vua man hinh ma khong bat nguoi dung cuon dai. */
export const MOI_TRANG = 20;

export type KetQuaTrang = {
  ds: DongCatalogue[];
  trang: number;
  soTrang: number;
  tu: number;
  den: number;
};

export function docTrang(sp: Record<string, string | undefined>): number {
  const n = Number(sp.trang);
  return Number.isFinite(n) && n >= 1 ? Math.trunc(n) : 1;
}

/**
 * Cat mot trang. Trang vuot khoang hop le bi GHIM ve dau hoac cuoi thay vi tra
 * danh sach rong — nguoi go tay ?trang=999 nen thay trang cuoi, khong phai
 * mot man hinh trong khong giai thich gi.
 */
export function catTrang(
  ds: DongCatalogue[],
  trang: number,
  moiTrang: number = MOI_TRANG,
): KetQuaTrang {
  const soTrang = Math.max(1, Math.ceil(ds.length / moiTrang));
  const t = Math.min(Math.max(1, Math.trunc(trang)), soTrang);
  const dau = (t - 1) * moiTrang;
  const lat = ds.slice(dau, dau + moiTrang);
  return { ds: lat, trang: t, soTrang, tu: ds.length === 0 ? 0 : dau + 1, den: dau + lat.length };
}
