import Link from "next/link";
import { requireUser } from "@/auth/guard";
import { dangXuat } from "@/auth/actions";
import { vi } from "@/messages/vi";

export default async function KhungQuanTri({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return (
    <div className="flex min-h-screen">
      <nav className="flex w-56 flex-col gap-1 border-r p-4">
        <p className="mb-4 text-sm font-semibold">{user.fullName}</p>
        <Link href="/admin/categories" className="rounded px-2 py-1 text-sm hover:bg-neutral-100">
          {vi.dieu_huong.danh_muc}
        </Link>
        <Link href="/admin/products" className="rounded px-2 py-1 text-sm hover:bg-neutral-100">
          {vi.dieu_huong.san_pham}
        </Link>
        <Link href="/admin/catalogue-sheet" className="rounded px-2 py-1 text-sm hover:bg-neutral-100">
          {vi.dieu_huong.catalogue_sheet}
        </Link>
        <Link href="/admin/upload" className="rounded px-2 py-1 text-sm hover:bg-neutral-100">
          {vi.dieu_huong.tai_anh}
        </Link>
        {user.role === "admin" && (
          <Link href="/admin/brand" className="rounded px-2 py-1 text-sm hover:bg-neutral-100">
            {vi.dieu_huong.thuong_hieu}
          </Link>
        )}
        <form action={dangXuat} className="mt-auto">
          <button type="submit" className="text-sm text-neutral-500 hover:underline">
            {vi.dang_nhap.dang_xuat}
          </button>
        </form>
      </nav>
      {/* min-w-0: flex item mac dinh co min-width:auto nen KHONG chiu co nho hon
          noi dung. Thieu no thi bang rong day ca vung noi dung vuot man hinh va
          toan trang truot ngang, thay vi bang tu cuon trong khung cua no. */}
      <main className="min-w-0 flex-1 p-8">{children}</main>
    </div>
  );
}
