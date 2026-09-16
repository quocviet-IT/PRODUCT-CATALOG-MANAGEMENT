import { describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { boChu } from "@/messages";
import type { MucCatalogue } from "@/modules/catalogue-share/chia-se.model";
import {
  BO_CUC,
  GIAO_DIEN_MAC_DINH,
  type BoCuc,
  type GiaoDienCatalogue,
} from "@/modules/catalogue-share/giao-dien.model";

vi.mock("@/messages/dung-chu", async () => {
  const { boChu: bo } = await import("@/messages");
  return { useChu: () => bo("vi") };
});

const { ThanCatalogue } = await import("@/app/catalogue/[slug]/bo-cuc");

const t = boChu("vi");

const anh = (n: number, tien: string) =>
  Array.from({ length: n }, (_, i) => ({ fileId: `${tien}-${i + 1}`, ten: `IMG_${i + 1}.jpg` }));

/** Hai mẫu nhiều ảnh, một mẫu một ảnh — đủ để mọi bố cục có cả ô lớn lẫn ô nhỏ. */
const MUC: MucCatalogue[] = [
  { maMau: "D101", loaiSp: "NHẪN", chatLieu: "Vàng 18K", mau: "Vàng", size: "6", tlVang: 2.4, anh: anh(6, "a") },
  { maMau: "D102", loaiSp: "VÒNG", chatLieu: "Vàng trắng 14K", mau: null, size: null, tlVang: null, anh: anh(4, "b") },
  { maMau: "D103", loaiSp: "DÂY CHUYỀN", chatLieu: null, mau: null, size: null, tlVang: 5.1, anh: anh(1, "c") },
];

function ve(boCuc: BoCuc): string {
  const g: GiaoDienCatalogue = { ...GIAO_DIEN_MAC_DINH, boCuc };
  return renderToStaticMarkup(createElement(ThanCatalogue, { muc: MUC, g, t }));
}

const dem = (html: string, chuoi: string) => html.split(chuoi).length - 1;

/**
 * Bố cục nào có "ô lớn" — ảnh chính đứng riêng một chỗ để ảnh nhỏ nhảy lên.
 *
 * Bốn bố cục ngoài danh sách này KHÔNG có: Danh sách và Lưới bày mọi ảnh ngang hàng
 * nhau (không có ô nào lớn hơn), Bảng màu và Thẻ tiêu bản chỉ hiện đúng một ảnh, còn
 * Khung cổ điển mở đầu bằng HAI ảnh lớn ngang nhau nên không có ô nào là "ô lớn" duy nhất.
 */
const CO_O_LON: BoCuc[] = ["lookbook", "trien-lam", "tap-chi", "thu-moi", "art-deco", "chu-lon"];

describe("ô ảnh lớn để ảnh nhỏ nhảy lên", () => {
  it.each(CO_O_LON)("%s: mỗi mẫu có ảnh đúng một ô lớn", (boCuc) => {
    const html = ve(boCuc);
    // Ba mẫu đều có ảnh nên ba ô lớn, không hơn — hai ô lớn trong một mẫu thì lúc bấm
    // ảnh nhỏ không biết nhảy lên ô nào.
    expect(dem(html, "data-anh-chinh")).toBe(MUC.length);
  });

  it.each(BO_CUC.filter((b) => !CO_O_LON.includes(b)))("%s: không đánh dấu ô lớn nào", (boCuc) => {
    expect(dem(ve(boCuc), "data-anh-chinh")).toBe(0);
  });

  it("ô lớn luôn là ảnh đầu của mẫu", () => {
    for (const boCuc of CO_O_LON) {
      const html = ve(boCuc);
      // Thẻ ảnh dựng ra là <div data-anh="..." data-anh-chinh ...>, nên ảnh đầu của mỗi
      // mẫu phải đứng ngay trước dấu đánh ô lớn.
      expect(html).toContain('data-anh="a-1" data-anh-chinh');
      expect(html).toContain('data-anh="c-1" data-anh-chinh');
      expect(html).not.toContain('data-anh="a-2" data-anh-chinh');
    }
  });
});
