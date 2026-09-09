"use client";

import { useCallback, useEffect, useSyncExternalStore, type ReactNode } from "react";
import Link from "next/link";
import {
  GIO_RONG, chupGio, dangKyGio, daoMa, datGio,
} from "@/modules/catalogue-share/gio-chon";
import { useChu } from "@/messages/dung-chu";
import { ChuCho } from "@/ui/dau-cho";

/**
 * Boc danh sach (bang hoac luoi) va quan ly viec tich chon mau.
 *
 * Cung ky thuat uy quyen su kien nhu NganChiTiet, va vi cung mot ly do: bang
 * va luoi deu la server component nen khong nhan duoc ham callback. Moi o tich
 * chi mang data-chon="<ma>".
 *
 * Trang thai tich nam trong localStorage chu khong trong DOM, nen no song qua
 * doi trang, doi bo loc va doi kieu xem — ba viec deu dung lai toan bo danh
 * sach tu may chu.
 */
export function ChonMau({ children }: { children: ReactNode }) {
  const t = useChu();
  // Doc thang tu kho thay vi useState + useEffect: xem chu thich trong
  // gio-chon.ts. Anh chup phia may chu la GIO_RONG nen HTML may chu tra ve
  // luon co moi o tich o trang thai chua tich — dung voi luc chua biet gi.
  const chon = useSyncExternalStore(dangKyGio, chupGio, () => GIO_RONG);

  // Dong bo trang thai xuong cac o tich do may chu ve. KHONG co mang phu thuoc:
  // danh sach con duoc thay moi sau moi lan loc/doi trang ma React khong bao
  // rieng, nen phai chay lai sau MOI lan render.
  useEffect(() => {
    const dang = new Set(chon);
    for (const o of document.querySelectorAll<HTMLInputElement>("input[data-chon]")) {
      const ma = o.dataset.chon;
      if (ma) o.checked = dang.has(ma);
    }
  });

  const dao = useCallback((ma: string) => {
    datGio(daoMa(chupGio(), ma));
  }, []);

  function batDoi(e: React.ChangeEvent<HTMLElement>) {
    const o = (e.target as HTMLElement).closest<HTMLInputElement>("input[data-chon]");
    if (o?.dataset.chon) dao(o.dataset.chon);
  }

  function xoaHet() {
    datGio([]);
  }

  return (
    <>
      <div onChange={batDoi}>{children}</div>

      {chon.length > 0 && (
        // Thanh noi de sale khong phai cuon nguoc len dau trang sau khi tich
        // xong mau cuoi. pb-28 o duoi de no khong che mat dong cuoi cung.
        <div
          className="fixed inset-x-0 bottom-0 z-30 border-t border-hp-rule bg-hp-card/95
                     px-8 py-4 backdrop-blur"
        >
          <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-3">
            <span className="text-[11px] uppercase tracking-[0.14em] text-hp-ink">
              {t.chia_se.da_chon.replace("{n}", String(chon.length))}
            </span>
            <button
              type="button"
              onClick={xoaHet}
              className="text-[11px] uppercase tracking-[0.14em] text-hp-muted
                         transition-colors duration-150 hover:text-hp-ink hover:underline"
            >
              {t.chia_se.bo_chon_het}
            </button>
            <Link
              href="/catalogue/tao"
              className="ml-auto border border-hp-ink bg-hp-ink px-5 py-2 text-[11px]
                         uppercase tracking-[0.14em] text-hp-foundation
                         transition-colors duration-150 hover:border-hp-pink hover:bg-hp-pink"
            >
              <ChuCho>{t.chia_se.tao_catalogue}</ChuCho>
            </Link>
          </div>
        </div>
      )}
      {chon.length > 0 && <div className="h-24" aria-hidden="true" />}
    </>
  );
}

/** O tich cua mot dong. Dung o CA bang lan luoi nen de chung mot cho. */
export function OTich({ ma }: { ma: string }) {
  const t = useChu();
  return (
    <input
      type="checkbox"
      data-chon={ma}
      defaultChecked={false}
      aria-label={t.chia_se.chon_o_nhan.replace("{ma}", ma)}
      className="h-4 w-4 cursor-pointer accent-hp-ink"
    />
  );
}
