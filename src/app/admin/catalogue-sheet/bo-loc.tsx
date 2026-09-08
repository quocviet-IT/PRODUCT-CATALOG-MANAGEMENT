"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { CoBatThuong } from "@/modules/sheet/catalogue.mapper";
import {
  MOI_CHIEU,
  thamSoCua,
  type BoLocCatalogue,
  type ChieuLoc,
  type DemLoc,
  type MucDem,
} from "@/modules/sheet/catalogue.view";
import { useChu } from "@/messages/dung-chu";
import type { BoChu } from "@/messages";
import { nhanCo } from "./nhan-co";

const NHAN = "block text-[11px] uppercase tracking-[0.14em] text-hp-muted";

function nhanChieu(t: BoChu): Record<ChieuLoc, string> {
  return {
    chatLieu: t.catalogue_sheet.cot_chat_lieu,
    loaiSp: t.catalogue_sheet.cot_loai_sp,
    dongSp: t.catalogue_sheet.cot_dong_sp,
    mau: t.catalogue_sheet.cot_mau,
    size: t.catalogue_sheet.cot_size,
    loaiXoan: t.catalogue_sheet.loai_xoan,
    canhBao: t.catalogue_sheet.canh_bao_nhan,
  };
}

/** Hai chieu mang nhan noi bo, phai doi sang chu nguoi doc hieu. */
function nhanXoan(t: BoChu): Record<string, string> {
  return {
    lab: t.catalogue_sheet.xoan_lab,
    "tu-nhien": t.catalogue_sheet.xoan_tu_nhien,
  };
}

function nhanGiaTri(chieu: ChieuLoc, gia_tri: string, t: BoChu): string {
  if (chieu === "loaiXoan") return nhanXoan(t)[gia_tri] ?? gia_tri;
  if (chieu === "canhBao") return nhanCo(t)[gia_tri as CoBatThuong] ?? gia_tri;
  return gia_tri;
}

/** Doi bat ky bo loc nao cung phai ve trang 1: trang 3 co the khong con ton tai. */
function dungUrl(
  duongDan: string,
  hienTai: URLSearchParams,
  doi: Record<string, string | null>,
): string {
  const q = new URLSearchParams(hienTai);
  for (const [k, v] of Object.entries(doi)) {
    if (v === null || v === "") q.delete(k);
    else q.set(k, v);
  }
  q.delete("trang");
  const s = q.toString();
  return s ? `${duongDan}?${s}` : duongDan;
}

/** Bat/tat mot gia tri trong danh sach ngan bang dau phay. */
function daoGiaTri(hienTai: readonly string[], gia_tri: string): string | null {
  const moi = hienTai.includes(gia_tri)
    ? hienTai.filter((x) => x !== gia_tri)
    : [...hienTai, gia_tri];
  return moi.length ? moi.join(",") : null;
}

/**
 * Mot o tha xuong chon nhieu.
 *
 * Khong dung <select multiple>: no bat nguoi dung giu Ctrl de chon nhieu, mot
 * quy uoc gan nhu khong ai biet, va khong cho hien so luong ben canh tung muc.
 * Day la nut mo + tam bang o vuong chon.
 */
