import { CANH_DAI_ANH_SHEET, CO_ANH_HOP_LE, layUrlAnhSheet } from "@/modules/media/anh-drive";

// fileId den tu duong dan URL nen khong tin duoc. Chan truoc khi dung no
// de dung khoa Storage hay goi Drive.
const DANG_FILE_ID = /^[A-Za-z0-9_-]{10,80}$/;

// URL co ky tra ve chi dung mot lan cho MOT phien va het han sau mot gio
// (xem HAN_URL_GIAY trong anh-drive.ts). Vi vay chinh chuyen huong nay khong
// duoc phep nam trong bat ky bo dem trung gian nao: mot Location bi cache qua
// thoi han se tra ra anh vo lang le. Anh o dau ben kia van duoc cache binh
// thuong theo header cua Supabase Storage.
const KHONG_LUU_DEM = "private, no-store";

function phanHoiRong(status: number, headers?: HeadersInit): Response {
  return new Response(null, {
    status,
    headers: { "Cache-Control": KHONG_LUU_DEM, ...headers },
  });
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ fileId: string }> },
): Promise<Response> {
  // Khong gac dang nhap: catalogue dang mo cong khai theo yeu cau, cong dang
  // nhap se lam sau. Hai chan con lai (dang fileId, danh sach co cho phep)
  // VAN CAN THIET — chung khong gac nguoi, chung gac dau vao tu URL.
  const { fileId } = await params;
  if (!DANG_FILE_ID.test(fileId)) {
    return phanHoiRong(400);
  }

  // Co anh den tu URL nen phai doi chieu danh sach cho phep: mot gia tri tuy y
  // se sinh vo han khoa cache khac nhau trong bucket.
  const w = Number(new URL(req.url).searchParams.get("w"));
  const canhDai = (CO_ANH_HOP_LE as readonly number[]).includes(w) ? w : CANH_DAI_ANH_SHEET;

  try {
    const url = await layUrlAnhSheet(fileId, canhDai);
    return phanHoiRong(302, { Location: url });
  } catch (loi) {
    // Mot anh hong khong duoc lam hong ca luoi — nguoi goi (tag <img>) chi
    // nhan 502 rong, khong bao gio lo van ban loi tho cua libvips/Drive ra
    // ngoai. Nhung neu khong ghi lai o day thi ca bon nguyen nhan co the xay
    // ra (Drive thieu/khong truy cap duoc, anh khong hop le tuc LoiAnhKhongHopLe,
    // Supabase Storage sap, hay sai khoa service account) deu bien mat khong
    // dau vet — khong con gi de grep khi anh vo xuat hien hang loat tren luoi.
    console.error(`[anh-drive] loi lay url anh cho fileId=${fileId}:`, loi);
    return phanHoiRong(502);
  }
}
