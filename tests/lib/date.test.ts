import { describe, it, expect } from "vitest";
import { dinhDangNgay } from "@/lib/date";

describe("dinhDangNgay", () => {
  it("dinh dang dd/mm/yyyy", () => {
    expect(dinhDangNgay(new Date(Date.UTC(2026, 7, 28, 12, 0)))).toBe("28/08/2026");
  });

  it("them so khong o dau cho ngay va thang mot chu so", () => {
    expect(dinhDangNgay(new Date(Date.UTC(2026, 0, 5, 12, 0)))).toBe("05/01/2026");
  });

  /**
   * Hai ca duoi day dat sat ranh gioi ngay theo UTC theo hai huong nguoc nhau,
   * nen neu ai do doi getUTC* thanh getter gio may thi it nhat MOT ca se hong
   * o bat ky mui gio lech 0 nao. Neu chi dung moc nua dem UTC, test van xanh
   * tren may UTC+7 (Viet Nam) du ham da hong.
   */
  it("dung gio UTC chu khong dung gio may — moc cuoi ngay", () => {
    expect(dinhDangNgay(new Date(Date.UTC(2026, 7, 28, 23, 30)))).toBe("28/08/2026");
  });

  it("dung gio UTC chu khong dung gio may — moc dau ngay", () => {
    expect(dinhDangNgay(new Date(Date.UTC(2026, 0, 5, 0, 30)))).toBe("05/01/2026");
  });
});
