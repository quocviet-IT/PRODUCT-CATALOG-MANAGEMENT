"use client";

import { useState, type ComponentType } from "react";
import { Check, Copy, MessageSquareText } from "lucide-react";
import { useChu } from "@/messages/dung-chu";
import { useGocLink } from "@/ui/goc-link";
import { duongDanCatalogue, tinNhanGuiKhach } from "@/modules/catalogue-share/duong-dan.model";

const NUT =
  "flex items-center gap-1.5 text-[11px] uppercase tracking-[0.14em] text-hp-muted " +
  "transition-colors duration-150 hover:text-hp-ink";

/**
 * Chep duong dan day du cua mot catalogue.
 *
 * Goc link lay tu useGocLink: ten mien thuong hieu neu da khai, khong thi ten
 * mien dang mo. Khong go cung mot dia chi: he thong chay o ca hpcatalogue.app,
 * ban xem thu tren Vercel va localhost — mot dia chi cung se cho sale chep nham
 * mot link tro sang moi truong khac.
 */
export function NutChep({ slug }: { slug: string }) {
  const t = useChu();
  const goc = useGocLink();
  return (
    <NutChepChu
      chu={() => duongDanCatalogue(goc, slug)}
      nhan={t.danh_sach_catalogue.chep}
      nhanXong={t.danh_sach_catalogue.da_chep}
      Icon={Copy}
    />
  );
}

/**
 * Chep tin nhan mau (ten thuong hieu + link + cach tu choi) de dan vao
 * RingCentral. Tin chi co mot cai link bi nha mang My chan — xem
 * duong-dan.model.ts.
 */
export function NutChepTinNhan({ slug }: { slug: string }) {
  const t = useChu();
  const goc = useGocLink();
  return (
    <NutChepChu
      chu={() => tinNhanGuiKhach(duongDanCatalogue(goc, slug))}
      nhan={t.danh_sach_catalogue.chep_tin_nhan}
      nhanXong={t.danh_sach_catalogue.da_chep}
      goiY={t.danh_sach_catalogue.chep_tin_nhan_goi_y}
      Icon={MessageSquareText}
    />
  );
}

function NutChepChu({
  chu,
  nhan,
  nhanXong,
  goiY,
  Icon,
}: {
  chu: () => string;
  nhan: string;
  nhanXong: string;
  goiY?: string;
  Icon: ComponentType<{ "aria-hidden"?: boolean; strokeWidth?: number; className?: string }>;
}) {
  const [xong, setXong] = useState(false);

  async function chep() {
    try {
      await navigator.clipboard.writeText(chu());
      setXong(true);
      setTimeout(() => setXong(false), 2000);
    } catch {
      // Trinh duyet tu choi quyen clipboard — sale van bam "Mo" roi chep tu
      // thanh dia chi duoc, nen khong bao loi o day.
    }
  }

  return (
    <button type="button" onClick={chep} title={goiY} className={NUT}>
      {/* Doi han icon chu khong chi doi chu: nguoi dung liec mot cai la biet
          da chep xong, khong phai doc lai nhan. */}
      {xong
        ? <Check aria-hidden strokeWidth={1.5} className="h-4 w-4 shrink-0" />
        : <Icon aria-hidden strokeWidth={1.5} className="h-4 w-4 shrink-0" />}
      {xong ? nhanXong : nhan}
    </button>
  );
}
