import Link from "next/link";
import { requireUser } from "@/auth/guard";
import { dangXuat } from "@/auth/actions";
import { layChu } from "@/messages/may-chu";
import { DoiNgonNgu } from "@/messages/dung-chu";
import { Logo } from "@/app/thuong-hieu";
import { NutGui } from "@/ui/nut-gui";
import { NutGopY } from "./gop-y/nut-gop-y";
import { BookOpen, FolderOpen, Inbox, LayoutGrid, LogOut, Users } from "lucide-react";

/**
 * Man hinh nay phuc vu dung mot viec: nhan vien kinh doanh tra cuu catalogue.
 * Vi vay khong co thanh dieu huong sang cac module khac — chi mot dai mong mang
 * danh tinh nguoi dang dung va loi ra.
 *
 * Khung nay EP DANG NHAP cho toan bo khu noi bo (quyet dinh 08/09/2026).
 * Link gui khach /catalogue/<slug> nam ngoai khung nay nen van cong khai —
 * khach khong co Gmail cong ty, khoa no la moi link da gui deu chet.
 */
export default async function KhungQuanTri({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const t = await layChu();

  // Mot lop cho ca nam muc: icon 16px khop dung chieu cao dong chu 11px viet
  // hoa, va khoang cach 1.5 de icon voi chu doc thanh MOT don vi chu khong
  // phai hai thu roi nhau.
  const MUC =
    "flex items-center gap-1.5 text-[11px] uppercase tracking-[0.14em] text-hp-muted " +
    "transition-colors duration-150 hover:text-hp-ink";
  const ICON = { "aria-hidden": true, strokeWidth: 1.5, className: "h-4 w-4 shrink-0" } as const;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-end gap-6 border-b border-hp-rule px-8 py-3">
        <Link href="/admin/catalogue-sheet" className="mr-auto shrink-0">
          <Logo co="nho" alt={t.catalogue_sheet.thuong_hieu} />
        </Link>
        {/* Chi admin moi thay loi vao man hinh tai khoan. Day KHONG phai lop
            gac — trang do va moi server action cua no deu tu goi requireAdmin();
            giau nut di chi de sale khong bam vao mot cho ho chac chan bi tu
            choi. */}
        {user.mucQuyen === "admin" && (
          <>
            {/* "Hop gop y" chu khong phai "Gop y": ngay ben canh la NUT gop
                y ma ai cung bam duoc. Hai chu giong het nhau tren cung mot
                thanh la nguoi dung phai thu ca hai moi biet cai nao la cai gi. */}
            <Link href="/admin/gop-y" className={MUC}>
              <Inbox {...ICON} />
              {t.gop_y.nut_menu}
            </Link>
            <Link href="/admin/nguoi-dung" className={MUC}>
              <Users {...ICON} />
              {t.nguoi_dung.nut_menu}
            </Link>
          </>
        )}
        <Link href="/admin/catalogue-sheet" className={MUC}>
          <LayoutGrid {...ICON} />
          {t.catalogue_sheet.tieu_de}
        </Link>
        <Link href="/admin/catalogue" className={MUC}>
          <FolderOpen {...ICON} />
          {t.danh_sach_catalogue.nut_menu}
        </Link>
        <Link href="/admin/huong-dan" className={MUC}>
          <BookOpen {...ICON} />
          {t.huong_dan.nut_menu}
        </Link>
        <span className="text-[11px] uppercase tracking-[0.14em] text-hp-muted">
          {user.fullName}
        </span>
        <NutGopY />
        <DoiNgonNgu />
        <form action={dangXuat}>
          <NutGui
            lop={MUC}
            nhanCho={<><LogOut {...ICON} />{t.dang_nhap.dang_ra}</>}
          >
            <LogOut {...ICON} />
            {t.dang_nhap.dang_xuat}
          </NutGui>
        </form>
      </header>

      {/* min-w-0: flex item mac dinh co min-width:auto nen KHONG chiu co nho hon
          noi dung. Thieu no thi bang rong day ca vung noi dung vuot man hinh va
          toan trang truot ngang, thay vi bang tu cuon trong khung cua no. */}
      <main className="min-w-0 flex-1 p-8">{children}</main>
    </div>
  );
}
