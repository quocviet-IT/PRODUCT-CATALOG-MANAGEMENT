import { layChu } from "@/messages/may-chu";
import { BangXuong, VungXuong, Xuong } from "@/ui/xuong";

export default async function DangTai() {
  const t = await layChu();
  return (
    <VungXuong nhan={t.phan_hoi.dang_tai_danh_sach}>
      <Xuong lop="mb-4 h-6 w-40" />
      <Xuong lop="mb-4 h-10 w-full max-w-[640px]" />
      <BangXuong cot={5} dong={8} />
    </VungXuong>
  );
}
