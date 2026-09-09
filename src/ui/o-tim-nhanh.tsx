"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { useDangLoc } from "./vung-loc";

/**
 * Ô tìm nhanh: gõ tới đâu lọc tới đó, không có nút Tìm.
 *
 * Khác ODoTim của màn hình catalogue ở chỗ không có gợi ý — danh sách ở đây
 * ngắn và chính nó là câu trả lời, một danh sách gợi ý nữa chỉ che mất nó.
 *
 * Ô nhập giữ trạng thái riêng rồi mới đẩy lên URL sau một nhịp nghỉ. Không có
 * nhịp nghỉ này thì mỗi phím là một lần dựng lại cả trang ở máy chủ.
 */

const NHIP_NGHI_MS = 250;

export function OTimNhanh({
  nhan,
  goiY,
  nhanXoa,
  chuDangCapNhat,
}: {
  /** Nhãn phía trên ô. */
  nhan: string;
  /** Câu mờ trong ô khi chưa gõ gì. */
  goiY: string;
  /** Nhãn cho nút xoá — chỉ trình đọc màn hình nghe thấy. */
  nhanXoa: string;
  chuDangCapNhat: string;
}) {
  const router = useRouter();
  const duongDan = usePathname();
  const thamSo = useSearchParams();
  const { dangLoc, chay } = useDangLoc();

  const [q, setQ] = useState(thamSo.get("q") ?? "");
  const lanDau = useRef(true);

  const di = useCallback(
    (v: string) => {
      const moi = new URLSearchParams(thamSo);
      if (v.trim()) moi.set("q", v.trim());
      else moi.delete("q");
      // Đổi câu tìm là về trang 1: trang 3 của kết quả cũ gần như chắc chắn
      // không tồn tại trong kết quả mới.
      moi.delete("trang");
      const s = moi.toString();
      chay(() => router.replace(s ? `${duongDan}?${s}` : duongDan, { scroll: false }));
    },
    [duongDan, router, thamSo, chay],
  );

  useEffect(() => {
    if (lanDau.current) {
      lanDau.current = false;
      return;
    }
    const h = setTimeout(() => di(q), NHIP_NGHI_MS);
    return () => clearTimeout(h);
    // `di` đổi theo mỗi lần tham số URL đổi; đưa nó vào đây thì hẹn giờ bị đặt
    // lại ngay sau khi điều hướng xong và câu tìm chạy hai lần.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  return (
    <div className="mb-8 max-w-xl">
      <div className="flex items-baseline justify-between gap-4">
        <label className="block text-[11px] uppercase tracking-[0.14em] text-hp-muted" htmlFor="q">
          {nhan}
        </label>
        <span
          aria-live="polite"
          className={`shrink-0 text-[11px] uppercase tracking-[0.14em] text-hp-muted
                      transition-opacity duration-150 ${dangLoc ? "opacity-100" : "opacity-0"}`}
        >
          {dangLoc ? chuDangCapNhat : ""}
        </span>
      </div>

      <div
        className="mt-2 flex items-center gap-3 border border-hp-rule bg-hp-card px-4 py-3
                   transition-colors duration-150 focus-within:border-hp-pink"
      >
        <Search aria-hidden strokeWidth={1.5} className="h-5 w-5 shrink-0 text-hp-muted" />
        <input
          id="q"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          autoComplete="off"
          placeholder={goiY}
          className="w-full bg-transparent font-body text-base text-hp-body
                     placeholder:text-hp-muted/70 focus:outline-none"
        />
        {q !== "" && (
          <button
            type="button"
            onClick={() => setQ("")}
            aria-label={nhanXoa}
            className="shrink-0 text-hp-muted transition-colors duration-150 hover:text-hp-ink"
          >
            <X aria-hidden strokeWidth={1.5} className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
