import { CO_ANH_HOP_LE } from "@/modules/media/anh-drive";
import { THU_MUC_DEM_ANH, dungKhoaAnhSheet } from "@/modules/media/khoa-anh";
import { lietKeTen, taiVe } from "@/modules/media/storage";
import { anhXaBang, type OTho } from "@/modules/sheet/catalogue.mapper";
import { anhCanDongBo } from "@/modules/sheet/anh-can-dong-bo";
import type { AnhTrongThuMuc } from "@/modules/sheet/drive.client";
import { KHOA_ANH_THU_MUC, KHOA_BANG, LoiChuaBatDongBo, kiemKhoa } from "@/modules/sheet/dong-bo";

/**
 * Tra lai nhung anh CHUA co trong bo dem, tinh tu chinh ban chup vua duoc day
 * len — script khong phai mang theo danh sach.
 *
 * Vi sao may chu tu suy ra: lan dong bo dau tien co hon mot nghin anh, ma moi
 * luot chay Apps Script chi duoc vai phut nen phai chay nhieu luot. Neu script
 * phai tu giu danh sach giua cac luot thi no phai doc lai ca bang tinh va 65
 * thu muc Drive moi lan — trong khi may chu vua nhan dung danh sach do xong.
 *
 * CHI anh trong thu muc cot "Hinh da xu ly" cua nhung dong dang co trong bang
 * (chot 11/09/2026) — xem modules/sheet/anh-can-dong-bo.ts. Khong con nap anh
 * cot HINH, va khong con lap qua MOI thu muc trong ban do: ban do chi gop them,
 * nen sau khi tab rut tu 1.839 dong xuong 12 no van giu 1.464 thu muc cu, va
 * duong nay da nap tiep anh cua chung.
 *
 * Mot anh chi tinh la "da co" khi CA HAI co (600 va 1400) deu nam trong bo dem:
 * thieu ban lon thi khung xem phong to van phai goi Drive — dung thu ma duong
 * nay sinh ra de tranh.
 */

const KHONG_LUU_DEM = { "Cache-Control": "private, no-store" };

/** Mot luot Apps Script khong the tai het nghin anh; dua vua du mot luot lam. */
const SO_TRA_TOI_DA = 400;

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

  let bang: OTho[][];
  let anhThuMuc: Record<string, AnhTrongThuMuc[]>;
  try {
    bang = JSON.parse((await taiVe(KHOA_BANG)).toString("utf8")) as OTho[][];
    anhThuMuc = JSON.parse((await taiVe(KHOA_ANH_THU_MUC)).toString("utf8")) as Record<
      string,
      AnhTrongThuMuc[]
    >;
  } catch (loi) {
    // Chua day bang len lan nao. Day khong phai loi cua nguoi goi — bao ro de
    // script biet phai chay dong bo du lieu truoc, chu dung tra "khong thieu gi".
    console.error("[dong-bo] chua co ban chup de doi chieu anh:", loi);
    return Response.json({ loi: "chua_co_bang" }, { status: 409, headers: KHONG_LUU_DEM });
  }

  const thuTu = anhCanDongBo(anhXaBang(bang), anhThuMuc);

  // Doi chieu bang KHOA DAY DU do chinh dungKhoaAnhSheet dung ra, khong tu ghep
  // lai chuoi o day: cach dat ten bo dem chi duoc dinh nghia o MOT noi, khong
  // thi doi ten mot ben la ben kia bao "thieu het" ma khong ai hay.
  const ten = await lietKeTen(THU_MUC_DEM_ANH);
  const daCo = new Set([...ten].map((t) => `${THU_MUC_DEM_ANH}/${t}`));

  const thieu: string[] = [];
  const daXet = new Set<string>();
  let tongThieu = 0;
  for (const id of thuTu) {
    if (daXet.has(id)) continue;
    daXet.add(id);
    if (CO_ANH_HOP_LE.every((co) => daCo.has(dungKhoaAnhSheet(id, co)))) continue;
    tongThieu++;
    if (thieu.length < SO_TRA_TOI_DA) thieu.push(id);
  }

  return Response.json(
    { thieu, tongThieu, tongAnh: daXet.size },
    { headers: KHONG_LUU_DEM },
  );
}
