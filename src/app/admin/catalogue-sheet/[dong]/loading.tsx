import { layChu } from "@/messages/may-chu";
import { VungXuong, Xuong } from "@/ui/xuong";

/**
 * Trang chi tiết một mẫu. Ngoài việc đọc bảng, nó còn liệt kê thư viện ảnh —
 * trung bình 26 tấm cho một mẫu, nên đây là chỗ chờ lâu thứ hai của hệ thống.
 */
export default async function DangTai() {
  const t = await layChu();
  return (
    <VungXuong nhan={t.phan_hoi.dang_tai_chi_tiet}>
      <Xuong lop="mb-6 h-3 w-24" />
      <Xuong lop="h-8 w-64" />
      <Xuong lop="mt-4 h-3 w-96" />

      {/* Bảng thông số bên trái, thư viện ảnh bên phải — đúng bố cục thật. */}
      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,380px)_1fr]">
        <div className="space-y-4">
          {Array.from({ length: 9 }, (_, i) => (
            <div key={i} className="border-b border-hp-rule pb-3">
              <Xuong lop="h-2.5 w-20" />
              <Xuong lop="mt-2 h-3 w-40" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {Array.from({ length: 9 }, (_, i) => (
            <Xuong key={i} lop="aspect-square w-full" />
          ))}
        </div>
      </div>
    </VungXuong>
  );
}
