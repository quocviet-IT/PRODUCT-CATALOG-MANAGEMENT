/** Dinh dang dd/mm/yyyy theo gio UTC de ket qua on dinh giua cac may. */
export function dinhDangNgay(d: Date): string {
  const ngay = String(d.getUTCDate()).padStart(2, "0");
  const thang = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${ngay}/${thang}/${d.getUTCFullYear()}`;
}

/**
 * Moc thoi gian day du, doc theo gio Viet Nam.
 *
 * Ghim mui gio thay vi dung gio may chu: may chu chay o Vercel (UTC), con
 * nguoi doc dong chu nay ngoi o Viet Nam va dang doi chieu voi bang tinh ho
 * vua sua. "10:20" phai la 10:20 cua ho.
 */
export const MUI_GIO_VN = "Asia/Ho_Chi_Minh";

export function dinhDangLuc(d: Date): string {
  // Locale "en-GB" chu khong phai "vi-VN": ta chi lay cac phan SO ra roi tu
  // ghep, nen dieu duy nhat locale con anh huong la he chu so — va en-GB thi
  // chac chan la chu so La Tinh.
  const p = new Intl.DateTimeFormat("en-GB", {
    timeZone: MUI_GIO_VN,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(d);
  const o = Object.fromEntries(p.map((x) => [x.type, x.value]));
  return `${o.hour}:${o.minute} ${o.day}/${o.month}/${o.year}`;
}
