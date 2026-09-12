import { Video } from "lucide-react";
import type { DongCatalogue } from "@/modules/sheet/catalogue.mapper";
import type { BoChu } from "@/messages";

/**
 * O "Clip da xu ly" trong bang: icon video + ten tep, giong chip tren bang tinh
 * de nguoi dung nhan ra ngay.
 *
 * Hien CA TEN chu khong chi icon nhu cot Thu muc: ten tep mang ma mau
 * ("C10068.mp4"), va mau nao co clip, mau nao chua la thu nguoi xem bang can
 * quet nhanh.
 *
 * Bam la mo clip tren Google Drive o tab moi. Chi nhan vien xem duoc: tep nam
 * tren Shared Drive chi chia se trong cong ty. Tab moi chu khong nhung trinh
 * phat vao trang — trinh duyet chan cookie ben thu ba (Safari) thi khung nhung
 * hien "can quyen truy cap" du nguoi xem co quyen.
 */
export function ClipDaXuLy({ d, t }: { d: DongCatalogue; t: BoChu }) {
  const ten = d.tenClipDaXuLy;

  if (d.urlClipDaXuLy === null) {
    // O co chu nhung khong co lien ket (go tay ten tep): van hien ten, de nguoi
    // xem biet mau nay co clip ma chua gan duoc.
    return ten === null
      ? <span className="text-hp-muted">{t.catalogue_sheet.o_trong}</span>
      : <span className="block max-w-[10rem] truncate" title={ten}>{ten}</span>;
  }

  // Ten truy cap bat dau bang dung chu dang hien tren man hinh, roi moi den
  // hanh dong — nguoi dung trinh doc man hinh goi lien ket bang chinh chu ho thay.
  const nhan = ten ? `${ten} — ${t.catalogue_sheet.mo_clip}` : t.catalogue_sheet.mo_clip;
  return (
    <a
      href={d.urlClipDaXuLy}
      target="_blank"
      rel="noreferrer"
      title={nhan}
      aria-label={nhan}
      className="inline-flex max-w-[10rem] items-center gap-1.5 text-hp-body
                 underline-offset-4 transition-colors duration-150
                 hover:text-hp-ink hover:underline"
    >
      <Video aria-hidden strokeWidth={1.5} className="h-4 w-4 shrink-0 text-hp-muted" />
      <span className="truncate">{ten ?? t.catalogue_sheet.cot_clip}</span>
    </a>
  );
}
