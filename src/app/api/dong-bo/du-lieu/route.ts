import { z } from "zod";
import { anhXaBang, type OTho } from "@/modules/sheet/catalogue.mapper";
import {
  LoiChuaBatDongBo,
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
  anhThuMuc: z.record(
    z.string().min(1).max(200),
    z.array(z.object({ fileId: z.string().min(1).max(120), ten: z.string().max(300) })).max(500),
  ),
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

  const soAnh = Object.values(than.anhThuMuc).reduce((t, x) => t + x.length, 0);
  await ghiBang(than.hang);
  await ghiAnhThuMuc(than.anhThuMuc);
  await ghiTrangThai({
    luc: new Date().toISOString(),
    soDong,
    soThuMuc: Object.keys(than.anhThuMuc).length,
    soAnh,
  });

  return Response.json(
    { soDong, soThuMuc: Object.keys(than.anhThuMuc).length, soAnh },
    { headers: KHONG_LUU_DEM },
  );
}
