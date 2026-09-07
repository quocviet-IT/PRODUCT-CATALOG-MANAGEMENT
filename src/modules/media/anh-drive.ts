import sharp from "sharp";
import { taiTepDrive } from "@/modules/sheet/drive.client";
import { tinhKichThuocMoi } from "./image-processor";
import { dungKhoaAnhSheet, ghiTep, layUrlCoKy, tepTonTai } from "./storage";

export const CANH_DAI_ANH_SHEET = 600;
const HAN_URL_GIAY = 3600;

/**
 * Tra URL co ky cho anh Drive, tai va cache khi chua co.
 * Anh goc tren Drive nang vai MB toi hon chuc MB; ban 600px con khoang 40 KB.
 */
export async function layUrlAnhSheet(fileId: string): Promise<string> {
  const khoa = dungKhoaAnhSheet(fileId, CANH_DAI_ANH_SHEET);

  if (!(await tepTonTai(khoa))) {
    const goc = await taiTepDrive(fileId);
    const meta = await sharp(goc).metadata();
    if (!meta.width || !meta.height) {
      throw new Error(`Không đọc được kích thước ảnh ${fileId}.`);
    }
    const kt = tinhKichThuocMoi(meta.width, meta.height, CANH_DAI_ANH_SHEET);
    // Chi truyen MOT chieu — truyen ca hai kem fit:"inside" lam sharp lam tron
    // hai lan roi lech 1px. Xem chu thich trong image-processor.ts.
    const rangBuoc = meta.width >= meta.height ? { width: kt.width } : { height: kt.height };
    const nho = await sharp(goc)
      .rotate()
      .resize({ ...rangBuoc, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();
    await ghiTep(khoa, nho, "image/webp");
  }

  return layUrlCoKy(khoa, HAN_URL_GIAY);
}
