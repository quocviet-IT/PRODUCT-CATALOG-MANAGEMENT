import Link from "next/link";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { KhoaSap, SapXep } from "@/modules/sheet/catalogue.view";
import { ChuCho } from "@/ui/dau-cho";

/**
 * Đầu cột bấm được để sắp xếp.
 *
 * Là <Link> chứ không phải <button>: sắp xếp nằm trong đường dẫn, nên một cách
 * xếp cụ thể gửi cho đồng nghiệp được, mở tab mới được, và bấm nút Lùi của
 * trình duyệt thì quay về cách xếp trước đó.
 *
 * Mũi tên chỉ hiện ở cột ĐANG xếp. Hiện mũi tên mờ ở mọi cột thì hàng tiêu đề
 * thành một dãy ký hiệu, và cột đang có tác dụng không còn nổi lên nữa.
 */
export function DauCot({
  khoa,
  nhan,
  sap,
  urlSap,
  soCanhPhai,
}: {
  khoa: KhoaSap;
  nhan: string;
  sap: SapXep;
  urlSap: (khoa: KhoaSap) => string;
  /** Cột số thì căn phải, để hàng chữ và hàng số thẳng mép nhau. */
  soCanhPhai?: boolean;
}) {
  const dang = sap.khoa === khoa;
  const Mui = sap.chieu === "giam" ? ChevronDown : ChevronUp;

  return (
    <Link
      href={urlSap(khoa)}
      aria-label={nhan}
      className={`inline-flex items-center gap-1 transition-colors duration-150
                  hover:text-hp-ink ${dang ? "text-hp-ink" : ""}
                  ${soCanhPhai ? "flex-row-reverse" : ""}`}
    >
      <ChuCho>{nhan}</ChuCho>
      {/* Ô 12px giữ chỗ sẵn kể cả khi không có mũi tên: bấm sang cột khác mà
          bề ngang tiêu đề đổi thì cả bảng dịch một nhịp. */}
      <span className="flex h-3 w-3 shrink-0 items-center justify-center">
        {dang && <Mui aria-hidden strokeWidth={2} className="h-3 w-3" />}
      </span>
    </Link>
  );
}
