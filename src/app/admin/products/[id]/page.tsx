import { notFound } from "next/navigation";
import { requireUser } from "@/auth/guard";
import { layTheoId } from "@/modules/catalog/products.service";
import { layTatCa } from "@/modules/catalog/categories.service";
import { layTheoSanPham } from "@/modules/media/images.repo";
import { kyNhieuUrl } from "@/modules/media/anh-url";
import { luuSanPham } from "./actions";
import { DANH_SACH_TRANG_THAI } from "../bo-loc";
import { vi } from "@/messages/vi";

export default async function TrangChiTiet({ params }: { params: Promise<{ id: string }> }) {
  await requireUser();
  const { id } = await params;

  const sp = await layTheoId(id);
  if (!sp) notFound();

  const [danhMuc, anhs] = await Promise.all([layTatCa(), layTheoSanPham(id)]);
  const urls = await kyNhieuUrl(anhs.map((a) => (a.variants as Record<string, string>).medium));

  return (
    <div className="grid max-w-4xl gap-8 md:grid-cols-2">
      <div className="flex flex-col gap-3">
        {urls.length === 0 && <p className="text-sm text-neutral-500">{vi.san_pham.san_pham_chua_co_anh}</p>}
        {urls.map((u, i) => u && (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={anhs[i].id} src={u} alt={sp.name} className="w-full rounded-lg border" />
        ))}
      </div>

      <form action={luuSanPham} className="flex flex-col gap-4">
        <input type="hidden" name="id" value={sp.id} />

        <label className="flex flex-col gap-1 text-xs">{vi.san_pham.ma_san_pham}
          <input name="sku" defaultValue={sp.sku} required
                 className="rounded border px-3 py-2 font-mono text-sm" />
        </label>

        <label className="flex flex-col gap-1 text-xs">{vi.san_pham.ten}
          <input name="name" defaultValue={sp.name} required
                 className="rounded border px-3 py-2 text-sm" />
        </label>

        <label className="flex flex-col gap-1 text-xs">{vi.san_pham.mo_ta}
          <textarea name="description" defaultValue={sp.description} rows={4}
                    className="rounded border px-3 py-2 text-sm" />
        </label>

        <label className="flex flex-col gap-1 text-xs">{vi.san_pham.gia_niem_yet}
          <input name="list_price" type="number" min="0" step="1"
                 defaultValue={sp.listPrice ?? ""}
                 className="rounded border px-3 py-2 text-sm" />
        </label>

        <label className="flex flex-col gap-1 text-xs">{vi.dieu_huong.danh_muc}
          <select name="category_id" defaultValue={sp.categoryId ?? ""}
                  className="rounded border px-3 py-2 text-sm">
            <option value="">{vi.san_pham.chua_phan_loai}</option>
            {danhMuc.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-xs">{vi.san_pham.trang_thai}
          <select name="status" defaultValue={sp.status}
                  className="rounded border px-3 py-2 text-sm">
            {DANH_SACH_TRANG_THAI.map((t) => (
              <option key={t.gia_tri} value={t.gia_tri}>{t.nhan}</option>
            ))}
          </select>
        </label>

        <button className="w-fit rounded bg-teal-800 px-4 py-2 text-sm text-white">
          {vi.chung.luu}
        </button>
      </form>
    </div>
  );
}
