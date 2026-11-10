import { describe, expect, it } from "vitest";
import {
  chonGocLink,
  duongDanCatalogue,
  tinNhanGuiKhach,
} from "@/modules/catalogue-share/duong-dan.model";

const TRINH_DUYET = "https://hpcatalogue.app";
const THUONG_HIEU = "https://catalogue.hungphatusa.com";

describe("chonGocLink", () => {
  it("dung dia chi da khai bao thay cho ten mien trinh duyet", () => {
    expect(chonGocLink(THUONG_HIEU, TRINH_DUYET)).toBe(THUONG_HIEU);
  });

  it("bo dau / o cuoi dia chi khai bao", () => {
    expect(chonGocLink(`${THUONG_HIEU}/`, TRINH_DUYET)).toBe(THUONG_HIEU);
  });

  it("lui ve ten mien trinh duyet khi chua khai bao", () => {
    expect(chonGocLink(undefined, TRINH_DUYET)).toBe(TRINH_DUYET);
    expect(chonGocLink("", TRINH_DUYET)).toBe(TRINH_DUYET);
  });

  it("lui ve ten mien trinh duyet khi dia chi khai bao khong phai http(s)", () => {
    expect(chonGocLink("catalogue.hungphatusa.com", TRINH_DUYET)).toBe(TRINH_DUYET);
    expect(chonGocLink("ftp://catalogue.hungphatusa.com", TRINH_DUYET)).toBe(TRINH_DUYET);
  });
});

describe("duongDanCatalogue", () => {
  it("ghep goc voi duong /catalogue/<slug>", () => {
    expect(duongDanCatalogue(THUONG_HIEU, "bo-suu-tap-kq25m4rk")).toBe(
      `${THUONG_HIEU}/catalogue/bo-suu-tap-kq25m4rk`,
    );
  });
});

describe("tinNhanGuiKhach", () => {
  const link = `${THUONG_HIEU}/catalogue/bo-suu-tap-phong-cach-nu-kq25m4rk`;
  const tin = tinNhanGuiKhach(link);

  it("mo dau bang ten thuong hieu", () => {
    expect(tin.startsWith("Hung Phat")).toBe(true);
  });

  it("chua nguyen ven link", () => {
    expect(tin).toContain(link);
  });

  it("khong dinh dau cau ngay sau link", () => {
    // May dien thoai gop dau "." hay "," lien sau vao link -> khach mo ra 404.
    const sau = tin.charAt(tin.indexOf(link) + link.length);
    expect(sau === "" || /\s/.test(sau)).toBe(true);
  });

  it("co cach tu choi nhan tin", () => {
    expect(tin).toMatch(/Reply STOP/);
  });

  it("chi dung ky tu ASCII", () => {
    // Mot ky tu co dau thoi la ca tin chuyen sang ma Unicode: 70 ky tu/doan
    // thay vi 160, tin bi cat lam ba bon doan.
    expect(tin).toMatch(/^[\x20-\x7E\n]*$/);
  });
});
