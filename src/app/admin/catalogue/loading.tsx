import { layChu } from "@/messages/may-chu";
import { BangXuong, DauTrangXuong, VungXuong, Xuong } from "@/ui/xuong";

export default async function DangTai() {
  const t = await layChu();
  return (
    <VungXuong nhan={t.phan_hoi.dang_tai_danh_sach}>
      <DauTrangXuong soDongMoTa={2} />
      <Xuong lop="mb-8 h-10 w-52" />
      <BangXuong cot={6} dong={6} />
    </VungXuong>
  );
}
