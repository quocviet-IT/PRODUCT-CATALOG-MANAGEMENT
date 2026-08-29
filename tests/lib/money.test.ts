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
  it("dinh dang USD co hai chu so thap phan", () => {
    expect(dinhDangTien(1234.5, "USD")).toBe("$1,234.50");
  });
});
