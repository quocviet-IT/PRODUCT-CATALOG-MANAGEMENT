"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { locGoiY, type MucGoiY, type NhomGoiY } from "@/modules/sheet/catalogue.view";
import type { BoChu } from "@/messages";

/**
 * Ô tìm kiếm kèm gợi ý.
 *
 * VÌ SAO CẦN GỢI Ý: bảng tính dùng chữ của người bán hàng — "Dây mân côi",
 * "Nhẫn band xoàn lab". Không ai đoán được những chữ đó có trong hệ thống hay
 * không, nên gõ vài chữ rồi không ra gì thì người ta kết luận là "hệ thống
 * không tìm được", chứ không nghĩ là mình gõ khác chữ trong bảng.
 *
 * Gợi ý lọc bằng ĐÚNG phép khớp của tìm kiếm thật (locGoiY dùng chung hàm với
 * bộ lọc). Một gợi ý hiện ra rồi bấm vào lại không ra kết quả nào thì tệ hơn là
 * không có gợi ý.
 */

const NHOM_CHU: Record<NhomGoiY, (t: BoChu) => string> = {
  moTa: (t) => t.catalogue_sheet.cot_mo_ta,
  loaiSp: (t) => t.catalogue_sheet.cot_loai_sp,
  dongSp: (t) => t.catalogue_sheet.cot_dong_sp,
  chatLieu: (t) => t.catalogue_sheet.cot_chat_lieu,
  mau: (t) => t.catalogue_sheet.cot_mau,
  size: (t) => t.catalogue_sheet.cot_size,
  maMau: (t) => t.catalogue_sheet.cot_ma_mau,
};

export function ODoTim({
  q,
  datQ,
  tuVung,
  dangLoc,
  t,
}: {
  q: string;
  datQ: (v: string) => void;
  tuVung: MucGoiY[];
  dangLoc: boolean;
  t: BoChu;
}) {
  const [mo, setMo] = useState(false);
  const [chon, setChon] = useState(-1);
  const boc = useRef<HTMLDivElement>(null);
  const maDs = useId();

  const goiY = mo ? locGoiY(tuVung, q) : [];

  useEffect(() => {
    // Bấm ra ngoài thì đóng. Dùng "pointerdown" chứ không dùng blur của ô nhập:
    // blur chạy TRƯỚC click của gợi ý, nên danh sách biến mất ngay trước khi
    // con trỏ chạm tới và cú bấm rơi vào chỗ trống.
    function ngoai(e: PointerEvent) {
      if (!boc.current?.contains(e.target as Node)) setMo(false);
    }
    document.addEventListener("pointerdown", ngoai);
    return () => document.removeEventListener("pointerdown", ngoai);
  }, []);

  function nhan(m: MucGoiY) {
    datQ(m.chu);
    setMo(false);
    setChon(-1);
  }

  function phim(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      setMo(false);
      return;
    }
    if (goiY.length === 0) return;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const buoc = e.key === "ArrowDown" ? 1 : -1;
      // -1 nghia la "chua chon gi, dang o chinh o nhap". Vong qua hai dau de
      // mui ten len tu dau danh sach dua ve lai o nhap chu khong ket cung.
      setChon((c) => {
        const moi = c + buoc;
        if (moi < -1) return goiY.length - 1;
        if (moi >= goiY.length) return -1;
        return moi;
      });
      return;
    }
    if (e.key === "Enter" && chon >= 0 && chon < goiY.length) {
      e.preventDefault();
      nhan(goiY[chon]);
    }
  }

  return (
    <div ref={boc} className="relative max-w-xl">
      {/* Dòng trạng thái nằm CÙNG HÀNG với nhãn, không nằm dưới ô nhập: dưới ô
          nhập là chỗ của danh sách gợi ý, hai thứ sẽ chồng lên nhau. */}
      <div className="flex items-baseline justify-between gap-4">
        <label
          className="block text-[11px] uppercase tracking-[0.14em] text-hp-muted"
          htmlFor="q"
        >
          {t.catalogue_sheet.tim_kiem_nhan}
        </label>
        <span
          aria-live="polite"
          className={`shrink-0 text-[11px] uppercase tracking-[0.14em] text-hp-muted
                      transition-opacity duration-150 ${dangLoc ? "opacity-100" : "opacity-0"}`}
        >
          {dangLoc ? t.phan_hoi.dang_cap_nhat : ""}
        </span>
      </div>

      <div
        className="mt-2 flex items-center gap-3 border border-hp-rule bg-hp-card
                   px-4 py-3 transition-colors duration-150 focus-within:border-hp-pink"
      >
        <Search aria-hidden strokeWidth={1.5} className="h-5 w-5 shrink-0 text-hp-muted" />
        <input
          id="q"
          value={q}
          onChange={(e) => {
            datQ(e.target.value);
            setMo(true);
            // Đặt lại ngay tại chỗ gõ chứ không đặt trong một effect nghe theo
            // `q`: danh sách vừa đổi thì con trỏ cũ trỏ vào một dòng khác hẳn.
            setChon(-1);
          }}
          onFocus={() => setMo(true)}
          onKeyDown={phim}
          autoComplete="off"
          role="combobox"
          aria-expanded={goiY.length > 0}
          aria-controls={maDs}
          aria-autocomplete="list"
          aria-activedescendant={chon >= 0 ? `${maDs}-${chon}` : undefined}
          placeholder={t.catalogue_sheet.tim_kiem_goi_y}
          className="w-full bg-transparent font-body text-base text-hp-body
                     placeholder:text-hp-muted/70 focus:outline-none"
        />
        {q !== "" && (
          <button
            type="button"
            onClick={() => {
              datQ("");
              setMo(false);
            }}
            aria-label={t.catalogue_sheet.xoa_loc}
            className="shrink-0 text-hp-muted transition-colors duration-150 hover:text-hp-ink"
          >
            <X aria-hidden strokeWidth={1.5} className="h-4 w-4" />
          </button>
        )}
      </div>

      {goiY.length > 0 && (
        <ul
          id={maDs}
          role="listbox"
          className="absolute inset-x-0 top-full z-20 mt-1 border border-hp-rule
                     bg-hp-card shadow-[0_8px_24px_rgba(42,39,37,0.10)]"
        >
          {goiY.map((m, i) => (
            /* role="option" phai la con TRUC TIEP cua listbox — mot the <button>
               long ben trong <li> khien ca cay tro nang khong nhin thay muc nao
               (da bat duoc bang Playwright: getByRole("option") ra 0). Con tro
               ban phim di bang aria-activedescendant chu khong bang focus, dung
               mau combobox chuan, nen muc khong can la nut bam duoc. */
            <li
              key={`${m.nhom}-${m.chu}`}
              id={`${maDs}-${i}`}
              role="option"
              aria-selected={i === chon}
              onClick={() => nhan(m)}
              onPointerEnter={() => setChon(i)}
              className={`flex cursor-pointer items-baseline gap-3 px-4 py-2.5
                          transition-colors duration-100 ${i === chon ? "bg-hp-inset" : ""}`}
            >
              <span className="text-sm text-hp-ink">{m.chu}</span>
              <span className="ml-auto shrink-0 text-[10px] uppercase tracking-[0.14em] text-hp-muted">
                {NHOM_CHU[m.nhom](t)}
              </span>
              <span className="w-12 shrink-0 text-right text-[11px] tabular-nums text-hp-muted">
                {t.catalogue_sheet.goi_y_dem.replace("{n}", String(m.soLuong))}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
