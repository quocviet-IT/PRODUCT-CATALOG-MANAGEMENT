import { anhXaBang, type OTho } from "@/modules/sheet/catalogue.mapper";
import { taiVe } from "@/modules/media/storage";
import {
  KHOA_BANG,
  LoiChuaBatDongBo,
  docAnhThuMuc,
  kiemKhoa,
} from "@/modules/sheet/dong-bo";

/**
 * Tra lại những thư mục ảnh CHƯA được liệt kê.
 *
 * VÌ SAO CẦN: bảng tính lớn từ 71 lên 1.854 mẫu, trỏ tới 1.476 thư mục Drive.
 * DriveApp liệt kê mất khoảng nửa giây một thư mục — hơn 13 phút cho cả lượt,
 * trong khi Apps Script cắt ngang ở 6 phút. Lượt chạy đầy đủ vì thế chết giữa
 * chừng và không bao giờ tới bước gửi kết quả, nên bản đồ thư mục đóng băng ở
 * 65 cái từ hồi bảng còn nhỏ: 1.625 mẫu mất sạch thư viện ảnh.
 *
 * Chia thành nhiều lượt thì phải có chỗ hỏi "còn thiếu cái nào" — chính là đây.
 * Cùng lối với `/api/dong-bo/thieu-anh`: máy chủ tự suy ra từ bản chụp vừa nhận,
 * script không phải mang theo danh sách.
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
  const canCo = new Set<string>();
  for (const d of anhXaBang(bang)) if (d.idThuMuc) canCo.add(d.idThuMuc);

  const thieu = [...canCo].filter((id) => !(id in daCo));

  return Response.json(
    { thieu: thieu.slice(0, SO_TRA_TOI_DA), tongThieu: thieu.length, tong: canCo.size },
    { headers: KHONG_LUU_DEM },
  );
}
