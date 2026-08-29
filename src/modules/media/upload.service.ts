import { randomUUID } from "node:crypto";
import { xuLyAnh, BIEN_THE, LoiAnhKhongHopLe, type TenBienThe } from "./image-processor";
import { dungKhoa, ghiTep, xoaTep } from "./storage";
import * as anhRepo from "./images.repo";
import { db } from "@/db/client";
import { taoSanPham } from "@/modules/catalog/products.service";

export const TOI_DA_BYTE = 20 * 1024 * 1024;
export const TOI_DA_TEP = 200;
const DUOI_CHO_PHEP = ["jpg", "jpeg", "png", "webp", "heic"];

export type KetQuaMotTep = { tenTep: string } & (
  | { trangThai: "thanh_cong"; productId: string; imageId: string }
  | { trangThai: "trung"; productIdDaCo: string }
  | { trangThai: "loi"; thongBao: string }
);

/** Ham thuan — kiem tra so bo truoc khi ton cong doc anh. */
export function kiemTraTep(
  tenTep: string, kichThuoc: number,
): { hopLe: true } | { hopLe: false; thongBao: string } {
  const duoi = tenTep.split(".").pop()?.toLowerCase() ?? "";
  if (!DUOI_CHO_PHEP.includes(duoi)) {
    return { hopLe: false, thongBao: `Không nhận định dạng ".${duoi}". Chỉ nhận JPG, PNG, WebP, HEIC.` };
  }
  if (kichThuoc > TOI_DA_BYTE) {
    return { hopLe: false, thongBao: "Tệp vượt quá 20 MB." };
  }
  return { hopLe: true };
}

/** Bo duoi va ky tu dac biet khoi ten tep de dung lam ten san pham nhap. */
function tenTuTenTep(tenTep: string): string {
  return tenTep.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").trim() || "Chưa đặt tên";
}

export async function napMotTep(
  tep: { ten: string; noiDung: Buffer },
  boi: string | null,
): Promise<KetQuaMotTep> {
  const so_bo = kiemTraTep(tep.ten, tep.noiDung.byteLength);
  if (!so_bo.hopLe) {
    return { tenTep: tep.ten, trangThai: "loi", thongBao: so_bo.thongBao };
  }

  try {
    const daXuLy = await xuLyAnh(tep.noiDung);

    const trung = await anhRepo.timTheoMaBam(daXuLy.contentHash);
    if (trung) {
      return { tenTep: tep.ten, trangThai: "trung", productIdDaCo: trung.productId };
    }

    // Sinh id TRUOC de ghi Storage xong roi moi mo giao dich.
    // KHONG duoc dat cac lenh ghiTep BEN TRONG db.transaction: moi tep can toi 4 luot
    // di mang ra Singapore, ma giao dich thi giu mot ket noi pooler suot thoi gian do.
    // Lo 200 anh se giu ket noi gan het request, va pool chi co 10 -> can kiet ket noi.
    const productId = randomUUID();
    const imageId = randomUUID();
    const duoiGoc = tep.ten.split(".").pop()!.toLowerCase();
    const daGhi: string[] = [];

    try {
      const khoaGoc = dungKhoa(productId, imageId, "goc", duoiGoc);
      await ghiTep(khoaGoc, tep.noiDung, `image/${duoiGoc === "jpg" ? "jpeg" : duoiGoc}`);
      daGhi.push(khoaGoc);

      const bienThe = {} as Record<TenBienThe, string>;
      for (const { ten } of BIEN_THE) {
        const khoa = dungKhoa(productId, imageId, ten, "webp");
        await ghiTep(khoa, daXuLy.bienThe[ten], "image/webp");
        daGhi.push(khoa);
        bienThe[ten] = khoa;
      }

      // Giao dich chi bao quanh HAI lenh chen, khong bao gio bao qua I/O mang.
      // Hai lenh nay phai nguyen tu voi nhau: neu san pham commit truoc dong anh,
      // se co mot san pham nhap khong anh lo ra ngoai va bi truy van
      // "san pham chua co anh" nhin thay.
      await db.transaction(async (tx) => {
        await taoSanPham({
          id: productId,
          sku: `TMP-${randomUUID().slice(0, 8).toUpperCase()}`,
          name: tenTuTenTep(tep.ten),
          status: "draft",
          createdBy: boi,
        }, tx);

        await anhRepo.chen({
          id: imageId,
          productId,
          storageKey: khoaGoc,
          variants: bienThe,
          width: daXuLy.width,
          height: daXuLy.height,
          bytes: daXuLy.bytes,
          contentHash: daXuLy.contentHash,
          isPrimary: true,
          sortOrder: 0,
        }, tx);
      });
    } catch (e) {
      // Storage khong nam trong giao dich Postgres, nen phai tu don nhung tep
      // lan nay da ghi. Don theo kieu no luc toi da: loi khi don khong duoc che
      // mat loi goc.
      if (daGhi.length > 0) await xoaTep(daGhi).catch(() => {});
      throw e;
    }

    return { tenTep: tep.ten, trangThai: "thanh_cong", productId, imageId };
  } catch (e) {
    const thongBao = e instanceof LoiAnhKhongHopLe
      ? e.message
      : `Lỗi khi xử lý: ${e instanceof Error ? e.message : String(e)}`;
    return { tenTep: tep.ten, trangThai: "loi", thongBao };
  }
}

/** Nap tuan tu de khong lam nghen bo nho khi lo len toi 200 anh. */
export async function napNhieuTep(
  ds: { ten: string; noiDung: Buffer }[],
  boi: string | null,
): Promise<KetQuaMotTep[]> {
  const kq: KetQuaMotTep[] = [];
  for (const tep of ds.slice(0, TOI_DA_TEP)) {
    kq.push(await napMotTep(tep, boi));
  }
  return kq;
}
