/**
 * Khối xám thay chỗ cho nội dung chưa về tới.
 *
 * Vì sao là khối có hình dạng chứ không phải chữ "Đang tải": khối giữ đúng chỗ
 * và đúng kích thước của thứ sắp hiện ra, nên khi dữ liệu về thì trang không
 * giật. Một dòng chữ "Đang tải" ở giữa màn hình vừa không nói được sẽ có bao
 * nhiêu dòng, vừa làm mọi thứ nhảy một cái khi biến mất.
 *
 * Không phải client component: nó chỉ là một thẻ có lớp CSS. Đặt được cả trong
 * loading.tsx lẫn trong bất kỳ server component nào.
 */
export function Xuong({ lop }: { lop?: string }) {
  return (
    <span
      aria-hidden
      className={`block animate-pulse bg-hp-inset ${lop ?? ""}`}
    />
  );
}

/**
 * Vùng đang tải của cả một màn hình.
 *
 * `role="status"` + `aria-live="polite"`: người dùng trình đọc màn hình không
 * thấy được mấy khối xám kia, nên nếu không có dòng này thì với họ trang đơn
 * giản là im lặng. `aria-busy` để công nghệ hỗ trợ biết nội dung còn đang đổi.
 */
export function VungXuong({
  nhan,
  children,
}: {
  /** Câu đọc lên cho trình đọc màn hình, ví dụ "Đang tải danh sách". */
  nhan: string;
  children: React.ReactNode;
}) {
  return (
    <div role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">{nhan}</span>
      {children}
    </div>
  );
}

/**
 * Đầu trang: tiêu đề + vài dòng mô tả + đường kẻ.
 *
 * Mọi màn hình nội bộ đều mở đầu bằng đúng khối này, nên khung chờ dựng lại
 * đúng nó thì lúc dữ liệu về, tiêu đề nằm y nguyên chỗ cũ — không nhảy.
 */
export function DauTrangXuong({ soDongMoTa = 1 }: { soDongMoTa?: number }) {
  return (
    <div className="mb-8">
      <Xuong lop="h-8 w-72" />
      <div className="mt-4 space-y-2">
        {Array.from({ length: soDongMoTa }, (_, i) => (
          <Xuong key={i} lop={`h-3 ${i === 0 ? "w-96" : "w-64"}`} />
        ))}
      </div>
      <div className="mt-5 h-px bg-hp-rule" />
    </div>
  );
}

/**
 * Khung bảng: hàng tiêu đề đậm hơn, rồi mấy hàng dữ liệu.
 *
 * Dựng đúng số cột thật để bề ngang không đổi khi bảng thật thay vào. Số hàng
 * thì không cần đúng — chỉ cần đủ để lấp phần màn hình người ta đang nhìn.
 */
export function BangXuong({ cot, dong = 8 }: { cot: number; dong?: number }) {
  return (
    <div className="overflow-hidden border border-hp-rule">
      <div className="flex gap-4 border-b border-hp-rule bg-hp-inset px-4 py-3">
        {Array.from({ length: cot }, (_, i) => (
          <Xuong key={i} lop="h-3 flex-1" />
        ))}
      </div>
      {Array.from({ length: dong }, (_, h) => (
        <div key={h} className="flex items-center gap-4 border-b border-hp-rule px-4 py-4">
          {Array.from({ length: cot }, (_, i) => (
            <Xuong key={i} lop="h-3 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}
