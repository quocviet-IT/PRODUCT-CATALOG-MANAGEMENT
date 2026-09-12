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
  /**
   * So mau KHONG dinh canh bao nao.
   *
   * Phai dem rieng, khong duoc lay tong tru di bon con so tren: mot mau vua
   * thieu anh vua thieu SKU se bi dem hai lan va ket qua ra am.
   */
  duDuLieu: number;
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
 * Tu dong nghia Viet - Anh, tra theo GIA TRI CUA TUNG COT chu khong quet ca
 * chuoi. Quet ca chuoi thi "lac" se khop nham trong "black", "mat" khop trong
 * "format" — tra theo cot thi khong the nham.
 *
 * Chi khai nhung gia tri CO THAT trong bang tinh. Bang tinh moc them gia tri
 * moi thi them mot dong o day, khong phai sua ham nao.
 */
const DONG_NGHIA_MAU: Record<string, string> = {
  white: "trang",
  yellow: "vang",
  rose: "hong",
};
const DONG_NGHIA_LOAI_SP: Record<string, string> = {
  "nhan": "ring",
  "day chuyen": "necklace",
  "day co": "chain necklace",
  "lac": "bracelet",
  "mat": "pendant charm",
  "bong tai": "earring",
};
const DONG_NGHIA_DONG_SP: Record<string, string> = {
  complete: "hoan chinh",
  "tron": "plain",
};

/**
 * Tu dien Viet-Anh ap dung theo TUNG TU, khac ba bang tren (chung doi chieu
 * NGUYEN gia tri mot o).
 *
 * Vi sao can them: hai cot mo ta la van xuoi — "Dây mân côi", "Mặt dây túi
 * tiền". Doi chieu nguyen cum thi khong bao gio trung, nen phai dich tung tu.
 *
 * Chi mot chieu Viet -> Anh la du: kho tim kiem duoc dung tu chinh o bang tinh
 * (tieng Viet), nen chi can them ban tieng Anh vao kho. Nguoi go tieng Viet da
 * khop san voi chinh chu goc roi.
 *
 * KHONG co "xoan" -> "diamond" o day, du "xoàn" nghia la kim cuong: bo dau xong
 * thi "xoàn" (kim cuong) va "xoắn" (van thung) thanh cung mot tu, va mot cai
 * lac xoan la se hien ra khi khach tim "diamond". Ban dich cua kim cuong duoc
 * them tu truong loaiXoan ben duoi — cho do doc tu ma LGDRI/DIARI nen khong
 * bao gio nham.
 */
const TU_DIEN_VI_EN: Record<string, string> = {
  nhan: "ring",
  day: "chain",
  chuyen: "necklace",
  lac: "bracelet",
  mat: "pendant charm",
  bong: "earring",
  tai: "earring",
  vang: "gold",
  trang: "white",
  hong: "rose pink",
  bac: "silver",
  tron: "plain",
  man: "rosary",
  coi: "rosary",
  bi: "bead ball",
  khac: "engraved engraving",
  may: "machine",
  la: "leaf",
  tui: "bag pouch",
  tien: "money coin",
  khoen: "link loop",
  lat: "flip",
  size: "size",
};

/**
 * Chat lieu la MA, khong phai chu: "18K", "14K", "PT". Khong co chu "vang" hay
 * "gold" nao trong bang tinh de ma khop, nen truoc khi them cho nay thi go
 * "gold" ra 0 mau — trong khi 64/71 mau la vang.
 *
 * Tach rieng khoi tu dien theo tu vi day la doc MA chu khong phai dich chu.
 */
function dichChatLieu(v: string | null): string[] {
  if (!v) return [];
  const s = chuanHoaTimKiem(v);
  if (/^pt/.test(s)) return ["platinum", "bach kim"];
  const m = /^(\d+)\s*k([a-z]?)/.exec(s);
  if (!m) return [];
  // "vang" vua la kim loai vua la mau — o day la kim loai.
  const ra = ["gold", "vang", `${m[1]}k`];
  const mauTheoMa: Record<string, string> = {
    y: "yellow vang",
    w: "white trang",
    r: "rose hong",
    p: "rose hong",
  };
  const mau = mauTheoMa[m[2]];
  if (mau) ra.push(mau);
  return ra;
}

