import { getSessionUser } from "@/auth/guard";
import { docAnhGopY } from "@/modules/gop-y/gop-y.service";

/**
 * Anh chup man hinh kem theo mot gop y. CHI quan tri doc duoc.
 *
 * Vi sao khong dung URL co ky cua Storage: mot URL co ky la mot chuoi ai cam
 * duoc cung mo duoc, va no song tiep sau khi nguoi do bi khoa tai khoan. Anh
 * nay chua gia, ma mau, duong dan link khach — no phai di qua mot cua gac doc
 * lai quyen o MOI yeu cau.
 */

const KHONG_LUU_DEM = { "Cache-Control": "private, no-store" };

/**
 * Ma gop y la uuid do Postgres cap. Chan chuoi la TRUOC khi hoi co so du lieu:
 * de no xuong toi Postgres thi cot uuid nem "invalid input syntax" va tuyen tra
 * 502 — trong nhu kho anh dang hong, trong khi chi la mot duong dan go sai.
 */
const MA_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const user = await getSessionUser();
  // Tra 404 chu khong 403 cho nguoi khong du quyen: 403 xac nhan "co mot anh o
  // day", va do da la mot manh thong tin.
  if (user === null || !user.isActive || user.mucQuyen !== "admin") {
    return new Response(null, { status: 404, headers: KHONG_LUU_DEM });
  }

  const { id } = await params;
  if (!MA_UUID.test(id)) return new Response(null, { status: 404, headers: KHONG_LUU_DEM });

  let anh: Awaited<ReturnType<typeof docAnhGopY>>;
  try {
    anh = await docAnhGopY(id);
  } catch (loi) {
    console.error("[gop-y] khong doc duoc anh:", loi);
    return new Response(null, { status: 502, headers: KHONG_LUU_DEM });
  }
  if (!anh) return new Response(null, { status: 404, headers: KHONG_LUU_DEM });

  return new Response(new Uint8Array(anh.byte), {
    headers: {
      "Content-Type": anh.kieu,
      "Content-Length": String(anh.byte.byteLength),
      // Kieu lay tu duoi khoa (chi png/jpeg/webp — xem tachDataUrl). nosniff de
      // trinh duyet khong tu doan ra mot kieu khac tu noi dung tep.
      "X-Content-Type-Options": "nosniff",
      ...KHONG_LUU_DEM,
    },
  });
}
