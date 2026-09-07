import Link from "next/link";
import { notFound } from "next/navigation";
import {
  layAnhCuaMau,
  layDanhSachCatalogue,
  nguonDangDung,
} from "@/modules/sheet/catalogue.service";
import type { AnhTrongThuMuc } from "@/modules/sheet/drive.client";
import type { DongCatalogue } from "@/modules/sheet/catalogue.mapper";
import { ChiTietMau } from "../chi-tiet-mau";
import { vi } from "@/messages/vi";

export default async function TrangChiTietMau({
  params,
}: {
  params: Promise<{ dong: string }>;
}) {
  const { dong } = await params;

  let tatCa: DongCatalogue[];
  try {
    tatCa = await layDanhSachCatalogue();
  } catch (loi) {
    console.error("[catalogue-sheet] loi doc bang tinh o trang chi tiet:", loi);
    return <p className="text-sm text-hp-pink-strong">{vi.catalogue_sheet.loi_doc_bang}</p>;
  }

  // Khoa la SO DONG cua bang tinh, khong phai ma mau: ma mau co the trung
  // (co "trung" ton tai la vi vay) va 14 dong khong he co SKU.
  const d = tatCa.find((x) => x.dongSheet === Number(dong));
  if (!d) notFound();

  // Thu vien anh khong duoc lam sap trang: thieu quyen Drive hay thu muc bi xoa
  // thi van hien day du thong so, chi khuyet phan anh.
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

  return (
    <>
      <Link
        href="/admin/catalogue-sheet"
        className="mb-6 inline-block text-[11px] uppercase tracking-[0.14em] text-hp-muted
                   transition-colors duration-150 hover:text-hp-ink hover:underline"
      >
        {vi.catalogue_sheet.quay_lai}
      </Link>
      {/* Trang rieng nay giu lai cho lien ket truc tiep va cho truong hop khong
          co JavaScript. Anh o day khong phong to duoc — khung phong to nam trong
          ngan truot, la thanh phan phia client. */}
      <ChiTietMau d={d} anh={anh} loiAnh={loiAnh} nguon={nguonDangDung()} />
    </>
  );
}
