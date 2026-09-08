import "server-only";
import { cookies } from "next/headers";
import { boChu, type BoChu } from ".";
import { COOKIE_NGON_NGU, docNgonNgu, type NgonNgu } from "./ngon-ngu";

/**
 * Ngon ngu cho MOT yeu cau, doc tu cookie.
 *
 * "server-only" o dau tep: goi ham nay tu mot client component la sai — o do
 * khong co cookie cua yeu cau — nen bat loi ngay luc build thay vi de no chay
 * ra mot man hinh luon tieng Viet ma khong ai hieu tai sao.
 *
 * Next tu gop nhieu lan goi cookies() trong cung mot yeu cau, nen goi ham nay
 * o moi server component la re, khong phai chuyen tay xuong tung cap.
 */
export async function layNgonNgu(): Promise<NgonNgu> {
  const kho = await cookies();
  return docNgonNgu(kho.get(COOKIE_NGON_NGU)?.value);
}

/** Bo chu cua yeu cau hien tai. */
export async function layChu(): Promise<BoChu> {
  return boChu(await layNgonNgu());
}
