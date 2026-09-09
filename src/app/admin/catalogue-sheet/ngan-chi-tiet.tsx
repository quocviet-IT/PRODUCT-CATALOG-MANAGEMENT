"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import type { DuLieuChiTiet } from "@/app/api/catalogue-sheet/[dong]/route";
import type { AnhTrongThuMuc } from "@/modules/sheet/drive.client";
import { ChiTietMau } from "./chi-tiet-mau";
import { X } from "lucide-react";
import { useChu } from "@/messages/dung-chu";
import { AnhTai } from "@/ui/anh-tai";
import { VungXuong, Xuong } from "@/ui/xuong";

/**
 * Boc danh sach (bang hoac luoi) va mo ngan chi tiet khi bam vao mot dong.
 *
 * Dung uy quyen su kien tren mot boc ngoai thay vi gan onClick vao tung dong:
 * bang va luoi deu la server component, khong the nhan ham callback. Moi dong
 * chi can mang data-dong.
 */
export function NganChiTiet({ children }: { children: ReactNode }) {
  const t = useChu();
  const [dong, setDong] = useState<number | null>(null);
  const [dl, setDl] = useState<DuLieuChiTiet | null>(null);
  const [dangTai, setDangTai] = useState(false);
  const [loi, setLoi] = useState(false);
  const [anhLon, setAnhLon] = useState<AnhTrongThuMuc | null>(null);
  const nutDong = useRef<HTMLButtonElement>(null);

  const dongNgan = useCallback(() => {
    setDong(null);
    setDl(null);
    setLoi(false);
    setAnhLon(null);
  }, []);

  // Escape dong lop tren cung truoc: dang phong to anh thi tra ve ngan, chua
  // phong to thi moi dong han ngan.
  useEffect(() => {
    if (dong === null) return;
    function batPhim(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      setAnhLon((truoc) => {
        if (truoc !== null) return null;
        dongNgan();
        return null;
      });
    }
    window.addEventListener("keydown", batPhim);
    return () => window.removeEventListener("keydown", batPhim);
  }, [dong, dongNgan]);

  useEffect(() => {
    if (dong !== null) nutDong.current?.focus();
  }, [dong, dl]);

  // Trang thai "dang tai" duoc dat ngay o cho bam, khong dat trong effect:
  // goi setState dong bo trong than effect gay render day chuyen.
  useEffect(() => {
    if (dong === null) return;
    let con = true;
    fetch(`/api/catalogue-sheet/${dong}`)
      .then((r) => (r.ok ? (r.json() as Promise<DuLieuChiTiet>) : Promise.reject(r.status)))
      .then((d) => con && setDl(d))
      .catch(() => con && setLoi(true))
      .finally(() => con && setDangTai(false));
    return () => {
      con = false;
    };
  }, [dong]);

  function batClick(e: React.MouseEvent) {
    const dich = e.target as HTMLElement;
    // Lien ket that (mo thu muc Drive) van phai hoat dong binh thuong.
    if (dich.closest("a")) return;
    // O tich chon mau nam ngay trong dong: bam vao no la y dinh "chon mau nay",
    // khong phai "mo chi tiet". Thieu dong nay thi moi lan tich la ngan bat ra.
    if (dich.closest("[data-chon]")) return;
    const o = dich.closest<HTMLElement>("[data-dong]");
    if (!o) return;
    e.preventDefault();
    setDl(null);
    setLoi(false);
    setDangTai(true);
    setDong(Number(o.dataset.dong));
  }

  return (
    <>
      <div onClick={batClick}>{children}</div>

      {dong !== null && (
        <>
          {/* Nen mo: lop phu phang theo huong dan cho anh/nen ban, khong dung
              hieu ung truot vi he thiet ke chi cho phep chuyen dong mau. */}
          <div
            onClick={dongNgan}
            className="fixed inset-0 z-40 bg-hp-ink/50 transition-opacity duration-150"
            aria-hidden="true"
          />

          <aside
            role="dialog"
            aria-modal="true"
            aria-label={t.catalogue_sheet.chi_tiet_mau}
            className="fixed inset-y-0 right-0 z-50 w-full max-w-2xl overflow-y-auto
                       border-l border-hp-rule bg-hp-foundation p-8
                       transition-opacity duration-150"
          >
            <button
              ref={nutDong}
              type="button"
              onClick={dongNgan}
              className="mb-6 flex items-center gap-1.5 text-[11px] uppercase
                         tracking-[0.14em] text-hp-muted transition-colors duration-150
                         hover:text-hp-ink"
            >
              <X aria-hidden strokeWidth={1.5} className="h-4 w-4" />
              {t.catalogue_sheet.dong_ngan}
            </button>

            {dangTai && !dl ? (
              /* Dung lai dung bo cuc cua ChiTietMau chu khong phai mot dong
                 chu: ngan truot cao gan het man hinh, mot dong chu don doc o
                 dinh de mot khoang trong lon ben duoi va trong nhu ngan bi hong. */
              <VungXuong nhan={t.phan_hoi.dang_tai_chi_tiet}>
                <Xuong lop="h-7 w-40" />
                <Xuong lop="mt-3 h-3 w-full max-w-sm" />
                <div className="mt-5 h-px bg-hp-rule" />
                <div className="mt-6 space-y-4">
                  {Array.from({ length: 7 }, (_, i) => (
                    <div key={i} className="border-b border-hp-rule pb-3">
                      <Xuong lop="h-2.5 w-20" />
                      <Xuong lop="mt-2 h-3 w-36" />
                    </div>
                  ))}
                </div>
                <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {Array.from({ length: 6 }, (_, i) => (
                    <Xuong key={i} lop="aspect-square w-full" />
                  ))}
                </div>
              </VungXuong>
            ) : loi ? (
              <p className="text-sm text-hp-pink-strong">{t.catalogue_sheet.loi_tai_chi_tiet}</p>
            ) : dl ? (
              <ChiTietMau
                t={t}
                d={dl.dong}
                anh={dl.anh}
                loiAnh={dl.loiAnh}
                nguon={dl.nguon}
                khiBamAnh={setAnhLon}
              />
            ) : null}
          </aside>
        </>
      )}

      {anhLon && (
        <div
          onClick={() => setAnhLon(null)}
          role="dialog"
          aria-modal="true"
          aria-label={anhLon.ten}
          className="fixed inset-0 z-[60] flex cursor-zoom-out flex-col items-center
                     justify-center gap-4 bg-hp-ink/90 p-8 transition-opacity duration-150"
        >
          <AnhTai
            src={`/api/anh-drive/${anhLon.fileId}?w=1400`}
            alt={anhLon.ten}
            nen="toi"
            tai="eager"
            // Ban 1400px la mot KHOA BO DEM khac voi ban 600px dang hien trong
            // luoi, nen no thuong phai tai moi that su — day la mot lan cho co
            // that, khong phai chop mat.
            lopBoc="flex h-[85vh] w-full max-w-[1100px] items-center justify-center"
            lop="max-h-full max-w-full object-contain"
          />
          <p className="text-[11px] uppercase tracking-[0.14em] text-hp-foundation/80">
            {anhLon.ten}
          </p>
        </div>
      )}
    </>
  );
}