function ThaXuong({
  chieu,
  muc,
  daChon,
  khiDao,
}: {
  chieu: ChieuLoc;
  muc: MucDem[];
  daChon: readonly string[];
  khiDao: (gia_tri: string) => void;
}) {
  const t = useChu();
  const [mo, setMo] = useState(false);
  const boc = useRef<HTMLDivElement>(null);
  const nut = useRef<HTMLButtonElement>(null);

  // Bam ra ngoai thi dong. Nghe o giai bat (capture) de van chay khi mot phan
  // tu ben trong goi stopPropagation.
  useEffect(() => {
    if (!mo) return;
    function ngoai(e: MouseEvent) {
      if (!boc.current?.contains(e.target as Node)) setMo(false);
    }
    function phim(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      setMo(false);
      nut.current?.focus();
    }
    document.addEventListener("mousedown", ngoai, true);
    document.addEventListener("keydown", phim);
    return () => {
      document.removeEventListener("mousedown", ngoai, true);
      document.removeEventListener("keydown", phim);
    };
  }, [mo]);

  const dangBat = daChon.length > 0;

  return (
    <div ref={boc} className="relative">
      <button
        ref={nut}
        type="button"
        onClick={() => setMo((x) => !x)}
        aria-expanded={mo}
        aria-haspopup="true"
        className={`flex w-full items-center justify-between gap-3 border px-3 py-2
                    text-[11px] uppercase tracking-[0.14em] transition-colors duration-150
                    focus:outline-none focus-visible:border-hp-pink
                    ${dangBat
                      ? "border-hp-ink text-hp-ink"
                      : "border-hp-rule text-hp-muted hover:text-hp-ink"}`}
      >
        <span className="truncate">
          {nhanChieu(t)[chieu]}
          {dangBat && (
            <span className="ml-2 tabular-nums">
              {t.catalogue_sheet.da_chon.replace("{n}", String(daChon.length))}
            </span>
          )}
        </span>
        {/* Tam giac quay khi mo — dau hieu duy nhat cho biet o nay bam duoc. */}
        <span aria-hidden="true" className={mo ? "rotate-180" : undefined}>
          ▾
        </span>
      </button>

      {mo && (
        <div
          className="absolute left-0 top-full z-30 mt-1 max-h-72 min-w-full overflow-y-auto
                     border border-hp-rule bg-hp-card p-1
                     shadow-[0_4px_24px_rgba(42,39,37,0.10)]"
        >
          {muc.length === 0 ? (
            <p className="px-3 py-2 text-[11px] text-hp-muted">
              {t.catalogue_sheet.khong_con_muc}
            </p>
          ) : (
            muc.map((m) => {
              const chon = daChon.includes(m.gia_tri);
              return (
                <label
                  key={m.gia_tri}
                  className="flex cursor-pointer items-center gap-3 whitespace-nowrap px-3 py-1.5
                             transition-colors duration-150 hover:bg-hp-inset"
                >
                  <input
                    type="checkbox"
                    checked={chon}
                    onChange={() => khiDao(m.gia_tri)}
                    className="h-3.5 w-3.5 shrink-0 accent-hp-ink"
                  />
                  <span
                    className={`flex-1 text-sm ${chon ? "text-hp-ink" : "text-hp-body"}`}
                  >
                    {nhanGiaTri(chieu, m.gia_tri, t)}
                  </span>
                  {/* Dem 0 van hien: muc do dang duoc chon, an di thi nguoi dung
                      mat cho de bo chon no ra. */}
                  <span
                    className={`tabular-nums text-xs ${
                      m.soLuong === 0 ? "text-hp-rule" : "text-hp-muted"
                    }`}
                  >
                    {m.soLuong}
                  </span>
                </label>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

const O_SO =
  "w-20 border-0 border-b border-hp-rule bg-transparent px-0.5 py-1 text-sm tabular-nums " +
  "text-hp-body transition-colors duration-150 focus:border-b-2 focus:border-hp-pink " +
  "focus:pb-[3px] focus:outline-none";

export function ThanhBoLoc({
  dem,
  hienTai,
}: {
  dem: DemLoc;
  hienTai: BoLocCatalogue;
}) {
  const router = useRouter();
  const duongDan = usePathname();
  const t = useChu();
  const thamSo = useSearchParams();

  // Cac o go chu giu trang thai rieng de go khong bi giat, roi moi day len URL
  // sau mot nhip nghi. Khong co nhip nghi nay thi moi phim la mot lan render
  // lai toan bo danh sach. Rieng o tha xuong thi ap dung ngay: mot lan bam la
  // mot y dinh tron ven, khong co gi de cho.
  const [q, setQ] = useState(hienTai.q ?? "");
  const [tlTu, setTlTu] = useState(hienTai.tlTu?.toString() ?? "");
  const [tlDen, setTlDen] = useState(hienTai.tlDen?.toString() ?? "");
  const lanDau = useRef(true);

  /**
   * Tham so URL MOI NHAT, khong phai ban chup cua lan render dang chay.
   *
   * Vi sao can: hen gio 250ms cua o go chu om lay `thamSo` cua luc no duoc dat.
   * Neu trong 250ms do co mot lan doi khac (bam mot o tha xuong, hay bam Xoa
   * tat ca) thi khi hen gio no ra, no dung ban chup CU de dung lai URL — va
   * dap nguoc lai lua chon vua roi. Loi nay tung lam nut "Xoa tat ca bo loc"
   * xoa duoc khoang trong luong nhung tra lai ngay the chat lieu.
   */
  const thamSoNay = useRef<URLSearchParams>(new URLSearchParams(thamSo));
  useEffect(() => {
    thamSoNay.current = new URLSearchParams(thamSo);
  }, [thamSo]);

  /** Loi di DUY NHAT: tinh URL, ghi lai tham so moi, roi moi dieu huong. */
  const di = useCallback(
    (doi: Record<string, string | null>) => {
      const url = dungUrl(duongDan, thamSoNay.current, doi);
      const sau = url.indexOf("?");
      thamSoNay.current = new URLSearchParams(sau === -1 ? "" : url.slice(sau + 1));
      router.replace(url, { scroll: false });
    },
    [duongDan, router],
  );

  useEffect(() => {
    if (lanDau.current) {
      lanDau.current = false;
      return;
    }
    const h = setTimeout(() => {
      di({
        q: q.trim() || null,
        tl_tu: tlTu.trim() || null,
        tl_den: tlDen.trim() || null,
      });
    }, 250);
    return () => clearTimeout(h);
  }, [q, tlTu, tlDen, di]);

  function xoaHet() {
    setQ("");
    setTlTu("");
    setTlDen("");
    const rong: Record<string, null> = { q: null, tl_tu: null, tl_den: null };
    for (const chieu of MOI_CHIEU) rong[thamSoCua(chieu)] = null;
    di(rong);
  }

  // Moi muc dang chon, phang ra thanh mot day the go bo duoc. Khong co day nay
  // thi bo loc dang bat bi giau kin trong cac o tha xuong dang dong.
  const dangChon = MOI_CHIEU.flatMap((chieu) =>
    (hienTai[chieu] as readonly string[]).map((gia_tri) => ({ chieu, gia_tri })),
  );
  const coLoc =
    dangChon.length > 0 ||
    hienTai.q !== null ||
    hienTai.tlTu !== null ||
    hienTai.tlDen !== null;

  return (
    <div className="mb-10 space-y-5">
      <div className="max-w-md">
        <label className={NHAN} htmlFor="q">
          {t.catalogue_sheet.tim_kiem_nhan}
        </label>
        <input
          id="q"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          autoComplete="off"
          className="mt-2 w-full border-0 border-b border-hp-rule bg-transparent px-0.5 py-1.5
                     font-body text-base text-hp-body transition-colors duration-150
                     focus:border-b-2 focus:border-hp-pink focus:pb-[5px] focus:outline-none"
        />
      </div>

      <div className="flex flex-wrap items-end gap-x-3 gap-y-3">
        {MOI_CHIEU.map((chieu) => (
          <div key={chieu} className="w-44">
            <ThaXuong
              chieu={chieu}
              muc={dem[chieu]}
              daChon={hienTai[chieu]}
              khiDao={(gia_tri) =>
                di({ [thamSoCua(chieu)]: daoGiaTri(hienTai[chieu], gia_tri) })
              }
            />
          </div>
        ))}

        <div className="flex items-baseline gap-2">
          <span className={NHAN}>{t.catalogue_sheet.tl_vang_khoang}</span>
          <label className="sr-only" htmlFor="tl_tu">
            {t.catalogue_sheet.tl_tu}
          </label>
          <input
            id="tl_tu"
            inputMode="decimal"
            placeholder={t.catalogue_sheet.tl_tu}
            value={tlTu}
            onChange={(e) => setTlTu(e.target.value)}
            className={O_SO}
          />
          <span className="text-hp-muted">–</span>
          <label className="sr-only" htmlFor="tl_den">
            {t.catalogue_sheet.tl_den}
          </label>
          <input
            id="tl_den"
            inputMode="decimal"
            placeholder={t.catalogue_sheet.tl_den}
            value={tlDen}
            onChange={(e) => setTlDen(e.target.value)}
            className={O_SO}
          />
        </div>
      </div>

      {coLoc && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-hp-rule pt-4">
          <span className={NHAN}>{t.catalogue_sheet.dang_loc_theo}</span>
          {dangChon.map(({ chieu, gia_tri }) => (
            <button
              key={`${chieu}:${gia_tri}`}
              type="button"
              onClick={() => di({ [thamSoCua(chieu)]: daoGiaTri(hienTai[chieu], gia_tri) })}
              aria-label={t.catalogue_sheet.bo_muc.replace(
                "{nhan}",
                `${nhanChieu(t)[chieu]}: ${nhanGiaTri(chieu, gia_tri, t)}`,
              )}
              className="border border-hp-rule px-2.5 py-1 text-xs text-hp-body
                         transition-colors duration-150 hover:border-hp-ink hover:text-hp-ink"
            >
              {nhanGiaTri(chieu, gia_tri, t)}
              <span aria-hidden="true" className="ml-2 text-hp-muted">
                ✕
              </span>
            </button>
          ))}
          <button
            type="button"
            onClick={xoaHet}
            className="ml-auto text-[11px] uppercase tracking-[0.14em] text-hp-muted
                       transition-colors duration-150 hover:text-hp-ink hover:underline"
          >
            {t.catalogue_sheet.xoa_loc}
          </button>
        </div>
      )}
    </div>
  );
}
