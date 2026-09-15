import { describe, expect, it, vi } from "vitest";
import { createElement, type ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { boChu } from "@/messages";
import type { MucCatalogue } from "@/modules/catalogue-share/chia-se.model";
import {
  GIAO_DIEN_MAC_DINH,
  type BoCuc,
  type GiaoDienCatalogue,
} from "@/modules/catalogue-share/giao-dien.model";
import type { DoiSo } from "@/app/catalogue/[slug]/bo-cuc-chung";

// AnhTai doc ngon ngu qua useChu; module that keo theo server action (next/headers).
vi.mock("@/messages/dung-chu", async () => {
  const { boChu: bo } = await import("@/messages");
  return { useChu: () => bo("vi") };
});

import { KhungArtDeco } from "@/app/catalogue/[slug]/bo-cuc-xu-huong";

const t = boChu("vi");

const anh = (n: number, tien: string) =>
  Array.from({ length: n }, (_, i) => ({ fileId: `${tien}-${i + 1}`, ten: `IMG_${i + 1}.jpg` }));

/** Ba mau: 3 anh du thong so; 1 anh thieu loai SP; 6 anh thieu ma mau. */
const MUC: MucCatalogue[] = [
  { maMau: "D101", loaiSp: "NHẪN", chatLieu: "Vàng 18K", mau: "Vàng", size: "6", tlVang: 2.4, anh: anh(3, "a"), gioiThieu: "Nhẫn cưới đan tay." },
  { maMau: "D102", loaiSp: null, chatLieu: "Vàng trắng 14K", mau: null, size: null, tlVang: null, anh: anh(1, "b") },
  { maMau: null, loaiSp: "DÂY CHUYỀN", chatLieu: null, mau: null, size: null, tlVang: 5.1, anh: anh(6, "c") },
];

function ve(
  Comp: (p: DoiSo) => ReactElement,
  boCuc: BoCuc,
  hien?: Partial<GiaoDienCatalogue["hien"]>,
): string {
  const g: GiaoDienCatalogue = { ...GIAO_DIEN_MAC_DINH, boCuc, hien: { ...GIAO_DIEN_MAC_DINH.hien, ...hien } };
  return renderToStaticMarkup(createElement(Comp, { muc: MUC, g, t }));
}

const dem = (html: string, chuoi: string) => html.split(chuoi).length - 1;

describe("Khung Art Deco", () => {
  const html = ve(KhungArtDeco, "art-deco");

  it("gốc mang data-bo-cuc, mỗi mẫu một data-muc", () => {
    expect(dem(html, 'data-bo-cuc="art-deco"')).toBe(1);
    expect(dem(html, "data-muc=")).toBe(3);
  });

  it("huy hiệu chỉ ở mẫu có từ hai ảnh và chứa đúng ảnh thứ hai", () => {
    expect(dem(html, "data-huy-hieu")).toBe(2);
    expect(html).toContain('data-anh="a-2"');
    expect(html).toContain('data-anh="c-2"');
    expect(html).not.toContain('data-anh="a-3"');
    expect(html).not.toContain('data-anh="c-3"');
  });

  it("đếm số ảnh khi mẫu có hơn một ảnh", () => {
    expect(html).toContain(">3 ảnh<");
    expect(html).toContain(">6 ảnh<");
    expect(html).not.toContain(">1 ảnh<");
  });

  it("mã mẫu làm tiêu đề; mẫu thiếu mã hiện chữ thay thế", () => {
    expect(html).toContain(">D101<");
    expect(html).toContain(`>${t.catalogue_sheet.chua_co_ma_mau}<`);
  });

  it("thông số bị ẩn không lọt ra; lời giới thiệu có mặt", () => {
    expect(html).toContain("2,40 g");
    expect(html).toContain("Nhẫn cưới đan tay.");
    expect(ve(KhungArtDeco, "art-deco", { tlVang: false })).not.toContain("2,40 g");
  });
});
