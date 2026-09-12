import { layChu } from "@/messages/may-chu";
import { BangXuong, DauTrangXuong, VungXuong } from "@/ui/xuong";

export default async function DangTai() {
  const t = await layChu();
  return (
    <VungXuong nhan={t.phan_hoi.dang_tai_gop_y}>
      <DauTrangXuong />
      <BangXuong cot={6} dong={5} />
    </VungXuong>
  );
}
