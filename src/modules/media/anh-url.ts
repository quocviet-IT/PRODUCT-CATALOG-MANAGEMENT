import { layUrlCoKy } from "./storage";
import type { SanPham } from "@/modules/catalog/products.service";

/**
 * Ky nhieu khoa cung luc. Mot khoa hong khong duoc lam hong ca luoi anh,
 * nen tra ve null cho khoa do thay vi nem loi.
 */
export async function kyNhieuUrl(
  khoa: (string | null)[],
  hanGiay = 3600,
): Promise<(string | null)[]> {
  return Promise.all(
    khoa.map(async (k) => {
      if (k === null) return null;
      try {
        return await layUrlCoKy(k, hanGiay);
      } catch {
        return null;
      }
    }),
  );
}

/** San pham kem URL anh da ky va ten danh muc, dung de hien thi tren luoi/trang chi tiet. */
export type SanPhamHienThi = SanPham & { urlAnh: string | null; tenDanhMuc: string | null };
