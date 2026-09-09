import { createHash } from "node:crypto";
import { z } from "zod";
import { anhXaBang, type OTho } from "@/modules/sheet/catalogue.mapper";
import {
  LoiChuaBatDongBo,
  docTrangThai,
  ghiAnhThuMuc,
  ghiBang,
  ghiTrangThai,
  kiemKhoa,
} from "@/modules/sheet/dong-bo";

/**
 * Nhan bang tho + danh sach anh tung thu muc tu Apps Script.
 *
 * Bang tho di qua DUNG mapper cua duong that (anhXaBang) ngay tai day de kiem,
 * roi moi luu. Neu bang tinh doi ten cot va gay hong mapper thi phai hong o day
 * — luc script vua day len va con nguoi con dang nhin — chu khong phai lang le
 * ghi de len ban tot roi lam trang khach vo vao sang hom sau.
 *
 * `anhThuMuc` la TUY CHON. Liet ke 65 thu muc Drive mat ~36 giay, con doc rieng
 * bang tinh chi mat ~2 giay; ma thu muc thi hiem khi doi con bang tinh thi doi
 * suot. Nen script goi day du moi gio, va goi khong kem `anhThuMuc` moi phut.
 * Thieu truong do thi ban danh sach anh cu duoc GIU NGUYEN, khong bi xoa.
 */

const KHONG_LUU_DEM = { "Cache-Control": "private, no-store" };

/**
 * Khong ta hinh dang o cua bang tinh o day: mapper da nhan moi thu la va tu bo
 * qua. Chi chan hai dieu — dung la mang hai chieu, va khong qua lon.
 */
const SO_DONG_TOI_DA = 5_000;
const SO_O_TOI_DA = 100;

const Than = z.object({
  hang: z.array(z.array(z.unknown()).max(SO_O_TOI_DA)).max(SO_DONG_TOI_DA),
  anhThuMuc: z
    .record(
      z.string().min(1).max(200),
      z.array(z.object({ fileId: z.string().min(1).max(120), ten: z.string().max(300) })).max(500),
    )
    .optional(),
});

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

  // Kiem bang chinh mapper cua duong that TRUOC khi ghi de.
  let soDong: number;
  try {
    soDong = anhXaBang(than.hang as OTho[][]).length;
  } catch (loi) {
    const chiTiet = loi instanceof Error ? loi.message : String(loi);
    console.error("[dong-bo] bang tho khong qua duoc mapper:", chiTiet);
    return Response.json(
      { loi: "bang_khong_doc_duoc", chiTiet },
      { status: 422, headers: KHONG_LUU_DEM },
    );
  }
  if (soDong === 0) {
    // Mot bang rong gan nhu chac chan la loi phia script (doc nham tab, quyen
    // bi thu hoi) chu khong phai cong ty vua xoa het hang. Tu choi con hon xoa
    // sach catalogue dang chay.
    return Response.json({ loi: "bang_rong" }, { status: 422, headers: KHONG_LUU_DEM });
  }

  const chuBang = JSON.stringify(than.hang);
  const bam = createHash("sha256").update(chuBang).digest("hex");
  const truoc = await docTrangThai();

  // Chay moi phut nghia la 1.440 lan mot ngay, ma bang tinh thi ca ngay khong
  // ai dong toi. Ghi de mot tep 110 KB mieng khong doi la ton vo ich — so van
  // tay du de biet co dang ghi hay khong.
  const doiBang = truoc?.bam !== bam;
  if (doiBang) await ghiBang(than.hang);

  let soThuMuc = truoc?.soThuMuc ?? 0;
  let soAnh = truoc?.soAnh ?? 0;
  if (than.anhThuMuc !== undefined) {
    await ghiAnhThuMuc(than.anhThuMuc);
    soThuMuc = Object.keys(than.anhThuMuc).length;
    soAnh = Object.values(than.anhThuMuc).reduce((t, x) => t + x.length, 0);
  }

  // Moc thoi gian van cap nhat du bang khong doi: nguoi dung doc dong chu nay
  // de biet dong bo CON SONG hay da chet. Mot moc dung im vi "khong co gi moi"
  // trong y het mot moc dung im vi script hong.
  await ghiTrangThai({ luc: new Date().toISOString(), soDong, soThuMuc, soAnh, bam });

  return Response.json({ soDong, soThuMuc, soAnh, doiBang }, { headers: KHONG_LUU_DEM });
}
