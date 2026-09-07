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
const KHOA_VUA_TAO = "hp-catalogue-vua-tao";

/** Mot catalogue vua tao tren may nay — thay cho danh sach "cua toi" khi chua co tai khoan. */
export type CatalogueVuaTao = { slug: string; ten: string; luc: number };

const SO_VUA_TAO_GIU = 20;

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

/** Cung ly do voi GIO_RONG: hang so dung chung cho anh chup phia may chu. */
export const VUA_TAO_RONG: readonly CatalogueVuaTao[] = [];

let banVuaTao: readonly CatalogueVuaTao[] | null = null;
const nguoiNgheVuaTao = new Set<() => void>();

export function dangKyVuaTao(khiDoi: () => void): () => void {
  nguoiNgheVuaTao.add(khiDoi);
  return () => {
    nguoiNgheVuaTao.delete(khiDoi);
  };
}

export function chupVuaTao(): readonly CatalogueVuaTao[] {
  if (banVuaTao === null) {
    banVuaTao = doc<CatalogueVuaTao[]>(KHOA_VUA_TAO, []).filter(
      (x) => x && typeof x.slug === "string" && typeof x.ten === "string",
    );
  }
  return banVuaTao;
}

export function themVuaTao(c: CatalogueVuaTao): void {
  banVuaTao = [c, ...chupVuaTao().filter((x) => x.slug !== c.slug)].slice(0, SO_VUA_TAO_GIU);
  ghi(KHOA_VUA_TAO, banVuaTao);
  for (const f of nguoiNgheVuaTao) f();
}
