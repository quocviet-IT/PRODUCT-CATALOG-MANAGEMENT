export type TienTe = "VND" | "USD";

const dinhDangVnd = new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 });
const dinhDangUsd = new Intl.NumberFormat("en-US", {
  style: "currency", currency: "USD", minimumFractionDigits: 2,
});

export function dinhDangTien(soTien: number, tienTe: TienTe): string {
  if (tienTe === "VND") return `${dinhDangVnd.format(Math.round(soTien))} ₫`;
  return dinhDangUsd.format(soTien);
}
