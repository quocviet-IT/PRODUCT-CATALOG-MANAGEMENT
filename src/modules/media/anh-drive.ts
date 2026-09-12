import sharp, { type Metadata } from "sharp";
import { taiAnhDrive } from "@/modules/sheet/drive.client";
import { LoiAnhKhongHopLe, tinhKichThuocMoi } from "./image-processor";
import { dungKhoaAnhSheet, ghiTep, taiVe } from "./storage";

export const CANH_DAI_ANH_SHEET = 600;
/** Ban lon cho khung xem phong to. */
export const CANH_DAI_ANH_LON = 1400;
/** Chi hai co nay duoc phep — fileId va co deu tu URL nen phai chan danh sach. */
export const CO_ANH_HOP_LE = [CANH_DAI_ANH_SHEET, CANH_DAI_ANH_LON] as const;
/**
 * BYTES cua anh, lay tu bo dem; chua co thi dung tu Drive roi cat vao bo dem.
 *
 * TRA VE BYTES CHU KHONG PHAI URL CO KY. Ban truoc ky mot URL Supabase roi
 * chuyen huong 302 sang do, va vi URL co ky het han sau mot gio nen chuyen
 * huong ay khong duoc phep cache — moi tam anh, moi lan mo trang, deu ton HAI
 * luot goi Supabase (mot de kiem tep co ton tai, mot de ky URL). Voi mot
 * catalogue 40 anh la 80 luot goi cho MOI luot xem.
 *
 * Tra thang bytes thi tuyen anh dat duoc header cache dai, va CDN cua Vercel
 * giu lai — luot xem thu hai tro di khong cham vao Supabase mot lan nao.
 *
 * Cung bo luon buoc tepTonTai(): no la mot lenh liet ke thu muc chua hang
 * nghin doi tuong, chay truoc MOI tam anh chi de tra loi mot cau hoi ma chinh
 * lenh tai ve da tra loi duoc.
 *
 * Anh goc tren Drive nang vai MB toi hon chuc MB; ban 600px con khoang 40 KB.
 */
export async function layAnhSheet(
  fileId: string,
  canhDai: number = CANH_DAI_ANH_SHEET,
): Promise<Buffer> {
  const khoa = dungKhoaAnhSheet(fileId, canhDai);

  try {
    return await taiVe(khoa);
  } catch {
    // Chua co trong bo dem — dung tu Drive. Bat loi thay vi hoi truoc: hoi
    // truoc la them mot luot goi vong Thai Binh Duong cho MOI tam anh, chi de
    // tiet kiem mot lan nem loi o truong hop hiem.
  }

  {
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
    return nho;
  }
}
