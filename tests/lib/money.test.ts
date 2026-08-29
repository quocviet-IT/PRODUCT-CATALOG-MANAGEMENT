import { describe, it, expect } from "vitest";
import { dinhDangTien } from "@/lib/money";

describe("dinhDangTien", () => {
  it("dinh dang VND theo kieu Viet Nam", () => {
    expect(dinhDangTien(2500000, "VND")).toBe("2.500.000 ₫");
  });
  it("lam tron VND ve so nguyen", () => {
    expect(dinhDangTien(2500000.6, "VND")).toBe("2.500.001 ₫");
  });
  it("xu ly so khong", () => {
    expect(dinhDangTien(0, "VND")).toBe("0 ₫");
  });
  it("lam tron nua don vi ra xa so 0, ke ca so am", () => {
    expect(dinhDangTien(2500000.5, "VND")).toBe("2.500.001 ₫");
    expect(dinhDangTien(-2500000.5, "VND")).toBe("-2.500.001 ₫");
  });

  it("khong bao gio in ra so 0 am", () => {
    expect(dinhDangTien(-0.4, "VND")).toBe("0 ₫");
    expect(dinhDangTien(-0, "VND")).toBe("0 ₫");
  });

  it("dinh dang so am binh thuong", () => {
    expect(dinhDangTien(-500000, "VND")).toBe("-500.000 ₫");
  });
  it("dinh dang USD co hai chu so thap phan", () => {
    expect(dinhDangTien(1234.5, "USD")).toBe("$1,234.50");
  });
});
