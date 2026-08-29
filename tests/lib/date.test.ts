import { describe, it, expect } from "vitest";
import { dinhDangNgay } from "@/lib/date";

describe("dinhDangNgay", () => {
  it("dinh dang dd/mm/yyyy", () => {
    expect(dinhDangNgay(new Date(Date.UTC(2026, 7, 28)))).toBe("28/08/2026");
  });
  it("them so khong o dau cho ngay va thang mot chu so", () => {
    expect(dinhDangNgay(new Date(Date.UTC(2026, 0, 5)))).toBe("05/01/2026");
  });
});