/** Ban dich tieng Anh cua tung tu trong mot doan van xuoi. */
function dichTungTu(v: string | null): string[] {
  if (!v) return [];
  const ra: string[] = [];
  for (const tu of chuanHoaTimKiem(v).split(" ")) {
    const dich = TU_DIEN_VI_EN[tu];
    if (dich) ra.push(dich);
  }
  return ra;
}

function themDongNghia(v: string | null, bang: Record<string, string>): string[] {
  if (!v) return [];
  const dong = bang[chuanHoaTimKiem(v)];
  return dong ? [dong] : [];
}

/**
 * Vung van ban de tim cua mot dong: MOI cot, khong chi ma mau va mo ta.
 *
 * Bo dem theo tung dong vi mot lan hien trang goi ham nay chin lan cho moi dong
 * (mot lan cho danh sach, tam lan cho bo dem cua tam o tha xuong).
 */
const boDemKho = new WeakMap<DongCatalogue, string[]>();

function khoTimKiem(d: DongCatalogue): string[] {
  const cu = boDemKho.get(d);
  if (cu !== undefined) return cu;

  const phan: (string | null)[] = [
    d.maMau, d.sku, d.mo, d.so, d.chiTiet,
    d.chatLieu, d.size, d.dongSp, d.loaiSp, d.mau, d.oChu,
    d.moTa1, d.moTa2,
  ];

  // TL vang la so nen khong tu vao chuoi. Nhan CA HAI cach go: "2.78" va
  // "2,78" — nguoi dung Viet go dau phay, con bang tinh ghi dau cham.
  if (d.tlVang !== null) {
    const so = d.tlVang.toFixed(2);
    phan.push(so, so.replace(".", ","));
  }
  // Loai xoan la nhan noi bo ("lab" / "tu-nhien"), phai doi sang chu nguoi go.
  if (d.loaiXoan) {
    // "diamond kim cuong" gan o DAY chu khong gan vao tu dien: truong nay doc
    // tu ma LGDRI/DIARI trong Chi tiet SP nen chac chan la kim cuong that.
    phan.push("diamond kim cuong");
    phan.push(d.loaiXoan === "lab" ? "lab xoan lab" : "tu nhien natural");
  }

  phan.push(
    ...themDongNghia(d.mau, DONG_NGHIA_MAU),
    ...themDongNghia(d.loaiSp, DONG_NGHIA_LOAI_SP),
    ...themDongNghia(d.dongSp, DONG_NGHIA_DONG_SP),
    // Van xuoi trong hai cot mo ta: dich tung tu mot.
    ...dichTungTu(d.moTa1),
    ...dichTungTu(d.moTa2),
    ...dichTungTu(d.loaiSp),
    ...dichChatLieu(d.chatLieu),
  );

  // Giu dang TUNG TU chu khong phai mot chuoi dai: phep khop ben duoi lam viec
  // theo tu, xem khopTu().
  const kho = chuanHoaTimKiem(phan.filter((x): x is string => Boolean(x)).join(" "))
    .split(" ")
    .filter(Boolean);
  boDemKho.set(d, kho);
  return kho;
}

/** Tu ngan hon nguong nay chi khop tu DAU tu, khong khop giua tu. */
const DAI_TU_DU_DAI = 4;

/**
 * Mot tu tim co khop vung van ban khong.
 *
 * Khop tu DAU MOI TU truoc. Neu khop bat ky cho nao trong chuoi thi "lac" se
 * khop trong "necklace" (nguoi tim vong lac lai ra day chuyen), va "5" se khop
 * trong "25.10006" khien "size 5" tra ve gan het bang.
 *
 * Rieng tu tu 4 ky tu tro len thi cho khop ca giua tu, vi do gan nhu chac chan
 * la ma hang: nguoi ta go "12751" de tim "D12751-01" ma khong go tu dau.
 */
function khopTu(kho: string[], t: string): boolean {
  if (kho.some((w) => w.startsWith(t))) return true;
  return t.length >= DAI_TU_DU_DAI && kho.some((w) => w.includes(t));
}

