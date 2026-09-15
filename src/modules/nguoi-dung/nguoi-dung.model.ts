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

// ─────────────────────────────────────────────────────── cham hoat dong

/**
 * Khoang cach toi thieu giua hai lan ghi users.last_seen_at cho cung mot nguoi.
 *
 * Moi yeu cau co dang nhap deu di qua getSessionUser; ghi o MOI yeu cau la them
 * mot cau UPDATE tren ket noi duy nhat (db/client.ts giu max: 1). Cham chi phan
 * biet 24 gio / 7 ngay nen sai so 10 phut khong doi mau cua ai.
 */
export const PHUT_GIUA_HAI_LAN_GHI = 10;

const MOT_PHUT = 60_000;
const MOT_NGAY = 24 * 60 * MOT_PHUT;

/** Muc hoat dong hien bang cham mau o trang Tai khoan. */
export type MucHoatDong = "trong-ngay" | "trong-tuan" | "lau";

/** Thu tu cua dong chu giai: xanh, vang, xam. */
export const MUC_HOAT_DONG: readonly MucHoatDong[] = ["trong-ngay", "trong-tuan", "lau"];

/**
 * Da den luc ghi lai lan cuoi hoat dong chua.
 *
 * Moc nam o TUONG LAI (dong ho may chu ung dung va co so du lieu lech nhau) thi
 * coi nhu con moi — lan mo trang sau se ghi.
 */
export function nenGhiHoatDong(lanCuoi: Date | null, bayGio: Date): boolean {
  if (lanCuoi === null) return true;
  return bayGio.getTime() - lanCuoi.getTime() >= PHUT_GIUA_HAI_LAN_GHI * MOT_PHUT;
}

/**
 * Moc "lan cuoi vao" cua mot tai khoan: muon hon giua lan cuoi dung he thong
 * (users.last_seen_at) va lan cuoi dang nhap (Supabase Auth).
 *
 * Dang nhap cung la hoat dong. Quan trong nhat la ngay sau khi them cot: moi
 * last_seen_at con trong, khong gop thi ai cung hien cham xam cho toi lan mo trang
 * ke tiep.
 */
export function gopLanCuoiVao(hoatDong: Date | null, dangNhap: Date | null): Date | null {
  if (hoatDong === null) return dangNhap;
  if (dangNhap === null) return hoatDong;
  return hoatDong.getTime() >= dangNhap.getTime() ? hoatDong : dangNhap;
}

/**
 * Moc "lan cuoi vao" DUNG DE HIEN THI: tai khoan bi khoa bo qua moc dang nhap,
 * chi tinh theo lan cuoi dung he thong that (hoatDong / users.last_seen_at).
 *
 * Ly do: Supabase ghi last_sign_in_at ngay khi mat khau/Google dung, TRUOC KHI
 * cua gac (getSessionUser) kip xet is_active va chan nguoi bi khoa vao. Mot
 * nhan vien da nghi viec chi can THU dang nhap la Supabase da coi la "dang
 * nhap thanh cong" du cua gac tu choi ho ngay sau do — gop moc do vao se hien
 * cham xanh canh dong "Da khoa", sai hoan toan y nghia "dang dung he thong".
 * Tai khoan dang mo van giu nguyen quy tac cu (gopLanCuoiVao): dang nhap van
 * la hoat dong that.
 *
 * Truong hop chuyen tiep: mot tai khoan vua bi khoa ma hoatDong con null (chua
 * tung dung he thong lan nao, chi tung dang nhap) se hien "chua vao lan nao" —
 * chap nhan duoc, dung voi thuc te la ho chua he dung he thong.
 */
export function lanCuoiVaoHienThi(v: {
  hoatDong: Date | null;
  dangNhap: Date | null;
  dangHoatDong: boolean;
}): Date | null {
  return gopLanCuoiVao(v.hoatDong, v.dangHoatDong ? v.dangNhap : null);
}

/**
 * Xep muc: duoi 24 gio, duoi 7 ngay, con lai. Moc o tuong lai tinh la trong ngay.
 * Chua vao lan nao cung la "lau" — cot Lan cuoi vao ghi ro "Chua vao lan nao".
 */
export function mucHoatDong(lanCuoi: Date | null, bayGio: Date): MucHoatDong {
  if (lanCuoi === null) return "lau";
  const hieu = bayGio.getTime() - lanCuoi.getTime();
  if (hieu < MOT_NGAY) return "trong-ngay";
  if (hieu < 7 * MOT_NGAY) return "trong-tuan";
  return "lau";
}

/**
 * Ghi lan cuoi hoat dong khi can — cau noi giua cua gac va cau UPDATE.
 *
 * `ghi` la ham chay UPDATE that (o auth/guard.ts); truyen vao de quy tac o day
 * kiem duoc ma khong can co so du lieu. Tai khoan bi khoa khong ghi: ho bi cua gac
 * chan, khong phai dang dung.
 *
 * Loi ghi CHI LOG. Ghi hoat dong la viec phu — khong duoc vi no ma mot nguoi dang
 * lam viec bi day ra ngoai.
 */
export async function ghiHoatDongNeuCan(
  hoSo: { id: string; isActive: boolean; lanCuoiHoatDong: Date | null },
  bayGio: Date,
  ghi: (id: string) => Promise<unknown>,
): Promise<void> {
  if (!hoSo.isActive || !nenGhiHoatDong(hoSo.lanCuoiHoatDong, bayGio)) return;
  try {
    await ghi(hoSo.id);
  } catch (loi) {
    console.error("[hoat-dong] khong ghi duoc lan cuoi hoat dong:", loi);
  }
}
