import { chuanHoaTimKiem } from "@/lib/vietnamese";
import type { DongDanhSach } from "./chia-se.service";

/**
 * Lọc danh sách catalogue đã tạo. Hàm thuần, không đụng cơ sở dữ liệu.
 *
 * VÌ SAO LỌC TRONG BỘ NHỚ chứ không lọc bằng SQL: câu tìm phải bỏ dấu tiếng
 * Việt — gõ "chi lan" phải ra "Chị Lan". Postgres làm được việc đó nhưng phải
 * bật extension `unaccent` hoặc nuôi thêm một cột đã chuẩn hoá, còn ở đây thì
 * dùng lại đúng hàm chuanHoaTimKiem đã có và đã được kiểm. Bảng này mỗi ngày
 * thêm vài dòng, nên đổi lấy sự đơn giản là đáng.
 */

/** Vùng chữ để tìm của một dòng. */
function kho(d: DongDanhSach): string[] {
  return chuanHoaTimKiem(
    [d.ten, d.slug, d.nguoiTao ?? "", String(d.so)].join(" "),
  )
    .split(" ")
    .filter(Boolean);
}

/** Từ ngắn hơn ngưỡng này chỉ khớp từ ĐẦU từ, không khớp giữa từ. */
const DAI_TU_DU_DAI = 4;

/**
 * Cùng phép khớp với ô tìm của màn hình catalogue: khớp từ đầu mỗi từ, và cho
 * khớp cả giữa từ khi từ tìm đủ dài — người ta gõ "8axs" để tìm một đuôi slug.
 */
function khopTu(vung: string[], t: string): boolean {
  if (vung.some((w) => w.startsWith(t))) return true;
  return t.length >= DAI_TU_DU_DAI && vung.some((w) => w.includes(t));
}

export function tachTuKhoa(q: string | null): string[] {
  if (q === null) return [];
  return chuanHoaTimKiem(q).split(" ").filter(Boolean);
}

/**
 * Một dòng phải chứa TẤT CẢ các từ, không cần đúng thứ tự. "lan 18k" tìm được
 * "Chị Lan — nhẫn cưới 18K" dù hai từ đó cách nhau mấy chữ.
 */
export function locDanhSachDaTao(ds: DongDanhSach[], q: string | null): DongDanhSach[] {
  const tuKhoa = tachTuKhoa(q);
  if (tuKhoa.length === 0) return ds;
  return ds.filter((d) => {
    const vung = kho(d);
    return tuKhoa.every((t) => khopTu(vung, t));
  });
}
