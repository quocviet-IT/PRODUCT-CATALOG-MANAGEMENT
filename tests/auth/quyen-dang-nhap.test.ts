import { describe, expect, it } from "vitest";
import {
  docDanhSach,
  duocPhepDangNhap,
  khopTienTo,
  tenTuEmail,
  type CauHinhQuyen,
} from "@/auth/quyen-dang-nhap";

const CH: CauHinhQuyen = {
  tienTo: "ctyhp",
  tenMienChinhXac: [],
  ngoaiLe: ["aiteamdev1@gmail.com"],
};

describe("duocPhepDangNhap — theo tien to ten mien", () => {
  it("nhan moi duoi cua ten mien cong ty", () => {
    for (const m of ["ctyhp.vn", "ctyhp.com", "ctyhp.us", "ctyhp.net", "ctyhp.com.vn"]) {
      expect(duocPhepDangNhap(`an@${m}`, CH)).toBe(true);
    }
  });

  it("khong phan biet hoa thuong va bo khoang trang thua", () => {
    expect(duocPhepDangNhap("  An@CtyHP.VN  ", CH)).toBe(true);
  });

  it("nhan email ngoai le da khai", () => {
    expect(duocPhepDangNhap("AiTeamDev1@Gmail.com", CH)).toBe(true);
  });

  it("CHAN ten mien chi GIONG chu khong phai cua cong ty", () => {
    // Ca dang nhat: "ctyhp.vn.attacker.com" bat dau bang "ctyhp." nhung ten
    // mien that su cua no la attacker.com. So sanh tien to CHUOI se cho qua;
    // dem theo NHAN thi loai duoc.
    for (const xau of [
      "x@ctyhp.vn.attacker.com",
      "x@notctyhp.vn",
      "x@sub.ctyhp.vn",
      "x@ctyhp-vn.com",
      "x@xctyhp.vn",
      "ctyhp.vn@gmail.com",
      "x@ctyhp",
      "x@ctyhp.",
      "x@ctyhp.1",
      "x@ctyhp.v",
    ]) {
      expect(duocPhepDangNhap(xau, CH), xau).toBe(false);
    }
  });

  it("tu choi khi khong co email hoac chuoi vo nghia", () => {
    for (const xau of [null, undefined, "", "   ", "khongcodauA"]) {
      expect(duocPhepDangNhap(xau, CH)).toBe(false);
    }
  });

  it("nhieu dau @ thi chi tinh phan sau dau @ CUOI CUNG", () => {
    expect(duocPhepDangNhap("a@b@ctyhp.vn", CH)).toBe(true);
    expect(duocPhepDangNhap("a@ctyhp.vn@gmail.com", CH)).toBe(false);
  });
});

describe("duocPhepDangNhap — khi khai ten mien chinh xac", () => {
  const CHAT: CauHinhQuyen = { ...CH, tenMienChinhXac: ["ctyhp.vn"] };

  it("chi nhan dung nhung ten mien da khai", () => {
    expect(duocPhepDangNhap("an@ctyhp.vn", CHAT)).toBe(true);
    // ctyhp.com hop le theo tien to, nhung nguoi khai danh sach la de THAT CHAT
    // — lui ve tien to o day se pha dung y do do.
    expect(duocPhepDangNhap("an@ctyhp.com", CHAT)).toBe(false);
  });

  it("ngoai le van duoc uu tien truoc moi quy tac", () => {
    expect(duocPhepDangNhap("aiteamdev1@gmail.com", CHAT)).toBe(true);
  });
});

describe("khopTienTo", () => {
  it("nhan toi da hai nhan sau tien to", () => {
    expect(khopTienTo("ctyhp.vn", "ctyhp")).toBe(true);
    expect(khopTienTo("ctyhp.com.vn", "ctyhp")).toBe(true);
    expect(khopTienTo("ctyhp.a.b.c", "ctyhp")).toBe(false);
  });
});

describe("docDanhSach", () => {
  it("tach theo dau phay, bo trung va khoang trang", () => {
    expect(docDanhSach(" A@x.com , b@y.com ,, A@X.com ")).toEqual(["a@x.com", "b@y.com"]);
  });
  it("khong khai thi danh sach rong", () => {
    expect(docDanhSach(undefined)).toEqual([]);
    expect(docDanhSach("")).toEqual([]);
  });
});

describe("tenTuEmail", () => {
  it("lay phan truoc dau @", () => {
    expect(tenTuEmail("an.nguyen@ctyhp.vn")).toBe("an.nguyen");
  });
  it("khong co dau @ thi giu nguyen", () => {
    expect(tenTuEmail("khongcodau")).toBe("khongcodau");
  });
});
