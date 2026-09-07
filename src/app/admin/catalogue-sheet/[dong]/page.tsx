import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/auth/guard";
import { layAnhCuaMau, layDanhSachCatalogue, nguonDangDung } from "@/modules/sheet/catalogue.service";
import type { AnhTrongThuMuc } from "@/modules/sheet/drive.client";
import type { CoBatThuong, DongCatalogue } from "@/modules/sheet/catalogue.mapper";
import { vi } from "@/messages/vi";

const NHAN_CO: Record<CoBatThuong, string> = {
  "thieu-sku": vi.catalogue_sheet.co_thieu_sku,
  "thieu-anh": vi.catalogue_sheet.co_thieu_anh,
  "thieu-mo-ta": vi.catalogue_sheet.co_thieu_mo_ta,
  "trung": vi.catalogue_sheet.co_trung,
  "tl-vang-lech": vi.catalogue_sheet.co_tl_vang_lech,
};

/** Chuan tieng Viet dung dau phay thap phan, du bang tinh ghi dau cham. */
function dinhDangGam(v: number | null): string | null {
  return v === null ? null : `${v.toFixed(2).replace(".", ",")} g`;
}

/** Mot dong thong so: nhan nho o tren, gia tri o duoi. */
function ThongSo({ nhan, gia_tri }: { nhan: string; gia_tri: string | null }) {
  return (
    <div className="border-b border-hp-rule py-3">
      <dt className="text-[11px] uppercase tracking-[0.14em] text-hp-muted">{nhan}</dt>
      <dd className="mt-1 text-hp-body">
        {gia_tri ?? <span className="text-hp-muted">{vi.catalogue_sheet.o_trong}</span>}
      </dd>
    </div>
  );
}

export default async function TrangChiTietMau({
  params,
}: {
  params: Promise<{ dong: string }>;
}) {
  await requireUser();
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
      <div className="mb-8">
        <Link
          href="/admin/catalogue-sheet"
          className="text-[11px] uppercase tracking-[0.14em] text-hp-muted
                     transition-colors duration-150 hover:text-hp-ink hover:underline"
        >
          {vi.catalogue_sheet.quay_lai}
        </Link>
        <h1 className="mt-3 font-title text-[32px] leading-none tracking-[0.02em] text-hp-ink">
          {d.maMau ?? vi.catalogue_sheet.chua_co_ma_mau}
        </h1>
        {d.chiTiet && <p className="mt-3 text-sm text-hp-body">{d.chiTiet}</p>}
        {d.co.length > 0 && (
          <p className="mt-3 text-[10px] uppercase tracking-[0.14em] text-hp-muted">
            {d.co.map((c) => NHAN_CO[c]).join(" · ")}
          </p>
        )}
        <div className="mt-5 h-px bg-hp-rule" />
      </div>

      <div className="grid gap-10 lg:grid-cols-[20rem_1fr]">
        <dl className="self-start">
          <ThongSo nhan={vi.catalogue_sheet.cot_sku} gia_tri={d.sku} />
          <ThongSo nhan={vi.catalogue_sheet.cot_so} gia_tri={d.so} />
          <ThongSo nhan={vi.catalogue_sheet.cot_mo} gia_tri={d.mo} />
          <ThongSo nhan={vi.catalogue_sheet.cot_loai} gia_tri={d.loai} />
          <ThongSo nhan={vi.catalogue_sheet.cot_dong_sp} gia_tri={d.dongSp} />
          <ThongSo nhan={vi.catalogue_sheet.cot_chat_lieu} gia_tri={d.chatLieu} />
          <ThongSo nhan={vi.catalogue_sheet.cot_tl_vang} gia_tri={dinhDangGam(d.tlVang)} />
          <ThongSo nhan={vi.catalogue_sheet.cot_size} gia_tri={d.size} />
          <ThongSo nhan={vi.catalogue_sheet.cot_o_chu} gia_tri={d.oChu} />

          {d.urlThuMuc && (
            <div className="pt-4">
              <a
                href={d.urlThuMuc}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] uppercase tracking-[0.14em] text-hp-muted
                           transition-colors duration-150 hover:text-hp-ink hover:underline"
              >
                {vi.catalogue_sheet.mo_thu_muc}
              </a>
            </div>
          )}
        </dl>

        <section>
          <div className="mb-4 flex items-baseline gap-4">
            <h2 className="text-[11px] uppercase tracking-[0.14em] text-hp-muted">
              {vi.catalogue_sheet.thu_vien_anh}
            </h2>
            {anh.length > 0 && (
              <span className="text-xs tabular-nums text-hp-muted">
                {vi.catalogue_sheet.dem_anh.replace("{n}", String(anh.length))}
              </span>
            )}
          </div>

          {loiAnh ? (
            <p className="text-sm text-hp-muted">{vi.catalogue_sheet.loi_doc_anh}</p>
          ) : anh.length === 0 ? (
            /* Ba nguyen nhan khac han nhau, khong duoc gop thanh mot cau chung:
               nguoi doc phai biet day la thieu du lieu, thu muc rong, hay chi la
               gioi han cua ban xem thu. */
            <p className="text-sm text-hp-muted">
              {d.idThuMuc === null
                ? vi.catalogue_sheet.chua_co_thu_muc
                : nguonDangDung() === "mau"
                  ? vi.catalogue_sheet.thu_vien_ngoai_mau
                  : vi.catalogue_sheet.thu_muc_rong}
            </p>
          ) : (
            <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
              {anh.map((a) => (
                <li key={a.fileId} className="border border-hp-rule bg-hp-card">
                  <div className="flex aspect-square items-center justify-center bg-hp-inset">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/api/anh-drive/${a.fileId}`}
                      alt={a.ten}
                      loading="lazy"
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <p className="truncate px-3 py-2 text-[10px] text-hp-muted" title={a.ten}>
                    {a.ten}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
