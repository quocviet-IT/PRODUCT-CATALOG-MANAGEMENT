import Link from "next/link";
import type { DanhMuc } from "@/modules/catalog/categories.service";
import type { TrangThaiSanPham } from "@/modules/catalog/search-query";
import { layChu } from "@/messages/may-chu";
import type { BoChu } from "@/messages";

/** Danh sach trang thai san pham dung chung cho bo loc va trang chi tiet. */
export function danhSachTrangThai(
  t: BoChu,
): { gia_tri: TrangThaiSanPham; nhan: string }[] {
  return [
    { gia_tri: "active", nhan: t.san_pham.trang_thai_dang_ban },
    { gia_tri: "draft", nhan: t.san_pham.trang_thai_nhap },
    { gia_tri: "discontinued", nhan: t.san_pham.trang_thai_ngung_ban },
  ];
}

export async function ThanhBoLoc({
  danhMuc, hienTai,
}: {
  danhMuc: DanhMuc[];
  hienTai: Record<string, string | undefined>;
}) {
  const t = await layChu();
  return (
    <form method="get" className="mb-6 flex flex-wrap items-end gap-3">
      <label className="flex flex-col gap-1 text-xs">
        {t.chung.tim_kiem}
        <input name="q" defaultValue={hienTai.q ?? ""} placeholder={t.san_pham.tim_kiem_placeholder}
               className="w-64 rounded border px-3 py-2 text-sm" />
      </label>

      <label className="flex flex-col gap-1 text-xs">
        {t.dieu_huong.danh_muc}
        <select name="danh_muc_path" defaultValue={hienTai.danh_muc_path ?? ""}
                className="rounded border px-3 py-2 text-sm">
          <option value="">{t.san_pham.tat_ca}</option>
          {danhMuc.map((d) => <option key={d.id} value={d.path}>{d.name}</option>)}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-xs">
        {t.san_pham.gia_tu}
        <input name="gia_tu" type="number" min="0" defaultValue={hienTai.gia_tu ?? ""}
               className="w-32 rounded border px-3 py-2 text-sm" />
      </label>

      <label className="flex flex-col gap-1 text-xs">
        {t.san_pham.gia_den}
        <input name="gia_den" type="number" min="0" defaultValue={hienTai.gia_den ?? ""}
               className="w-32 rounded border px-3 py-2 text-sm" />
      </label>

      <label className="flex flex-col gap-1 text-xs">
        {t.san_pham.trang_thai}
        <select name="trang_thai" defaultValue={hienTai.trang_thai ?? ""}
                className="rounded border px-3 py-2 text-sm">
          <option value="">{t.san_pham.tat_ca}</option>
          {danhSachTrangThai(t).map((x) => (
            <option key={x.gia_tri} value={x.gia_tri}>{x.nhan}</option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-xs">
        {t.san_pham.anh}
        <select name="co_anh" defaultValue={hienTai.co_anh ?? ""}
                className="rounded border px-3 py-2 text-sm">
          <option value="">{t.san_pham.tat_ca}</option>
          <option value="1">{t.san_pham.da_co_anh}</option>
          <option value="0">{t.san_pham.chua_co_anh}</option>
        </select>
      </label>

      <button className="rounded bg-teal-800 px-4 py-2 text-sm text-white">{t.san_pham.loc}</button>
      <Link href="/admin/products" className="px-2 py-2 text-sm text-neutral-600 hover:underline">
        {t.san_pham.xoa_loc}
      </Link>
    </form>
  );
}
