import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import {
  layAnhCuaMau,
  layDanhSachCatalogue,
  nguonDangDung,
} from "@/modules/sheet/catalogue.service";
import type { AnhTrongThuMuc } from "@/modules/sheet/drive.client";
import type { DongCatalogue } from "@/modules/sheet/catalogue.mapper";
import { ChiTietMau } from "../chi-tiet-mau";
import { layChu } from "@/messages/may-chu";

/**
 * Duong ve danh sach, GIU NGUYEN moi tham so dang co tren duong dan.
 *
 * Trang nay chi den tu mot duong dan truc tiep (danh sach mo chi tiet trong
 * ngan truot chu khong dieu huong). Ai gui link kem bo loc thi bam "Ve danh
 * sach" phai quay lai dung danh sach do, khong phai mot danh sach trong.
 */
function urlVeDanhSach(sp: Record<string, string | undefined>): string {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) if (v) q.set(k, v);
  const s = q.toString();
  return s ? `/admin/catalogue-sheet?${s}` : "/admin/catalogue-sheet";
}

export default async function TrangChiTietMau({
  params,
  searchParams,
}: {
  params: Promise<{ dong: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const t = await layChu();
  const { dong } = await params;
  const sp = await searchParams;

  let tatCa: DongCatalogue[];
  try {
    tatCa = await layDanhSachCatalogue();
  } catch (loi) {
    console.error("[catalogue-sheet] loi doc bang tinh o trang chi tiet:", loi);
    return <p className="text-sm text-hp-pink-strong">{t.catalogue_sheet.loi_doc_bang}</p>;
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
        href={urlVeDanhSach(sp)}
        className="mb-6 inline-flex items-center gap-1.5 text-[11px] uppercase
                   tracking-[0.14em] text-hp-muted transition-colors duration-150
                   hover:text-hp-ink"
      >
        <ArrowLeft aria-hidden strokeWidth={1.5} className="h-4 w-4" />
        {t.catalogue_sheet.quay_lai}
      </Link>
      {/* Trang rieng nay giu lai cho lien ket truc tiep va cho truong hop khong
          co JavaScript. Anh o day khong phong to duoc — khung phong to nam trong
          ngan truot, la thanh phan phia client. */}
      <ChiTietMau d={d} anh={anh} loiAnh={loiAnh} nguon={nguonDangDung()} t={t} />
    </>
  );
}
