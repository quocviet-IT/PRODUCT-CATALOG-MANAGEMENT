/**
 * Bo dau tieng Viet. Dung NFD de tach dau ra khoi nguyen am roi xoa,
 * sau do xu ly rieng chu D gach ngang vi no khong phai dau to hop.
 *
 * Dai U+0300..U+036F PHAI viet bang escape \u, khong duoc dan ky tu to hop
 * thang vao source: chung vo hinh, de bi editor chuan hoa Unicode lam hong,
 * va toan bo tim kiem tieng Viet phu thuoc vao dong nay.
 */
export function boDau(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}

export function chuanHoaTimKiem(s: string): string {
  return boDau(s).toLowerCase().replace(/\s+/g, " ").trim();
}

export function dungSearchText(p: { sku: string; name: string; description?: string }): string {
  return chuanHoaTimKiem([p.sku, p.name, p.description ?? ""].join(" "));
}
