"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { boChu, type BoChu } from ".";
import { datNgonNgu } from "./hanh-dong";
import { NutGui } from "@/ui/nut-gui";
import {
  NGON_NGU, NGON_NGU_MAC_DINH, NHAN_NGAN, NHAN_NGON_NGU, type NgonNgu,
} from "./ngon-ngu";

/**
 * Ngon ngu cho phia trinh duyet.
 *
 * Truyen xuong MA ngon ngu ("vi" / "en") chu khong truyen ca bo chu: bo chu
 * nang khoang 10 KB, gui kem moi lan dung trang la tra tien do lai mai. Hai bo
 * chu nam san trong goi JavaScript, doi qua doi lai khong ton them yeu cau nao.
 */

const O = createContext<NgonNgu>(NGON_NGU_MAC_DINH);

export function NguonNgonNgu({ ngonNgu, children }: { ngonNgu: NgonNgu; children: ReactNode }) {
  return <O.Provider value={ngonNgu}>{children}</O.Provider>;
}

export function useNgonNgu(): NgonNgu {
  return useContext(O);
}

export function useChu(): BoChu {
  const n = useContext(O);
  return useMemo(() => boChu(n), [n]);
}

/**
 * Nut doi ngon ngu.
 *
 * Moi lua chon la mot form rieng gui ve server action. Khong dung
 * document.cookie: server component doc ngon ngu tu cookie CUA YEU CAU, nen
 * cookie phai co truoc khi may chu dung lai trang — ghi o trinh duyet roi goi
 * refresh() la hai buoc phu thuoc thu tu vao nhau.
 *
 * Khong co JavaScript thi van bam duoc, vi day la form that.
 */
export function DoiNgonNgu({ lop }: { lop?: string }) {
  const hienTai = useNgonNgu();

  return (
    <div className={`flex items-center gap-2 ${lop ?? ""}`}>
      {NGON_NGU.map((n, i) => (
        <span key={n} className="flex items-center gap-2">
          {i > 0 && <span aria-hidden className="text-hp-rule">/</span>}
          <form action={datNgonNgu}>
            <input type="hidden" name="ngon_ngu" value={n} />
            {/* Nhan chi co hai ky tu ("VI"), khong the doi chu ma khong lam ca
                dai xe dich — nen dau hieu cho o day la mo di, khong phai doi chu. */}
            <NutGui
              nhanCho={<span className="opacity-40">{NHAN_NGAN[n]}</span>}
              aria-current={n === hienTai ? "true" : undefined}
              title={NHAN_NGON_NGU[n]}
              lop={
                "text-[11px] uppercase tracking-[0.14em] transition-colors duration-150 " +
                (n === hienTai
                  ? "text-hp-ink underline underline-offset-4"
                  : "text-hp-muted hover:text-hp-ink")
              }
            >
              {NHAN_NGAN[n]}
            </NutGui>
          </form>
        </span>
      ))}
    </div>
  );
}
