import { z } from "zod";
import { getSessionUser } from "@/auth/guard";
import { dungMucDeChon, SO_MUC_TOI_DA } from "@/modules/catalogue-share/chia-se.model";
import { layNguonTheoMa } from "@/modules/catalogue-share/chia-se.service";

/**
 * Tra ve thong tin + thu vien anh cho mot loat ma mau.
 *
 * Vi sao POST chu khong phai GET: gio hang cua sale nam trong localStorage va
 * co the toi 100 ma. Nhet tung ay vao chuoi truy van thi vua dai vua bi cat o
 * mot so proxy. Tuyen nay khong ghi gi ca.
 */
const Than = z.object({
  ma: z.array(z.string().min(1).max(80)).min(1).max(SO_MUC_TOI_DA),
});

const KHONG_LUU_DEM = { "Cache-Control": "private, no-store" };

export async function POST(req: Request): Promise<Response> {
  const user = await getSessionUser();
  if (user === null || !user.isActive) {
    return new Response(null, { status: 401, headers: KHONG_LUU_DEM });
  }

  let than: z.infer<typeof Than>;
  try {
    than = Than.parse(await req.json());
  } catch {
    return new Response(null, { status: 400, headers: KHONG_LUU_DEM });
  }

  try {
    const nguon = await layNguonTheoMa(than.ma);
    // Giu dung thu tu sale da chon; ma khong con tren bang tinh thi bien mat.
    const theoMa = new Map(dungMucDeChon(nguon).map((m) => [m.ma, m]));
    const muc = than.ma.map((m) => theoMa.get(m)).filter((m) => m !== undefined);
    return Response.json({ muc }, { headers: KHONG_LUU_DEM });
  } catch (loi) {
    console.error("[catalogue-chon] loi doc du lieu mau:", loi);
    return new Response(null, { status: 502, headers: KHONG_LUU_DEM });
  }
}
