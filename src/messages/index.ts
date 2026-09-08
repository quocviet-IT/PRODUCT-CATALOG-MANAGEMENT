import { vi } from "./vi";
import { en } from "./en";
import { type NgonNgu } from "./ngon-ngu";

/**
 * Hinh dang mot bo chu.
 *
 * `vi` khai bao `as const` nen `typeof vi` co kieu la TUNG CAU CHU cu the
 * ("Luu", "Huy"…). Dung thang kieu do cho ban tieng Anh thi moi cau deu bao
 * loi vi "Save" khong phai "Luu". Kieu duoi day noi long moi chuoi thanh
 * `string` nhung GIU NGUYEN bo khoa — do la thu can ep: thieu mot khoa, hay go
 * sai ten mot khoa, la khong build duoc.
 */
type NoiLong<T> = { [K in keyof T]: T[K] extends string ? string : NoiLong<T[K]> };

export type BoChu = NoiLong<typeof vi>;

const BANG: Record<NgonNgu, BoChu> = { vi, en };

/** Bo chu cua mot ngon ngu. Luon tra ve mot bo day du, khong bao gio null. */
export function boChu(n: NgonNgu): BoChu {
  return BANG[n] ?? vi;
}

export { vi, en };
export type { NgonNgu };