/**
 * Tach cau tim thanh tung tu. Mot dong phai chua TAT CA cac tu, khong can dung
 * thu tu va khong can nam canh nhau.
 *
 * Truoc day cau tim duoc doi chieu nguyen cum voi ca chuoi da ghep, nen "nhan
 * 18k" khong ra gi ca: hai tu do nam o hai cot khac nhau va khong bao gio dung
 * canh nhau. Do la cach nguoi ta go tim that su, nen day la loi chu khong phai
 * gioi han.
 */
export function tachTuKhoa(q: string | null): string[] {
  if (q === null) return [];
  return chuanHoaTimKiem(q).split(" ").filter(Boolean);
}

function quaTimKiem(d: DongCatalogue, tuKhoa: string[]): boolean {
  if (tuKhoa.length === 0) return true;
  const kho = khoTimKiem(d);
  return tuKhoa.every((t) => khopTu(kho, t));
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
  const tuKhoa = tachTuKhoa(loc.q);
  return ds.filter((d) => {
    for (const chieu of MOI_CHIEU) {
      if (chieu !== tru && !quaChieu(d, loc, chieu)) return false;
    }
    if (!quaTrongLuong(d, loc)) return false;
    if (!quaTimKiem(d, tuKhoa)) return false;
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
    duDuLieu: ds.filter((d) => d.co.length === 0).length,
  };
}

/** Co bat ky rang buoc nao dang bat khong — de biet nen hien nut xoa loc. */
export function dangLoc(loc: BoLocCatalogue): boolean {
  if (loc.q !== null || loc.tlTu !== null || loc.tlDen !== null) return true;
  return MOI_CHIEU.some((chieu) => daChon(loc, chieu).length > 0);
}

/** So dong moi trang. 20 vua man hinh ma khong bat nguoi dung cuon dai. */
export const MOI_TRANG = 20;

export type KetQuaTrang<T = DongCatalogue> = {
  ds: T[];
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
export function catTrang<T>(
  ds: T[],
  trang: number,
  moiTrang: number = MOI_TRANG,
): KetQuaTrang<T> {
  const soTrang = Math.max(1, Math.ceil(ds.length / moiTrang));
  const t = Math.min(Math.max(1, Math.trunc(trang)), soTrang);
  const dau = (t - 1) * moiTrang;
  const lat = ds.slice(dau, dau + moiTrang);
  return { ds: lat, trang: t, soTrang, tu: ds.length === 0 ? 0 : dau + 1, den: dau + lat.length };
}

// ---------------------------------------------------------------------------
// Goi y khi go tim
// ---------------------------------------------------------------------------

/** Cot ma mot goi y den tu do. Hien canh goi y de nguoi ta biet minh chon gi. */
export type NhomGoiY =
  | "maMau" | "loaiSp" | "dongSp" | "chatLieu" | "mau" | "size" | "moTa";

export type MucGoiY = {
  /** Chu se duoc dien vao o tim kiem khi bam. */
  chu: string;
  nhom: NhomGoiY;
  /** Bao nhieu mau mang gia tri nay. */
  soLuong: number;
};

const LAY_GOI_Y: { nhom: NhomGoiY; lay: (d: DongCatalogue) => (string | null)[] }[] = [
  { nhom: "moTa", lay: (d) => [d.moTa1, d.moTa2] },
  { nhom: "loaiSp", lay: (d) => [d.loaiSp] },
  { nhom: "dongSp", lay: (d) => [d.dongSp] },
  { nhom: "chatLieu", lay: (d) => [d.chatLieu] },
  { nhom: "mau", lay: (d) => [d.mau] },
  { nhom: "size", lay: (d) => [d.size] },
  { nhom: "maMau", lay: (d) => [d.maMau] },
];

/**
 * Toan bo tu vung goi y duoc, dung mot lan cho ca bang.
 *
 * Tinh o may chu roi truyen sang: o tim kiem la client component va noi dung go
 * doi theo tung phim, nen viec LOC phai lam o trinh duyet. Nhung danh sach gia
 * tri thi khong doi theo phim — tinh mot lan, gui mot lan.
 *
 * Mot gia tri chi thuoc MOT nhom: neu no xuat hien o hai cot thi giu nhom dau
 * tien theo thu tu LAY_GOI_Y, va cong don so luong. Hien mot chu hai lan trong
 * danh sach goi y trong nhu mot loi.
 */
export function tuVungGoiY(ds: DongCatalogue[]): MucGoiY[] {
  const bang = new Map<string, MucGoiY>();
  for (const { nhom, lay } of LAY_GOI_Y) {
    for (const d of ds) {
      for (const v of lay(d)) {
        const chu = v?.trim();
        if (!chu) continue;
        const khoa = chuanHoaTimKiem(chu);
        const cu = bang.get(khoa);
        if (cu) cu.soLuong++;
        else bang.set(khoa, { chu, nhom, soLuong: 1 });
      }
    }
  }
  return [...bang.values()];
}

/** Bao nhieu goi y hien cung luc. Dai hon thi danh sach che mat ban thu ket qua. */
export const SO_GOI_Y = 8;

/**
 * Loc tu vung theo cau dang go. Ham thuan, chay o trinh duyet theo tung phim.
 *
 * Dung DUNG phep khop cua tim kiem that (khopTu): goi y ma hien ra roi bam vao
 * lai khong ra ket qua nao thi te hon la khong co goi y.
 */
export function locGoiY(tuVung: MucGoiY[], q: string | null, toiDa = SO_GOI_Y): MucGoiY[] {
  const tuKhoa = tachTuKhoa(q);
  if (tuKhoa.length === 0) return [];

  const hop = tuVung.filter((m) => {
    const kho = chuanHoaTimKiem(m.chu).split(" ").filter(Boolean);
    return tuKhoa.every((t) => khopTu(kho, t));
  });

  // Da go dung y het mot goi y roi thi khong con gi de goi y nua.
  const daDayDu = chuanHoaTimKiem(q ?? "");
  const con = hop.filter((m) => chuanHoaTimKiem(m.chu) !== daDayDu);

  return con
    .sort((a, b) => b.soLuong - a.soLuong || a.chu.localeCompare(b.chu, "vi"))
    .slice(0, toiDa);
}

// ---------------------------------------------------------------------------
// Sap xep
// ---------------------------------------------------------------------------

/**
 * Cac cot sap xep duoc. "dong" la thu tu goc cua bang tinh — mac dinh, va la
 * thu duy nhat khop voi cai nguoi dung nhin thay khi ho mo Google Sheets.
 */
export const KHOA_SAP = [
  "dong", "maMau", "sku", "so", "mo", "loaiSp", "dongSp",
  "chatLieu", "mau", "tlVang", "size", "chiTiet",
] as const;
export type KhoaSap = (typeof KHOA_SAP)[number];
export type ChieuSap = "tang" | "giam";
export type SapXep = { khoa: KhoaSap; chieu: ChieuSap };

export const SAP_MAC_DINH: SapXep = { khoa: "dong", chieu: "tang" };

export function docSapXepTuUrl(sp: Record<string, string | undefined>): SapXep {
  const khoa = (KHOA_SAP as readonly string[]).includes(sp.sap ?? "")
    ? (sp.sap as KhoaSap)
    : SAP_MAC_DINH.khoa;
  const chieu: ChieuSap = sp.chieu === "giam" ? "giam" : "tang";
  return { khoa, chieu };
}

/** Gia tri dem ra so sanh. null nghia la "o trong". */
const LAY_SAP: Record<KhoaSap, (d: DongCatalogue) => string | number | null> = {
  dong: (d) => d.dongSheet,
  maMau: (d) => d.maMau,
  sku: (d) => d.sku,
  so: (d) => d.so,
  mo: (d) => d.mo,
  loaiSp: (d) => d.loaiSp,
  dongSp: (d) => d.dongSp,
  chatLieu: (d) => d.chatLieu,
  mau: (d) => d.mau,
  tlVang: (d) => d.tlVang,
  size: (d) => d.size,
  chiTiet: (d) => d.chiTiet,
};

/**
 * Sap xep danh sach. Ham thuan, KHONG sua mang goc.
 *
 * O trong luon xuong CUOI, khong theo chieu sap: dao chieu ma dua ca mot man
 * hinh o trong len dau thi cu bam dao chieu la mat hut du lieu, va nguoi ta
 * tuong bang hong.
 *
 * Bang nhau thi tra ve thu tu goc cua bang tinh — thu tu on dinh, khong nhay
 * lung tung moi lan dung lai trang.
 */
export function sapXepDanhSach(ds: DongCatalogue[], sap: SapXep): DongCatalogue[] {
  const lay = LAY_SAP[sap.khoa];
  const dau = sap.chieu === "giam" ? -1 : 1;
  return [...ds].sort((a, b) => {
    const x = lay(a);
    const y = lay(b);
    if (x === null && y === null) return a.dongSheet - b.dongSheet;
    if (x === null) return 1;
    if (y === null) return -1;
    let n: number;
    if (typeof x === "number" && typeof y === "number") n = x - y;
    else if (sap.khoa === "size") n = sapSize(String(x), String(y));
    else n = String(x).localeCompare(String(y), "vi", { numeric: true });
    return n !== 0 ? n * dau : a.dongSheet - b.dongSheet;
  });
}

/**
 * Nhung cot KHONG bao gio co du lieu trong toan bo bang.
 *
 * Bang nay 16 cot va phai keo ngang mai moi het. Mot cot rong tuyet doi — hom
 * nay la "O chu", 0/71 dong — chi ton be ngang de bay ra mot cot gach ngang.
 * Tinh tren TOAN BO bang chu khong theo bo loc dang bat: cot bien mat rooi hien
 * lai theo tung lan go tim thi bang nhay lien tuc.
 */
export const COT_AN_DUOC = ["sku", "so", "mo", "chiTiet", "size", "oChu", "thuMuc", "clip"] as const;
export type CotAnDuoc = (typeof COT_AN_DUOC)[number];

const LAY_COT: Record<CotAnDuoc, (d: DongCatalogue) => unknown> = {
  sku: (d) => d.sku,
  so: (d) => d.so,
  mo: (d) => d.mo,
  chiTiet: (d) => d.chiTiet,
  size: (d) => d.size,
  oChu: (d) => d.oChu,
  thuMuc: (d) => d.urlThuMuc ?? d.urlAnhConcept ?? d.urlClipTho,
  clip: (d) => d.urlClipDaXuLy ?? d.tenClipDaXuLy,
};

export function cotRong(ds: DongCatalogue[]): Set<CotAnDuoc> {
  const rong = new Set<CotAnDuoc>();
  for (const c of COT_AN_DUOC) {
    if (!ds.some((d) => LAY_COT[c](d) !== null && LAY_COT[c](d) !== "")) rong.add(c);
  }
  return rong;
}

/**
 * Số dòng của những dòng LẶP LẠI một mã mẫu đã xuất hiện trước đó trong danh
 * sách này.
 *
 * VÌ SAO CẦN: ô tích mang khoá là MÃ MẪU (xem khoaMau), nhưng bảng hiện một
 * dòng cho mỗi biến thể — 202/1.591 mã trải trên nhiều dòng. Hai dòng cùng mã
 * nghĩa là hai ô tích cùng một khoá: tích một cái thì cái kia cũng tích, bỏ một
 * cái thì cả hai cùng bỏ. Người dùng thấy đúng như một lỗi, và họ đúng — giao
 * diện đang hứa hai thứ độc lập trong khi bên dưới chỉ có một.
 *
 * Nên chỉ dòng ĐẦU của mỗi mã mới mang ô tích; những dòng sau nói rõ là cùng
 * mẫu. Tính theo thứ tự đang hiển thị, nên đổi cách sắp xếp hay sang trang thì
 * dòng đầu đổi theo — vẫn luôn có đúng một ô tích cho mỗi mã trên màn hình.
 */
export function dongLapMa(ds: DongCatalogue[], khoa: (d: DongCatalogue) => string): Set<number> {
  const daGap = new Set<string>();
  const lap = new Set<number>();
  for (const d of ds) {
    const k = khoa(d);
    if (daGap.has(k)) lap.add(d.dongSheet);
    else daGap.add(k);
  }
  return lap;
}
