import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Cormorant_Garamond, EB_Garamond } from "next/font/google";
import { vi } from "@/messages/vi";
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

export const metadata: Metadata = {
  title: vi.trang.tieu_de,
  description: vi.trang.mo_ta,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="vi"
      className={`${fontTieuDe.variable} ${fontThanBai.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
