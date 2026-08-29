import { chuanHoaTimKiem } from "@/lib/vietnamese";

export type TrangThaiSanPham = "active" | "discontinued" | "draft";

export type BoLoc = {
  tuKhoa?: string;
  categoryPath?: string;
  giaTu?: number;
  giaDen?: number;
  trangThai?: TrangThaiSanPham;
  coAnh?: boolean;
};

export type ThamSoTrang = { trang: number; moiTrang: number };

const TRANG_THAI_HOP_LE: TrangThaiSanPham[] = ["active", "discontinued", "draft"];

function docSo(v: string | undefined): number | undefined {
  if (v === undefined || v.trim() === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

/** Ham thuan — bien searchParams cua Next.js thanh bo loc da kiem tra. */
export function docBoLocTuUrl(sp: Record<string, string | undefined>): BoLoc {
  const loc: BoLoc = {};

  const q = sp.q ? chuanHoaTimKiem(sp.q) : "";
  if (q) loc.tuKhoa = q;

  if (sp.danh_muc_path) loc.categoryPath = sp.danh_muc_path;

  const tu = docSo(sp.gia_tu);
  if (tu !== undefined) loc.giaTu = tu;
  const den = docSo(sp.gia_den);
  if (den !== undefined) loc.giaDen = den;

  if (sp.trang_thai && TRANG_THAI_HOP_LE.includes(sp.trang_thai as TrangThaiSanPham)) {
    loc.trangThai = sp.trang_thai as TrangThaiSanPham;
  }

  if (sp.co_anh === "1") loc.coAnh = true;
  else if (sp.co_anh === "0") loc.coAnh = false;

  return loc;
}

export function docThamSoTrang(sp: Record<string, string | undefined>): ThamSoTrang {
  const trang = Math.max(1, Math.trunc(docSo(sp.trang) ?? 1));
  return { trang, moiTrang: 48 };
}
