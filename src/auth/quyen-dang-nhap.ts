/**
 * Ai duoc phep dang nhap. Ham THUAN, khong cham mang lan co so du lieu.
 *
 * Tach rieng khoi tuyen callback vi day la ranh gioi an ninh: bat ky ai co mot
 * tai khoan Google deu bam duoc nut dang nhap, nen cho nay la thu duy nhat
 * ngan nguoi ngoai vao he thong. Tach ra thi kiem tra duoc bang test thay vi
 * phai dung tai khoan that de thu.
 */

export type CauHinhQuyen = {
  /**
   * Tien to ten mien cong ty, khong co dau cham. Moi ten mien dang
   * "<tienTo>.<duoi>" deu vao duoc: ctyhp.vn, ctyhp.com, ctyhp.us, ctyhp.com.vn...
   */
  tienTo: string;
  /**
   * Danh sach ten mien khai CHINH XAC. Khai bien nay thi tienTo bi bo qua va
   * chi dung nhung ten mien o day moi vao duoc — dung khi muon that chat.
   */
  tenMienChinhXac: readonly string[];
  /** Email cu the duoc phep du nam ngoai moi quy tac tren. */
  ngoaiLe: readonly string[];
};

export const TIEN_TO_MAC_DINH = "ctyhp";

/**
 * Toi da hai nhan sau tien to: du cho ".vn", ".com", ".com.vn", ".co.uk".
 *
 * Day chinh la cho chan ke gian. "ctyhp.vn.attacker.com" cung bat dau bang
 * "ctyhp." nhung ten mien that su cua no la attacker.com — mot phep so sanh
 * tien to chuoi se cho qua. Dem theo NHAN thi no co ba nhan sau tien to nen bi
 * loai.
 */
const SO_NHAN_TOI_DA_SAU_TIEN_TO = 2;

/** Duoi ten mien chi gom chu cai: chan ca nhan rong lan nhan chua so/dau. */
const NHAN_DUOI = /^[a-z]{2,24}$/;

function chuanHoa(s: string): string {
  return s.trim().toLowerCase();
}

/** Doc danh sach ngan bang dau phay tu bien moi truong. Bo trung va bo rong. */
export function docDanhSach(tho: string | undefined): string[] {
  if (!tho) return [];
  return [...new Set(tho.split(",").map(chuanHoa).filter(Boolean))];
}

/** Ten mien co dang "<tienTo>.<duoi>" khong. Xem chu thich o tren ve so nhan. */
export function khopTienTo(mien: string, tienTo: string): boolean {
  const nhan = chuanHoa(mien).split(".");
  if (nhan.length < 2 || nhan.length > 1 + SO_NHAN_TOI_DA_SAU_TIEN_TO) return false;
  if (nhan[0] !== chuanHoa(tienTo)) return false;
  return nhan.slice(1).every((n) => NHAN_DUOI.test(n));
}

/**
 * Lay phan ten mien: doan sau dau @ CUOI CUNG.
 *
 * Phai la dau @ cuoi cung chu khong phai dau @ dau tien —
 * "a@ctyhp.vn@gmail.com" co ten mien that la gmail.com.
 */
function mienCua(email: string): string | null {
  const i = email.lastIndexOf("@");
  return i === -1 ? null : email.slice(i + 1);
}

export function duocPhepDangNhap(email: string | null | undefined, ch: CauHinhQuyen): boolean {
  if (!email) return false;
  const e = chuanHoa(email);
  if (ch.ngoaiLe.includes(e)) return true;

  const mien = mienCua(e);
  if (mien === null || mien === "") return false;

  // Khai ten mien chinh xac thi CHI dung danh sach do — khong lui ve tien to,
  // vi nguoi khai ra no la de that chat.
  if (ch.tenMienChinhXac.length > 0) {
    return ch.tenMienChinhXac.some((m) => mien === chuanHoa(m));
  }
  return khopTienTo(mien, ch.tienTo);
}

/** Ten hien thi khi Google khong tra ve ten — lay phan truoc dau @. */
export function tenTuEmail(email: string): string {
  const i = email.lastIndexOf("@");
  return (i === -1 ? email : email.slice(0, i)).trim() || email;
}
