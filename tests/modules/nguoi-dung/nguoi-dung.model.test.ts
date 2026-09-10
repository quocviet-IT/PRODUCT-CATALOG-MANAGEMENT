import { describe, expect, it } from "vitest";
import {
  DAI_MAT_KHAU_TOI_THIEU,
  kiemTraMatKhau,
  kiemTraSuaDoi,
  kiemTraTaoTaiKhoan,
  suyRaCachDangNhap,
} from "@/modules/nguoi-dung/nguoi-dung.model";

const HOP_LE = { email: "an@ctyhp.vn", matKhau: "matkhau123", hoTen: "Nguyễn An" };

describe("kiemTraTaoTaiKhoan", () => {
  it("nhan du lieu hop le", () => {
    expect(kiemTraTaoTaiKhoan(HOP_LE)).toBeNull();
  });

  it("tu choi email sai dang", () => {
    for (const e of ["", "khongcodau", "a@b", "a b@c.vn", "@ctyhp.vn"]) {
      expect(kiemTraTaoTaiKhoan({ ...HOP_LE, email: e }), e).toBe("email_khong_hop_le");
    }
  });

  it("KHONG rang buoc ten mien — admin duoc tao tai khoan cho nguoi ngoai", () => {
    // Rang buoc ten mien chi ap cho duong dang nhap bang Google. Tai khoan do
    // admin tu tay tao la quyet dinh cua admin.
    expect(kiemTraTaoTaiKhoan({ ...HOP_LE, email: "doitac@gmail.com" })).toBeNull();
  });

  it("tu choi ho ten de trong", () => {
    expect(kiemTraTaoTaiKhoan({ ...HOP_LE, hoTen: "   " })).toBe("thieu_ho_ten");
  });

  it("tu choi mat khau ngan hon nguong", () => {
    expect(kiemTraTaoTaiKhoan({ ...HOP_LE, matKhau: "a".repeat(DAI_MAT_KHAU_TOI_THIEU - 1) }))
      .toBe("mat_khau_qua_ngan");
    expect(kiemTraTaoTaiKhoan({ ...HOP_LE, matKhau: "a".repeat(DAI_MAT_KHAU_TOI_THIEU) }))
      .toBeNull();
  });

  it("tu choi mat khau dai hon 72 ky tu", () => {
    // bcrypt chi doc 72 byte dau; dai hon thi phan thua bi bo lang le va nguoi
    // dung tuong mat khau cua minh dai hon thuc te.
    expect(kiemTraTaoTaiKhoan({ ...HOP_LE, matKhau: "a".repeat(73) })).toBe("mat_khau_qua_dai");
  });
});

describe("kiemTraMatKhau", () => {
  it("chi xet do dai", () => {
    expect(kiemTraMatKhau("a".repeat(8))).toBeNull();
    expect(kiemTraMatKhau("ngan")).toBe("mat_khau_qua_ngan");
  });
});

describe("kiemTraSuaDoi", () => {
  const TOI = "id-toi";
  const NGUOI_KHAC = "id-khac";

  it("chan admin tu khoa chinh minh", () => {
    // Chi admin moi mo duoc man hinh nay. Tu khoa minh lai la khong con ai vao
    // duoc de sua lai — phai dung den co so du lieu moi cuu.
    expect(kiemTraSuaDoi(TOI, TOI, { kieu: "khoa" })).toBe("tu_khoa_chinh_minh");
  });

  it("chan admin tu ha quyen chinh minh", () => {
    expect(kiemTraSuaDoi(TOI, TOI, { kieu: "doi-vai-tro", vaiTroMoi: "sale" }))
      .toBe("tu_ha_quyen_chinh_minh");
  });

  it("van cho tu doi mat khau cua chinh minh", () => {
    expect(kiemTraSuaDoi(TOI, TOI, { kieu: "doi-mat-khau" })).toBeNull();
  });

  it("van cho tu giu vai tro admin cua chinh minh", () => {
    expect(kiemTraSuaDoi(TOI, TOI, { kieu: "doi-vai-tro", vaiTroMoi: "admin" })).toBeNull();
  });

  it("khong chan gi khi tac dong len nguoi KHAC", () => {
    for (const td of [
      { kieu: "khoa" } as const,
      { kieu: "mo-khoa" } as const,
      { kieu: "doi-vai-tro", vaiTroMoi: "sale" } as const,
      { kieu: "doi-mat-khau" } as const,
    ]) {
      expect(kiemTraSuaDoi(TOI, NGUOI_KHAC, td)).toBeNull();
    }
  });
});

describe("suyRaCachDangNhap", () => {
  it("phan biet duoc bon truong hop", () => {
    expect(suyRaCachDangNhap(["google"])).toBe("google");
    expect(suyRaCachDangNhap(["email"])).toBe("mat-khau");
    expect(suyRaCachDangNhap(["google", "email"])).toBe("ca-hai");
    expect(suyRaCachDangNhap([])).toBe("khac");
  });
});
