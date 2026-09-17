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

import { ChuLon, KhungArtDeco, TheTieuBan } from "@/app/catalogue/[slug]/bo-cuc-xu-huong";

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

/** Nhu `ve` nhung nhan danh sach mau rieng — dung khi test can them mau vao MUC goc. */
function veMuc(Comp: (p: DoiSo) => ReactElement, boCuc: BoCuc, muc: MucCatalogue[]): string {
  const g: GiaoDienCatalogue = { ...GIAO_DIEN_MAC_DINH, boCuc };
  return renderToStaticMarkup(createElement(Comp, { muc, g, t }));
}

/** Mau khong con anh nao — dungNoiDung() van giu mau khi file bi loc het (anh: []). */
const MAU_KHONG_ANH: MucCatalogue = {
  maMau: "D104",
  loaiSp: "NHẪN",
  chatLieu: null,
  mau: null,
  size: null,
  tlVang: null,
  anh: [],
};

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
  });

  it("ảnh từ thứ ba trở đi nằm trong dải nhỏ dưới ảnh chính", () => {
    // Mẫu 1 dư một ảnh, mẫu 3 dư bốn ảnh; mẫu 2 chỉ có ảnh chính nên không có dải.
    expect(dem(html, "data-dai-anh")).toBe(2);
    expect(dem(html, "data-anh=")).toBe(3 + 1 + 6);
    expect(html).toContain('data-anh="a-3"');
    expect(html).toContain('data-anh="c-6"');
  });

  it("dải ảnh không in ra — một mẫu vẫn gọn một tờ giấy", () => {
    expect(dem(html, "print:hidden")).toBe(dem(html, "data-dai-anh"));
    expect(dem(html, "print:hidden")).toBe(2);
  });

  it("dải bày hết ảnh thì dòng đếm chỉ còn trên bản in", () => {
    // Mẫu 3 ảnh và 6 ảnh: màn hình đã thấy đủ nên ẩn, nhưng bản in không có dải nên vẫn cần.
    expect(dem(html, "data-dem-anh")).toBe(2);
    expect(dem(html, "hidden print:block")).toBe(2);
    expect(html).toContain(">3 ảnh<");
    expect(html).toContain(">6 ảnh<");
    expect(html).not.toContain(">1 ảnh<");
  });

  it("dải ảnh dừng ở năm tấm; mẫu còn ảnh chưa hiện thì đếm cả trên màn hình", () => {
    const h = veMuc(KhungArtDeco, "art-deco", [{ ...MUC[0], maMau: "D105", anh: anh(9, "d") }]);
    expect(dem(h, "data-anh=")).toBe(7);
    expect(h).toContain('data-anh="d-7"');
    expect(h).not.toContain('data-anh="d-8"');
    expect(h).toContain(">9 ảnh<");
    expect(h).not.toContain("hidden print:block");
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

describe("Thẻ tiêu bản", () => {
  const html = ve(TheTieuBan, "tieu-ban");

  it("gốc là ul mang data-bo-cuc, mỗi mẫu một data-muc, không lặp dòng đếm số mẫu", () => {
    // React 19 SSR tự đẩy <link rel="preload"> cho <img> lên đầu chuỗi HTML (không
    // liên quan cây component) — bỏ các thẻ đó trước khi xét phần tử gốc thật sự.
    const noiDung = html.replace(/^(<link[^>]*\/>)*/, "");
    expect(noiDung.startsWith('<ul data-bo-cuc="tieu-ban"')).toBe(true);
    expect(dem(html, "data-muc=")).toBe(3);
    expect(html).not.toContain(">3 mẫu<");
  });

  it("nhãn: số đệm ba chữ số · mã mẫu · số ảnh khi hơn một ảnh", () => {
    expect(html).toContain(">Nº 001 · D101 · 3 ảnh<");
    expect(html).toContain(">Nº 002 · D102<");
    expect(html).toContain(`>Nº 003 · ${t.catalogue_sheet.chua_co_ma_mau} · 6 ảnh<`);
  });

  it("ảnh chính kèm dải nhỏ tối đa bốn tấm — thẻ hẹp, năm tấm thì nhỏ quá", () => {
    // Mẫu 3 ảnh bày đủ 3, mẫu 1 ảnh bày 1, mẫu 6 ảnh bày 1 + 4.
    expect(dem(html, "data-anh=")).toBe(3 + 1 + 5);
    expect(dem(html, "data-dai-anh")).toBe(2);
    expect(html).toContain('data-anh="c-5"');
    expect(html).not.toContain('data-anh="c-6"');
    expect(dem(html, "data-anh-chinh")).toBe(3);
  });

  it("dải ảnh không in ra — vẫn nhiều mẫu một trang", () => {
    expect(dem(html, "print:hidden")).toBe(dem(html, "data-dai-anh"));
  });

  it("thông số và lời giới thiệu có mặt", () => {
    expect(html).toContain("NHẪN · Vàng 18K");
    expect(html).toContain("Nhẫn cưới đan tay.");
  });
});

describe("Chữ lớn", () => {
  const html = ve(ChuLon, "chu-lon");
  const chuLon = (s: string) => [...s.matchAll(/data-chu-lon="true"[^>]*>([^<]*)</g)].map((x) => x[1]);

  it("gốc mang data-bo-cuc, mỗi mẫu một data-muc", () => {
    expect(dem(html, 'data-bo-cuc="chu-lon"')).toBe(1);
    expect(dem(html, "data-muc=")).toBe(3);
  });

  it("chữ lớn theo chuLonCuaMau: Loại SP, thiếu thì Chất liệu", () => {
    expect(chuLon(html)).toEqual(["NHẪN", "Vàng trắng 14K", "DÂY CHUYỀN"]);
  });

  it("ẩn Loại SP thì chữ lớn sang Chất liệu, thiếu nữa thì chữ thay cho mã mẫu", () => {
    expect(chuLon(ve(ChuLon, "chu-lon", { loaiSp: false }))).toEqual([
      "Vàng 18K", "Vàng trắng 14K", t.catalogue_sheet.chua_co_ma_mau,
    ]);
  });

  it("số thứ tự dạng 01 / 03 và tối đa bốn ảnh phụ", () => {
    expect(html).toContain(">01 / 03<");
    expect(html).toContain('data-anh="c-5"');
    expect(html).not.toContain('data-anh="c-6"');
  });

  it("thông số và lời giới thiệu có mặt", () => {
    expect(html).toContain("Nhẫn cưới đan tay.");
    expect(html).toContain(">D101<");
  });

  it("thông số có nhãn (mã mẫu chữ tiêu đề, không dùng MaMau)", () => {
    expect(html).toContain(`>${t.catalogue_sheet.cot_chat_lieu}<`);
    expect(html).toContain(">Vàng 18K<");
  });

  it('dòng "N ảnh" chỉ hiện khi mẫu có hơn năm ảnh', () => {
    expect(html).toContain(">6 ảnh<");
    expect(html).not.toContain(">3 ảnh<");
  });

  it("số thứ tự không còn là chữ màu nhấn", () => {
    expect(html).toMatch(/class="[^"]*text-hp-ink[^"]*">01 \/ 03</);
  });
});

describe("mẫu không có ảnh", () => {
  const mucVoiRong = [...MUC, MAU_KHONG_ANH];

  it("thẻ tiêu bản: giữ chỗ trống thay ảnh", () => {
    const html = veMuc(TheTieuBan, "tieu-ban", mucVoiRong);
    expect(dem(html, "data-muc=")).toBe(4);
    expect(html).toContain('aria-hidden="true" class="aspect-[4/3] bg-hp-plate"');
  });

  it("khung Art Deco: không huy hiệu cho mẫu trống, vẫn hiện mã mẫu", () => {
    const html = veMuc(KhungArtDeco, "art-deco", mucVoiRong);
    expect(dem(html, "data-muc=")).toBe(4);
    expect(dem(html, "data-huy-hieu")).toBe(2);
    expect(html).toContain(">D104<");
  });

  it("chữ lớn: mẫu trống vẫn có chữ lớn từ Loại SP", () => {
    const html = veMuc(ChuLon, "chu-lon", mucVoiRong);
    expect(dem(html, "data-muc=")).toBe(4);
    const chuLon = [...html.matchAll(/data-chu-lon="true"[^>]*>([^<]*)</g)].map((x) => x[1]);
    expect(chuLon[chuLon.length - 1]).toBe("NHẪN");
  });
});
