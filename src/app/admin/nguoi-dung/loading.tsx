import { layChu } from "@/messages/may-chu";
import { BangXuong, DauTrangXuong, VungXuong } from "@/ui/xuong";

export default async function DangTai() {
  const t = await layChu();
  return (
    <VungXuong nhan={t.phan_hoi.dang_tai_tai_khoan}>
      <DauTrangXuong />
      <BangXuong cot={7} dong={6} />
    </VungXuong>
  );
}
