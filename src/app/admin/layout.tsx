import { getSessionUser } from "@/auth/guard";
import { dangXuat } from "@/auth/actions";
import { vi } from "@/messages/vi";

/**
 * Man hinh nay phuc vu dung mot viec: nhan vien kinh doanh tra cuu catalogue.
 * Vi vay khong co thanh dieu huong sang cac module khac — chi mot dai mong mang
 * danh tinh nguoi dang dung va loi ra.
 *
 * Khung nay KHONG con ep dang nhap. Catalogue dang mo cong khai theo yeu cau;
 * cong dang nhap se lam sau. Cac trang /admin/products, /admin/categories,
 * /admin/upload VAN GOI requireUser() o chinh chung nen van duoc gac — dung
 * bo loi goi do khi sua khung nay.
 */
export default async function KhungQuanTri({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-baseline justify-end gap-6 border-b border-hp-rule px-8 py-3">
        {/* Chua dang nhap thi dai nay trong — giu lai de duong ke duoi khong
            bien mat, bo cuc khong nhay khi dang nhap tro lai. */}
        {user && (
          <>
            <span className="text-[11px] uppercase tracking-[0.14em] text-hp-muted">
              {user.fullName}
            </span>
            <form action={dangXuat}>
              <button
                type="submit"
                className="text-[11px] uppercase tracking-[0.14em] text-hp-muted
                           transition-colors duration-150 hover:text-hp-ink hover:underline"
              >
                {vi.dang_nhap.dang_xuat}
              </button>
            </form>
          </>
        )}
      </header>

      {/* min-w-0: flex item mac dinh co min-width:auto nen KHONG chiu co nho hon
          noi dung. Thieu no thi bang rong day ca vung noi dung vuot man hinh va
          toan trang truot ngang, thay vi bang tu cuon trong khung cua no. */}
      <main className="min-w-0 flex-1 p-8">{children}</main>
    </div>
  );
}
