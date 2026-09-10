import { describe, it, expect } from "vitest";
import {
  DAI_TEN_VAI_TRO_TOI_DA,
  DAI_MA_VAI_TRO_TOI_DA,
  kiemTraVaiTro,
  laMucQuyen,
  maTuTen,
  tenVaiTro,
  type VaiTro,
} from "@/modules/nguoi-dung/nguoi-dung.model";

describe("maTuTen", () => {
  it("bo dau tieng Viet", () => {
    expect(maTuTen("Giám sát nội bộ")).toBe("giam-sat-noi-bo");
    expect(maTuTen("Kế toán trưởng")).toBe("ke-toan-truong");
  });

  it("xu ly duoc chu D gach ngang", () => {
    expect(maTuTen("Điều phối")).toBe("dieu-phoi");
  });

  it("gop khoang trang va ky tu la thanh MOT gach", () => {
    expect(maTuTen("R & D")).toBe("r-d");
    expect(maTuTen("Sale   —   Miền Bắc")).toBe("sale-mien-bac");
  });

  it("khong de lai gach thua o hai dau", () => {
    expect(maTuTen("  Thực tập sinh  ")).toBe("thuc-tap-sinh");
    expect(maTuTen("(Sale)")).toBe("sale");
  });

  it("cat dung do dai va khong ket thuc bang gach", () => {
    // Cat cung o gioi han co the roi dung vao mot dau gach — mot ma ket thuc
    // bang "-" trong nhu bi cat cut.
    const ma = maTuTen("a".repeat(DAI_MA_VAI_TRO_TOI_DA) + " b");
    expect(ma.length).toBeLessThanOrEqual(DAI_MA_VAI_TRO_TOI_DA);
    expect(ma.endsWith("-")).toBe(false);
  });

  it("tra chuoi rong khi ten khong con chu nao", () => {
    expect(maTuTen("###")).toBe("");
    expect(maTuTen("   ")).toBe("");
  });
});

describe("kiemTraVaiTro", () => {
  it("nhan mot vai tro binh thuong", () => {
    expect(kiemTraVaiTro({ ten: "Giám sát nội bộ", tenEn: "Internal Audit" })).toBeNull();
  });

  it("cho phep bo trong ten tieng Anh", () => {
    // Bat admin dich moi vai tro truoc khi luu duoc thi ho se go tieng Viet
    // vao o tieng Anh — te hon la de trong va tu lui ve ban tieng Viet.
    expect(kiemTraVaiTro({ ten: "Thực tập sinh", tenEn: "" })).toBeNull();
  });

  it("tu choi ten rong", () => {
    expect(kiemTraVaiTro({ ten: "   ", tenEn: "Intern" })).toBe("thieu_ten_vai_tro");
  });

  it("tu choi ten qua dai, ca tieng Viet lan tieng Anh", () => {
    const dai = "a".repeat(DAI_TEN_VAI_TRO_TOI_DA + 1);
    expect(kiemTraVaiTro({ ten: dai, tenEn: "" })).toBe("ten_vai_tro_qua_dai");
    expect(kiemTraVaiTro({ ten: "Sale", tenEn: dai })).toBe("ten_vai_tro_qua_dai");
  });

  it("tu choi ten khong sinh ra duoc ma", () => {
    expect(kiemTraVaiTro({ ten: "###", tenEn: "" })).toBe("ma_vai_tro_khong_hop_le");
  });
});

describe("tenVaiTro", () => {
  const v = (p: Partial<VaiTro>): VaiTro => ({
    ma: "gsnb", ten: "Giám sát nội bộ", tenEn: "Internal Audit",
    mucQuyen: "sale", heThong: false, thuTu: 2, ...p,
  });

  it("lay ban tieng Anh o che do tieng Anh", () => {
    expect(tenVaiTro(v({}), true)).toBe("Internal Audit");
  });

  it("lui ve tieng Viet khi chua co ban dich", () => {
    // Man hinh tieng Anh hien ten tieng Viet van doc duoc; hien o TRONG thi
    // khong.
    expect(tenVaiTro(v({ tenEn: "" }), true)).toBe("Giám sát nội bộ");
    expect(tenVaiTro(v({ tenEn: "   " }), true)).toBe("Giám sát nội bộ");
  });

  it("luon lay tieng Viet o che do tieng Viet", () => {
    expect(tenVaiTro(v({}), false)).toBe("Giám sát nội bộ");
  });
});

describe("laMucQuyen", () => {
  it("chi nhan dung hai bac he thong cuong che duoc", () => {
    expect(laMucQuyen("admin")).toBe(true);
    expect(laMucQuyen("sale")).toBe(true);
    // Mot bac thu ba khong duoc phep lot qua: khong cua gac nao kiem tra no.
    expect(laMucQuyen("gsnb")).toBe(false);
    expect(laMucQuyen("")).toBe(false);
  });
});
