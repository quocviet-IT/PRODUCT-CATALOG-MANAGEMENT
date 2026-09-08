import { FolderOpen, Images, Video } from "lucide-react";
import type { DongCatalogue } from "@/modules/sheet/catalogue.mapper";
import type { BoChu } from "@/messages";

/**
 * Ba lien ket Drive cua mot mau, hien bang icon.
 *
 * Truoc day o nay la mot dong chu "MO THU MUC ANH" chiem gan hai phan cot va
 * lap lai y het o moi dong. Ba icon nam gon trong mot o, va moi icon co title
 * rieng nen re chuot vao van biet no la cai gi.
 *
 * Khong dung mau hong: day la ba lien ket lap lai tren MOI dong bang, khong
 * phai diem nhan cua man hinh.
 */

const NUT =
  "inline-flex h-7 w-7 items-center justify-center border border-transparent " +
  "text-hp-muted transition-colors duration-150 " +
  "hover:border-hp-rule hover:text-hp-ink";

export function LienKetDrive({ d, t }: { d: DongCatalogue; t: BoChu }) {
  const muc: { url: string | null; nhan: string; Icon: typeof FolderOpen }[] = [
    { url: d.urlThuMuc, nhan: t.catalogue_sheet.mo_thu_muc, Icon: FolderOpen },
    { url: d.urlAnhConcept, nhan: t.catalogue_sheet.mo_anh_concept, Icon: Images },
    { url: d.urlClipTho, nhan: t.catalogue_sheet.mo_clip_tho, Icon: Video },
  ];
  const co = muc.filter((m): m is typeof m & { url: string } => m.url !== null);

  if (co.length === 0) {
    return <span className="text-hp-muted">{t.catalogue_sheet.o_trong}</span>;
  }

  return (
    <span className="flex items-center gap-0.5">
      {co.map((m) => (
        <a
          key={m.nhan}
          href={m.url}
          target="_blank"
          rel="noreferrer"
          title={m.nhan}
          aria-label={m.nhan}
          className={NUT}
        >
          <m.Icon aria-hidden strokeWidth={1.5} className="h-4 w-4" />
        </a>
      ))}
    </span>
  );
}
