"use client";

import { vi } from "@/messages/vi";

/**
 * "Tai PDF" = mo hop thoai in cua trinh duyet, khach chon "Luu thanh PDF".
 *
 * Vi sao khong sinh PDF o may chu: link moi la duong gui chinh (quyet dinh
 * 07/09/2026), PDF chi la duong phu. Sinh PDF that can headless Chrome ~50MB
 * tren Vercel hoac phai tu dat tung dong chu kem nhung font tieng Viet — ca
 * hai deu dat hon nhieu so voi gia tri no them vao lúc nay. Duong nay khong
 * them thu vien nao, va ban in luon khop voi trang khach dang xem.
 */
export function NutInPdf() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="border border-hp-rule px-4 py-1.5 text-[11px] uppercase tracking-[0.14em]
                 text-hp-muted transition-colors duration-150
                 hover:border-hp-ink hover:text-hp-ink"
    >
      {vi.chia_se.tai_pdf}
    </button>
  );
}
