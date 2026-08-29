import { describe, it, expect } from "vitest";
import { docBoLocTuUrl } from "@/modules/catalog/search-query";

describe("docBoLocTuUrl", () => {
  it("tra ve bo loc rong khi khong co tham so", () => {
    expect(docBoLocTuUrl({})).toEqual({});
  });

  it("chuan hoa tu khoa ve dang khong dau chu thuong", () => {
    expect(docBoLocTuUrl({ q: "  Ghế Gỗ  " }).tuKhoa).toBe("ghe go");
  });

  it("bo qua tu khoa chi gom khoang trang", () => {
    expect(docBoLocTuUrl({ q: "   " }).tuKhoa).toBeUndefined();
  });

  it("doc khoang gia thanh so", () => {
    expect(docBoLocTuUrl({ gia_tu: "1000", gia_den: "5000" }))
      .toMatchObject({ giaTu: 1000, giaDen: 5000 });
  });

  it("bo qua khoang gia khong phai so", () => {
    expect(docBoLocTuUrl({ gia_tu: "abc" }).giaTu).toBeUndefined();
  });

  it("chi nhan trang thai hop le", () => {
    expect(docBoLocTuUrl({ trang_thai: "active" }).trangThai).toBe("active");
    expect(docBoLocTuUrl({ trang_thai: "linh tinh" }).trangThai).toBeUndefined();
  });

  it("doc co_anh dang chuoi ve boolean", () => {
    expect(docBoLocTuUrl({ co_anh: "1" }).coAnh).toBe(true);
    expect(docBoLocTuUrl({ co_anh: "0" }).coAnh).toBe(false);
    expect(docBoLocTuUrl({}).coAnh).toBeUndefined();
  });
});
