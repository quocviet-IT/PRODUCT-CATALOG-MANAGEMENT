import { CANH_DAI_ANH_SHEET, CO_ANH_HOP_LE, layAnhSheet } from "@/modules/media/anh-drive";

// fileId den tu duong dan URL nen khong tin duoc. Chan truoc khi dung no
// de dung khoa Storage hay goi Drive.
const DANG_FILE_ID = /^[A-Za-z0-9_-]{10,80}$/;

/**
 * Anh cua mot (fileId, co) KHONG BAO GIO DOI: khoa bo dem gom ca hai, va duong
 * dong bo khong ghi de len tam da co. Vi vay cho cache that lau va danh dau
 * immutable — CDN cua Vercel giu lai, va tu luot xem thu hai tro di khong con
 * luot goi nao sang Supabase.
 *
 * Ban truoc dat "private, no-store" vi tuyen nay tra ve mot URL co ky het han
 * sau mot gio. Gio no tra thang bytes nen han do khong con lien quan.
 */
const LUU_DEM_LAU = "public, max-age=2592000, immutable";
/** Loi thi KHONG duoc cache: mot 502 bi giu lai la anh chet suot ca thang. */
const KHONG_LUU_DEM = "private, no-store";

function phanHoiRong(status: number): Response {
  return new Response(null, {
    status,
    headers: { "Cache-Control": KHONG_LUU_DEM },
  });
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ fileId: string }> },
): Promise<Response> {
  // TUYEN NAY PHAI CONG KHAI — dung them cong dang nhap vao day.
  //
  // No phuc vu anh cho CA khu noi bo lan trang khach xem /catalogue/<slug>.
  // Khach hang khong co Gmail cong ty; gac tuyen nay lai thi moi link da
  // gui cho khach deu mat sach anh, ma trang van len 200 nen rat lau moi
  // co ai bao. Co mot test khoa dieu nay lai.
  //
  // Hai chan con lai (dang fileId, danh sach co cho phep) VAN CAN THIET —
  // chung khong gac nguoi, chung gac dau vao tu URL.
  const { fileId } = await params;
  if (!DANG_FILE_ID.test(fileId)) {
    return phanHoiRong(400);
  }

  // Co anh den tu URL nen phai doi chieu danh sach cho phep: mot gia tri tuy y
  // se sinh vo han khoa cache khac nhau trong bucket.
  const w = Number(new URL(req.url).searchParams.get("w"));
  const canhDai = (CO_ANH_HOP_LE as readonly number[]).includes(w) ? w : CANH_DAI_ANH_SHEET;

  try {
    const anh = await layAnhSheet(fileId, canhDai);
    return new Response(new Uint8Array(anh), {
      headers: {
        "Content-Type": "image/webp",
        "Content-Length": String(anh.byteLength),
        "Cache-Control": LUU_DEM_LAU,
      },
    });
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
