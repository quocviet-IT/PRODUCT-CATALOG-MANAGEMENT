import { z } from "zod";
import { getSessionUser } from "@/auth/guard";
import { SO_MUC_TOI_DA } from "@/modules/catalogue-share/chia-se.model";
import {
  DAI_TEN_TOI_DA,
  LoiCatalogueRong,
  taoCatalogue,
} from "@/modules/catalogue-share/chia-se.service";
import { docGiaoDien } from "@/modules/catalogue-share/giao-dien.model";
import { SO_ANH_MOI_THU_MUC } from "@/modules/sheet/dong-bo";

/**
 * So anh toi da moi mau — LAY THANG tu tran cua dong bo, khong dat rieng.
 *
 * Truoc day cho nay ghi 40 kem ghi chu "thu vien lon nhat hien co la 8". Cau
 * do dung luc anh con lay tu mot o trong bang tinh. Tu khi dong bo quet thu
 * muc Drive, mot mau mang trung binh 23 anh va nhieu nhat 166 — 112 thu muc
 * vuot 40, tuc 7,7% mau bi tu choi bang loi 400 khong loi giai thich.
 *
 * Bai hoc: mot tran o day PHAI bang tran ma dong bo ghi vao, khong duoc doan
 * lai. Nen no la mot bien duy nhat, dung chung.
 */
const SO_ANH_TOI_DA = SO_ANH_MOI_THU_MUC;

const Than = z.object({
  ten: z.string().max(DAI_TEN_TOI_DA).default(""),
  // Ten link rieng. Khong gui (trinh duyet cu) hay bo trong thi link theo ten.
  tenLink: z.string().max(DAI_TEN_TOI_DA).default(""),
  chon: z
    .array(
      z.object({
        ma: z.string().min(1).max(80),
        anh: z.array(z.string().min(1).max(120)).max(SO_ANH_TOI_DA),
        // Loi gioi thieu tung mau. Chan tho o day; cat ve DAI_GIOI_THIEU trong
        // dungNoiDung — mot noi quyet dinh do dai, khong phai hai.
        gioiThieu: z.string().max(2000).optional(),
      }),
    )
    .min(1)
    .max(SO_MUC_TOI_DA),
  // Khong ta hinh dang o day: docGiaoDien() da nhan moi gia tri la va tra ve
  // bo mac dinh. Ta lai bang zod la hai ban ta cung mot thu, va chung se lech
  // nhau vao lan them lua chon tiep theo.
  giaoDien: z.unknown().optional(),
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
    const kq = await taoCatalogue(
      than.ten,
      than.chon,
      docGiaoDien(than.giaoDien),
      user.id,
      than.tenLink,
    );
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
