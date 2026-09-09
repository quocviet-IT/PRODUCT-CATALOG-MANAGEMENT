import { layChu } from "@/messages/may-chu";
import { VungXuong, Xuong } from "@/ui/xuong";

export default async function DangTai() {
  const t = await layChu();
  return (
    <VungXuong nhan={t.phan_hoi.dang_tai_trang}>
      <Xuong lop="h-8 w-80" />
      <Xuong lop="mt-4 h-3 w-[28rem]" />
      <Xuong lop="mt-8 h-12 w-full max-w-[520px]" />
      <div className="mt-8 space-y-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Xuong key={i} lop="h-24 w-full" />
        ))}
      </div>
    </VungXuong>
  );
}
