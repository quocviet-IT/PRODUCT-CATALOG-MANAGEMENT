import { describe, it, expect } from "vitest";
import {
  DAI_NOI_DUNG_TOI_DA,
  DAI_DUONG_DAN_TOI_DA,
  chuanHoaDuongDan,
  kiemTraGopY,
  laLoaiGopY,
  laTrangThaiGopY,
} from "@/modules/gop-y/gop-y.model";

describe("kiemTraGopY", () => {
  it("nhan mot gop y binh thuong", () => {
    expect(kiemTraGopY("Bấm Tạo link thì không thấy gì xảy ra.")).toBeNull();
  });

  it("tu choi noi dung rong hoac qua ngan", () => {
    // "loi" hay "." khong giup ai sua duoc gi, ma nguoi go se khong bao gio
    // biet no vo ich neu he thong cu nhan.
    expect(kiemTraGopY("")).toBe("thieu_noi_dung");
    expect(kiemTraGopY("   ")).toBe("thieu_noi_dung");
    expect(kiemTraGopY("lỗi")).toBe("thieu_noi_dung");
  });

  it("dem do dai SAU khi cat khoang trang hai dau", () => {
    expect(kiemTraGopY("   ok    ")).toBe("thieu_noi_dung");
    expect(kiemTraGopY(`   ${"a".repeat(DAI_NOI_DUNG_TOI_DA)}   `)).toBeNull();
  });

  it("tu choi noi dung qua dai", () => {
    expect(kiemTraGopY("a".repeat(DAI_NOI_DUNG_TOI_DA + 1))).toBe("noi_dung_qua_dai");
  });
});

describe("chuanHoaDuongDan", () => {
  it("giu duong dan binh thuong", () => {
    expect(chuanHoaDuongDan("/admin/catalogue-sheet")).toBe("/admin/catalogue-sheet");
  });

  it("BO chuoi truy van va neo", () => {
    // Chuoi truy van chua tu khoa tim kiem cua sale; mot bang gop y khong phai
    // cho de luu lai thoi quen lam viec cua tung nguoi.
    expect(chuanHoaDuongDan("/admin/catalogue-sheet?q=nhan+kim+cuong&trang=3"))
      .toBe("/admin/catalogue-sheet");
    expect(chuanHoaDuongDan("/admin/huong-dan#buoc-5")).toBe("/admin/huong-dan");
  });

  it("them dau gach dau neu thieu", () => {
    expect(chuanHoaDuongDan("admin/gop-y")).toBe("/admin/gop-y");
  });

  it("tra rong khi khong co gi", () => {
    expect(chuanHoaDuongDan("")).toBe("");
    expect(chuanHoaDuongDan("   ")).toBe("");
  });

  it("cat mot duong dan dai bat thuong", () => {
    const d = chuanHoaDuongDan("/" + "a".repeat(DAI_DUONG_DAN_TOI_DA * 2));
    expect(d.length).toBe(DAI_DUONG_DAN_TOI_DA);
  });
});

describe("laLoaiGopY / laTrangThaiGopY", () => {
  it("chi nhan dung cac gia tri co that", () => {
    expect(laLoaiGopY("hong")).toBe(true);
    expect(laLoaiGopY("y-kien")).toBe(true);
    expect(laLoaiGopY("khac")).toBe(false);
    expect(laTrangThaiGopY("moi")).toBe(true);
    expect(laTrangThaiGopY("da-xu-ly")).toBe(true);
    expect(laTrangThaiGopY("dang-xem")).toBe(false);
  });
});
