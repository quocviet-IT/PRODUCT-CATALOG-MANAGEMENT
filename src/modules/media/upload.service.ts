import { randomUUID } from "node:crypto";
import { xuLyAnh, BIEN_THE, LoiAnhKhongHopLe, type TenBienThe } from "./image-processor";
import { dungKhoa, ghiTep } from "./storage";
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

    // Tao san pham VA chen dong anh trong CUNG mot giao dich: neu khong, san pham
    // se commit ngay va bi lo ra ngoai (chua co anh nao) trong luc cac luot ghiTep
    // ben duoi con dang chay — mot truy van "san pham chua co anh" chay dong thoi se
    // thay san pham "ma" nay. Neu ghiTep loi giua chung, giao dich cuon lai va khong
    // de lai san pham rong nao trong CSDL (du vai tep goc/bien the co the con vuong
    // lai tren Storage — Storage khong nam trong pham vi giao dich Postgres).
    const { productId, imageId } = await db.transaction(async (tx) => {
      const sp = await taoSanPham({
        sku: `TMP-${randomUUID().slice(0, 8).toUpperCase()}`,
        name: tenTuTenTep(tep.ten),
        status: "draft",
        createdBy: boi,
      }, tx);

      const imageId = randomUUID();
      const duoiGoc = tep.ten.split(".").pop()!.toLowerCase();

      const khoaGoc = dungKhoa(sp.id, imageId, "goc", duoiGoc);
      await ghiTep(khoaGoc, tep.noiDung, `image/${duoiGoc === "jpg" ? "jpeg" : duoiGoc}`);

      const bienThe = {} as Record<TenBienThe, string>;
      for (const { ten } of BIEN_THE) {
        const khoa = dungKhoa(sp.id, imageId, ten, "webp");
        await ghiTep(khoa, daXuLy.bienThe[ten], "image/webp");
        bienThe[ten] = khoa;
      }

      await anhRepo.chen({
        id: imageId,
        productId: sp.id,
        storageKey: khoaGoc,
        variants: bienThe,
        width: daXuLy.width,
        height: daXuLy.height,
        bytes: daXuLy.bytes,
        contentHash: daXuLy.contentHash,
        isPrimary: true,
        sortOrder: 0,
      }, tx);

      return { productId: sp.id, imageId };
    });

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
