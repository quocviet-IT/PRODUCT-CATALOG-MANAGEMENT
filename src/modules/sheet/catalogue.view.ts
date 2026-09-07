import { chuanHoaTimKiem } from "@/lib/vietnamese";
import type { DongCatalogue } from "./catalogue.mapper";

export type LoaiXoan = "lab" | "tu-nhien";

export type BoLocCatalogue = {
  q: string | null;
  /** Rong = khong rang buoc. Nhieu gia tri = hop (OR) trong cung mot tieu chi. */
  chatLieu: string[];
  loaiXoan: LoaiXoan[];
  chiCanhBao: boolean;
};

export type MucDem = { gia_tri: string; soLuong: number };

export type ThongKe = {
  tong: number;
  thieuAnh: number;
  thieuSku: number;
  tlVangLech: number;
  trung: number;
  theoChatLieu: MucDem[];
  theoLoaiXoan: MucDem[];
};

function chuoi(v: string | undefined): string | null {
  const s = v?.trim();
  return s ? s : null;
}

/** Nhieu gia tri di trong MOT tham so, ngan bang dau phay. Bo trung va bo rong. */
function danhSach(v: string | undefined): string[] {
  if (!v) return [];
  return [...new Set(v.split(",").map((x) => x.trim()).filter(Boolean))];
}

export function docBoLocTuUrl(sp: Record<string, string | undefined>): BoLocCatalogue {
  return {
    q: chuoi(sp.q),
    chatLieu: danhSach(sp.chat_lieu),
    loaiXoan: danhSach(sp.loai_xoan).filter(
      (x): x is LoaiXoan => x === "lab" || x === "tu-nhien",
    ),
    chiCanhBao: sp.canh_bao === "1",
  };
}

function demTheo(ds: DongCatalogue[], chon: (d: DongCatalogue) => string | null): MucDem[] {
  const dem = new Map<string, number>();
  for (const d of ds) {
    const v = chon(d);
    if (v !== null) dem.set(v, (dem.get(v) ?? 0) + 1);
  }
  // Nhieu nhat truoc; bang nhau thi theo bang chu cai de thu tu on dinh.
  return [...dem.entries()]
    .map(([gia_tri, soLuong]) => ({ gia_tri, soLuong }))
    .sort((a, b) => b.soLuong - a.soLuong || a.gia_tri.localeCompare(b.gia_tri));
}

export function tinhThongKe(ds: DongCatalogue[]): ThongKe {
  return {
    tong: ds.length,
    thieuAnh: ds.filter((d) => d.co.includes("thieu-anh")).length,
    thieuSku: ds.filter((d) => d.co.includes("thieu-sku")).length,
    tlVangLech: ds.filter((d) => d.co.includes("tl-vang-lech")).length,
    trung: ds.filter((d) => d.co.includes("trung")).length,
    theoChatLieu: demTheo(ds, (d) => d.chatLieu),
    theoLoaiXoan: demTheo(ds, (d) => d.loaiXoan),
  };
}

/**
 * Moi cot chu deu tim duoc, khong chi ma mau va mo ta. Nguoi dung go so MO hay
 * "18KW" thi phai ra ket qua, khong phai doan xem cot nao duoc tim.
 */
function khoTimKiem(d: DongCatalogue): string {
  return chuanHoaTimKiem(
    [
      d.maMau, d.sku, d.mo, d.so, d.chiTiet,
      d.chatLieu, d.size, d.loai, d.dongSp, d.oChu,
    ]
      .filter((x): x is string => Boolean(x))
      .join(" "),
  );
}

export function locDanhSach(ds: DongCatalogue[], loc: BoLocCatalogue): DongCatalogue[] {
  const tuKhoa = loc.q === null ? null : chuanHoaTimKiem(loc.q);
  return ds.filter((d) => {
    // Danh sach rong nghia la KHONG rang buoc, khong phai "khong khop gi".
    if (loc.chatLieu.length > 0 && (d.chatLieu === null || !loc.chatLieu.includes(d.chatLieu)))
      return false;
    if (loc.loaiXoan.length > 0 && (d.loaiXoan === null || !loc.loaiXoan.includes(d.loaiXoan)))
      return false;
    if (loc.chiCanhBao && d.co.length === 0) return false;
    if (tuKhoa !== null && !khoTimKiem(d).includes(tuKhoa)) return false;
    return true;
  });
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
