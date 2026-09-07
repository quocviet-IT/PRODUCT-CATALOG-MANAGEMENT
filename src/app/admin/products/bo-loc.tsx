import Link from "next/link";
import type { DanhMuc } from "@/modules/catalog/categories.service";
import type { TrangThaiSanPham } from "@/modules/catalog/search-query";
import { vi } from "@/messages/vi";

/** Danh sach trang thai san pham dung chung cho bo loc va trang chi tiet. */
export const DANH_SACH_TRANG_THAI: { gia_tri: TrangThaiSanPham; nhan: string }[] = [
  { gia_tri: "active", nhan: vi.san_pham.trang_thai_dang_ban },
  { gia_tri: "draft", nhan: vi.san_pham.trang_thai_nhap },
  { gia_tri: "discontinued", nhan: vi.san_pham.trang_thai_ngung_ban },
];

export function ThanhBoLoc({
  danhMuc, hienTai,
}: {
  danhMuc: DanhMuc[];
  hienTai: Record<string, string | undefined>;
}) {
  return (
    <form method="get" className="mb-6 flex flex-wrap items-end gap-3">
      <label className="flex flex-col gap-1 text-xs">
        {vi.chung.tim_kiem}
        <input name="q" defaultValue={hienTai.q ?? ""} placeholder={vi.san_pham.tim_kiem_placeholder}
               className="w-64 rounded border px-3 py-2 text-sm" />
      </label>

      <label className="flex flex-col gap-1 text-xs">
        {vi.dieu_huong.danh_muc}
        <select name="danh_muc_path" defaultValue={hienTai.danh_muc_path ?? ""}
                className="rounded border px-3 py-2 text-sm">
          <option value="">{vi.san_pham.tat_ca}</option>
          {danhMuc.map((d) => <option key={d.id} value={d.path}>{d.name}</option>)}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-xs">
        {vi.san_pham.gia_tu}
        <input name="gia_tu" type="number" min="0" defaultValue={hienTai.gia_tu ?? ""}
               className="w-32 rounded border px-3 py-2 text-sm" />
      </label>

      <label className="flex flex-col gap-1 text-xs">
        {vi.san_pham.gia_den}
        <input name="gia_den" type="number" min="0" defaultValue={hienTai.gia_den ?? ""}
               className="w-32 rounded border px-3 py-2 text-sm" />
      </label>

      <label className="flex flex-col gap-1 text-xs">
        {vi.san_pham.trang_thai}
        <select name="trang_thai" defaultValue={hienTai.trang_thai ?? ""}
                className="rounded border px-3 py-2 text-sm">
          <option value="">{vi.san_pham.tat_ca}</option>
          {DANH_SACH_TRANG_THAI.map((t) => (
            <option key={t.gia_tri} value={t.gia_tri}>{t.nhan}</option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-xs">
        {vi.san_pham.anh}
        <select name="co_anh" defaultValue={hienTai.co_anh ?? ""}
                className="rounded border px-3 py-2 text-sm">
          <option value="">{vi.san_pham.tat_ca}</option>
          <option value="1">{vi.san_pham.da_co_anh}</option>
          <option value="0">{vi.san_pham.chua_co_anh}</option>
        </select>
      </label>

      <button className="rounded bg-teal-800 px-4 py-2 text-sm text-white">{vi.san_pham.loc}</button>
      <Link href="/admin/products" className="px-2 py-2 text-sm text-neutral-600 hover:underline">
        {vi.san_pham.xoa_loc}
      </Link>
    </form>
  );
}
