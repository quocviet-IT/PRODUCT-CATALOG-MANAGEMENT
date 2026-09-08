"use client";

import { useActionState } from "react";
import { Lock, LockOpen } from "lucide-react";
import { useChu } from "@/messages/dung-chu";
import type { TrangThaiLink } from "@/modules/catalogue-share/hieu-luc.model";
import { doiKhoa } from "./actions";

const NUT =
  "inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.14em] " +
  "text-hp-muted transition-colors duration-150 hover:text-hp-ink " +
  "disabled:cursor-not-allowed disabled:opacity-40";

/**
 * Khoa mot link dang mo, hoac mo lai mot link da khoa.
 *
 * Link HET HAN thi khong co nut: mo khoa khong lam no song lai, va mot cai nut
 * bam vao khong doi gi con te hon la khong co nut.
 */
export function NutKhoa({ slug, trangThai }: { slug: string; trangThai: TrangThaiLink }) {
  const t = useChu();
  const [loi, gui, dangChay] = useActionState(doiKhoa, null);

  if (trangThai === "het-han") return null;
  const dangKhoa = trangThai === "khoa";

  return (
    <form action={gui} className="inline">
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="khoa" value={dangKhoa ? "0" : "1"} />
      <button type="submit" disabled={dangChay} className={NUT}>
        {dangKhoa
          ? <LockOpen aria-hidden strokeWidth={1.5} className="h-4 w-4 shrink-0" />
          : <Lock aria-hidden strokeWidth={1.5} className="h-4 w-4 shrink-0" />}
        {dangKhoa ? t.danh_sach_catalogue.mo_khoa : t.danh_sach_catalogue.khoa}
      </button>
      {loi && (
        <span className="ml-2 text-xs text-hp-pink-strong">
          {t.danh_sach_catalogue.loi_khoa}
        </span>
      )}
    </form>
  );
}
