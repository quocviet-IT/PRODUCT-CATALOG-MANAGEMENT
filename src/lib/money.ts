export type TienTe = "VND" | "USD";

const dinhDangVnd = new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 });
const dinhDangUsd = new Intl.NumberFormat("en-US", {
  style: "currency", currency: "USD", minimumFractionDigits: 2,
});

/**
 * Lam tron nua don vi RA XA so 0 (quy uoc ke toan), khac voi Math.round von
 * luon lam tron ve phia +Infinity: Math.round(-0.5) cho -0, va Intl se in ra
 * chuoi "-0 ₫" tren ban bao gia gui khach.
 */
function lamTronTien(x: number): number {
  const n = Math.sign(x) * Math.round(Math.abs(x));
  return Object.is(n, -0) ? 0 : n;
}

export function dinhDangTien(soTien: number, tienTe: TienTe): string {
  if (tienTe === "VND") return `${dinhDangVnd.format(lamTronTien(soTien))} ₫`;
  return dinhDangUsd.format(soTien);
}
