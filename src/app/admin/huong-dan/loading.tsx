import { layChu } from "@/messages/may-chu";
import { DauTrangXuong, VungXuong, Xuong } from "@/ui/xuong";

/**
 * Trang hướng dẫn nặng vì có bảy ảnh chụp màn hình. Nó cũng là tuyến duy nhất
 * trong khung quản trị trước đây không có khung chờ — mà thanh điều hướng lại
 * dựa vào khung chờ để báo "đã nhận", nên thiếu tệp này là bấm HƯỚNG DẪN xong
 * màn hình đứng im.
 */
export default async function DangTai() {
  const t = await layChu();
  return (
    <VungXuong nhan={t.phan_hoi.dang_tai_trang}>
      <DauTrangXuong soDongMoTa={2} />
      <div className="space-y-10">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i}>
            <Xuong lop="h-4 w-56" />
            <Xuong lop="mt-3 h-3 w-full max-w-2xl" />
            <Xuong lop="mt-4 aspect-[16/10] w-full max-w-4xl" />
          </div>
        ))}
      </div>
    </VungXuong>
  );
}
