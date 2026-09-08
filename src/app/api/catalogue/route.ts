import { z } from "zod";
import { getSessionUser } from "@/auth/guard";
import { SO_MUC_TOI_DA } from "@/modules/catalogue-share/chia-se.model";
import {
  DAI_TEN_TOI_DA,
  LoiCatalogueRong,
  taoCatalogue,
} from "@/modules/catalogue-share/chia-se.service";

/** So anh toi da moi mau — thu vien lon nhat hien co la 8, 40 la thua rong rai. */
const SO_ANH_TOI_DA = 40;

const Than = z.object({
  ten: z.string().max(DAI_TEN_TOI_DA).default(""),
  chon: z
    .array(
      z.object({
        ma: z.string().min(1).max(80),
        anh: z.array(z.string().min(1).max(120)).max(SO_ANH_TOI_DA),
      }),
    )
    .min(1)
    .max(SO_MUC_TOI_DA),
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
    const kq = await taoCatalogue(than.ten, than.chon);
    return Response.json(kq, { status: 201, headers: KHONG_LUU_DEM });
  } catch (loi) {
    // Chon toan ma khong con tren bang tinh -> khong phai loi he thong, phai
    // noi ro cho sale biet ma chon lai.
    if (loi instanceof LoiCatalogueRong) {
      return new Response(null, { status: 422, headers: KHONG_LUU_DEM });
    }
    console.error("[catalogue] loi tao catalogue:", loi);
    return new Response(null, { status: 502, headers: KHONG_LUU_DEM });
  }
}
