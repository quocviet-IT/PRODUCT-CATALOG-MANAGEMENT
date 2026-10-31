import { describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { boChu } from "@/messages";

vi.mock("@/messages/dung-chu", async () => {
  const { boChu: bo } = await import("@/messages");
  return { useChu: () => bo("vi") };
});

const { KhungXemAnh } = await import("@/ui/khung-xem-anh");

const t = boChu("vi");

const anh = (n: number) =>
  Array.from({ length: n }, (_, i) => ({ fileId: `a${i + 1}`, ten: `IMG_${i + 1}.jpg` }));

const ve = (soAnh: number, viTri = 0) =>
  renderToStaticMarkup(
    createElement(KhungXemAnh, {
      anh: anh(soAnh),
      viTri,
      datViTri: () => {},
      dong: () => {},
    }),
  );

describe("KhungXemAnh", () => {
  it("hien dung tam dang xem, lay ban 1400px", () => {
    expect(ve(7, 2)).toContain("/api/anh-drive/a3?w=1400");
  });

  it("co nut qua lai va so dem khi bo co nhieu hon mot tam", () => {
    const html = ve(7, 2);
    expect(html).toContain(t.chia_se.anh_truoc);
    expect(html).toContain(t.chia_se.anh_sau);
    expect(html).toContain("3 / 7");
  });

  it("bo chi co MOT tam thi khong bay nut qua lai — bam vao cung quay ve chinh no", () => {
    const html = ve(1);
    expect(html).not.toContain(t.chia_se.anh_truoc);
    expect(html).not.toContain(" / 1");
  });

  it("luon co nut dong, ke ca khi chi mot tam", () => {
    expect(ve(1)).toContain(t.chia_se.dong_anh);
  });

  it("vi tri tro ra ngoai danh sach thi khong ve gi, khong vo", () => {
    // Anh bi xoa khoi thu muc trong luc dang mo khung xem.
    expect(ve(3, 9)).toBe("");
  });

  it("la mot hop thoai, co nhan ten tep cho trinh doc man hinh", () => {
    const html = ve(7, 2);
    expect(html).toContain('role="dialog"');
    expect(html).toContain('aria-modal="true"');
    expect(html).toContain("IMG_3.jpg");
  });
});
