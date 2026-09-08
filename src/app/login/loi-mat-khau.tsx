"use client";

import { useState } from "react";
import { useChu } from "@/messages/dung-chu";

const NHAN = "block text-[11px] uppercase tracking-[0.14em] text-hp-muted";
const O_NHAP =
  "mt-2 w-full border-0 border-b border-hp-rule bg-transparent px-0.5 py-1.5 " +
  "font-body text-base text-hp-body transition-colors duration-150 " +
  "focus:border-b-2 focus:border-hp-pink focus:pb-[5px] focus:outline-none";

/**
 * Duong lui bang email + mat khau, mac dinh GAP LAI.
 *
 * Vi sao van giu: Google la duong chinh, nhung neu no tro chung (het han
 * chung chi, doi cau hinh, mang cong ty chan) thi ca he thong khoa cung va
 * khong ai vao sua duoc. Day la loi thoat do. Gap lai de khong ai nham no
 * moi la cach dang nhap thong thuong.
 */
export function LoiMatKhau({ guiForm }: { guiForm: (form: FormData) => void }) {
  const t = useChu();
  const [mo, setMo] = useState(false);

  if (!mo) {
    return (
      <button
        type="button"
        onClick={() => setMo(true)}
        className="mt-6 w-full text-center text-xs text-hp-muted underline
                   transition-colors duration-150 hover:text-hp-ink"
      >
        {t.dang_nhap.khong_vao_duoc}
      </button>
    );
  }

  return (
    <div className="mt-6 border-t border-hp-rule pt-6">
      <p className={NHAN}>{t.dang_nhap.dung_mat_khau}</p>
      <form action={guiForm} className="mt-4 space-y-4">
        <div>
          <label className={NHAN} htmlFor="email">
            {t.dang_nhap.email}
          </label>
          <input id="email" name="email" type="email" required autoComplete="email" className={O_NHAP} />
        </div>
        <div>
          <label className={NHAN} htmlFor="mat_khau">
            {t.dang_nhap.mat_khau}
          </label>
          <input
            id="mat_khau"
            name="mat_khau"
            type="password"
            required
            autoComplete="current-password"
            className={O_NHAP}
          />
        </div>
        <button
          type="submit"
          className="w-full border border-hp-ink bg-hp-ink px-5 py-2.5 text-[11px] uppercase
                     tracking-[0.14em] text-hp-foundation transition-colors duration-150
                     hover:border-hp-pink hover:bg-hp-pink"
        >
          {t.dang_nhap.nut}
        </button>
      </form>
    </div>
  );
}
