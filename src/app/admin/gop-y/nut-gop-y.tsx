"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname } from "next/navigation";
import { MessageSquare, X } from "lucide-react";
import type { BoChu } from "@/messages";
import { useChu } from "@/messages/dung-chu";
import { DAI_NOI_DUNG_TOI_DA, LOAI_GOP_Y } from "@/modules/gop-y/gop-y.model";
import { NutGui } from "@/ui/nut-gui";
import { guiGopY } from "./actions";

/**
 * Nut gop y, nam tren thanh dau cua MOI man hinh quan tri.
 *
 * Duong dan trang duoc gui kem tu dong: nguoi bao "cho nay hong" gan nhu khong
 * bao gio nho ghi ho dang o man hinh nao, va nguoi doc thi can dung dieu do.
 */

const NUT_THANH =
  "flex items-center gap-1.5 text-[11px] uppercase tracking-[0.14em] text-hp-muted " +
  "transition-colors duration-150 hover:text-hp-ink";
const ICON = { "aria-hidden": true, strokeWidth: 1.5, className: "h-4 w-4 shrink-0" } as const;

function loiThanhChu(t: BoChu): Record<string, string> {
  return {
    thieu_noi_dung: t.gop_y.thieu_noi_dung,
    noi_dung_qua_dai: t.gop_y.noi_dung_qua_dai,
    loi_he_thong: t.nguoi_dung.loi_he_thong,
  };
}

export function NutGopY() {
  const t = useChu();
  const duongDan = usePathname();
  const [mo, setMo] = useState(false);
  const [xong, setXong] = useState(false);
  const [loi, setLoi] = useState<string | null>(null);
  const [dangChay, batDau] = useTransition();
  const oChu = useRef<HTMLTextAreaElement>(null);

  /**
   * Doc THANG ket qua cua server action thay vi theo doi qua useActionState.
   *
   * Cach kia phai dung mot effect de biet "vua chay xong va khong loi", ma goi
   * setState trong effect thi gay mot lan render day chuyen — va o day no con
   * de sai: dong hop thoai ngay luc bam se lam mot gop y gui hong bien mat ma
   * nguoi go khong biet. Cho await xong roi moi quyet dinh dong hay bao loi.
   */
  function gui(f: FormData) {
    batDau(async () => {
      const kq = await guiGopY(null, f);
      if (kq === null) {
        setLoi(null);
        setMo(false);
        setXong(true);
      } else {
        setLoi(kq);
      }
    });
  }

  useEffect(() => {
    if (mo) oChu.current?.focus();
  }, [mo]);

  useEffect(() => {
    if (!mo) return;
    const thoat = (e: KeyboardEvent) => { if (e.key === "Escape") setMo(false); };
    window.addEventListener("keydown", thoat);
    return () => window.removeEventListener("keydown", thoat);
  }, [mo]);

  return (
    <>
      <button
        type="button"
        onClick={() => { setXong(false); setLoi(null); setMo(true); }}
        className={NUT_THANH}
      >
        <MessageSquare {...ICON} />
        {t.gop_y.nut}
      </button>

      {xong && !mo && (
        <span className="text-[11px] uppercase tracking-[0.14em] text-hp-muted">
          {t.gop_y.da_gui}
        </span>
      )}

      {mo && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto
                     bg-hp-ink/40 px-4 py-10"
          onClick={(e) => { if (e.target === e.currentTarget) setMo(false); }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={t.gop_y.tieu_de}
            className="w-full max-w-lg border border-hp-rule bg-hp-card p-6"
          >
            <div className="flex items-baseline">
              <h2 className="font-title text-xl leading-none text-hp-ink">{t.gop_y.tieu_de}</h2>
              <button
                type="button"
                onClick={() => setMo(false)}
                aria-label={t.nguoi_dung.huy}
                className={`ml-auto ${NUT_THANH}`}
              >
                <X {...ICON} />
              </button>
            </div>
            <p className="mt-2 text-xs text-hp-muted">
              {t.gop_y.mo_ta.replace("{duong_dan}", duongDan)}
            </p>

            <form action={gui} className="mt-5 space-y-5">
              <input type="hidden" name="duong_dan" value={duongDan} />

              <fieldset>
                <legend className="text-[11px] uppercase tracking-[0.14em] text-hp-muted">
                  {t.gop_y.o_loai}
                </legend>
                <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2">
                  {LOAI_GOP_Y.map((l, i) => (
                    <label key={l} className="flex cursor-pointer items-center gap-2 text-sm text-hp-body">
                      <input
                        type="radio"
                        name="loai"
                        value={l}
                        defaultChecked={i === 0}
                        className="h-3.5 w-3.5 accent-hp-ink"
                      />
                      {l === "hong" ? t.gop_y.loai_hong : t.gop_y.loai_y_kien}
                    </label>
                  ))}
                </div>
              </fieldset>

              <div>
                <label
                  className="block text-[11px] uppercase tracking-[0.14em] text-hp-muted"
                  htmlFor="gop-y-noi-dung"
                >
                  {t.gop_y.o_noi_dung}
                </label>
                <textarea
                  id="gop-y-noi-dung"
                  ref={oChu}
                  name="noi_dung"
                  rows={5}
                  required
                  maxLength={DAI_NOI_DUNG_TOI_DA}
                  placeholder={t.gop_y.goi_y}
                  className="mt-2 w-full resize-y border border-hp-rule bg-transparent px-3 py-2
                             font-body text-sm leading-relaxed text-hp-body transition-colors
                             duration-150 placeholder:text-hp-muted/60 focus:border-hp-pink
                             focus:outline-none"
                />
              </div>

              {loi && (
                <p role="alert" className="border-l-2 border-hp-pink bg-hp-inset px-4 py-3 text-sm text-hp-body">
                  {loiThanhChu(t)[loi] ?? t.nguoi_dung.loi_he_thong}
                </p>
              )}

              <div className="flex items-center gap-5">
                <NutGui
                  dangChay={dangChay}
                  lop="border border-hp-ink bg-hp-ink px-6 py-2.5 text-[11px] uppercase
                       tracking-[0.14em] text-hp-foundation transition-colors duration-150
                       hover:border-hp-pink hover:bg-hp-pink
                       disabled:cursor-not-allowed disabled:opacity-40"
                  nhanCho={t.gop_y.dang_gui}
                >
                  {t.gop_y.nut_gui}
                </NutGui>
                <button
                  type="button"
                  onClick={() => setMo(false)}
                  className="text-[11px] uppercase tracking-[0.14em] text-hp-muted
                             transition-colors duration-150 hover:text-hp-ink hover:underline"
                >
                  {t.nguoi_dung.huy}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
