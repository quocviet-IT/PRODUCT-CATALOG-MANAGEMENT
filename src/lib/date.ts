/** Dinh dang dd/mm/yyyy theo gio UTC de ket qua on dinh giua cac may. */
export function dinhDangNgay(d: Date): string {
  const ngay = String(d.getUTCDate()).padStart(2, "0");
  const thang = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${ngay}/${thang}/${d.getUTCFullYear()}`;
}
