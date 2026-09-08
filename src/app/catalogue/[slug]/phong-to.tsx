"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useChu } from "@/messages/dung-chu";

/**
 * Boc danh sach mau va cho khach bam vao anh de phong to.
 *
 * Dung uy quyen su kien nhu NganChiTiet ben khu quan tri, va vi cung mot ly do:
 * danh sach anh do server component dung nen khong nhan duoc ham callback. Moi
 * anh chi can mang data-anh="<fileId>".
 *
 * Giu nguyen viec server dung danh sach anh — khong chuyen sang dung o phia
 * trinh duyet — vi hai ly do: khach mo link tren dien thoai thay anh ngay tu
 * lan son dau, va ban IN (nut "Tai PDF") van co day du anh.
 */
export function PhongToAnh({
  anh,
  children,
}: {
  /** Toan bo anh trong catalogue, dung THU TU tren trang, de bam qua lai. */
  anh: { fileId: string; ten: string }[];
  children: ReactNode;
}) {
  const t = useChu();
  const [viTri, setViTri] = useState<number | null>(null);

  const dong = useCallback(() => setViTri(null), []);
  const di = useCallback(
    (buoc: number) => {
      setViTri((truoc) => {
        if (truoc === null) return null;
        // Vong tron: tu anh cuoi bam tiep quay ve anh dau. Khach dang luot xem
        // chu khong doc sach, khong co ly do gi de chan ho o hai dau.
        return (truoc + buoc + anh.length) % anh.length;
      });
    },
    [anh.length],
  );

  useEffect(() => {
    if (viTri === null) return;
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
  }, [viTri, dong, di]);

  function batClick(e: React.MouseEvent) {
    const o = (e.target as HTMLElement).closest<HTMLElement>("[data-anh]");
    if (!o?.dataset.anh) return;
    const i = anh.findIndex((a) => a.fileId === o.dataset.anh);
    if (i >= 0) setViTri(i);
  }

  const dangXem = viTri === null ? null : anh[viTri];

  return (
    <>
      <div onClick={batClick}>{children}</div>

      {dangXem && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={dangXem.ten}
          onClick={dong}
          className="fixed inset-0 z-50 flex cursor-zoom-out flex-col items-center
                     justify-center gap-4 bg-hp-ink/92 p-4 sm:p-8 print:hidden"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/api/anh-drive/${dangXem.fileId}?w=1400`}
            alt={dangXem.ten}
            className="max-h-[82vh] max-w-full object-contain"
          />

          {anh.length > 1 && (
            <div
              // Bam vao dai nut khong duoc dong khung xem — nguoi dung dang muon
              // chuyen anh, khong phai thoat ra.
              onClick={(e) => e.stopPropagation()}
              className="flex cursor-default items-center gap-8"
            >
              <button type="button" onClick={() => di(-1)} aria-label={t.chia_se.anh_truoc}
                className={NUT}>←</button>
              <span className="text-[11px] tabular-nums tracking-[0.14em] text-hp-foundation/70">
                {viTri! + 1} / {anh.length}
              </span>
              <button type="button" onClick={() => di(1)} aria-label={t.chia_se.anh_sau}
                className={NUT}>→</button>
            </div>
          )}

          <button
            type="button"
            onClick={dong}
            className="text-[11px] uppercase tracking-[0.14em] text-hp-foundation/70
                       transition-colors duration-150 hover:text-hp-foundation"
          >
            {t.chia_se.dong_anh}
          </button>
        </div>
      )}
    </>
  );
}

const NUT =
  "px-4 py-1 text-xl leading-none text-hp-foundation/70 " +
  "transition-colors duration-150 hover:text-hp-foundation";
