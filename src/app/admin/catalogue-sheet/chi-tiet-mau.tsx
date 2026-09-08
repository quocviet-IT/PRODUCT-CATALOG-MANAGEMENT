import type { DongCatalogue } from "@/modules/sheet/catalogue.mapper";
import type { AnhTrongThuMuc } from "@/modules/sheet/drive.client";
import { FolderOpen, Images, Video } from "lucide-react";
import type { BoChu } from "@/messages";
import { nhanCo } from "./nhan-co";

/**
 * Phan trinh bay chi tiet mot mau. KHONG doc du lieu, khong biet minh dang nam
 * trong trang rieng hay trong ngan truot — nho vay ca hai cho dung chung mot
 * ban va khong bao gio lech nhau.
 */

/** Chuan tieng Viet dung dau phay thap phan, du bang tinh ghi dau cham. */
function dinhDangGam(v: number | null): string | null {
  return v === null ? null : `${v.toFixed(2).replace(".", ",")} g`;
}

function ThongSo({ nhan, gia_tri, t }: { nhan: string; gia_tri: string | null; t: BoChu }) {
  return (
    <div className="border-b border-hp-rule py-3">
      <dt className="text-[11px] uppercase tracking-[0.14em] text-hp-muted">{nhan}</dt>
      <dd className="mt-1 text-hp-body">
        {gia_tri ?? <span className="text-hp-muted">{t.catalogue_sheet.o_trong}</span>}
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
  t,
}: {
  d: DongCatalogue;
  anh: AnhTrongThuMuc[];
  loiAnh: boolean;
  nguon: "mau" | "bang-tinh";
  /** Co ham nay thi anh bam duoc de phong to; khong co thi anh chi de xem. */
  khiBamAnh?: (a: AnhTrongThuMuc) => void;
  /**
   * Bo chu truyen tu ben ngoai vao.
   *
   * Tep nay duoc dung tu CA HAI phia: trang chi tiet (server component) va ngan
   * truot (client component). Vi vay no khong duoc goi layChu() — chi chay o may
   * chu — cung khong duoc goi useChu() — chi chay o trinh duyet. Nhan qua doi so
   * la cach duy nhat chay dung o ca hai noi.
   */
  t: BoChu;
}) {
  return (
    <>
      <h2 className="font-title text-[28px] leading-none tracking-[0.02em] text-hp-ink">
        {d.maMau ?? t.catalogue_sheet.chua_co_ma_mau}
      </h2>
      {d.chiTiet && <p className="mt-3 text-sm text-hp-body">{d.chiTiet}</p>}
      {d.co.length > 0 && (
        <p className="mt-3 text-[10px] uppercase tracking-[0.14em] text-hp-muted">
          {d.co.map((c) => nhanCo(t)[c]).join(" · ")}
        </p>
      )}
      <div className="mt-5 h-px bg-hp-rule" />

      <dl className="mt-6">
        <ThongSo t={t} nhan={t.catalogue_sheet.cot_sku} gia_tri={d.sku} />
        <ThongSo t={t} nhan={t.catalogue_sheet.cot_so} gia_tri={d.so} />
        <ThongSo t={t} nhan={t.catalogue_sheet.cot_mo} gia_tri={d.mo} />
        <ThongSo t={t} nhan={t.catalogue_sheet.cot_loai_sp} gia_tri={d.loaiSp} />
        <ThongSo t={t} nhan={t.catalogue_sheet.cot_dong_sp} gia_tri={d.dongSp} />
        <ThongSo t={t} nhan={t.catalogue_sheet.cot_chat_lieu} gia_tri={d.chatLieu} />
        <ThongSo t={t} nhan={t.catalogue_sheet.cot_mau} gia_tri={d.mau} />
        <ThongSo t={t} nhan={t.catalogue_sheet.cot_tl_vang} gia_tri={dinhDangGam(d.tlVang)} />
        <ThongSo t={t} nhan={t.catalogue_sheet.cot_size} gia_tri={d.size} />
        <ThongSo t={t} nhan={t.catalogue_sheet.cot_o_chu} gia_tri={d.oChu} />
      </dl>

      {/* O day co cho nen ba lien ket hien ca chu, khac voi trong bang: bang
          lap lai chung tren moi dong nen chi hien icon. */}
      <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2">
        {([
          [d.urlThuMuc, t.catalogue_sheet.mo_thu_muc, FolderOpen],
          [d.urlAnhConcept, t.catalogue_sheet.mo_anh_concept, Images],
          [d.urlClipTho, t.catalogue_sheet.mo_clip_tho, Video],
        ] as const)
          .filter((x): x is readonly [string, string, typeof FolderOpen] => x[0] !== null)
          .map(([url, nhan, Icon]) => (
            <a
              key={nhan}
              href={url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-[11px] uppercase
                         tracking-[0.14em] text-hp-muted transition-colors duration-150
                         hover:text-hp-ink"
            >
              <Icon aria-hidden strokeWidth={1.5} className="h-4 w-4 shrink-0" />
              {nhan}
            </a>
          ))}
      </div>

      <div className="mt-8 mb-4 flex items-baseline gap-4">
        <h3 className="text-[11px] uppercase tracking-[0.14em] text-hp-muted">
          {t.catalogue_sheet.thu_vien_anh}
        </h3>
        {anh.length > 0 && (
          <span className="text-xs tabular-nums text-hp-muted">
            {t.catalogue_sheet.dem_anh.replace("{n}", String(anh.length))}
          </span>
        )}
      </div>

      {loiAnh ? (
        <p className="text-sm text-hp-muted">{t.catalogue_sheet.loi_doc_anh}</p>
      ) : anh.length === 0 ? (
        /* Ba nguyen nhan khac han nhau, khong duoc gop thanh mot cau chung. */
        <p className="text-sm text-hp-muted">
          {d.idThuMuc === null
            ? t.catalogue_sheet.chua_co_thu_muc
            : nguon === "mau"
              ? t.catalogue_sheet.thu_vien_ngoai_mau
              : t.catalogue_sheet.thu_muc_rong}
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
                    aria-label={t.catalogue_sheet.phong_to.replace("{ten}", a.ten)}
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
