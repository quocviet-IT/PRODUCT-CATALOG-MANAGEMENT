import { describe, expect, it } from "vitest";
import {
  GIAO_DIEN_MAC_DINH,
  THONG_SO,
  coThongSo,
  docGiaoDien,
  DAI_DIEN_THOAI,
  DAI_LOI_CHAO,
  DAI_TEN_KHACH,
  DAI_TEN_SALE,
  soGoiDuoc,
} from "@/modules/catalogue-share/giao-dien.model";

describe("docGiaoDien", () => {
  it("cot rong cua catalogue cu doc ra dung bo mac dinh", () => {
    // Cot giao_dien mac dinh la {} — moi catalogue tao truoc khi co tinh nang
    // nay deu di qua duong nay, va phai hien Y HET luc no duoc gui cho khach.
    expect(docGiaoDien({})).toEqual(GIAO_DIEN_MAC_DINH);
  });

  it("khong nem loi voi gia tri la", () => {
    for (const tho of [null, undefined, 0, "", "beige", [], true]) {
      expect(docGiaoDien(tho)).toEqual(GIAO_DIEN_MAC_DINH);
    }
  });

  it("bo cuc va tone la thi lui ve mac dinh, khong lam hong ca bo", () => {
    const g = docGiaoDien({ boCuc: "ban-do-kho-bau", tone: "cau-vong", ngonNgu: "fr" });
    expect(g.boCuc).toBe("danh-sach");
    expect(g.tone).toBe("beige");
    expect(g.ngonNgu).toBe("vi");
  });

  it("giu lua chon hop le", () => {
    const g = docGiaoDien({ boCuc: "lookbook", tone: "toi", ngonNgu: "en" });
    expect(g.boCuc).toBe("lookbook");
    expect(g.tone).toBe("toi");
    expect(g.ngonNgu).toBe("en");
  });

  it("thieu mot khoa trong hien thi BAT khoa do", () => {
    // Quan trong: mot ban ghi cu chi co vai khoa khong duoc bien thanh mot
    // catalogue giau mat thong so ma khach truoc do van thay.
    const g = docGiaoDien({ hien: { tlVang: false } });
    expect(g.hien.tlVang).toBe(false);
    expect(g.hien.loaiSp).toBe(true);
    expect(g.hien.size).toBe(true);
  });

  it("chi dung false moi tat, gia tri la khong tat nham", () => {
    const g = docGiaoDien({ hien: { loaiSp: "khong", chatLieu: 0, mau: null } });
    expect(g.hien.loaiSp).toBe(true);
    expect(g.hien.chatLieu).toBe(true);
    expect(g.hien.mau).toBe(true);
  });

  it("bia toan chuoi rong thi khong phai bia", () => {
    expect(docGiaoDien({ bia: { tenKhach: "  ", loiChao: "" } }).bia).toBeNull();
    expect(docGiaoDien({ bia: {} }).bia).toBeNull();
    expect(docGiaoDien({ bia: "co" }).bia).toBeNull();
  });

  it("bia co chu thi giu, da cat khoang trang", () => {
    const g = docGiaoDien({ bia: { tenKhach: "  Chị Lan  ", loiChao: "Kính gửi chị" } });
    expect(g.bia).toEqual({ tenKhach: "Chị Lan", loiChao: "Kính gửi chị" });
  });

  it("cat chuoi bia qua dai", () => {
    // Chuoi nay di thang ra trang khach dang mo. Khong chan do dai thi mot cu
    // dan nham ca trang van ban se pha vo bo cuc trang bia.
    const g = docGiaoDien({
      bia: { tenKhach: "a".repeat(500), loiChao: "b".repeat(1000) },
    });
    expect(g.bia!.tenKhach).toHaveLength(DAI_TEN_KHACH);
    expect(g.bia!.loiChao).toHaveLength(DAI_LOI_CHAO);
  });

  it("bo qua khoa la, khong chep no vao ket qua", () => {
    const g = docGiaoDien({ boCuc: "luoi", giaBan: 5_000_000, noiBo: "SO-123" });
    expect(Object.keys(g).sort()).toEqual(
      ["bia", "boCuc", "hien", "lienHe", "ngonNgu", "phienBan", "tone"],
    );
  });

  it("phienBan luon la 1 du dau vao noi gi", () => {
    expect(docGiaoDien({ phienBan: 99 }).phienBan).toBe(1);
  });
});

