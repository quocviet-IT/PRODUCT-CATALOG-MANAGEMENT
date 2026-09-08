import Link from "next/link";
import { requireUser } from "@/auth/guard";
import { dangXuat } from "@/auth/actions";
import { layChu } from "@/messages/may-chu";
import { DoiNgonNgu } from "@/messages/dung-chu";

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
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-baseline justify-end gap-6 border-b border-hp-rule px-8 py-3">
        {/* Chi admin moi thay loi vao man hinh tai khoan. Day KHONG phai lop
            gac — trang do va moi server action cua no deu tu goi requireAdmin();
            giau nut di chi de sale khong bam vao mot cho ho chac chan bi tu
            choi. */}
        {user.role === "admin" && (
          <Link
            href="/admin/nguoi-dung"
            className="mr-auto text-[11px] uppercase tracking-[0.14em] text-hp-muted
                       transition-colors duration-150 hover:text-hp-ink hover:underline"
          >
            {t.nguoi_dung.nut_menu}
          </Link>
        )}
        <Link
          href="/admin/catalogue-sheet"
          className="text-[11px] uppercase tracking-[0.14em] text-hp-muted
                     transition-colors duration-150 hover:text-hp-ink hover:underline"
        >
          {t.catalogue_sheet.tieu_de}
        </Link>
        <Link
          href="/admin/catalogue"
          className="text-[11px] uppercase tracking-[0.14em] text-hp-muted
                     transition-colors duration-150 hover:text-hp-ink hover:underline"
        >
          {t.danh_sach_catalogue.nut_menu}
        </Link>
        <Link
          href="/admin/huong-dan"
          className="text-[11px] uppercase tracking-[0.14em] text-hp-muted
                     transition-colors duration-150 hover:text-hp-ink hover:underline"
        >
          {t.huong_dan.nut_menu}
        </Link>
        <span className="text-[11px] uppercase tracking-[0.14em] text-hp-muted">
          {user.fullName}
        </span>
        <DoiNgonNgu />
        <form action={dangXuat}>
          <button
            type="submit"
            className="text-[11px] uppercase tracking-[0.14em] text-hp-muted
                       transition-colors duration-150 hover:text-hp-ink hover:underline"
          >
            {t.dang_nhap.dang_xuat}
          </button>
        </form>
      </header>

      {/* min-w-0: flex item mac dinh co min-width:auto nen KHONG chiu co nho hon
          noi dung. Thieu no thi bang rong day ca vung noi dung vuot man hinh va
          toan trang truot ngang, thay vi bang tu cuon trong khung cua no. */}
      <main className="min-w-0 flex-1 p-8">{children}</main>
    </div>
  );
}
