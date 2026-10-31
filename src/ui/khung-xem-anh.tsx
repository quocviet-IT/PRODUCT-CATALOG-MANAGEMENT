"use client";

import { useCallback, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useChu } from "@/messages/dung-chu";
import { AnhTai } from "@/ui/anh-tai";
import { taoTayQuet, viTriKeTiep } from "@/ui/quet-ngang";

/**
 * Khung xem anh to, dung chung cho catalogue gui khach va man quan tri.
 *
 * VI SAO DUNG CHUNG. Truoc day moi man tu dung mot khung rieng, va chung lech
 * nhau han: ben khach co nut qua lai, so dem, khoa cuon nen; ben quan tri chi
 * co moi mot tam anh, muon xem tam thu hai phai dong roi bam lai. Bo anh bay
 * tam la muoi bon lan bam. Khong ai co y lam the — chi la sua mot ben thi ben
 * kia khong ai nho.
 *
 * Hai man chi khac nhau o cho LAY danh sach anh: ben khach doc tu DOM (danh
 * sach do server dung, de khach mo dien thoai thay anh ngay va ban in con du
 * anh), ben quan tri truyen thang mang. Cho khac nhau do nam ngoai tep nay.
 */
export function KhungXemAnh({
  anh,
  viTri,
  datViTri,
  dong,
}: {
  anh: readonly { fileId: string; ten: string }[];
  viTri: number;
  datViTri: (n: number) => void;
  dong: () => void;
}) {
  const t = useChu();
  const dangXem = anh[viTri];

  const di = useCallback(
    (buoc: number) => datViTri(viTriKeTiep(viTri, buoc, anh.length)),
    [datViTri, viTri, anh.length],
  );

  useEffect(() => {
    function batPhim(e: KeyboardEvent) {
      if (e.key === "Escape") dong();
      else if (e.key === "ArrowRight") di(1);
      else if (e.key === "ArrowLeft") di(-1);
    }
    window.addEventListener("keydown", batPhim);
    // Chan cuon nen: dang xem anh to ma nen truot ben duoi la mat phuong huong.
    const cuonCu = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", batPhim);
      document.body.style.overflow = cuonCu;
    };
  }, [dong, di]);

  // Trang thai cu quet nam o taoTayQuet() — ngoai React, de test duoc ma khong
  // can dung ca mot trinh duyet gia. Xem quet-ngang.ts.
  const tay = useRef(taoTayQuet());

  function chamXuong(e: React.TouchEvent) {
    const c = e.touches[0];
    if (c) tay.current.chamXuong({ x: c.clientX, y: c.clientY });
  }

  function nhacTay(e: React.TouchEvent) {
    const c = e.changedTouches[0];
    if (!c) return;
    const buoc = tay.current.nhacTay({ x: c.clientX, y: c.clientY });
    if (buoc !== 0) di(buoc);
  }

  function bamNen() {
    if (tay.current.nenDong()) dong();
  }

  if (!dangXem) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={dangXem.ten}
      onClick={bamNen}
      onTouchStart={chamXuong}
      onTouchEnd={nhacTay}
      className="fixed inset-0 z-[60] flex cursor-zoom-out flex-col items-center
                 justify-center gap-4 bg-hp-ink/92 p-4 sm:p-8 print:hidden"
    >
      <AnhTai
        src={`/api/anh-drive/${dangXem.fileId}?w=1400`}
        alt={dangXem.ten}
        nen="toi"
        tai="eager"
        // Ban 1400px la mot KHOA BO DEM khac voi ban 600px dang hien trong luoi,
        // nen no thuong phai tai moi that su — day la mot lan cho co that.
        lopBoc="flex h-[82vh] w-full max-w-[1100px] items-center justify-center"
        lop="max-h-full max-w-full object-contain"
      />

      {anh.length > 1 && (
        <div
          // Bam vao dai nut khong duoc dong khung — nguoi dung dang muon chuyen
          // anh, khong phai thoat ra.
          onClick={(e) => e.stopPropagation()}
          className="flex cursor-default items-center gap-8"
        >
          <button type="button" onClick={() => di(-1)} aria-label={t.chia_se.anh_truoc} className={NUT}>
            <ChevronLeft aria-hidden strokeWidth={1.5} className="h-6 w-6" />
          </button>
          <span className="text-[11px] tabular-nums tracking-[0.14em] text-hp-foundation/70">
            {viTri + 1} / {anh.length}
          </span>
          <button type="button" onClick={() => di(1)} aria-label={t.chia_se.anh_sau} className={NUT}>
            <ChevronRight aria-hidden strokeWidth={1.5} className="h-6 w-6" />
          </button>
        </div>
      )}

      <p className="max-w-full truncate text-[11px] uppercase tracking-[0.14em] text-hp-foundation/70">
        {dangXem.ten}
      </p>

      <button
        type="button"
        onClick={dong}
        className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.14em]
                   text-hp-foundation/70 transition-colors duration-150 hover:text-hp-foundation"
      >
        <X aria-hidden strokeWidth={1.5} className="h-4 w-4" />
        {t.chia_se.dong_anh}
      </button>
    </div>
  );
}

const NUT =
  "px-4 py-1 text-xl leading-none text-hp-foundation/70 " +
  "transition-colors duration-150 hover:text-hp-foundation";
