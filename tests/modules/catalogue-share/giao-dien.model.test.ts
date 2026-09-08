import { describe, expect, it } from "vitest";
import {
  GIAO_DIEN_MAC_DINH,
  THONG_SO,
  coThongSo,
  docGiaoDien,
  DAI_LOI_CHAO,
  DAI_TEN_KHACH,
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
    expect(docGiaoDien({ bia: { tenKhach: "  ", loiChao: "", tenSale: "" } }).bia).toBeNull();
    expect(docGiaoDien({ bia: {} }).bia).toBeNull();
    expect(docGiaoDien({ bia: "co" }).bia).toBeNull();
  });

  it("bia co chu thi giu, da cat khoang trang", () => {
    const g = docGiaoDien({ bia: { tenKhach: "  Chị Lan  ", loiChao: "Kính gửi chị" } });
    expect(g.bia).toEqual({ tenKhach: "Chị Lan", loiChao: "Kính gửi chị", tenSale: "" });
  });

  it("cat chuoi bia qua dai", () => {
    // Chuoi nay di thang ra trang khach dang mo. Khong chan do dai thi mot cu
    // dan nham ca trang van ban se pha vo bo cuc trang bia.
    const g = docGiaoDien({
      bia: { tenKhach: "a".repeat(500), loiChao: "b".repeat(1000), tenSale: "c" },
    });
    expect(g.bia!.tenKhach).toHaveLength(DAI_TEN_KHACH);
    expect(g.bia!.loiChao).toHaveLength(DAI_LOI_CHAO);
  });

  it("bo qua khoa la, khong chep no vao ket qua", () => {
    const g = docGiaoDien({ boCuc: "luoi", giaBan: 5_000_000, noiBo: "SO-123" });
    expect(Object.keys(g).sort()).toEqual(
      ["bia", "boCuc", "hien", "ngonNgu", "phienBan", "tone"],
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
