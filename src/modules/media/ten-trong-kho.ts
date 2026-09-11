/**
 * Ghep va tach ten tep khi doc danh sach kho bang SQL. Ham THUAN — test duoc.
 *
 * Vi sao co tep nay: lietKeTen() tung goi list() cua Supabase Storage, 1.000
 * tep moi trang, chan cung o 50 trang. Sang 11/09/2026 thu muc bo dem anh cham
 * 50.216 tep, lietKeTen() nem loi, /api/dong-bo/thieu-anh tra 500, va ca duong
 * nap anh cua Apps Script dung tu 04:14 sang. Gio lietKeTen() doc thang bang
 * storage.objects bang mot cau SQL — khong con tran, va nhanh hon: 50.216 ten
 * trong 755ms thay vi 51 luot goi mat ~20 giay.
 */

/** Thoat ky tu dac biet cua LIKE (\ % _) de ten thu muc khop DUNG nguyen van. */
export function thoatLike(s: string): string {
  return s.replace(/[\\%_]/g, (k) => `\\${k}`);
}

function boGachCuoi(thuMuc: string): string {
  return thuMuc.replace(/\/+$/, "");
}

/** Mau LIKE cho moi khoa nam DUOI thuMuc, vi du "sheet-cache/%". */
export function mauLikeDuoiThuMuc(thuMuc: string): string {
  return `${thoatLike(boGachCuoi(thuMuc))}/%`;
}

/**
 * Ten tep TRUC TIEP trong thuMuc (da bo tien to), hoac null.
 *
 * Tra null cho khoa nam trong thu muc CON: list() cu chi tra mot tang, va noi
 * goi (doi chieu bo dem anh) dung ten nay de ghep lai khoa — ten lan dau "/" o
 * day se ghep ra mot khoa khong ton tai.
 */
export function tenTrucTiep(khoa: string, thuMuc: string): string | null {
  const tienTo = `${boGachCuoi(thuMuc)}/`;
  if (!khoa.startsWith(tienTo)) return null;
  const ten = khoa.slice(tienTo.length);
  if (ten === "" || ten.includes("/")) return null;
  return ten;
}
