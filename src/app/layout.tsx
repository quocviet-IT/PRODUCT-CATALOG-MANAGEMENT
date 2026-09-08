import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Cormorant_Garamond, EB_Garamond } from "next/font/google";
import { layChu, layNgonNgu } from "@/messages/may-chu";
import { NguonNgonNgu } from "@/messages/dung-chu";
import { MA_HTML } from "@/messages/ngon-ngu";
import "./globals.css";

// "The Seasons" cua he thiet ke la font thuong mai, khong co ban web.
// Cormorant Garamond la ban thay ma chinh he thiet ke chi dinh.
const fontTieuDe = Cormorant_Garamond({
  variable: "--font-title-nap",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500"],
});

// He thiet ke chi dinh "Cardo" cho than bai, nhung Cardo KHONG co subset
// vietnamese tren Google Fonts. Ca giao dien la tieng Viet nen dung no la
// moi chu co dau roi sang font he thong. EB Garamond giu dung y do serif
// than bai va co du dau.
const fontThanBai = EB_Garamond({
  variable: "--font-body-nap",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500"],
});

/**
 * Tieu de trang doi theo ngon ngu nen phai la HAM, khong the la hang so
 * module: hang so tinh mot lan luc nap tep, con ngon ngu doc tu cookie cua
 * tung yeu cau.
 */
export async function generateMetadata(): Promise<Metadata> {
  const t = await layChu();
  return {
    title: t.trang.tieu_de,
    description: t.trang.mo_ta,
  // Catalogue dang mo cong khai (chua co cong dang nhap) nhung KHONG duoc
  // len ket qua tim kiem: no chua ma hang va trong luong vang. robots.txt
  // chi xin bot dung thu thap — the noindex nay moi la thu ngan trang da
  // biet duong dan khoi vao chi muc. Can ca hai.
    robots: { index: false, follow: false },
  };
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const nn = await layNgonNgu();
  return (
    <html
      lang={MA_HTML[nn]}
      className={`${fontTieuDe.variable} ${fontThanBai.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* Cac client component doc ngon ngu tu day. Trang khach xem tu boc
            lai bang mot NguonNgonNgu rieng — ngon ngu cua khach do sale chon
            luc tao catalogue, khong phai cookie tren may nhan vien. */}
        <NguonNgonNgu ngonNgu={nn}>{children}</NguonNgonNgu>
      </body>
    </html>
  );
}
