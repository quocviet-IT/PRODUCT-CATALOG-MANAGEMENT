"use client";

import { useState } from "react";
import { ArrowLeft, ArrowLeftToLine, ArrowRight, GripVertical } from "lucide-react";
import { useChu } from "@/messages/dung-chu";
import { AnhTai } from "@/ui/anh-tai";
import {
  doiCho, type AnhTrongCatalogue, type MucDeChon,
} from "@/modules/catalogue-share/chia-se.model";

const NUT_NHO =
  "inline-flex h-7 w-7 shrink-0 items-center justify-center border border-transparent " +
  "text-hp-muted transition-colors duration-150 hover:border-hp-rule hover:text-hp-ink " +
  "disabled:cursor-not-allowed disabled:opacity-30";
const ICON = { "aria-hidden": true, strokeWidth: 1.5, className: "h-3.5 w-3.5 shrink-0" } as const;

/**
 * Luoi anh cua MOT mau o trang tao catalogue: tich de giu/bo, va doi thu tu anh
 * (gop y 12/09/2026).
 *
 * Thu tu cua `m.anh` CHINH LA thu tu khach thay: trang tao gui len may chu dung thu
 * tu nay, Xem truoc cung doc thang no. Anh duoc tich DAU TIEN la anh chinh — Lookbook,
 * Trien lam, Tap chi lay no lam anh lon, Khung co dien lay hai anh dau, Luoi anh gan
 * thong so vao no. Vi vay moi co nut "dat lam anh chinh": mau co vai chuc anh thi bam
 * mui ten tung buoc la qua lau.
 *
 * Hai cach doi thu tu, ket qua nhu nhau: keo tha HTML5 (chuot), va nut — cho dien
 * thoai (keo tha HTML5 khong chay tren man cam ung) va cho ban phim.
 *
 * Cac nut nam NGOAI the <label> cua o tich: nut long trong label vua sai HTML vua de
 * bam nham thanh bo tich.
 */
