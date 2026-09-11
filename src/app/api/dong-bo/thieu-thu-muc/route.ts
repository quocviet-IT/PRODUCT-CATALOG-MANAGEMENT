import { anhXaBang, type OTho } from "@/modules/sheet/catalogue.mapper";
import { taiVe } from "@/modules/media/storage";
import {
  KHOA_BANG,
  LoiChuaBatDongBo,
  docAnhThuMuc,
  docLucThuMuc,
  kiemKhoa,
} from "@/modules/sheet/dong-bo";
import { thuMucCanLietKe } from "@/modules/sheet/thu-muc-can-liet-ke";

/**
 * Tra lại những thư mục ảnh cần Apps Script liệt kê: CHƯA liệt kê, và (từ
 * 11/09/2026) đã liệt kê QUÁ 30 PHÚT.
 *
 * VÌ SAO CẦN: bảng tính từng trỏ tới 1.476 thư mục Drive. DriveApp liệt kê mất
 * hơn một giây một thư mục, trong khi Apps Script cắt ngang ở 6 phút — nên phải
 * chia nhiều lượt, và chia lượt thì phải có chỗ hỏi "còn cái nào" — chính là đây.
 * Cùng lối với `/api/dong-bo/thieu-anh`: máy chủ tự suy ra từ bản chụp vừa nhận,
 * script không phải mang theo danh sách.
 *
 * LIỆT KÊ LẠI: trước đây mỗi thư mục chỉ được liệt kê một lần, nên thêm hay bớt
 * ảnh BÊN TRONG một thư mục "Hình đã xử lý" đã có thì web không bao giờ thấy.
 * Nay thư mục mới đứng trước, rồi tới thư mục quá hạn — cũ nhất trước. Xem
 * modules/sheet/thu-muc-can-liet-ke.ts.
 */

const KHONG_LUU_DEM = { "Cache-Control": "private, no-store" };

/** Một lượt Apps Script liệt kê được vài trăm thư mục; đưa dư một chút. */
const SO_TRA_TOI_DA = 600;

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
  try {
    bang = JSON.parse((await taiVe(KHOA_BANG)).toString("utf8")) as OTho[][];
  } catch (loi) {
    console.error("[dong-bo] chua co ban chup de doi chieu thu muc:", loi);
    return Response.json({ loi: "chua_co_bang" }, { status: 409, headers: KHONG_LUU_DEM });
  }

  const daCo = await docAnhThuMuc();
  const lucLietKe = await docLucThuMuc();
  const canCo: string[] = [];
  for (const d of anhXaBang(bang)) if (d.idThuMuc) canCo.push(d.idThuMuc);

  const { moi, cu } = thuMucCanLietKe(canCo, daCo, lucLietKe, Date.now());
  const thieu = [...moi, ...cu];

  return Response.json(
    {
      thieu: thieu.slice(0, SO_TRA_TOI_DA),
      tongThieu: thieu.length,
      tong: new Set(canCo).size,
      soMoi: moi.length,
      soCu: cu.length,
    },
    { headers: KHONG_LUU_DEM },
  );
}
