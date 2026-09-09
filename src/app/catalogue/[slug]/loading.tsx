import { layChu } from "@/messages/may-chu";
import { VungXuong, Xuong } from "@/ui/xuong";

/**
 * Khung chờ của trang khách xem.
 *
 * CỐ Ý ĐỂ MỎNG. Tông màu của catalogue (be, trắng, tối, rêu) nằm trong bản ghi
 * dưới cơ sở dữ liệu — đúng thứ trang này còn đang đợi. Nên khung chờ không thể
 * biết mình sẽ mang màu gì, và dựng lại cả bố cục ở đây là bảo đảm khách nhìn
 * thấy một trang sáng rồi nó lật sang tối ngay sau đó.
 *
 * Vài khối mờ giữa nền là đủ nói "đang tải", mà lật màu thì gần như không thấy.
 * Chỗ chờ lâu thật của trang này là ảnh, và ảnh đã có chỗ giữ riêng (AnhTai).
 */
export default async function DangTai() {
  const t = await layChu();
  return (
    <VungXuong nhan={t.phan_hoi.dang_tai_catalogue}>
      <main className="mx-auto max-w-4xl px-6 py-10">
        <Xuong lop="h-3 w-28 opacity-60" />
        <Xuong lop="mt-4 h-8 w-72 opacity-60" />
        <Xuong lop="mt-3 h-3 w-40 opacity-60" />
        <div className="mt-12 space-y-4">
          {Array.from({ length: 3 }, (_, i) => (
            <Xuong key={i} lop="h-40 w-full opacity-40" />
          ))}
        </div>
      </main>
    </VungXuong>
  );
}
