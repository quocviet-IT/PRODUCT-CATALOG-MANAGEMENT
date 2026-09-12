/**
 * Quy tac cua man hinh quan tri tai khoan. Ham THUAN — khong cham co so du
 * lieu, khong cham Supabase. Nho vay moi quy tac o day kiem duoc bang test.
 */

import { boDau } from "@/lib/vietnamese";

/**
 * Bac quyen he thong THUC SU cuong che. Chi hai — moi cua gac trong ma nguon
 * hoi mot cau nhi phan "co phai admin khong". Xem chu thich o db/schema.ts.
 */
export type MucQuyen = "admin" | "sale";

export const MUC_QUYEN: readonly MucQuyen[] = ["admin", "sale"];

export function laMucQuyen(v: string): v is MucQuyen {
  return (MUC_QUYEN as readonly string[]).includes(v);
}

/** Ma cua hai vai tro goc — khong xoa duoc, khong doi duoc muc quyen. */
export const MA_ADMIN = "admin";
export const MA_SALE = "sale";

/**
 * Mot vai tro nhu no nam trong bang. `ma` la thu duoc luu o users.role.
 *
 * Vi sao khong con la `"admin" | "sale"`: cong ty con them GSNB, R&D, thuc
 * tap sinh — nhung nguoi khong phai sale ma cung khong phai quan tri. Vai tro
 * gio la du lieu; cai KHONG doi la hai bac quyen o tren.
 */
export type VaiTro = {
  ma: string;
  ten: string;
  tenEn: string;
  mucQuyen: MucQuyen;
  heThong: boolean;
  thuTu: number;
};

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
  | { kieu: "doi-vai-tro"; mucQuyenMoi: MucQuyen }
  | { kieu: "doi-mat-khau" };

export type LoiSuaDoi = "tu_khoa_chinh_minh" | "tu_ha_quyen_chinh_minh";

/**
 * Chan admin tu khoa chinh minh ra ngoai.
 *
 * Day khong phai chuyen ly thuyet: he thong chi co admin moi vao duoc man hinh
 * nay. Mot admin tu vo hieu hoa hoac tu ha minh xuong sale la KHONG CON AI mo
 * duoc man hinh de sua lai — phai vao thang co so du lieu moi cuu duoc.
 *
 * Xet MUC QUYEN cua vai tro moi chu khong xet ma cua no: chuyen minh sang mot
 * vai tro ten khac nhung van mang muc quyen admin thi khong khoa ai ra ngoai
 * ca, con chuyen sang bat ky vai tro muc sale nao thi co — du ten no la gi.
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
  if (td.kieu === "doi-vai-tro" && td.mucQuyenMoi !== "admin") return "tu_ha_quyen_chinh_minh";
  return null;
}

// ─────────────────────────────────────────────────────── quan ly vai tro

export const DAI_TEN_VAI_TRO_TOI_DA = 40;
export const DAI_MA_VAI_TRO_TOI_DA = 32;

export type LoiVaiTro =
  | "thieu_ten_vai_tro"
  | "ten_vai_tro_qua_dai"
  | "ma_vai_tro_khong_hop_le"
  | "vai_tro_he_thong";

/**
 * Ma khong dau suy ra tu ten tieng Viet: "Giám sát nội bộ" -> "giam-sat-noi-bo".
 *
 * Admin chi go TEN; ma la thu ky thuat nam trong cot users.role va khong ai
 * phai nghi ra no. Rut gon ve DAI_MA_VAI_TRO_TOI_DA va cat dau gach thua o hai
 * dau — mot ma ket thuc bang "-" trong ra nhu bi cat cut.
 */
export function maTuTen(ten: string): string {
  return boDau(ten)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, DAI_MA_VAI_TRO_TOI_DA)
    .replace(/-+$/g, "");
}

/**
 * Kiem mot vai tro admin vua go.
 *
 * Ten tieng Anh de trong la HOP LE — bat admin dich moi vai tro sang tieng Anh
 * truoc khi luu duoc thi ho se go dai tieng Viet vao o do. Tang tren tu lay
 * ten tieng Viet khi thieu ban dich.
 */
export function kiemTraVaiTro(v: { ten: string; tenEn: string }): LoiVaiTro | null {
  const ten = v.ten.trim();
  if (ten === "") return "thieu_ten_vai_tro";
  if (ten.length > DAI_TEN_VAI_TRO_TOI_DA) return "ten_vai_tro_qua_dai";
  if (v.tenEn.trim().length > DAI_TEN_VAI_TRO_TOI_DA) return "ten_vai_tro_qua_dai";
  // Mot ten toan ky tu la ("###") bo dau xong con lai chuoi rong — khong co ma.
  if (maTuTen(ten) === "") return "ma_vai_tro_khong_hop_le";
  return null;
}

/** Ten hien theo ngon ngu dang xem, lui ve tieng Viet khi chua co ban dich. */
export function tenVaiTro(v: VaiTro, tiengAnh: boolean): string {
  return tiengAnh && v.tenEn.trim() !== "" ? v.tenEn : v.ten;
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
