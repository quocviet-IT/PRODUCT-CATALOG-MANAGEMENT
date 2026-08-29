import { describe, it, expect } from "vitest";
import { boDau, chuanHoaTimKiem, dungSearchText } from "@/lib/vietnamese";

describe("boDau", () => {
  it("bo dau thanh va dau mu", () => {
    expect(boDau("Ghế gỗ sồi")).toBe("Ghe go soi");
  });
  it("chuyen d gach ngang thanh d", () => {
    expect(boDau("Đèn đứng")).toBe("Den dung");
  });
  it("giu nguyen chuoi khong dau", () => {
    expect(boDau("Sofa 3 cho")).toBe("Sofa 3 cho");
  });
  it("xu ly du 12 nguyen am co dau", () => {
    expect(boDau("àáảãạ ăằắẳẵặ âầấẩẫậ")).toBe("aaaaa aaaaaa aaaaaa");
    expect(boDau("èéẻẽẹ êềếểễệ")).toBe("eeeee eeeeee");
    expect(boDau("òóỏõọ ôồốổỗộ ơờớởỡợ")).toBe("ooooo oooooo oooooo");
    expect(boDau("ùúủũụ ưừứửữự")).toBe("uuuuu uuuuuu");
    expect(boDau("ìíỉĩị ỳýỷỹỵ")).toBe("iiiii yyyyy");
  });
});

describe("chuanHoaTimKiem", () => {
  it("bo dau, ha chu thuong va gop khoang trang", () => {
    expect(chuanHoaTimKiem("  Ghế   Gỗ  Sồi ")).toBe("ghe go soi");
  });
});

describe("dungSearchText", () => {
  it("gop ma, ten va mo ta", () => {
    expect(dungSearchText({ sku: "SP001", name: "Ghế gỗ sồi", description: "Chân Đen" }))
      .toBe("sp001 ghe go soi chan den");
  });
  it("chay duoc khi khong co mo ta", () => {
    expect(dungSearchText({ sku: "SP002", name: "Bàn trà" })).toBe("sp002 ban tra");
  });
});
