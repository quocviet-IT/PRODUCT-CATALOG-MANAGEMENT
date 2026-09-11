import Link from "next/link";
import { LogOut } from "lucide-react";
import { requireUser } from "@/auth/guard";
import { dangXuat } from "@/auth/actions";
import { layChu } from "@/messages/may-chu";
import { Logo } from "@/app/thuong-hieu";
import { NutGui } from "@/ui/nut-gui";
import { NutGopY } from "./gop-y/nut-gop-y";
import { lopDongMenu } from "./dieu-huong";
import { MenuChinh, MenuTaiKhoan } from "./thanh-dau-trang";

/**
 * Man hinh nay phuc vu dung mot viec: nhan vien kinh doanh tra cuu catalogue.
 * Vi vay khong co thanh dieu huong sang cac module khac — chi mot dai mong mang
 * ba trang lam viec, danh tinh nguoi dang dung va loi ra. Xem thanh-dau-trang.tsx
 * cho cach chia muc.
 *
 * Khung nay EP DANG NHAP cho toan bo khu noi bo (quyet dinh 08/09/2026).
 * Link gui khach /catalogue/<slug> nam ngoai khung nay nen van cong khai —
 * khach khong co Gmail cong ty, khoa no la moi link da gui deu chet.
 */
export default async function KhungQuanTri({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const t = await layChu();

  const ICON = { "aria-hidden": true, strokeWidth: 1.5, className: "h-4 w-4 shrink-0" } as const;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="relative border-b border-hp-rule">
        <div className="flex h-14 items-center gap-10 px-5 sm:px-8">
          <Link href="/admin/catalogue-sheet" className="shrink-0">
            <Logo co="nho" alt={t.catalogue_sheet.thuong_hieu} />
          </Link>
          <MenuChinh />
          <MenuTaiKhoan
            hoTen={user.fullName}
            email={user.email}
            laQuanTri={user.mucQuyen === "admin"}
            nutDangXuat={
              <form action={dangXuat}>
                <NutGui
                  lop={lopDongMenu()}
                  nhanCho={<><LogOut {...ICON} />{t.dang_nhap.dang_ra}</>}
                >
                  <LogOut {...ICON} />
                  {t.dang_nhap.dang_xuat}
                </NutGui>
              </form>
            }
          />
        </div>
      </header>

      {/* min-w-0: flex item mac dinh co min-width:auto nen KHONG chiu co nho hon
          noi dung. Thieu no thi bang rong day ca vung noi dung vuot man hinh va
          toan trang truot ngang, thay vi bang tu cuon trong khung cua no. */}
      <main className="min-w-0 flex-1 p-8">{children}</main>

      {/* Tab NOI o mep phai, bam duoc o moi vi tri cuon — nen nam ngoai thanh
          dau trang (xem nut-gop-y.tsx). */}
      <NutGopY />
    </div>
  );
}
