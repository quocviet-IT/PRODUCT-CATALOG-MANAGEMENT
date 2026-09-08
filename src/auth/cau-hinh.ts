import { getEnv } from "@/lib/env";
import { TIEN_TO_MAC_DINH, docDanhSach, type CauHinhQuyen } from "./quyen-dang-nhap";

/**
 * Dung cau hinh quyen dang nhap tu bien moi truong.
 *
 * Tach khoi quyen-dang-nhap.ts de ham quyet dinh o do van THUAN — test duoc
 * moi truong hop bien ma khong phai dung den bien moi truong.
 */
export function layCauHinhQuyen(): CauHinhQuyen {
  const env = getEnv();
  return {
    tienTo: env.AUTH_TIEN_TO_MIEN ?? TIEN_TO_MAC_DINH,
    tenMienChinhXac: docDanhSach(env.AUTH_TEN_MIEN),
    ngoaiLe: docDanhSach(env.AUTH_EMAIL_NGOAI_LE),
  };
}
