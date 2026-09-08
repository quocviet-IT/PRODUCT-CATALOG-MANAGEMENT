import Link from "next/link";
import { requireUser } from "@/auth/guard";
import { timSanPham } from "@/modules/catalog/products.service";
import { docBoLocTuUrl, docThamSoTrang } from "@/modules/catalog/search-query";
import { layTatCa } from "@/modules/catalog/categories.service";
import { kyNhieuUrl } from "@/modules/media/anh-url";
import { dinhDangTien } from "@/lib/money";
import { ThanhBoLoc } from "./bo-loc";
import { layChu } from "@/messages/may-chu";

export default async function TrangSanPham({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const t = await layChu();
  await requireUser();
  const sp = await searchParams;

  const [{ ds, tong }, danhMuc] = await Promise.all([
    timSanPham(docBoLocTuUrl(sp), docThamSoTrang(sp)),
    layTatCa(),
  ]);
  const urls = await kyNhieuUrl(ds.map((s) => s.anhDaiDien));
  const tenDanhMuc = new Map(danhMuc.map((d) => [d.id, d.name]));

  const trang = docThamSoTrang(sp);
  const soTrang = Math.max(1, Math.ceil(tong / trang.moiTrang));

  function urlTrang(n: number): string {
    const q = new URLSearchParams();
    for (const [k, v] of Object.entries(sp)) if (v) q.set(k, v);
    q.set("trang", String(n));
    return `/admin/products?${q.toString()}`;
  }

  return (
    <>
      <h1 className="mb-4 text-xl font-bold">{t.dieu_huong.san_pham}</h1>
      <ThanhBoLoc danhMuc={danhMuc} hienTai={sp} />
      <p className="mb-4 text-sm text-neutral-600">
        {t.san_pham.tim_thay} {tong} {t.san_pham.ket_qua}
      </p>

      {ds.length === 0 ? (
        <p className="text-sm text-neutral-500">{t.chung.khong_co_du_lieu}</p>
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {ds.map((s, i) => (
            <li key={s.id} className="overflow-hidden rounded-lg border">
              <Link href={`/admin/products/${s.id}`}>
                <div className="aspect-square bg-neutral-100">
                  {urls[i] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={urls[i]!} alt={s.name} loading="lazy"
                         className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-neutral-400">
                      {t.san_pham.chua_co_anh}
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="font-mono text-[11px] text-neutral-500">{s.sku}</p>
                  <p className="line-clamp-2 text-sm font-medium">{s.name}</p>
                  <p className="mt-1 text-sm">
                    {s.listPrice
                      ? dinhDangTien(Number(s.listPrice), s.currency === "USD" ? "USD" : "VND")
                      : <span className="text-neutral-400">{t.san_pham.chua_co_gia}</span>}
                  </p>
                  {s.categoryId && (
                    <p className="mt-1 text-[11px] text-neutral-500">
                      {tenDanhMuc.get(s.categoryId)}
                    </p>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {soTrang > 1 && (
        <nav className="mt-8 flex gap-2 text-sm">
          {Array.from({ length: soTrang }, (_, i) => i + 1).map((n) => (
            <Link key={n} href={urlTrang(n)}
                  className={`rounded border px-3 py-1 ${n === trang.trang ? "bg-teal-800 text-white" : ""}`}>
              {n}
            </Link>
          ))}
        </nav>
      )}
    </>
  );
}
