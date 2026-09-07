import { chuanHoaTimKiem } from "@/lib/vietnamese";
import type { DongCatalogue } from "./catalogue.mapper";

export type BoLocCatalogue = {
  q: string | null;
  chatLieu: string | null;
  loaiXoan: "lab" | "tu-nhien" | null;
  chiCanhBao: boolean;
};

export type MucDem = { gia_tri: string; soLuong: number };

export type ThongKe = {
  tong: number;
  thieuAnh: number;
  thieuSku: number;
  tlVangLech: number;
  theoChatLieu: MucDem[];
  theoLoaiXoan: MucDem[];
};

function chuoi(v: string | undefined): string | null {
  const s = v?.trim();
  return s ? s : null;
}

export function docBoLocTuUrl(sp: Record<string, string | undefined>): BoLocCatalogue {
  const xoan = chuoi(sp.loai_xoan);
  return {
    q: chuoi(sp.q),
    chatLieu: chuoi(sp.chat_lieu),
    loaiXoan: xoan === "lab" || xoan === "tu-nhien" ? xoan : null,
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
    theoChatLieu: demTheo(ds, (d) => d.chatLieu),
    theoLoaiXoan: demTheo(ds, (d) => d.loaiXoan),
  };
}

export function locDanhSach(ds: DongCatalogue[], loc: BoLocCatalogue): DongCatalogue[] {
  const tuKhoa = loc.q === null ? null : chuanHoaTimKiem(loc.q);
  return ds.filter((d) => {
    if (loc.chatLieu !== null && d.chatLieu !== loc.chatLieu) return false;
    if (loc.loaiXoan !== null && d.loaiXoan !== loc.loaiXoan) return false;
    if (loc.chiCanhBao && d.co.length === 0) return false;
    if (tuKhoa !== null) {
      const kho = chuanHoaTimKiem([d.maMau ?? "", d.sku ?? "", d.chiTiet ?? ""].join(" "));
      if (!kho.includes(tuKhoa)) return false;
    }
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
