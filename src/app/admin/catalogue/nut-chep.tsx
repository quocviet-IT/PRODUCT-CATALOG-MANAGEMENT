"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { useChu } from "@/messages/dung-chu";

const NUT =
  "flex items-center gap-1.5 text-[11px] uppercase tracking-[0.14em] text-hp-muted " +
  "transition-colors duration-150 hover:text-hp-ink";

/**
 * Chep duong dan day du cua mot catalogue.
 *
 * Dung origin cua chinh trinh duyet chu khong dung mot dia chi khai san: he
 * thong chay o ca hpcatalogue.app, ban xem thu tren Vercel va localhost — mot
 * dia chi cung se cho sale chep nham mot link tro sang moi truong khac.
 */
export function NutChep({ slug }: { slug: string }) {
  const t = useChu();
  const [xong, setXong] = useState(false);

  async function chep() {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/catalogue/${slug}`);
      setXong(true);
      setTimeout(() => setXong(false), 2000);
    } catch {
      // Trinh duyet tu choi quyen clipboard — sale van bam "Mo" roi chep tu
      // thanh dia chi duoc, nen khong bao loi o day.
    }
  }

  return (
    <button type="button" onClick={chep} className={NUT}>
      {/* Doi han icon chu khong chi doi chu: nguoi dung liec mot cai la biet
          da chep xong, khong phai doc lai nhan. */}
      {xong
        ? <Check aria-hidden strokeWidth={1.5} className="h-4 w-4 shrink-0" />
        : <Copy aria-hidden strokeWidth={1.5} className="h-4 w-4 shrink-0" />}
      {xong ? t.danh_sach_catalogue.da_chep : t.danh_sach_catalogue.chep}
    </button>
  );
}
