"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { boChu } from "@/messages";
import { NguonNgonNgu, useChu } from "@/messages/dung-chu";
import type { MucCatalogue, MucDeChon } from "@/modules/catalogue-share/chia-se.model";
import type { GiaoDienCatalogue } from "@/modules/catalogue-share/giao-dien.model";
import {
  KhoiLienHe,
  LOP_TONE,
  ThanCatalogue,
  TrangBia,
  bienMauNhan,
} from "@/app/catalogue/[slug]/bo-cuc";

/**
 * Ban xem truoc truoc khi bam Tao.
 *
 * Dung LAI DUNG cac thanh phan cua trang khach — TrangBia, ThanCatalogue,
 * KhoiLienHe — chu khong ve lai mot ban gan giong. Ve lai la co hai ban trinh
 * bay phai giu cho khop nhau, va chung se lech ngay o lan sua bo cuc tiep theo;
 * luc do ban xem truoc noi doi, ma noi doi thi con te hon khong co.
 *
 * Khong co khung phong to anh: o day sale dang duyet bo cuc, khong phai xem
 * tung tam anh.
 */

/** Dung danh sach muc y het cach may chu se dung khi thuc su tao. */
function dungMuc(muc: MucDeChon[], anhGiu: Record<string, string[]>): MucCatalogue[] {
  return muc.map((m) => {
    const giu = new Set(anhGiu[m.ma] ?? []);
    return {
      maMau: m.maMau,
      loaiSp: m.loaiSp,
      chatLieu: m.chatLieu,
      mau: m.mau,
      size: m.size,
      tlVang: m.tlVang,
      anh: m.anh.filter((a) => giu.has(a.fileId)),
    };
  });
}

export function XemTruoc({
  muc,
  anhGiu,
  gia,
  ten,
  khiDong,
}: {
  muc: MucDeChon[];
  anhGiu: Record<string, string[]>;
  gia: GiaoDienCatalogue;
  ten: string;
  khiDong: () => void;
}) {
  /** Chu cua KHUNG xem truoc (tieu de, nut Dong): ngon ngu cua nhan vien. */
  const t = useChu();
  /**
   * Chu cua CATALOGUE ben trong: ngon ngu sale chot cho catalogue, dung nhu trang
   * khach. Truoc 12/09/2026 ca catalogue dung `t` — chon English ma giao dien dang
   * tieng Viet thi ban xem truoc van ra tieng Viet, trai voi dong "Dung thu khach
   * se thay" ngay tren dau.
   */
  const k = boChu(gia.ngonNgu);
  const nutDong = useRef<HTMLButtonElement>(null);

  // Escape de dong, va khoa cuon cua trang ben duoi: khong khoa thi cuon trong
  // ban xem truoc den cuoi la trang ben duoi cuon tiep.
  useEffect(() => {
    function batPhim(e: KeyboardEvent) {
      if (e.key === "Escape") khiDong();
    }
    document.addEventListener("keydown", batPhim);
    const cuonCu = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    nutDong.current?.focus();
    return () => {
      document.removeEventListener("keydown", batPhim);
      document.body.style.overflow = cuonCu;
    };
  }, [khiDong]);

  const danhSach = dungMuc(muc, anhGiu);
  const tieuDe = ten.trim() || k.chia_se.xem_truoc_chua_dat_ten;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t.chia_se.xem_truoc}
      className="fixed inset-0 z-40 flex flex-col bg-hp-foundation"
    >
      <header
        className="flex shrink-0 items-center justify-between gap-4 border-b border-hp-rule
                   bg-hp-card px-6 py-3"
      >
        <div>
          <span className="block text-[11px] uppercase tracking-[0.14em] text-hp-muted">
            {t.chia_se.xem_truoc}
          </span>
          <span className="mt-0.5 block text-sm text-hp-body">
            {t.chia_se.xem_truoc_tieu_de}
          </span>
        </div>
        <button
          ref={nutDong}
          type="button"
          onClick={khiDong}
          className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.14em]
                     text-hp-muted transition-colors duration-150 hover:text-hp-ink"
        >
          <X aria-hidden strokeWidth={1.5} className="h-4 w-4" />
          {t.catalogue_sheet.dong_ngan}
        </button>
      </header>

      {/* Khung cuon rieng, mang dung lop tong mau cua trang khach. NguonNgonNgu nhu
          trang khach: thanh phan con nao doc useChu() cung ra ngon ngu catalogue. */}
      <div className={`flex-1 overflow-y-auto ${LOP_TONE[gia.tone]}`} style={bienMauNhan(gia.nhan)}>
        <main className="mx-auto max-w-4xl px-6 py-10">
          {danhSach.length === 0 ? (
            <p className="text-sm text-hp-muted">{t.chia_se.xem_truoc_chua_co_mau}</p>
          ) : (
            <NguonNgonNgu ngonNgu={gia.ngonNgu}>
              {gia.bia && (
                <TrangBia
                  bia={gia.bia}
                  lienHe={gia.lienHe}
                  tieuDe={tieuDe}
                  thuongHieu={k.catalogue_sheet.thuong_hieu}
                  t={k}
                />
              )}

              {!gia.bia && (
                <header className="mb-10">
                  <h1 className="font-title text-[32px] leading-tight tracking-[0.02em] text-hp-ink">
                    {tieuDe}
                  </h1>
                  <p className="mt-2 text-xs tabular-nums text-hp-muted">
                    {k.chia_se.khach_gom.replace("{n}", String(danhSach.length))}
                  </p>
                </header>
              )}

              <ThanCatalogue muc={danhSach} g={gia} t={k} />

              {gia.lienHe && <KhoiLienHe lienHe={gia.lienHe} loiKeuGoi={gia.loiKeuGoi} t={k} />}

              <footer className="mt-14 border-t border-hp-rule pt-6 text-xs text-hp-muted">
                {k.chia_se.lien_he}
              </footer>
            </NguonNgonNgu>
          )}
        </main>
      </div>
    </div>
  );
}
