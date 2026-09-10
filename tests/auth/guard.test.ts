import { describe, it, expect } from "vitest";
import { kiemTraQuyen, type NguoiDung } from "@/auth/guard";

const sale: NguoiDung = { id: "1", email: "a@b.c", fullName: "Sale", role: "sale", isActive: true };
const admin: NguoiDung = { ...sale, id: "2", role: "admin" };

describe("kiemTraQuyen", () => {
  it("tu choi khi chua dang nhap", () => {
    expect(kiemTraQuyen(null, false)).toEqual({ cho_phep: false, ly_do: "chua_dang_nhap" });
  });

  it("tu choi tai khoan bi vo hieu hoa", () => {
    expect(kiemTraQuyen({ ...sale, isActive: false }, false))
      .toEqual({ cho_phep: false, ly_do: "bi_vo_hieu_hoa" });
  });

  it("cho sale vao route khong doi quyen admin", () => {
    expect(kiemTraQuyen(sale, false)).toEqual({ cho_phep: true, user: sale });
  });

  it("chan sale khoi route doi quyen admin", () => {
    expect(kiemTraQuyen(sale, true)).toEqual({ cho_phep: false, ly_do: "khong_du_quyen" });
  });

  it("cho admin vao route doi quyen admin", () => {
    expect(kiemTraQuyen(admin, true)).toEqual({ cho_phep: true, user: admin });
  });

  it("uu tien ly do vo hieu hoa hon ly do thieu quyen", () => {
    expect(kiemTraQuyen({ ...sale, isActive: false }, true))
      .toEqual({ cho_phep: false, ly_do: "bi_vo_hieu_hoa" });
  });
});
