import { layChu } from "@/messages/may-chu";
import { BangXuong, DauTrangXuong, VungXuong, Xuong } from "@/ui/xuong";

/**
 * Khung chờ của màn hình catalogue.
 *
 * Đây là trang nặng nhất hệ thống: đọc bản chụp bảng tính từ Supabase Storage
 * rồi dựng bảng 16 cột. Không có tệp này thì bấm vào mục Catalogue Online là
 * màn hình cũ đứng im cho tới khi máy chủ trả lời — người dùng không biết đã
 * bấm trúng chưa và bấm thêm lần nữa.
 */
export default async function DangTai() {
  const t = await layChu();
  return (
    <VungXuong nhan={t.phan_hoi.dang_tai_danh_sach}>
      <DauTrangXuong />

      {/* Năm ô thống kê. Dựng đúng năm ô chứ không phải một khối dài: lúc số
          thật hiện ra, chúng nằm sẵn đúng chỗ. */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="border border-hp-rule p-6">
            <Xuong lop="h-9 w-16" />
            <Xuong lop="mt-6 h-3 w-24" />
          </div>
        ))}
      </div>

      <Xuong lop="mb-8 h-14 w-full max-w-[860px]" />
      <BangXuong cot={8} dong={10} />
    </VungXuong>
  );
}
