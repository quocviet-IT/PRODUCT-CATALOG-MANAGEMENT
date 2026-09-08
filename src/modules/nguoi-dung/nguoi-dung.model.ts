/**
 * Quy tac cua man hinh quan tri tai khoan. Ham THUAN — khong cham co so du
 * lieu, khong cham Supabase. Nho vay moi quy tac o day kiem duoc bang test.
 */

export type VaiTro = "admin" | "sale";

/** Ngan nhat cho mot mat khau do admin dat ho nguoi khac. */
export const DAI_MAT_KHAU_TOI_THIEU = 8;
export const DAI_MAT_KHAU_TOI_DA = 72;

export type LoiTaoTaiKhoan =
  | "email_khong_hop_le"
  | "mat_khau_qua_ngan"
  | "mat_khau_qua_dai"
  | "thieu_ho_ten";

/**
 * Chap nhan dang email co ban. KHONG dung de xet email co thuoc cong ty khong
 * — day la tai khoan do admin tu tay tao, admin duoc quyen tao cho ca doi tac
 * ngoai cong ty. Rang buoc ten mien chi ap cho duong dang nhap bang Google
 * (xem auth/quyen-dang-nhap.ts).
 */
const DANG_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function kiemTraTaoTaiKhoan(v: {
  email: string;
  matKhau: string;
  hoTen: string;
}): LoiTaoTaiKhoan | null {
  if (!DANG_EMAIL.test(v.email.trim())) return "email_khong_hop_le";
  if (v.hoTen.trim() === "") return "thieu_ho_ten";
  if (v.matKhau.length < DAI_MAT_KHAU_TOI_THIEU) return "mat_khau_qua_ngan";
  // bcrypt cua Supabase chi doc 72 byte dau — dai hon la phan thua bi bo lang
  // le, nguoi dung tuong minh co mat khau dai hon thuc te.
  if (v.matKhau.length > DAI_MAT_KHAU_TOI_DA) return "mat_khau_qua_dai";
  return null;
}

export function kiemTraMatKhau(matKhau: string): LoiTaoTaiKhoan | null {
  if (matKhau.length < DAI_MAT_KHAU_TOI_THIEU) return "mat_khau_qua_ngan";
  if (matKhau.length > DAI_MAT_KHAU_TOI_DA) return "mat_khau_qua_dai";
  return null;
}

export type ThayDoi =
  | { kieu: "khoa" }
  | { kieu: "mo-khoa" }
  | { kieu: "doi-vai-tro"; vaiTroMoi: VaiTro }
  | { kieu: "doi-mat-khau" };

export type LoiSuaDoi = "tu_khoa_chinh_minh" | "tu_ha_quyen_chinh_minh";

/**
 * Chan admin tu khoa chinh minh ra ngoai.
 *
 * Day khong phai chuyen ly thuyet: he thong chi co admin moi vao duoc man hinh
 * nay. Mot admin tu vo hieu hoa hoac tu ha minh xuong sale la KHONG CON AI mo
 * duoc man hinh de sua lai — phai vao thang co so du lieu moi cuu duoc.
 *
 * Doi mat khau CUA CHINH MINH thi van cho: do la viec hop le va khong khoa ai
 * ra ngoai.
 */
export function kiemTraSuaDoi(
  idNguoiThucHien: string,
  idMucTieu: string,
  td: ThayDoi,
): LoiSuaDoi | null {
  if (idNguoiThucHien !== idMucTieu) return null;
  if (td.kieu === "khoa") return "tu_khoa_chinh_minh";
  if (td.kieu === "doi-vai-tro" && td.vaiTroMoi !== "admin") return "tu_ha_quyen_chinh_minh";
  return null;
}

/** Cach mot tai khoan dang nhap, suy ra tu danh sach provider cua Supabase. */
export type CachDangNhap = "google" | "mat-khau" | "ca-hai" | "khac";

export function suyRaCachDangNhap(providers: readonly string[]): CachDangNhap {
  const coGoogle = providers.includes("google");
  const coMatKhau = providers.includes("email");
  if (coGoogle && coMatKhau) return "ca-hai";
  if (coGoogle) return "google";
  if (coMatKhau) return "mat-khau";
  return "khac";
}
