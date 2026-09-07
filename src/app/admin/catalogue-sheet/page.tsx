import Link from "next/link";
import { requireUser } from "@/auth/guard";
import { layDanhSachCatalogue, nguonDangDung } from "@/modules/sheet/catalogue.service";
import { catTrang, docBoLocTuUrl, docTrang, locDanhSach, tinhThongKe } from "@/modules/sheet/catalogue.view";
import type { CoBatThuong, DongCatalogue } from "@/modules/sheet/catalogue.mapper";
import { BangCatalogue } from "./bang";
import { ThanhBoLoc } from "./bo-loc";
import { NganChiTiet } from "./ngan-chi-tiet";
import { vi } from "@/messages/vi";

/**
 * Hai kieu xem chung mot bo loc. Bang la mac dinh vi nguoi dung doi chieu voi
 * bang tinh; luoi anh de luot xem mau.
 */
type KieuXem = "bang" | "luoi";

function docKieuXem(v: string | undefined): KieuXem {
  return v === "luoi" ? "luoi" : "bang";
}

/** Giu nguyen moi tham so hien co, chi doi rieng mot cai. */
function urlDoi(
  sp: Record<string, string | undefined>,
  khoa: string,
  giaTri: string,
): string {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) if (v && k !== khoa) q.set(k, v);
  q.set(khoa, giaTri);
  return `/admin/catalogue-sheet?${q.toString()}`;
}

/** Doi kieu xem thi ve trang 1 — trang 3 cua bang co the khong ton tai o luoi. */
function urlDoiKieuXem(sp: Record<string, string | undefined>, kieu: KieuXem): string {
  const conLai = Object.fromEntries(
    Object.entries(sp).filter(([k]) => k !== "trang"),
  );
  return urlDoi(conLai, "xem", kieu);
}

const NUT_TRANG =
  "text-[11px] uppercase tracking-[0.14em] text-hp-muted " +
  "transition-colors duration-150 hover:text-hp-ink hover:underline";

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

function O({
  so, nhan, tong,
}: {
  so: number;
  nhan: string;
  /** Co gia tri khi dang loc: hien "28 / 64" de van thay duoc tong. */
  tong?: number;
}) {
  return (
    <div className="px-7 first:pl-0">
      {/* So 0 phai TRONG nhu 0: mot con so mau muc dam nhu cac o khac se khien
          nguoi doc tuong co van de trong khi khong co van de nao. */}
      <p
        className={`font-title text-[28px] leading-none tabular-nums
                    ${so === 0 ? "text-hp-muted" : "text-hp-ink"}`}
      >
        {so}
        {tong !== undefined && (
          <span className="text-lg text-hp-muted"> / {tong}</span>
        )}
      </p>
      <p className="mt-2 text-[11px] uppercase tracking-[0.14em] text-hp-muted">{nhan}</p>
    </div>
  );
}

function The({ d }: { d: DongCatalogue }) {
  const trongLuong = dinhDangGam(d.tlVang);
  const coDongTrongLuongSize = trongLuong !== null || d.size !== null;

  return (
    <li
      data-dong={d.dongSheet}
      className="cursor-pointer border border-hp-rule bg-hp-card transition-colors
                 duration-150 hover:border-hp-ink"
    >
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

  const nguon = nguonDangDung();
  const daLoc = locDanhSach(tatCa, loc);
  // HAI bo thong ke, co chu dich:
  //  - thongKe (toan bo)  -> so dem tren NHAN BO LOC. Neu no theo ket qua da loc
  //    thi chon 18KW xong, nhan 18KY tut ve 0 va khong ai bam nguoc lai duoc.
  //  - thongKeHien (da loc) -> DAI SO o dau trang, vi day la thong ke cua cai
  //    dang xem.
  const thongKe = tinhThongKe(tatCa);
  const thongKeHien = tinhThongKe(daLoc);
  const dangLoc = daLoc.length !== tatCa.length;
  const { ds, trang, soTrang, tu, den } = catTrang(daLoc, docTrang(sp));

  return (
    <>
      <div className="mb-10">
        <span className="block text-[11px] uppercase tracking-[0.14em] text-hp-muted">
          {vi.catalogue_sheet.thuong_hieu}
        </span>
        {/* Chu hoa nen can gian chu rong hon chu thuong; 0.06em la muc du tho
            de tung chu tach ra ma chua roi thanh nhan eyebrow. */}
        <h1 className="mt-2 font-title text-[32px] uppercase leading-none tracking-[0.06em] text-hp-ink">
          {vi.catalogue_sheet.tieu_de}
        </h1>
        <p className="mt-3 text-xs text-hp-muted">
          {nguon === "mau"
            ? vi.catalogue_sheet.nguon_mau
            : vi.catalogue_sheet.nguon_bang_tinh}
        </p>
        <div className="mt-5 h-px bg-hp-rule" />
      </div>

      <div className="mb-10 flex flex-wrap divide-x divide-hp-rule border border-hp-rule bg-hp-card p-6">
        <O
          so={thongKeHien.tong}
          tong={dangLoc ? thongKe.tong : undefined}
          nhan={vi.catalogue_sheet.dem_mau}
        />
        <O so={thongKeHien.thieuAnh} nhan={vi.catalogue_sheet.dem_thieu_anh} />
        <O so={thongKeHien.thieuSku} nhan={vi.catalogue_sheet.dem_thieu_sku} />
        <O so={thongKeHien.tlVangLech} nhan={vi.catalogue_sheet.dem_tl_vang_lech} />
        <O so={thongKeHien.trung} nhan={vi.catalogue_sheet.dem_trung} />
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
      ) : (
        <NganChiTiet>
          {kieuXem === "bang" ? (
            <BangCatalogue ds={ds} />
          ) : (
            <ul className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
              {ds.map((d) => <The key={d.dongSheet} d={d} />)}
            </ul>
          )}
        </NganChiTiet>
      )}

      {daLoc.length > 0 && (
        <nav className="mt-8 flex flex-wrap items-baseline gap-x-6 gap-y-2 border-t border-hp-rule pt-5">
          <span className="text-[11px] uppercase tracking-[0.14em] text-hp-muted">
            {vi.catalogue_sheet.trang_nhan} {trang}/{soTrang}
          </span>

          {trang > 1 && (
            <Link href={urlDoi(sp, "trang", String(trang - 1))} className={NUT_TRANG}>
              {vi.catalogue_sheet.trang_truoc}
            </Link>
          )}
          {trang < soTrang && (
            <Link href={urlDoi(sp, "trang", String(trang + 1))} className={NUT_TRANG}>
              {vi.catalogue_sheet.trang_sau}
            </Link>
          )}

          <span className="ml-auto text-xs tabular-nums text-hp-muted">
            {vi.catalogue_sheet.pham_vi
              .replace("{tu}", String(tu))
              .replace("{den}", String(den))
              .replace("{tong}", String(daLoc.length))}
          </span>
        </nav>
      )}
    </>
  );
}
