import sharp from "sharp";
import { z } from "zod";
import { CO_ANH_HOP_LE } from "@/modules/media/anh-drive";
import { tinhKichThuocMoi } from "@/modules/media/image-processor";
import { dungKhoaAnhSheet } from "@/modules/media/khoa-anh";
import { ghiTep } from "@/modules/media/storage";
import { LoiChuaBatDongBo, kiemKhoa } from "@/modules/sheet/dong-bo";

/**
 * Nhan anh tu Apps Script va nap thang vao bo dem anh.
 *
 * Sau buoc nay ung dung KHONG con phai goi Drive de lay anh nua: layUrlAnhSheet
 * chi goi Drive khi bo dem trong, ma bo dem thi day roi.
 *
 * Script gui ban thu nho ~1600px lay tu thumbnailLink chu khong gui anh goc
 * vai MB — ta van thu nho tiep o day de ra dung hai co ung dung dung, va de
 * viec thu nho nam trong CUNG mot doan code voi duong Drive.
 */

const KHONG_LUU_DEM = { "Cache-Control": "private, no-store" };

/**
 * Vercel chan than yeu cau o 4,5 MB. Anh thu nho tu Drive (=w1600) thuong
 * 150-400 KB, ma base64 lam phinh them mot phan ba — sau tam la khoang 3 MB,
 * con cho du rong duoi tran. Doi so nay thi phai doi ca trong Apps Script.
 */
const SO_ANH_MOI_LAN = 6;
/** Chan mot tam don le vo ly, truoc khi sharp phai dung toi no. */
const BYTE_TOI_DA = 6 * 1024 * 1024;

const Than = z.object({
  anh: z
    .array(
      z.object({
        fileId: z.string().regex(/^[A-Za-z0-9_-]{10,80}$/),
        /** Noi dung anh, ma hoa base64. */
        duLieu: z.string().min(1),
      }),
    )
    .min(1)
    .max(SO_ANH_MOI_LAN),
});

/** Thu nho mot anh ve dung mot canh dai roi ghi vao bo dem. */
async function napMotCo(fileId: string, goc: Buffer, canhDai: number): Promise<void> {
  const meta = await sharp(goc).metadata();
  if (!meta.width || !meta.height) throw new Error("không đọc được kích thước");
  const kt = tinhKichThuocMoi(meta.width, meta.height, canhDai);
  // Chi truyen MOT chieu — truyen ca hai kem fit:"inside" lam sharp lam tron
  // hai lan roi lech 1px. Xem chu thich trong image-processor.ts.
  const rangBuoc = meta.width >= meta.height ? { width: kt.width } : { height: kt.height };
  // Giong het duong Drive trong anh-drive.ts: rotate() de theo huong EXIF, va
  // withoutEnlargement de mot anh nho hon 1400px khong bi phong to nhoe ra.
  const webp = await sharp(goc)
    .rotate()
    .resize({ ...rangBuoc, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();
  await ghiTep(dungKhoaAnhSheet(fileId, canhDai), webp, "image/webp");
}

export async function POST(req: Request): Promise<Response> {
  let hopLe: boolean;
  try {
    hopLe = kiemKhoa(req);
  } catch (loi) {
    if (loi instanceof LoiChuaBatDongBo) {
      console.error("[dong-bo]", loi.message);
      return Response.json({ loi: "chua_bat" }, { status: 503, headers: KHONG_LUU_DEM });
    }
    throw loi;
  }
  if (!hopLe) return new Response(null, { status: 401, headers: KHONG_LUU_DEM });

  let than: z.infer<typeof Than>;
  try {
    than = Than.parse(await req.json());
  } catch {
    return Response.json({ loi: "than_khong_hop_le" }, { status: 400, headers: KHONG_LUU_DEM });
  }

  const xong: string[] = [];
  const hong: { fileId: string; chiTiet: string }[] = [];

  for (const a of than.anh) {
    try {
      const goc = Buffer.from(a.duLieu, "base64");
      if (goc.byteLength === 0) throw new Error("dữ liệu rỗng");
      if (goc.byteLength > BYTE_TOI_DA) throw new Error("ảnh quá lớn");
      // Mot anh hong khong duoc lam hong ca lo: script van di tiep nhung anh
      // con lai va bao lai chinh xac tam nao khong nap duoc.
      for (const co of CO_ANH_HOP_LE) await napMotCo(a.fileId, goc, co);
      xong.push(a.fileId);
    } catch (loi) {
      const chiTiet = loi instanceof Error ? loi.message : String(loi);
      console.error(`[dong-bo] khong nap duoc anh ${a.fileId}:`, chiTiet);
      hong.push({ fileId: a.fileId, chiTiet });
    }
  }

  return Response.json({ xong: xong.length, hong }, { headers: KHONG_LUU_DEM });
}
