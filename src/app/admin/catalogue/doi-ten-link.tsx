"use client";

import { useActionState, useId, useState, useSyncExternalStore } from "react";
import { Check, PencilLine } from "lucide-react";
import { useChu } from "@/messages/dung-chu";
import {
  chuanHoaSlug, maCuaSlug, phanTenCuaSlug,
} from "@/modules/catalogue-share/chia-se.model";
import { NutGui } from "@/ui/nut-gui";
import { luuTenLink, type KetQuaDoiTen } from "./actions";

const NUT =
  "inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.14em] " +
  "text-hp-muted transition-colors duration-150 hover:text-hp-ink";
const ICON = { "aria-hidden": true, strokeWidth: 1.5, className: "h-4 w-4 shrink-0" } as const;
const BAN_DAU: KetQuaDoiTen = { loi: null, slug: null };

/**
 * Doi ten link cua mot catalogue da tao.
 *
 * Chi doi PHAN TEN; ma o cuoi giu nguyen, nen link cu da gui khach van mo duoc —
 * trang khach tu chuyen sang link moi. Dung o hai noi: man hinh vua tao xong va
 * danh sach catalogue da tao.
 *
 * `khiDoi` cho noi tu giu duong dan trong state (man hinh tao xong). Danh sach
 * thi khong can: action don lai trang, dong do hien lai voi duong dan moi.
 */
export function DoiTenLink({
  slug,
  khiDoi,
}: {
  slug: string;
  khiDoi?: (slugMoi: string) => void;
}) {
  const t = useChu();
  const [mo, setMo] = useState(false);
  const [daDoi, setDaDoi] = useState(false);

  if (mo) {
    // Khung chi dung khi dang mo: moi lan mo la mot khung moi, khong mang theo
    // chu go do hay loi cua lan truoc.
    return (
      <KhungDoiTen
        slug={slug}
        khiHuy={() => setMo(false)}
        khiXong={(slugMoi) => {
          setMo(false);
          setDaDoi(true);
          setTimeout(() => setDaDoi(false), 3000);
          khiDoi?.(slugMoi);
        }}
      />
    );
  }

  return (
    <span className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
      <button type="button" onClick={() => setMo(true)} className={NUT}>
        <PencilLine {...ICON} />
        {t.chia_se.doi_ten_link}
      </button>
      {/* Vung thong bao luon co mat: trinh doc man hinh chi doc thay doi ben
          trong mot vung da ton tai tu truoc. */}
      <span role="status" className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.14em] text-hp-muted">
        {daDoi && (
          <>
            <Check {...ICON} />
            {t.chia_se.da_doi_ten_link}
          </>
        )}
      </span>
    </span>
  );
}

function KhungDoiTen({
  slug,
  khiHuy,
  khiXong,
}: {
  slug: string;
  khiHuy: () => void;
  khiXong: (slugMoi: string) => void;
}) {
  const t = useChu();
  const id = useId();
  // Dien san phan ten dang dung, de sua mot chu khong phai go lai ca cau.
  const [ten, setTen] = useState(() => phanTenCuaSlug(slug));
  // Ten mien lay tu trinh duyet — xem ghi chu o DaXong (tao-catalogue.tsx).
  const origin = useSyncExternalStore(
    () => () => {},
    () => window.location.origin,
    () => "",
  );

  const [kq, gui, dangChay] = useActionState(
    async (truoc: KetQuaDoiTen, form: FormData): Promise<KetQuaDoiTen> => {
      const moi = await luuTenLink(truoc, form);
      if (moi.slug !== null) khiXong(moi.slug);
      return moi;
    },
    BAN_DAU,
  );

  const phanTen = chuanHoaSlug(ten);

  return (
    <form action={gui} className="mt-3 block w-full max-w-md text-left">
      <input type="hidden" name="slug" value={slug} />
      <label htmlFor={id} className="block text-[11px] uppercase tracking-[0.14em] text-hp-muted">
        {t.chia_se.doi_ten_nhan}
      </label>
      <input
        id={id}
        name="tenLink"
        value={ten}
        onChange={(e) => setTen(e.target.value)}
        onFocus={(e) => e.currentTarget.select()}
        placeholder={t.chia_se.ten_link_goi_y}
        maxLength={120}
        // Nguoi dung vua bam "Doi ten link" — con tro phai nam san trong o.
        autoFocus
        className="mt-1.5 w-full border-0 border-b border-hp-rule bg-transparent px-0.5 py-1.5
                   font-body text-sm text-hp-body transition-colors duration-150
                   placeholder:text-hp-rule focus:border-b-2 focus:border-hp-pink
                   focus:pb-[5px] focus:outline-none"
      />
      {/* Xem truoc dung duong dan se luu: cung ham chuanHoaSlug voi may chu, va
          ma cuoi la ma THAT cua catalogue nay. */}
      <p className="mt-2 text-xs break-all text-hp-muted">
        {t.chia_se.ten_link_se_la}{" "}
        <span className="text-hp-body">
          {origin}/catalogue/{phanTen || "…"}-{maCuaSlug(slug)}
        </span>
      </p>
      <p className="mt-1 text-xs text-hp-muted">{t.chia_se.link_cu_van_mo}</p>
      {kq.loi && (
        <p role="alert" className="mt-2 text-xs text-hp-pink-strong">
          {kq.loi === "ten_rong" ? t.chia_se.loi_ten_link_rong : t.chia_se.loi_doi_ten_link}
        </p>
      )}
      <div className="mt-3 flex flex-wrap items-center gap-5">
        {/* Hover toi mau chu dam, khong hong: day la nut lap lai tren moi dong
            cua danh sach, khong phai hanh dong chinh cua man hinh. */}
        <NutGui
          dangChay={dangChay}
          tat={phanTen === ""}
          nhanCho={t.chia_se.dang_luu_ten_link}
          lop="border border-hp-ink bg-hp-ink px-4 py-1.5 text-[11px] uppercase
               tracking-[0.14em] text-hp-foundation transition-colors duration-150
               hover:border-hp-body hover:bg-hp-body
               disabled:cursor-not-allowed disabled:opacity-40"
        >
          {t.chia_se.luu_ten_link}
        </NutGui>
        <button type="button" onClick={khiHuy} className={NUT}>
          {t.chia_se.huy_doi_ten}
        </button>
      </div>
    </form>
  );
}
