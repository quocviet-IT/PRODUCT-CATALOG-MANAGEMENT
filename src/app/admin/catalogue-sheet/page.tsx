import Link from "next/link";
import { requireUser } from "@/auth/guard";
import { layDanhSachCatalogue } from "@/modules/sheet/catalogue.service";
import { docBoLocTuUrl, locDanhSach, tinhThongKe } from "@/modules/sheet/catalogue.view";
import type { CoBatThuong, DongCatalogue } from "@/modules/sheet/catalogue.mapper";
import { BangCatalogue } from "./bang";
import { ThanhBoLoc } from "./bo-loc";
import { vi } from "@/messages/vi";

/**
 * Hai kieu xem chung mot bo loc. Bang la mac dinh vi nguoi dung doi chieu voi
 * bang tinh; luoi anh de luot xem mau.
 */
type KieuXem = "bang" | "luoi";

function docKieuXem(v: string | undefined): KieuXem {
  return v === "luoi" ? "luoi" : "bang";
}

/** Giu nguyen moi tham so loc hien co, chi doi rieng kieu xem. */
function urlDoiKieuXem(sp: Record<string, string | undefined>, kieu: KieuXem): string {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) if (v && k !== "xem") q.set(k, v);
  q.set("xem", kieu);
  return `/admin/catalogue-sheet?${q.toString()}`;
}

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
  const trongLuong = dinhDangGam(d.tlVang);
  const coDongTrongLuongSize = trongLuong !== null || d.size !== null;

  return (
    <li className="border border-hp-rule bg-hp-card">
      <div className="flex aspect-[4/5] items-center justify-center bg-hp-inset">
        {d.fileIdAnh ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/api/anh-drive/${d.fileIdAnh}`}
            alt={d.maMau ?? vi.catalogue_sheet.anh_chua_co_ma_mau}
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
        <h3 className="mt-1 font-title text-xl leading-tight text-hp-ink">
          {d.maMau ?? vi.catalogue_sheet.chua_co_ma_mau}
        </h3>

        {coDongTrongLuongSize && (
          <p className="mt-2 flex flex-wrap gap-x-4 text-sm tabular-nums text-hp-body">
            {trongLuong && <span>{trongLuong}</span>}
            {d.size && <span>{vi.catalogue_sheet.size_nhan} {d.size}</span>}
          </p>
        )}

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
  const kieuXem = docKieuXem(sp.xem);

  let tatCa: DongCatalogue[];
  try {
    tatCa = await layDanhSachCatalogue();
  } catch (loi) {
    // Loi doc bang tinh (auth Google hong, het quota, hay bi doi ten cot) khong
    // duoc bien mat khong dau vet — nguoi dung chi thay mot dong text an toan,
    // nhung server phai giu lai chi tiet de con grep khi trang trang hang loat.
    console.error("[catalogue-sheet] loi doc bang tinh catalogue:", loi);
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

      {/* Kieu xem khong dung mau hong: ngan sach hong da chi het cho vien focus
          o tim kiem va gach chan bo loc dang bat. O day phan biet bang ink/muted. */}
      <div className="mb-6 flex items-baseline gap-6">
        <span className="text-[11px] uppercase tracking-[0.14em] text-hp-muted">
          {vi.catalogue_sheet.xem_nhan}
        </span>
        {([
          ["bang", vi.catalogue_sheet.xem_bang],
          ["luoi", vi.catalogue_sheet.xem_luoi],
        ] as const).map(([gia_tri, nhan]) => (
          <Link
            key={gia_tri}
            href={urlDoiKieuXem(sp, gia_tri)}
            aria-current={kieuXem === gia_tri ? "page" : undefined}
            className={`border-b-2 pb-0.5 text-[11px] uppercase tracking-[0.14em]
                        transition-colors duration-150
                        ${kieuXem === gia_tri
                          ? "border-hp-ink text-hp-ink"
                          : "border-transparent text-hp-muted hover:text-hp-ink"}`}
          >
            {nhan}
          </Link>
        ))}
      </div>

      {ds.length === 0 ? (
        <p className="text-sm text-hp-muted">{vi.catalogue_sheet.khong_khop}</p>
      ) : kieuXem === "bang" ? (
        <BangCatalogue ds={ds} />
      ) : (
        <ul className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
          {ds.map((d) => <The key={d.dongSheet} d={d} />)}
        </ul>
      )}
    </>
  );
}
