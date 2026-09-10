import { describe, it, expect } from "vitest";
import { kiemTraQuyen, type NguoiDung } from "@/auth/guard";

const sale: NguoiDung = {
  id: "1", email: "a@b.c", fullName: "Sale",
  role: "sale", mucQuyen: "sale", isActive: true,
};
const admin: NguoiDung = { ...sale, id: "2", role: "admin", mucQuyen: "admin" };

/**
 * Vai tro do admin tu them (GSNB) mang bac quyen quan tri. Day la truong hop
 * `role` va `mucQuyen` KHONG con trung nhau — chinh la truong hop mot cua gac
 * viet nham `role === "admin"` se lam sai.
 */
const gsnb: NguoiDung = { ...sale, id: "3", role: "gsnb", mucQuyen: "admin" };
const rnd: NguoiDung = { ...sale, id: "4", role: "r-d", mucQuyen: "sale" };

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

  it("cho vai tro tu dat mang bac quyen admin vao route admin", () => {
    // Cua gac phai doc muc quyen, khong doc ten vai tro. Neu ai do doi lai
    // thanh so sanh `role === "admin"` thi dong nay do.
    expect(kiemTraQuyen(gsnb, true)).toEqual({ cho_phep: true, user: gsnb });
  });

  it("chan vai tro tu dat mang bac quyen sale khoi route admin", () => {
    expect(kiemTraQuyen(rnd, true)).toEqual({ cho_phep: false, ly_do: "khong_du_quyen" });
  });

  it("tai khoan bi khoa van bi chan du mang bac quyen admin", () => {
    expect(kiemTraQuyen({ ...gsnb, isActive: false }, true))
      .toEqual({ cho_phep: false, ly_do: "bi_vo_hieu_hoa" });
  });
});
