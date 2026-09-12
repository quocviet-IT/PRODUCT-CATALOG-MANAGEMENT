import { z } from "zod";
import {
  LoiChuaBatDongBo,
  SO_ANH_MOI_THU_MUC,
  docTrangThai,
  ghiTrangThai,
  gopAnhThuMuc,
  kiemKhoa,
} from "@/modules/sheet/dong-bo";

/**
 * Nhận một LÔ thư mục vừa liệt kê và GỘP vào bản đồ đã có.
 *
 * Gộp chứ không ghi đè: việc liệt kê hàng nghìn thư mục Drive không xong trong
 * một lượt chạy Apps Script (6 phút), nên nó phải chia nhiều lượt. Ghi đè ở đây
 * là mỗi lượt xoá sạch công của lượt trước, và bản đồ không bao giờ đầy.
 *
 * Một thư mục thật sự rỗng vẫn phải được gửi lên với mảng rỗng — có mặt trong
 * bản đồ nghĩa là "đã liệt kê rồi", và đó là thứ ngăn script hỏi lại nó mãi.
 *
 * NHƯNG từ 11/09/2026 thư mục được liệt kê LẠI mỗi 30 phút, nên mảng rỗng gửi
 * lên cho một thư mục ĐANG có ảnh thì bị bỏ qua (giuLai) — script gửi mảng rỗng
 * cả khi không mở được thư mục, và một lần Drive trục trặc không được phép xoá
 * sạch thư viện ảnh của mẫu đang nằm trên catalogue.
 */

const KHONG_LUU_DEM = { "Cache-Control": "private, no-store" };

/** Giữ gói tin dưới trần 4,5 MB của Vercel. */
const SO_THU_MUC_MOI_LAN = 400;

const Than = z.object({
  anhThuMuc: z
    .record(
      z.string().min(1).max(200),
      z
        .array(z.object({ fileId: z.string().min(1).max(120), ten: z.string().max(300) }))
        .max(SO_ANH_MOI_THU_MUC),
    )
    .refine((b) => Object.keys(b).length <= SO_THU_MUC_MOI_LAN, "qua nhieu thu muc mot lan"),
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

  // So dem lay THANG tu buoc gop — no da cam ban do trong tay. Khong cong don
  // so cua rieng lo nay: cong don thi chay lai mot lo se dem hai lan, va dong
  // chu trang thai bao sai.
  const { tong, themMoi, soAnh, giuLai } = await gopAnhThuMuc(than.anhThuMuc);
  const truoc = await docTrangThai();
  if (truoc) {
    await ghiTrangThai({ ...truoc, luc: new Date().toISOString(), soThuMuc: tong, soAnh });
  }

  return Response.json({ tong, themMoi, soAnh, giuLai }, { headers: KHONG_LUU_DEM });
}
