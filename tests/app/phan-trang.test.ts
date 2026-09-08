import { describe, expect, it } from "vitest";
import { SO_O_TOI_DA, cuaSoTrang } from "@/app/admin/catalogue-sheet/phan-trang";

describe("cuaSoTrang", () => {
  it("it trang thi hien het, khong don", () => {
    expect(cuaSoTrang(1, 3)).toEqual([1, 2, 3]);
    expect(cuaSoTrang(3, 3)).toEqual([1, 2, 3]);
  });

  it("dung bang so o toi da van hien het", () => {
    expect(cuaSoTrang(4, SO_O_TOI_DA)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it("nhieu trang thi LUON dung SO_O_TOI_DA o", () => {
    // Day so co lung linh lam ca thanh nhay ngang moi lan doi trang.
    for (const trang of [1, 2, 5, 10, 19, 20]) {
      expect(cuaSoTrang(trang, 20)).toHaveLength(SO_O_TOI_DA);
    }
  });

  it("trang dang xem nam giua khi con cho hai ben", () => {
    expect(cuaSoTrang(10, 20)).toEqual([7, 8, 9, 10, 11, 12, 13]);
  });

  it("sat dau thi day sang phai, khong tao so am", () => {
    expect(cuaSoTrang(1, 20)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(cuaSoTrang(2, 20)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it("sat cuoi thi day sang trai, khong vuot so trang", () => {
    expect(cuaSoTrang(20, 20)).toEqual([14, 15, 16, 17, 18, 19, 20]);
    expect(cuaSoTrang(19, 20)).toEqual([14, 15, 16, 17, 18, 19, 20]);
  });

  it("trang dang xem luon nam trong day", () => {
    for (let n = 1; n <= 30; n++) expect(cuaSoTrang(n, 30)).toContain(n);
  });

  it("chi co mot trang", () => {
    expect(cuaSoTrang(1, 1)).toEqual([1]);
  });
});
