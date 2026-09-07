import type { DongCatalogue } from "@/modules/sheet/catalogue.mapper";
import {
  layAnhCuaMau,
  layDanhSachCatalogue,
  nguonDangDung,
} from "@/modules/sheet/catalogue.service";
import type { AnhTrongThuMuc } from "@/modules/sheet/drive.client";

export type DuLieuChiTiet = {
  dong: DongCatalogue;
  anh: AnhTrongThuMuc[];
  /** True khi doc thu muc anh that bai — khac han voi thu muc rong. */
  loiAnh: boolean;
  nguon: "mau" | "bang-tinh";
};

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ dong: string }> },
): Promise<Response> {
  // Khong gac dang nhap: catalogue dang mo cong khai theo yeu cau, cong dang
  // nhap se lam sau. Tuyen nay chi doc, khong ghi gi.
  const { dong } = await params;
  const so = Number(dong);
  if (!Number.isInteger(so) || so < 1) {
    return new Response(null, { status: 400, headers: { "Cache-Control": "private, no-store" } });
  }

  let ds: DongCatalogue[];
  try {
    ds = await layDanhSachCatalogue();
  } catch (loi) {
    console.error("[catalogue-sheet] loi doc bang tinh o api chi tiet:", loi);
    return new Response(null, { status: 502, headers: { "Cache-Control": "private, no-store" } });
  }

  const d = ds.find((x) => x.dongSheet === so);
  if (!d) {
    return new Response(null, { status: 404, headers: { "Cache-Control": "private, no-store" } });
  }

  // Thu vien anh hong khong duoc lam hong ca phan thong so.
  let anh: AnhTrongThuMuc[] = [];
  let loiAnh = false;
  if (d.idThuMuc) {
    try {
      anh = await layAnhCuaMau(d.idThuMuc);
    } catch (loi) {
      loiAnh = true;
      console.error(`[catalogue-sheet] loi doc thu muc anh ${d.idThuMuc}:`, loi);
    }
  }

  const body: DuLieuChiTiet = { dong: d, anh, loiAnh, nguon: nguonDangDung() };
  return Response.json(body, { headers: { "Cache-Control": "private, no-store" } });
}
