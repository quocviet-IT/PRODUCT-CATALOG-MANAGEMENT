/**
 * Gio hang cua sale: nhung ma mau dang duoc tich chon.
 *
 * Nam trong localStorage vi he thong khong bat dang nhap (quyet dinh
 * 07/09/2026) nen khong co cho nao khac de gan no vao. Hai he qua da biet
 * truoc: doi may la mat lua chon, va hai tab cung mo se khong thay nhau —
 * chap nhan duoc cho mot gio hang song vai phut.
 *
 * KHONG dua vao URL: 100 ma mau lam duong dan dai loang ngoang, va moi lan
 * doi bo loc la phai mang theo ca cai duoi do.
 *
 * Duoc dung qua useSyncExternalStore chu khong qua useState + useEffect. Ly do
 * ky thuat: localStorage khong ton tai luc render o may chu, nen doc no phai co
 * mot "anh chup phia may chu" rieng — dung dung useState roi nap trong effect
 * thi vua sai vong doi (setState dong bo trong effect) vua nhay mot nhip hinh.
 *
 * Moi ham deu chiu duoc localStorage nem loi: trinh duyet o che do rieng tu
 * hoac chan cookie ben thu ba deu co the nem ngay khi doc.
 */

const KHOA = "hp-catalogue-chon";

/*
 * Truoc day tep nay con giu them mot danh sach "catalogue vua tao tren may
 * nay". No da bi go bo: he thong co dang nhap roi, va bang `catalogues` trong
 * co so du lieu giu danh sach do THEO NGUOI — xem /admin/catalogue. Danh sach
 * theo trinh duyet mat khi doi may hay xoa lich su, va de hai danh sach canh
 * nhau chi lam sale khong biet cai nao moi la that.
 */

/**
 * Anh chup cho may chu. Phai la MOT hang so dung chung: useSyncExternalStore so
 * sanh bang tham chieu, tra ve mang moi moi lan goi se lam React render vo tan.
 */
export const GIO_RONG: readonly string[] = [];

function doc<T>(khoa: string, macDinh: T): T {
  try {
    const v = localStorage.getItem(khoa);
    if (!v) return macDinh;
    const j = JSON.parse(v);
    return Array.isArray(j) ? (j as T) : macDinh;
  } catch {
    return macDinh;
  }
}

function ghi(khoa: string, gia_tri: unknown): void {
  try {
    localStorage.setItem(khoa, JSON.stringify(gia_tri));
  } catch {
    // Het dung luong hoac bi chan — mat lua chon con hon lam sap trang.
  }
}

let ban: readonly string[] | null = null;
const nguoiNghe = new Set<() => void>();

export function dangKyGio(khiDoi: () => void): () => void {
  nguoiNghe.add(khiDoi);
  return () => {
    nguoiNghe.delete(khiDoi);
  };
}

/** Tham chieu chi doi khi noi dung thuc su doi — dieu kien cua useSyncExternalStore. */
export function chupGio(): readonly string[] {
  if (ban === null) ban = doc<string[]>(KHOA, []).filter((x) => typeof x === "string");
  return ban;
}

export function datGio(ma: readonly string[]): void {
  ban = ma;
  ghi(KHOA, ma);
  for (const f of nguoiNghe) f();
}

export function docGio(): readonly string[] {
  return chupGio();
}

/** Bat/tat mot ma. Ma moi duoc THEM VAO CUOI de giu dung thu tu sale chon. */
export function daoMa(hienTai: readonly string[], ma: string): string[] {
  return hienTai.includes(ma) ? hienTai.filter((x) => x !== ma) : [...hienTai, ma];
}
