import { describe, expect, it } from "vitest";
import { NHAN, NHAN_GOI_Y, TONE } from "@/modules/catalogue-share/giao-dien.model";

describe("NHAN_GOI_Y — mau nhan di kem tong moi", () => {
  it("bon tong moi deu co goi y, va goi y la mot mau nhan hop le", () => {
    for (const k of ["hoa-van", "champagne", "bach-kim", "hong-phan"] as const) {
      expect(TONE).toContain(k);
      expect(NHAN).toContain(NHAN_GOI_Y[k]);
    }
  });

  it("bon tong cu KHONG co goi y: chon lai chung khong am tham doi mau nhan sale da chon", () => {
    for (const k of ["beige", "trang", "toi", "reu"] as const) {
      expect(NHAN_GOI_Y[k]).toBeUndefined();
    }
  });

  it("dung nhu mo ta da duyet: champagne voi vang dong, bach kim voi xanh co vit", () => {
    expect(NHAN_GOI_Y.champagne).toBe("dong");
    expect(NHAN_GOI_Y["bach-kim"]).toBe("luc");
    expect(NHAN_GOI_Y["hoa-van"]).toBe("hong");
  });
});
