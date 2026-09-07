import { requireUser } from "@/auth/guard";
import { layDanhSachCatalogue } from "@/modules/sheet/catalogue.service";
import { docBoLocTuUrl, locDanhSach, tinhThongKe } from "@/modules/sheet/catalogue.view";
import type { CoBatThuong, DongCatalogue } from "@/modules/sheet/catalogue.mapper";
import { ThanhBoLoc } from "./bo-loc";
import { vi } from "@/messages/vi";

const NHAN_CO: Record<CoBatThuong, string> = {
  "thieu-sku": vi.catalogue_sheet.co_thieu_sku,
  "thieu-anh": vi.catalogue_sheet.co_thieu_anh,
  "thieu-mo-ta": vi.catalogue_sheet.co_thieu_mo_ta,
  "trung": vi.catalogue_sheet.co_trung,
  "tl-vang-lech": vi.catalogue_sheet.co_tl_vang_lech,
};

/** Chuan tieng Viet dung dau phay thap phan, du bang tinh ghi dau cham. */
function dinhDangGam(v: number | null): string | null {
  return v === null ? null : `${v.toFixed(2).replace(".", ",")} g`;
}

function O({ so, nhan }: { so: number; nhan: string }) {
  return (
    <div className="px-6 first:pl-0">
      <p className="font-title text-2xl tabular-nums text-hp-ink">{so}</p>
      <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-hp-muted">{nhan}</p>
    </div>
  );
}

function The({ d }: { d: DongCatalogue }) {
  return (
    <li className="border border-hp-rule bg-hp-card">
      <div className="flex aspect-[4/5] items-center justify-center bg-hp-inset">
        {d.fileIdAnh ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/api/anh-drive/${d.fileIdAnh}`}
            alt={d.maMau ?? ""}
            loading="lazy"
            className="h-full w-full object-contain"
          />
        ) : (
          <span className="text-[11px] uppercase tracking-[0.14em] text-hp-muted">
            {vi.catalogue_sheet.chua_co_anh}
          </span>
        )}
      </div>

      <div className="p-5">
        {d.chatLieu && (
          <span className="block text-[11px] uppercase tracking-[0.14em] text-hp-muted">
            {d.chatLieu}
          </span>
        )}
        <h3 className="mt-1 font-title text-xl leading-tight text-hp-ink">{d.maMau ?? "—"}</h3>

        <p className="mt-2 flex flex-wrap gap-x-4 text-sm tabular-nums text-hp-body">
          {dinhDangGam(d.tlVang) && <span>{dinhDangGam(d.tlVang)}</span>}
          {d.size && <span>Size {d.size}</span>}
        </p>

        {d.co.length > 0 && (
          <p className="mt-3 text-[10px] uppercase tracking-[0.14em] text-hp-muted">
            {d.co.map((c) => NHAN_CO[c]).join(" · ")}
          </p>
        )}

        {d.urlThuMuc && (
          <a href={d.urlThuMuc} target="_blank" rel="noreferrer"
             className="mt-3 inline-block text-[10px] uppercase tracking-[0.14em] text-hp-muted
                        transition-colors duration-150 hover:text-hp-ink hover:underline">
            {vi.catalogue_sheet.mo_thu_muc}
          </a>
        )}
      </div>
    </li>
  );
}

export default async function TrangCatalogueSheet({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requireUser();
  const sp = await searchParams;
  const loc = docBoLocTuUrl(sp);

  let tatCa: DongCatalogue[];
  try {
    tatCa = await layDanhSachCatalogue();
  } catch {
    return (
      <p className="text-sm text-hp-pink-strong">{vi.catalogue_sheet.loi_doc_bang}</p>
    );
  }

  const thongKe = tinhThongKe(tatCa);
  const ds = locDanhSach(tatCa, loc);

  return (
    <>
      <div className="mb-8">
        <span className="block text-[11px] uppercase tracking-[0.14em] text-hp-muted">
          {vi.catalogue_sheet.nguon}
        </span>
        <h1 className="mt-2 font-title text-[28px] leading-tight text-hp-ink">
          {vi.catalogue_sheet.tieu_de}
        </h1>
        <div className="mt-4 h-px bg-hp-rule" />
      </div>

      <div className="mb-10 flex divide-x divide-hp-rule">
        <O so={thongKe.tong} nhan={vi.catalogue_sheet.dem_mau} />
        <O so={thongKe.thieuAnh} nhan={vi.catalogue_sheet.dem_thieu_anh} />
        <O so={thongKe.thieuSku} nhan={vi.catalogue_sheet.dem_thieu_sku} />
        <O so={thongKe.tlVangLech} nhan={vi.catalogue_sheet.dem_tl_vang_lech} />
      </div>

      <ThanhBoLoc thongKe={thongKe} hienTai={loc} />

      {ds.length === 0 ? (
        <p className="text-sm text-hp-muted">{vi.catalogue_sheet.khong_khop}</p>
      ) : (
        <ul className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
          {ds.map((d) => <The key={d.dongSheet} d={d} />)}
        </ul>
      )}
    </>
  );
}
