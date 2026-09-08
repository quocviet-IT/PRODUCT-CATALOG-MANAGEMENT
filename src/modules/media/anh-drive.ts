import sharp, { type Metadata } from "sharp";
import { taiAnhDrive } from "@/modules/sheet/drive.client";
import { LoiAnhKhongHopLe, tinhKichThuocMoi } from "./image-processor";
import { dungKhoaAnhSheet, ghiTep, layUrlCoKy, tepTonTai } from "./storage";

export const CANH_DAI_ANH_SHEET = 600;
/** Ban lon cho khung xem phong to. */
export const CANH_DAI_ANH_LON = 1400;
/** Chi hai co nay duoc phep — fileId va co deu tu URL nen phai chan danh sach. */
export const CO_ANH_HOP_LE = [CANH_DAI_ANH_SHEET, CANH_DAI_ANH_LON] as const;
const HAN_URL_GIAY = 3600;

/**
 * Tra URL co ky cho anh Drive, tai va cache khi chua co.
 * Anh goc tren Drive nang vai MB toi hon chuc MB; ban 600px con khoang 40 KB.
 */
export async function layUrlAnhSheet(
  fileId: string,
  canhDai: number = CANH_DAI_ANH_SHEET,
): Promise<string> {
  const khoa = dungKhoaAnhSheet(fileId, canhDai);

  if (!(await tepTonTai(khoa))) {
    const goc = await taiAnhDrive(fileId);
    let meta: Metadata;
    try {
      meta = await sharp(goc).metadata();
    } catch (e) {
      throw new LoiAnhKhongHopLe(e instanceof Error ? e.message : String(e));
    }
    if (!meta.width || !meta.height) {
      throw new LoiAnhKhongHopLe("không đọc được kích thước");
    }
    const kt = tinhKichThuocMoi(meta.width, meta.height, canhDai);
    // Chi truyen MOT chieu — truyen ca hai kem fit:"inside" lam sharp lam tron
    // hai lan roi lech 1px. Xem chu thich trong image-processor.ts.
    const rangBuoc = meta.width >= meta.height ? { width: kt.width } : { height: kt.height };
    // metadata() chi doc header nen tep bi cat ngang giua chung van qua duoc
    // buoc kiem tra o tren; loi that chi lo ra khi resize/encode phai quet het
    // du lieu anh. Boc rieng buoc nay de doi loi libvips tho thanh loi mien nguyen.
    let nho: Buffer;
    try {
      nho = await sharp(goc)
        .rotate()
        .resize({ ...rangBuoc, withoutEnlargement: true })
        .webp({ quality: 82 })
        .toBuffer();
    } catch (e) {
      throw new LoiAnhKhongHopLe(e instanceof Error ? e.message : String(e));
    }
    await ghiTep(khoa, nho, "image/webp");
  }

  return layUrlCoKy(khoa, HAN_URL_GIAY);
}
