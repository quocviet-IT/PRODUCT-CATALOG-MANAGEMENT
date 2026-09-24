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

const { thongSo } = await import("@/app/catalogue/[slug]/bo-cuc-chung");
const { ThanCatalogue } = await import("@/app/catalogue/[slug]/bo-cuc");

const t = boChu("vi");

const MAU: MucCatalogue = {
  maMau: "D101",
  loaiSp: "NHẪN",
  chatLieu: "Vàng 18K",
  mau: null,
  size: null,
  tlVang: 2.4,
  anh: [{ fileId: "a-1", ten: "IMG_1.jpg" }],
  thongSoThem: [
    { nhan: "Đá chính", giaTri: "Kim cương 5 ly" },
    { nhan: "Khắc tên", giaTri: "Miễn phí" },
  ],
};

function gd(hien?: Partial<GiaoDienCatalogue["hien"]>, boCuc: BoCuc = "danh-sach"): GiaoDienCatalogue {
  return { ...GIAO_DIEN_MAC_DINH, boCuc, hien: { ...GIAO_DIEN_MAC_DINH.hien, ...hien } };
}

describe("thông số sale tự điền — hàm thongSo", () => {
  it("nối vào SAU thông số của bảng tính, đúng thứ tự sale gõ", () => {
    expect(thongSo(MAU, gd(), t)).toEqual([
      [t.catalogue_sheet.cot_loai_sp, "NHẪN"],
      [t.catalogue_sheet.cot_chat_lieu, "Vàng 18K"],
      [t.catalogue_sheet.cot_tl_vang, "2,40 g"],
      // Phần tử thứ ba đánh dấu dòng sale gõ, để bố cục chỉ hiện giá trị kéo nhãn theo.
      ["Đá chính", "Kim cương 5 ly", true],
      ["Khắc tên", "Miễn phí", true],
    ]);
  });

  it("ô tích Thông số chỉ điều khiển cột của bảng tính, không đụng dòng sale gõ", () => {
    // Sale gõ tay nghĩa là họ CỐ Ý muốn khách thấy; tắt hết ô tích vẫn còn hai dòng đó.
    expect(thongSo(MAU, gd({ loaiSp: false, chatLieu: false, tlVang: false }), t)).toEqual([
      ["Đá chính", "Kim cương 5 ly", true],
      ["Khắc tên", "Miễn phí", true],
    ]);
  });

  it("mẫu không gõ gì thì không đổi gì", () => {
    expect(thongSo({ ...MAU, thongSoThem: undefined }, gd(), t)).toHaveLength(3);
  });
});

describe("thông số sale tự điền — hiện ở mọi bố cục", () => {
  it.each(BO_CUC)("%s: khách thấy cả nhãn lẫn giá trị", (boCuc) => {
    const html = renderToStaticMarkup(
      createElement(ThanCatalogue, { muc: [MAU], g: gd({}, boCuc), t }),
    );
    expect(html).toContain("Đá chính");
    expect(html).toContain("Kim cương 5 ly");
  });
});
