import type { CoBatThuong, DongCatalogue } from "@/modules/sheet/catalogue.mapper";
import type { AnhTrongThuMuc } from "@/modules/sheet/drive.client";
import { vi } from "@/messages/vi";

/**
 * Phan trinh bay chi tiet mot mau. KHONG doc du lieu, khong biet minh dang nam
 * trong trang rieng hay trong ngan truot — nho vay ca hai cho dung chung mot
 * ban va khong bao gio lech nhau.
 */

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

export function ChiTietMau({
  d,
  anh,
  loiAnh,
  nguon,
  khiBamAnh,
}: {
  d: DongCatalogue;
  anh: AnhTrongThuMuc[];
  loiAnh: boolean;
  nguon: "mau" | "bang-tinh";
  /** Co ham nay thi anh bam duoc de phong to; khong co thi anh chi de xem. */
  khiBamAnh?: (a: AnhTrongThuMuc) => void;
}) {
  return (
    <>
      <h2 className="font-title text-[28px] leading-none tracking-[0.02em] text-hp-ink">
        {d.maMau ?? vi.catalogue_sheet.chua_co_ma_mau}
      </h2>
      {d.chiTiet && <p className="mt-3 text-sm text-hp-body">{d.chiTiet}</p>}
      {d.co.length > 0 && (
        <p className="mt-3 text-[10px] uppercase tracking-[0.14em] text-hp-muted">
          {d.co.map((c) => NHAN_CO[c]).join(" · ")}
        </p>
      )}
      <div className="mt-5 h-px bg-hp-rule" />

      <dl className="mt-6">
        <ThongSo nhan={vi.catalogue_sheet.cot_sku} gia_tri={d.sku} />
        <ThongSo nhan={vi.catalogue_sheet.cot_so} gia_tri={d.so} />
        <ThongSo nhan={vi.catalogue_sheet.cot_mo} gia_tri={d.mo} />
        <ThongSo nhan={vi.catalogue_sheet.cot_loai} gia_tri={d.loai} />
        <ThongSo nhan={vi.catalogue_sheet.cot_dong_sp} gia_tri={d.dongSp} />
        <ThongSo nhan={vi.catalogue_sheet.cot_chat_lieu} gia_tri={d.chatLieu} />
        <ThongSo nhan={vi.catalogue_sheet.cot_tl_vang} gia_tri={dinhDangGam(d.tlVang)} />
        <ThongSo nhan={vi.catalogue_sheet.cot_size} gia_tri={d.size} />
        <ThongSo nhan={vi.catalogue_sheet.cot_o_chu} gia_tri={d.oChu} />
      </dl>

      {d.urlThuMuc && (
        <a
          href={d.urlThuMuc}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-block text-[11px] uppercase tracking-[0.14em] text-hp-muted
                     transition-colors duration-150 hover:text-hp-ink hover:underline"
        >
          {vi.catalogue_sheet.mo_thu_muc}
        </a>
      )}

      <div className="mt-8 mb-4 flex items-baseline gap-4">
        <h3 className="text-[11px] uppercase tracking-[0.14em] text-hp-muted">
          {vi.catalogue_sheet.thu_vien_anh}
        </h3>
        {anh.length > 0 && (
          <span className="text-xs tabular-nums text-hp-muted">
            {vi.catalogue_sheet.dem_anh.replace("{n}", String(anh.length))}
          </span>
        )}
      </div>

      {loiAnh ? (
        <p className="text-sm text-hp-muted">{vi.catalogue_sheet.loi_doc_anh}</p>
      ) : anh.length === 0 ? (
        /* Ba nguyen nhan khac han nhau, khong duoc gop thanh mot cau chung. */
        <p className="text-sm text-hp-muted">
          {d.idThuMuc === null
            ? vi.catalogue_sheet.chua_co_thu_muc
            : nguon === "mau"
              ? vi.catalogue_sheet.thu_vien_ngoai_mau
              : vi.catalogue_sheet.thu_muc_rong}
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {anh.map((a) => {
            const khung = (
              <>
                <div className="flex aspect-square items-center justify-center bg-hp-inset">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/api/anh-drive/${a.fileId}`}
                    alt={a.ten}
                    loading="lazy"
                    className="h-full w-full object-contain"
                  />
                </div>
                <p className="truncate px-2 py-1.5 text-[10px] text-hp-muted" title={a.ten}>
                  {a.ten}
                </p>
              </>
            );
            return (
              <li key={a.fileId} className="border border-hp-rule bg-hp-card">
                {khiBamAnh ? (
                  <button
                    type="button"
                    onClick={() => khiBamAnh(a)}
                    aria-label={vi.catalogue_sheet.phong_to.replace("{ten}", a.ten)}
                    className="block w-full cursor-zoom-in text-left transition-colors
                               duration-150 hover:bg-hp-inset"
                  >
                    {khung}
                  </button>
                ) : (
                  khung
                )}
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
