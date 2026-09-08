import { describe, expect, it } from "vitest";
import {
  SO_NGAY_SONG,
  conMoDuoc,
  hetHanTu,
  soNgayConLai,
  trangThaiLink,
} from "@/modules/catalogue-share/hieu-luc.model";

const NGAY = 24 * 60 * 60 * 1000;
const LUC = new Date("2026-09-08T10:00:00Z");
const sau = (n: number) => new Date(LUC.getTime() + n * NGAY);

describe("hetHanTu", () => {
  it("cong dung SO_NGAY_SONG ngay", () => {
    expect(hetHanTu(LUC).getTime()).toBe(LUC.getTime() + SO_NGAY_SONG * NGAY);
  });
});

describe("trangThaiLink", () => {
  const hetHan = hetHanTu(LUC);

  it("moi tao thi mo", () => {
    expect(trangThaiLink(hetHan, null, LUC)).toBe("mo");
  });

  it("truoc han mot ngay van mo", () => {
    expect(trangThaiLink(hetHan, null, sau(SO_NGAY_SONG - 1))).toBe("mo");
  });

  it("dung luc het han la het han — khong con mo them mot giay nao", () => {
    expect(trangThaiLink(hetHan, null, hetHan)).toBe("het-han");
  });

  it("qua han thi het han", () => {
    expect(trangThaiLink(hetHan, null, sau(SO_NGAY_SONG + 1))).toBe("het-han");
  });

  it("khoa tay thi khoa, du con han", () => {
    expect(trangThaiLink(hetHan, sau(1), sau(2))).toBe("khoa");
  });

  it("vua khoa vua het han thi bao KHOA", () => {
    // Khoa la thu nguoi dung chu dong lam; bao "het han" se lam ho tuong nut
    // khoa khong an gi.
    expect(trangThaiLink(hetHan, sau(1), sau(SO_NGAY_SONG + 5))).toBe("khoa");
  });
});

describe("conMoDuoc", () => {
  const hetHan = hetHanTu(LUC);

  it("chi dung khi trang thai la mo", () => {
    expect(conMoDuoc(hetHan, null, LUC)).toBe(true);
    expect(conMoDuoc(hetHan, sau(1), sau(2))).toBe(false);
    expect(conMoDuoc(hetHan, null, sau(SO_NGAY_SONG))).toBe(false);
  });
});

describe("soNgayConLai", () => {
  const hetHan = hetHanTu(LUC);

  it("moi tao thi con dung so ngay quy dinh", () => {
    expect(soNgayConLai(hetHan, LUC)).toBe(SO_NGAY_SONG);
  });

  it("lam tron LEN: con vai tieng van la 1 ngay", () => {
    // "Con 0 ngay" ma link van mo duoc se lam sale tuong no chet va di tao lai.
    const conBaTieng = new Date(hetHan.getTime() - 3 * 60 * 60 * 1000);
    expect(soNgayConLai(hetHan, conBaTieng)).toBe(1);
  });

  it("het han thi 0, khong am", () => {
    expect(soNgayConLai(hetHan, hetHan)).toBe(0);
    expect(soNgayConLai(hetHan, sau(SO_NGAY_SONG + 30))).toBe(0);
  });
});