describe("coThongSo", () => {
  it("mac dinh la co", () => {
    expect(coThongSo(GIAO_DIEN_MAC_DINH)).toBe(true);
  });

  it("tat het thi khong con", () => {
    const hien = Object.fromEntries(THONG_SO.map((k) => [k, false]));
    expect(coThongSo(docGiaoDien({ hien }))).toBe(false);
  });
});

describe("docGiaoDien — khối liên hệ", () => {
  it("không có gì thì null", () => {
    expect(docGiaoDien({}).lienHe).toBeNull();
    expect(docGiaoDien({ lienHe: {} }).lienHe).toBeNull();
    expect(docGiaoDien({ lienHe: "0909" }).lienHe).toBeNull();
  });

  it("giữ tên và điện thoại, đã cắt khoảng trắng", () => {
    const g = docGiaoDien({ lienHe: { ten: " Ngọc Anh ", dienThoai: " 0909 123 456 " } });
    expect(g.lienHe).toEqual({ ten: "Ngọc Anh", dienThoai: "0909 123 456" });
  });

  it("chỉ có điện thoại vẫn là một khối liên hệ hợp lệ", () => {
    expect(docGiaoDien({ lienHe: { dienThoai: "0909123456" } }).lienHe).toEqual({
      ten: "",
      dienThoai: "0909123456",
    });
  });

  it("BẢN GHI CŨ: tên người tư vấn nằm trong bia.tenSale thì phải lấy ra", () => {
    // Catalogue tạo trước 08/09/2026 lưu tên người tư vấn ở bia.tenSale. Bỏ qua
    // là những link đã gửi mất một dòng thông tin mà không ai biết.
    const g = docGiaoDien({ bia: { tenKhach: "Chị Lan", tenSale: "Ngọc Anh" } });
    expect(g.lienHe).toEqual({ ten: "Ngọc Anh", dienThoai: "" });
    expect(g.bia).toEqual({ tenKhach: "Chị Lan", loiChao: "" });
  });

  it("có lienHe mới thì KHÔNG lấy tên cũ nữa", () => {
    const g = docGiaoDien({
      bia: { tenKhach: "Chị Lan", tenSale: "Tên cũ" },
      lienHe: { ten: "Tên mới", dienThoai: "0909" },
    });
    expect(g.lienHe).toEqual({ ten: "Tên mới", dienThoai: "0909" });
  });

  it("cắt chuỗi quá dài", () => {
    const g = docGiaoDien({
      lienHe: { ten: "a".repeat(200), dienThoai: "9".repeat(200) },
    });
    expect(g.lienHe!.ten).toHaveLength(DAI_TEN_SALE);
    expect(g.lienHe!.dienThoai).toHaveLength(DAI_DIEN_THOAI);
  });
});

describe("soGoiDuoc", () => {
  it("bỏ mọi thứ không phải chữ số", () => {
    expect(soGoiDuoc("0909 123 456")).toBe("0909123456");
    expect(soGoiDuoc("(408) 555-0199")).toBe("4085550199");
    expect(soGoiDuoc("0909.123.456")).toBe("0909123456");
  });

  it("giữ dấu + ở đầu — số quốc tế gọi được, thiếu dấu + là gọi sai nước", () => {
    expect(soGoiDuoc("+84 909 123 456")).toBe("+84909123456");
    expect(soGoiDuoc(" +1 408 555 0199 ")).toBe("+14085550199");
  });

  it("dấu + ở giữa không phải mã quốc gia nên bỏ", () => {
    expect(soGoiDuoc("0909+123")).toBe("0909123");
  });

  it("không có chữ số nào thì trả chuỗi rỗng", () => {
    expect(soGoiDuoc("")).toBe("");
    expect(soGoiDuoc("gọi em nhé")).toBe("");
    expect(soGoiDuoc("+")).toBe("");
  });
});
