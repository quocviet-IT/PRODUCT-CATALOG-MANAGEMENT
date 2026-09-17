import { describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { boChu } from "@/messages";
import type { MucCatalogue } from "@/modules/catalogue-share/chia-se.model";
import { GIAO_DIEN_MAC_DINH, type GiaoDienCatalogue } from "@/modules/catalogue-share/giao-dien.model";

vi.mock("@/messages/dung-chu", async () => {
  const { boChu: bo } = await import("@/messages");
  return { useChu: () => bo("vi") };
});

const { ThanCatalogue } = await import("@/app/catalogue/[slug]/bo-cuc");

const t = boChu("vi");

const anh = (n: number, tien: string) =>
  Array.from({ length: n }, (_, i) => ({ fileId: `${tien}-${i + 1}`, ten: `IMG_${i + 1}.jpg` }));

/** Ba mẫu: 8 ảnh (dư hơn dải), 3 ảnh (dải bày hết), 1 ảnh (không có dải). */
const MUC: MucCatalogue[] = [
  { maMau: "D101", loaiSp: "NHẪN", chatLieu: "Vàng 18K", mau: null, size: null, tlVang: null, anh: anh(8, "a") },
  { maMau: "D102", loaiSp: "VÒNG", chatLieu: null, mau: null, size: null, tlVang: null, anh: anh(3, "b") },
  { maMau: "D103", loaiSp: "DÂY", chatLieu: null, mau: null, size: null, tlVang: null, anh: anh(1, "c") },
];

const g: GiaoDienCatalogue = { ...GIAO_DIEN_MAC_DINH, boCuc: "bang-mau" };
const html = renderToStaticMarkup(createElement(ThanCatalogue, { muc: MUC, g, t }));
const dem = (chuoi: string) => html.split(chuoi).length - 1;

describe("Bảng mẫu — dải ảnh phụ", () => {
  it("mẫu có từ hai ảnh có một dải, mẫu một ảnh thì không", () => {
    expect(dem("data-dai-anh")).toBe(2);
  });

  it("dải dừng ở năm tấm: ảnh chính + năm = sáu ảnh mỗi mẫu", () => {
    // 8 ảnh chỉ bày 6; 3 ảnh bày đủ 3; 1 ảnh bày 1.
    expect(dem("data-anh=")).toBe(6 + 3 + 1);
    expect(html).toContain('data-anh="a-6"');
    expect(html).not.toContain('data-anh="a-7"');
    expect(html).toContain('data-anh="b-3"');
  });

  it("ảnh chính là ô lớn để ảnh nhỏ nhảy lên", () => {
    expect(dem("data-anh-chinh")).toBe(3);
    expect(html).toContain('data-anh="a-1" data-anh-chinh');
  });

  it("dải ảnh không in ra — bảng mẫu vẫn in gọn nhiều mẫu một trang", () => {
    expect(dem("print:hidden")).toBe(dem("data-dai-anh"));
  });

  it("dòng đếm: màn hình chỉ khi còn ảnh chưa bày, bản in thì từ hai ảnh như cũ", () => {
    expect(html).toContain(">8 ảnh<");
    expect(html).toContain(">3 ảnh<");
    expect(html).not.toContain(">1 ảnh<");
    // Mẫu 3 ảnh: dải đã bày hết nên màn hình ẩn dòng đếm, bản in vẫn cần.
    expect(dem("hidden print:block")).toBe(1);
  });
});
