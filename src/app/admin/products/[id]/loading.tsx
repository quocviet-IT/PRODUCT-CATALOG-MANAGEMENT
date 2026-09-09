import { layChu } from "@/messages/may-chu";
import { VungXuong, Xuong } from "@/ui/xuong";

export default async function DangTai() {
  const t = await layChu();
  return (
    <VungXuong nhan={t.phan_hoi.dang_tai_trang}>
      <Xuong lop="mb-6 h-6 w-56" />
      <div className="grid gap-8 lg:grid-cols-2">
        <Xuong lop="aspect-square w-full max-w-[420px]" />
        <div className="space-y-4">
          {Array.from({ length: 6 }, (_, i) => (
            <Xuong key={i} lop="h-10 w-full max-w-[420px]" />
          ))}
        </div>
      </div>
    </VungXuong>
  );
}
