"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, GripVertical } from "lucide-react";
import { useChu } from "@/messages/dung-chu";
import { AnhTai } from "@/ui/anh-tai";
import {
  CACH_SAP_NHANH, doiCho, sapXepMuc, type CachSapNhanh, type MucDeChon,
} from "@/modules/catalogue-share/chia-se.model";

const NUT_NHO =
  "inline-flex h-8 w-8 shrink-0 items-center justify-center border border-transparent " +
  "text-hp-muted transition-colors duration-150 hover:border-hp-rule hover:text-hp-ink " +
  "disabled:cursor-not-allowed disabled:opacity-30";
const ICON = { "aria-hidden": true, strokeWidth: 1.5, className: "h-4 w-4 shrink-0" } as const;

/**
 * Khung "Thu tu trinh bay" o trang tao catalogue (gop y 11/09/2026).
 *
 * Doi thu tu tren MOT danh sach gon chu khong keo ca the mau to (anh + o tich +
 * o gioi thieu): keo mot khoi cao hon man hinh la keo mu. Hai cach doi, ket qua nhu
 * nhau:
 *  - keo dong (chuot) — keo tha HTML5;
 *  - nut len/xuong — cho dien thoai (keo tha HTML5 khong chay tren man cam ung) va
 *    cho ban phim.
 * Thu tu o day chinh la thu tu gui len may chu va thu tu khach thay.
 */
export function ThuTuTrinhBay({
  muc,
  anhGiu,
  thuTuGoc,
  khiDoi,
}: {
  muc: MucDeChon[];
  /**
   * ma -> fileId dang giu. Hinh thu nho la ANH CHINH (anh duoc tich dau tien theo thu
   * tu sale xep), khong phai anh dau thu muc — anh do co khi da bi bo tich.
   */
  anhGiu: Record<string, string[]>;
  /** Danh sach ma luc tai trang — "Thu tu luc tich chon" tro ve day. */
  thuTuGoc: string[];
  khiDoi: (moi: MucDeChon[]) => void;
}) {
  const t = useChu();
  const [dangKeo, setDangKeo] = useState<number | null>(null);
  const [viTriTha, setViTriTha] = useState<number | null>(null);
  const [thongBao, setThongBao] = useState("");

  // Mot mau thi khong co gi de sap.
  if (muc.length < 2) return null;

  const nhanSap: Record<CachSapNhanh, string> = {
    "da-chon": t.chia_se.sap_da_chon,
    "loai-sp": t.chia_se.sap_loai_sp,
    "loai-vang": t.chia_se.sap_loai_vang,
  };
  const tenMau = (m: MucDeChon) => m.maMau ?? m.ma;

  function chuyen(tu: number, den: number) {
    const moi = doiCho(muc, tu, den);
    if (moi === muc) return;
    khiDoi(moi);
    // Nguoi dung trinh doc man hinh khong thay dong vua nhay cho: noi ra.
    setThongBao(
      t.chia_se.da_chuyen.replace("{ma}", tenMau(muc[tu])).replace("{n}", String(den + 1)),
    );
  }

  function xongKeo() {
    setDangKeo(null);
    setViTriTha(null);
  }

  return (
    <section className="mb-8 border border-hp-rule bg-hp-card p-6">
      <h2 className="font-title text-xl leading-none text-hp-ink">{t.chia_se.thu_tu_nhan}</h2>
      <p className="mt-2 text-xs text-hp-muted">{t.chia_se.thu_tu_mo_ta}</p>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <span className="text-[11px] uppercase tracking-[0.14em] text-hp-muted">
          {t.chia_se.sap_nhanh}
        </span>
        {CACH_SAP_NHANH.map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => khiDoi(sapXepMuc(muc, k, thuTuGoc))}
            className="border border-hp-rule px-3 py-1.5 text-sm text-hp-body transition-colors
                       duration-150 hover:border-hp-ink hover:text-hp-ink"
          >
            {nhanSap[k]}
          </button>
        ))}
      </div>

      <ol className="mt-5 divide-y divide-hp-rule border-y border-hp-rule">
        {muc.map((m, i) => (
          <li
            key={m.ma}
            draggable
            onDragStart={(e) => {
              setDangKeo(i);
              e.dataTransfer.effectAllowed = "move";
              e.dataTransfer.setData("text/plain", m.ma);
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
            data-thu-tu={m.ma}
            className={
              "flex items-center gap-3 py-2 pr-1 transition-colors duration-150 " +
              (dangKeo === i ? "opacity-40 " : "") +
              (viTriTha === i && dangKeo !== null && dangKeo !== i ? "bg-hp-inset" : "bg-hp-card")
            }
          >
            <span
              title={t.chia_se.keo_doi_cho.replace("{ma}", tenMau(m))}
              className="cursor-grab pl-1 text-hp-muted active:cursor-grabbing"
            >
              <GripVertical {...ICON} />
            </span>
            <span className="w-6 text-right text-xs tabular-nums text-hp-muted">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-hp-inset">
              {/* Anh chinh = anh duoc tich dau tien theo thu tu sale xep. Khong tich anh
                  nao thi o trong, dung nhu khach se thay. */}
              {m.anh
                .filter((a) => (anhGiu[m.ma] ?? []).includes(a.fileId))
                .slice(0, 1)
                .map((a) => (
                  <AnhTai
                    key={a.fileId}
                    src={`/api/anh-drive/${a.fileId}`}
                    alt=""
                    lop="h-full w-full object-contain"
                  />
                ))}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm text-hp-ink">{tenMau(m)}</span>
              <span className="block truncate text-xs text-hp-muted">
                {[m.loaiSp, m.chatLieu].filter(Boolean).join(" · ")}
              </span>
            </span>
            <button
              type="button"
              onClick={() => chuyen(i, i - 1)}
              disabled={i === 0}
              aria-label={t.chia_se.dua_len.replace("{ma}", tenMau(m))}
              className={NUT_NHO}
            >
              <ArrowUp {...ICON} />
            </button>
            <button
              type="button"
              onClick={() => chuyen(i, i + 1)}
              disabled={i === muc.length - 1}
              aria-label={t.chia_se.dua_xuong.replace("{ma}", tenMau(m))}
              className={NUT_NHO}
            >
              <ArrowDown {...ICON} />
            </button>
          </li>
        ))}
      </ol>
      <p role="status" className="sr-only">{thongBao}</p>
    </section>
  );
}
