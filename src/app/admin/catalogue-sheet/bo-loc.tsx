"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { BoLocCatalogue, LoaiXoan, ThongKe } from "@/modules/sheet/catalogue.view";
import { vi } from "@/messages/vi";

const NHAN = "block text-[11px] uppercase tracking-[0.14em] text-hp-muted";

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
function daoGiaTri(hienTai: string[], gia_tri: string): string | null {
  const moi = hienTai.includes(gia_tri)
    ? hienTai.filter((x) => x !== gia_tri)
    : [...hienTai, gia_tri];
  return moi.length ? moi.join(",") : null;
}

function MucChon({
  nhan, soLuong, dangBat, khiBam,
}: {
  nhan: string;
  soLuong?: number;
  dangBat: boolean;
  khiBam: () => void;
}) {
  return (
    <button
      type="button"
      onClick={khiBam}
      aria-pressed={dangBat}
      className={`border-b-2 pb-0.5 text-[11px] uppercase tracking-[0.14em]
                  transition-colors duration-150
                  ${dangBat
                    ? "border-hp-pink text-hp-ink"
                    : "border-transparent text-hp-muted hover:text-hp-ink"}`}
    >
      {nhan}
      {soLuong !== undefined && <span className="ml-1.5 tabular-nums">{soLuong}</span>}
    </button>
  );
}

export function ThanhBoLoc({
  thongKe, hienTai,
}: {
  thongKe: ThongKe;
  hienTai: BoLocCatalogue;
}) {
  const router = useRouter();
  const duongDan = usePathname();
  const thamSo = useSearchParams();

  // O tim kiem giu trang thai rieng de go khong bi giat, roi moi day len URL sau
  // mot nhip nghi. Khong co nhip nghi nay thi moi phim la mot lan render lai
  // toan bo danh sach.
  const [q, setQ] = useState(hienTai.q ?? "");
  const lanDau = useRef(true);

  useEffect(() => {
    if (lanDau.current) {
      lanDau.current = false;
      return;
    }
    const h = setTimeout(() => {
      router.replace(dungUrl(duongDan, thamSo, { q: q.trim() || null }), { scroll: false });
    }, 250);
    return () => clearTimeout(h);
    // thamSo doi moi lan loc -> khong dua vao day, neu khong se tu kich hoat lai.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  function dat(khoa: string, gia_tri: string | null) {
    router.replace(dungUrl(duongDan, thamSo, { [khoa]: gia_tri }), { scroll: false });
  }

  const coLoc =
    hienTai.q !== null ||
    hienTai.chatLieu.length > 0 ||
    hienTai.loaiXoan.length > 0 ||
    hienTai.chiCanhBao;

  return (
    <div className="mb-10 space-y-6">
      <div className="max-w-md">
        <label className={NHAN} htmlFor="q">
          {vi.catalogue_sheet.tim_kiem_nhan}
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

      <div className="flex flex-wrap items-baseline gap-x-6 gap-y-3">
        <span className={`${NHAN} w-24`}>{vi.catalogue_sheet.chat_lieu}</span>
        <MucChon
          nhan={vi.catalogue_sheet.tat_ca}
          soLuong={thongKe.tong}
          dangBat={hienTai.chatLieu.length === 0}
          khiBam={() => dat("chat_lieu", null)}
        />
        {thongKe.theoChatLieu.map((m) => (
          <MucChon
            key={m.gia_tri}
            nhan={m.gia_tri}
            soLuong={m.soLuong}
            dangBat={hienTai.chatLieu.includes(m.gia_tri)}
            khiBam={() => dat("chat_lieu", daoGiaTri(hienTai.chatLieu, m.gia_tri))}
          />
        ))}
      </div>

      <div className="flex flex-wrap items-baseline gap-x-6 gap-y-3">
        <span className={`${NHAN} w-24`}>{vi.catalogue_sheet.loai_xoan}</span>
        <MucChon
          nhan={vi.catalogue_sheet.tat_ca}
          dangBat={hienTai.loaiXoan.length === 0}
          khiBam={() => dat("loai_xoan", null)}
        />
        {thongKe.theoLoaiXoan.map((m) => (
          <MucChon
            key={m.gia_tri}
            nhan={
              m.gia_tri === "lab"
                ? vi.catalogue_sheet.xoan_lab
                : vi.catalogue_sheet.xoan_tu_nhien
            }
            soLuong={m.soLuong}
            dangBat={hienTai.loaiXoan.includes(m.gia_tri as LoaiXoan)}
            khiBam={() => dat("loai_xoan", daoGiaTri(hienTai.loaiXoan, m.gia_tri))}
          />
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-6">
        <MucChon
          nhan={vi.catalogue_sheet.chi_canh_bao}
          dangBat={hienTai.chiCanhBao}
          khiBam={() => dat("canh_bao", hienTai.chiCanhBao ? null : "1")}
        />
        {coLoc && (
          <button
            type="button"
            onClick={() =>
              router.replace(
                dungUrl(duongDan, thamSo, {
                  q: null, chat_lieu: null, loai_xoan: null, canh_bao: null,
                }),
                { scroll: false },
              )
            }
            className="text-[11px] uppercase tracking-[0.14em] text-hp-muted
                       transition-colors duration-150 hover:text-hp-ink hover:underline"
          >
            {vi.catalogue_sheet.xoa_loc}
          </button>
        )}
      </div>
    </div>
  );
}
