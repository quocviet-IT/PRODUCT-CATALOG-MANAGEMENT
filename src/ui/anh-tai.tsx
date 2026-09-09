"use client";

import { useEffect, useRef, useState } from "react";
import { ImageOff } from "lucide-react";
import { useChu } from "@/messages/dung-chu";

/**
 * Ảnh sản phẩm, có chỗ giữ trong lúc tải và có lối thoát khi hỏng.
 *
 * VÌ SAO CẦN: `/api/anh-drive/<id>` lần đầu phải gọi sang Drive, tải bản gốc rồi
 * thu nhỏ — mất vài giây. Trong vài giây đó thẻ <img> trần là một ô trống hoàn
 * toàn. Với một lưới 40 mẫu thì khách nhìn thấy một trang trắng lỗ chỗ và không
 * biết là đang tải hay là hỏng. Từ lần thứ hai trở đi ảnh nằm trong bộ đệm nên
 * gần như hiện ngay — và ô xám sẽ chớp qua quá nhanh để kịp thấy.
 *
 * Ảnh hỏng KHÔNG được để trống: một ô trống trông y hệt một ô đang tải, và
 * khách sẽ ngồi đợi một thứ không bao giờ tới.
 *
 * Thẻ bọc tự mang `relative`, không đòi hỏi gì ở thẻ cha — nếu bắt cha phải có
 * `relative` thì chỉ cần một chỗ quên là ô xám nhảy ra góc màn hình.
 */
export function AnhTai({
  src,
  alt,
  lop,
  lopBoc,
  tai = "lazy",
  nen = "sang",
}: {
  src: string;
  alt: string;
  /** Lớp cho chính thẻ <img>. */
  lop?: string;
  /**
   * Lớp cho thẻ bọc. Mặc định lấp đầy ô cha — đúng cho mọi ô ảnh có kích thước
   * sẵn (ô bảng, ô lưới). Khung phóng to thì ảnh tự định cỡ nên phải truyền
   * riêng, không thì thẻ bọc rộng bằng 0 và ô xám không thấy đâu cả.
   */
  lopBoc?: string;
  tai?: "eager" | "lazy";
  /**
   * Nền sau lưng ảnh. Khung phóng to nằm trên lớp phủ tối, mà ô xám màu be
   * trên nền tối là một mảng sáng chói giữa màn hình.
   */
  nen?: "sang" | "toi";
}) {
  // Tự đọc ngôn ngữ thay vì nhận nhãn qua prop: riêng bố cục trang khách đã có
  // mười chỗ gọi. Mà trang khách còn tự bọc lại NguonNgonNgu bằng ngôn ngữ sale
  // chọn lúc tạo — nên đọc từ context mới ra ĐÚNG thứ tiếng khách đang xem.
  const t = useChu();
  const [trangThai, setTrangThai] = useState<"cho" | "xong" | "hong">("cho");
  const anh = useRef<HTMLImageElement>(null);

  useEffect(() => {
    // Ảnh đã nằm trong bộ đệm trình duyệt thì tải xong TRƯỚC khi React kịp gắn
    // onLoad — không có đoạn này thì đúng những ảnh nhanh nhất lại kẹt ô xám
    // vĩnh viễn. Thẻ do máy chủ dựng sẵn nên trường hợp này rất hay xảy ra.
    const e = anh.current;
    if (e?.complete) setTrangThai(e.naturalWidth > 0 ? "xong" : "hong");
  }, [src]);

  const nenXam = nen === "toi" ? "bg-hp-foundation/10" : "bg-hp-inset";
  const mauIcon = nen === "toi" ? "text-hp-foundation/70" : "text-hp-muted";

  return (
    <span className={`relative ${lopBoc ?? "block h-full w-full"}`}>
      {trangThai === "cho" && (
        <span aria-hidden className={`absolute inset-0 animate-pulse ${nenXam}`} />
      )}

      {trangThai === "hong" ? (
        <span
          title={t.phan_hoi.anh_hong}
          className={`absolute inset-0 flex items-center justify-center ${nenXam}`}
        >
          <ImageOff aria-hidden strokeWidth={1.5} className={`h-5 w-5 ${mauIcon}`} />
          <span className="sr-only">{t.phan_hoi.anh_hong}</span>
        </span>
      ) : (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          ref={anh}
          src={src}
          alt={alt}
          loading={tai}
          onLoad={() => setTrangThai("xong")}
          onError={() => setTrangThai("hong")}
          // Hiện dần thay vì bật ra: một lưới ảnh tải xong lệch nhau vài trăm
          // mili giây, bật ra thì thành một tràng nhấp nháy.
          className={`${lop ?? ""} transition-opacity duration-300 ${
            trangThai === "xong" ? "opacity-100" : "opacity-0"
          }`}
        />
      )}
    </span>
  );
}
