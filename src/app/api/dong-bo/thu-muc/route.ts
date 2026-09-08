import { z } from "zod";
import { anhXaBang, type OTho } from "@/modules/sheet/catalogue.mapper";
import { LoiChuaBatDongBo, kiemKhoa } from "@/modules/sheet/dong-bo";

/**
 * Nhan bang tho, tra lai ID cac thu muc anh can liet ke. KHONG ghi gi ca.
 *
 * Vi sao co buoc nay thay vi de Apps Script tu tim cot: ten cot cua bang tinh
 * da doi hai lan trong mot thang ("FOLDER HÌNH" -> "Hình raw - lưu mẫu", va
 * LOẠI/DÒNG trao cho nhau). Chi co anhXaBang() biet nhung ten nao duoc chap
 * nhan. Cho script tu doan ten cot la bao dam co ngay hai ben lech nhau — ma
 * lech kieu do khong bao loi, chi im lang mat thu vien anh cua vai chuc mau.
 */

const KHONG_LUU_DEM = { "Cache-Control": "private, no-store" };

const SO_DONG_TOI_DA = 5_000;
const SO_O_TOI_DA = 100;

const Than = z.object({
  hang: z.array(z.array(z.unknown()).max(SO_O_TOI_DA)).max(SO_DONG_TOI_DA),
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

  let thuMuc: string[];
  try {
    const ds = anhXaBang(than.hang as OTho[][]);
    thuMuc = [...new Set(ds.map((d) => d.idThuMuc).filter((x): x is string => x !== null))];
  } catch (loi) {
    const chiTiet = loi instanceof Error ? loi.message : String(loi);
    console.error("[dong-bo] bang tho khong qua duoc mapper:", chiTiet);
    return Response.json(
      { loi: "bang_khong_doc_duoc", chiTiet },
      { status: 422, headers: KHONG_LUU_DEM },
    );
  }

  return Response.json({ thuMuc }, { headers: KHONG_LUU_DEM });
}
