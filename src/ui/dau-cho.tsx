"use client";

import { useLinkStatus } from "next/link";

/**
 * Dấu hiệu "đã nghe thấy" cho một liên kết đang chờ trang mới về.
 *
 * VÌ SAO CẦN, dù đã có loading.tsx: khung loading chỉ hiện khi ĐỔI TRANG. Đổi
 * số trang hay đổi bộ lọc là cùng một trang với tham số khác — Next dựng lại
 * tại chỗ và giữ nguyên màn hình cũ cho tới lúc xong. Không có gì ở đây thì
 * bấm "trang 3" xong màn hình đứng im, và người ta bấm lại lần nữa.
 *
 * Cả hai đều phải nằm BÊN TRONG `<Link>` — useLinkStatus đọc trạng thái của
 * liên kết gần nhất bọc ngoài nó.
 */

/**
 * Thay icon của liên kết bằng một chấm nhấp nháy.
 *
 * Thay đúng chỗ cái icon chứ không thêm gì mới: ô 16px giữ nguyên kích thước
 * nên thanh phân trang không xê dịch một pixel nào lúc bấm.
 */
export function IconCho({ children }: { children: React.ReactNode }) {
  const { pending } = useLinkStatus();
  if (!pending) return <>{children}</>;

  return (
    <span aria-hidden className="flex h-4 w-4 shrink-0 items-center justify-center">
      <span className="block h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
    </span>
  );
}

/**
 * Làm mờ nhãn chữ của liên kết trong lúc chờ.
 *
 * Dùng cho liên kết không có icon (ô số trang). Mờ đi chứ không đổi chữ: đổi
 * chữ trong một ô rộng 32px là làm cả hàng số nhảy.
 */
export function ChuCho({ children }: { children: React.ReactNode }) {
  const { pending } = useLinkStatus();
  return (
    <span
      aria-busy={pending || undefined}
      className={`transition-opacity duration-150 ${pending ? "opacity-40" : ""}`}
    >
      {children}
    </span>
  );
}
