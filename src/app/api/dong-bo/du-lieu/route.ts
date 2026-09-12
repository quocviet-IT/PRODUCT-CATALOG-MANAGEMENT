import { createHash } from "node:crypto";
import { z } from "zod";
import { anhXaBang, type OTho } from "@/modules/sheet/catalogue.mapper";
import {
  LoiChuaBatDongBo,
  docTrangThai,
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
 * `anhThuMuc` KHONG con duoc nhan o day nua — xem /api/dong-bo/anh-thu-muc.
 * Bang tinh gio tro toi 1.476 thu muc Drive, khong liet ke het trong mot luot
 * chay Apps Script, nen ban do thu muc duoc dung DAN qua nhieu luot va chi
 * duoc phep GOP THEM. Neu tuyen nay con ghi de bang mot ban do mot phan thi
 * mot script cu chay lai la xoa sach cong cua ca chuc luot.
 *
 * Van chap nhan truong do trong than de mot script cu khong bi 400 — chi la bo
 * qua no.
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
  // Nhan de khong lam gay script cu, nhung KHONG dung toi. Xem chu thich tren.
  anhThuMuc: z.unknown().optional(),
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

  // So thu muc / so anh do rieng /api/dong-bo/anh-thu-muc cap nhat; o day chi
  // mang sang, khong tinh lai.
  const soThuMuc = truoc?.soThuMuc ?? 0;
  const soAnh = truoc?.soAnh ?? 0;

  // Moc thoi gian van cap nhat du bang khong doi: nguoi dung doc dong chu nay
  // de biet dong bo CON SONG hay da chet. Mot moc dung im vi "khong co gi moi"
  // trong y het mot moc dung im vi script hong.
  await ghiTrangThai({ luc: new Date().toISOString(), soDong, soThuMuc, soAnh, bam });

  return Response.json({ soDong, soThuMuc, soAnh, doiBang }, { headers: KHONG_LUU_DEM });
}