export function LuoiAnhMau({
  m,
  giu,
  khiDao,
  khiDoi,
}: {
  m: MucDeChon;
  /** fileId dang giu. Thu tu trong mang nay KHONG co nghia — thu tu la `m.anh`. */
  giu: string[];
  khiDao: (fileId: string) => void;
  khiDoi: (anhMoi: AnhTrongCatalogue[]) => void;
}) {
  const t = useChu();
  const [dangKeo, setDangKeo] = useState<number | null>(null);
  const [viTriTha, setViTriTha] = useState<number | null>(null);
  const [thongBao, setThongBao] = useState("");

  if (m.anh.length === 0) {
    return <p className="mt-4 text-sm text-hp-muted">{t.chia_se.khong_co_anh}</p>;
  }

  const tapGiu = new Set(giu);
  const viTriChinh = m.anh.findIndex((a) => tapGiu.has(a.fileId));
  const nhieuAnh = m.anh.length > 1;

  function chuyen(tu: number, den: number) {
    const moi = doiCho(m.anh, tu, den);
    if (moi === m.anh) return;
    khiDoi(moi);
    // Nguoi dung trinh doc man hinh khong thay o anh vua nhay cho: noi ra.
    setThongBao(
      t.chia_se.anh_da_chuyen.replace("{ten}", m.anh[tu].ten).replace("{n}", String(den + 1)),
    );
  }

  function datChinh(i: number) {
    const a = m.anh[i];
    // Dat lam anh chinh mot anh dang bo tich: y sale ro rang la muon gui anh do.
    if (!tapGiu.has(a.fileId)) khiDao(a.fileId);
    const moi = doiCho(m.anh, i, 0);
    if (moi !== m.anh) khiDoi(moi);
    setThongBao(t.chia_se.anh_da_dat_chinh.replace("{ten}", a.ten));
  }

  function xongKeo() {
    setDangKeo(null);
    setViTriTha(null);
  }

  return (
    <div className="mt-4">
      {nhieuAnh && <p className="mb-3 text-xs text-hp-muted">{t.chia_se.anh_thu_tu_mo_ta}</p>}

      <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
        {m.anh.map((a, i) => {
          const dangGiu = tapGiu.has(a.fileId);
          const laChinh = i === viTriChinh;
          return (
            <li
              key={a.fileId}
              data-anh={a.fileId}
              draggable={nhieuAnh}
              onDragStart={(e) => {
                setDangKeo(i);
                e.dataTransfer.effectAllowed = "move";
                e.dataTransfer.setData("text/plain", a.fileId);
              }}
              onDragOver={(e) => {
                if (dangKeo === null) return;
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
                if (viTriTha !== i) setViTriTha(i);
              }}
              onDrop={(e) => {
                e.preventDefault();
                if (dangKeo !== null) chuyen(dangKeo, i);
                xongKeo();
              }}
              onDragEnd={xongKeo}
              className={
                "flex flex-col border transition-colors duration-150 " +
                (dangGiu ? "border-hp-ink " : "border-hp-rule ") +
                (dangKeo === i ? "opacity-40 " : "") +
                (viTriTha === i && dangKeo !== null && dangKeo !== i
                  ? "outline-2 outline-offset-2 outline-dashed outline-hp-ink"
                  : "")
              }
            >
              <label className={`block cursor-pointer ${dangGiu ? "" : "opacity-45"}`}>
                <div className="relative flex aspect-square items-center justify-center bg-hp-inset">
                  <AnhTai
                    src={`/api/anh-drive/${a.fileId}`}
                    alt={a.ten}
                    lop="h-full w-full object-contain"
                  />
                  {laChinh && nhieuAnh && (
                    <span
                      className="absolute left-0 top-0 bg-hp-ink px-1.5 py-0.5 text-[9px] uppercase
                                 tracking-[0.14em] text-hp-foundation"
                    >
                      {t.chia_se.anh_chinh}
                    </span>
                  )}
                </div>
                <span className="flex items-center gap-2 px-2 py-1.5">
                  <input
                    type="checkbox"
                    checked={dangGiu}
                    onChange={() => khiDao(a.fileId)}
                    className="h-3.5 w-3.5 shrink-0 accent-hp-ink"
                  />
                  <span className="truncate text-[10px] text-hp-muted" title={a.ten}>
                    {a.ten}
                  </span>
                </span>
              </label>

              {nhieuAnh && (
                <div className="mt-auto flex items-center border-t border-hp-rule px-1">
                  <span
                    title={t.chia_se.anh_keo.replace("{ten}", a.ten)}
                    className="hidden cursor-grab px-1 text-hp-muted active:cursor-grabbing sm:inline-flex"
                  >
                    <GripVertical {...ICON} />
                  </span>
                  <button
                    type="button"
                    onClick={() => datChinh(i)}
                    disabled={laChinh}
                    aria-label={t.chia_se.anh_dat_chinh.replace("{ten}", a.ten)}
                    title={t.chia_se.anh_dat_chinh.replace("{ten}", a.ten)}
                    className={`ml-auto ${NUT_NHO}`}
                  >
                    <ArrowLeftToLine {...ICON} />
                  </button>
                  <button
                    type="button"
                    onClick={() => chuyen(i, i - 1)}
                    disabled={i === 0}
                    aria-label={t.chia_se.anh_len_truoc.replace("{ten}", a.ten)}
                    className={NUT_NHO}
                  >
                    <ArrowLeft {...ICON} />
                  </button>
                  <button
                    type="button"
                    onClick={() => chuyen(i, i + 1)}
                    disabled={i === m.anh.length - 1}
                    aria-label={t.chia_se.anh_ra_sau.replace("{ten}", a.ten)}
                    className={NUT_NHO}
                  >
                    <ArrowRight {...ICON} />
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
      <p role="status" className="sr-only">{thongBao}</p>
    </div>
  );
}
