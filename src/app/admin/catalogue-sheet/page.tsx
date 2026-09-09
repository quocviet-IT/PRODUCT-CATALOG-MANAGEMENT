import Link from "next/link";
import { ChevronDown, ChevronUp } from "lucide-react";
import { layDanhSachCatalogue, nguonDangDung } from "@/modules/sheet/catalogue.service";
import { docTrangThai } from "@/modules/sheet/dong-bo";
import { dinhDangLuc } from "@/lib/date";
import {
  catTrang,
  docBoLocTuUrl,
  docTrang,
  locDanhSach,
  thamSoCua,
  tinhDemLoc,
  tinhThongKe,
  tuVungGoiY,
  cotRong,
  docSapXepTuUrl,
  sapXepDanhSach,
  type ChieuSap,
  type KhoaSap,
  type SapXep,
} from "@/modules/sheet/catalogue.view";
import type { DongCatalogue } from "@/modules/sheet/catalogue.mapper";
import { khoaMau } from "@/modules/catalogue-share/chia-se.model";
import { ChonMau, OTich } from "./chon-mau";
import { BangCatalogue } from "./bang";
import { ThanhBoLoc } from "./bo-loc";
import { NganChiTiet } from "./ngan-chi-tiet";
import { layChu } from "@/messages/may-chu";
import type { BoChu } from "@/messages";
import { nhanCo } from "./nhan-co";
import { PhanTrang } from "./phan-trang";
import { BangDieuKhien } from "./bang-dieu-khien";
import { AnhTai } from "@/ui/anh-tai";
import { KetQuaLoc, NguonLoc } from "@/ui/vung-loc";

/**
 * Dong chu cho nguon "dong-bo": ban chup that cua bang tinh do Apps Script day
 * len. Neu chua co lan day nao thi noi dung do, khong lang le tut ve cau "du
 * lieu mau" — hai tinh huong nay can hai hanh dong khac han nhau.
 */
async function moTaDongBo(t: BoChu): Promise<string> {
  const tt = await docTrangThai();
  if (tt === null) return t.catalogue_sheet.nguon_dong_bo_chua_co;
  const luc = new Date(tt.luc);
  return Number.isNaN(luc.getTime())
    ? t.catalogue_sheet.nguon_dong_bo_chua_co
    : t.catalogue_sheet.nguon_dong_bo.replace("{luc}", dinhDangLuc(luc));
}

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

/**
 * Bam vao dau cot: cot dang xep thi dao chieu, cot khac thi xep tang.
 * Doi cach xep luon ve trang 1 — dong dang o trang 3 se nam cho khac han.
 */
function urlSapXep(
  sp: Record<string, string | undefined>,
  sap: SapXep,
  khoa: KhoaSap,
): string {
  const chieu: ChieuSap = sap.khoa === khoa && sap.chieu === "tang" ? "giam" : "tang";
  const conLai = Object.fromEntries(
    Object.entries(sp).filter(([k]) => k !== "trang" && k !== "chieu"),
  );
  return urlDoi({ ...conLai, chieu }, "sap", khoa);
}

/** Doi kieu xem thi ve trang 1 — trang 3 cua bang co the khong ton tai o luoi. */
function urlDoiKieuXem(sp: Record<string, string | undefined>, kieu: KieuXem): string {
  const conLai = Object.fromEntries(
    Object.entries(sp).filter(([k]) => k !== "trang"),
  );
  return urlDoi(conLai, "xem", kieu);
}

/** Chuan tieng Viet dung dau phay thap phan, du bang tinh ghi dau cham. */
function dinhDangGam(v: number | null): string | null {
  return v === null ? null : `${v.toFixed(2).replace(".", ",")} g`;
}

async function The({ d }: { d: DongCatalogue }) {
  const t = await layChu();
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
          <AnhTai
            src={`/api/anh-drive/${d.fileIdAnh}`}
            alt={d.maMau ?? t.catalogue_sheet.anh_chua_co_ma_mau}
            lop="h-full w-full object-contain"
          />
        ) : (
          <span className="text-[11px] uppercase tracking-[0.14em] text-hp-muted">
            {t.catalogue_sheet.chua_co_anh}
          </span>
        )}
      </div>

      <div className="p-5">
        <div className="mb-3">
          <OTich ma={khoaMau(d)} />
        </div>
        {d.chatLieu && (
          <span className="block text-[11px] uppercase tracking-[0.14em] text-hp-muted">
            {d.chatLieu}
          </span>
        )}
        <h3 className="mt-1 font-title text-xl leading-tight text-hp-ink">
          {d.maMau ?? t.catalogue_sheet.chua_co_ma_mau}
        </h3>

        {coDongTrongLuongSize && (
          <p className="mt-2 flex flex-wrap gap-x-4 text-sm tabular-nums text-hp-body">
            {trongLuong && <span>{trongLuong}</span>}
            {d.size && <span>{t.catalogue_sheet.size_nhan} {d.size}</span>}
          </p>
        )}

        {d.co.length > 0 && (
          <p className="mt-3 text-[10px] uppercase tracking-[0.14em] text-hp-muted">
            {d.co.map((c) => nhanCo(t)[c]).join(" · ")}
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
  const t = await layChu();
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
      <p className="text-sm text-hp-pink-strong">{t.catalogue_sheet.loi_doc_bang}</p>
    );
  }

  const nguon = nguonDangDung();
  // Doc moc dong bo NGAY o day chu khong de lop trinh bay tu goi: dong chu
  // nguon la mot cau khang dinh ve du lieu dang hien, nen no phai duoc dung ra
  // cung luc va cung noi voi du lieu do.
  const moTaNguon =
    nguon === "mau"
      ? t.catalogue_sheet.nguon_mau
      : nguon === "bang-tinh"
        ? t.catalogue_sheet.nguon_bang_tinh
        : await moTaDongBo(t);
  const sap = docSapXepTuUrl(sp);
  const daLoc = sapXepDanhSach(locDanhSach(tatCa, loc), sap);
  // Ba con so khac nhau, ba chu dich khac nhau — dung gop lai:
  //  - dem (theo tung chieu) -> so ben canh moi muc trong o tha xuong. Moi
  //    chieu tinh tren tap da loc boi cac chieu KHAC, nen con so tra loi dung
  //    cau hoi "bam vao day thi con bao nhieu".
  //  - thongKeHien (da loc) -> DAI SO o dau trang: thong ke cua cai dang xem.
  //  - thongKe.tong (toan bo) -> chi de hien mau so "28 / 71".
  const dem = tinhDemLoc(tatCa, loc);
  const thongKe = tinhThongKe(tatCa);
  const thongKeHien = tinhThongKe(daLoc);
  const dangLoc = daLoc.length !== tatCa.length;
  const { ds, trang, soTrang, tu, den } = catTrang(daLoc, docTrang(sp));

  return (
    <>
      <div className="mb-10">
        {/* Chu hoa nen can gian chu rong hon chu thuong; 0.06em la muc du tho
            de tung chu tach ra ma chua roi thanh nhan eyebrow. */}
        <h1 className="font-title text-[32px] uppercase leading-none tracking-[0.06em] text-hp-ink">
          {t.catalogue_sheet.tieu_de}
        </h1>
        <p className="mt-3 text-xs text-hp-muted">{moTaNguon}</p>
        <div className="mt-5 h-px bg-hp-rule" />
      </div>

      {/* Thanh bo loc va vung ket qua la anh em, khong ai thay trang thai cua
          ai. NguonLoc noi hai ben lai: luc dieu huong dang chay thi ket qua tu
          mo di, thay vi danh sach cu nam im nhu the khong co gi khop.
          Day thong ke nam TRONG vung mo cung voi bang: no cung la ket qua cua
          bo loc, de no sang ro giua mot trang dang mo la trung ra con so cu nhu
          the do la con so hien tai. */}
      <NguonLoc>
      <KetQuaLoc>
        <BangDieuKhien
          thongKe={thongKe}
          thongKeHien={thongKeHien}
          dangLoc={dangLoc}
          canhBaoDangBat={loc.canhBao}
          thamSoCanhBao={thamSoCua("canhBao")}
          sp={sp}
          t={t}
        />
      </KetQuaLoc>

      {/* Tu vung goi y tinh tren TOAN BO bang, khong theo bo loc dang bat:
          goi y la de nguoi ta biet trong he thong CO nhung chu gi, ke ca khi
          bo loc hien tai dang che chung di. */}
      <ThanhBoLoc dem={dem} hienTai={loc} tuVung={tuVungGoiY(tatCa)} />

      <KetQuaLoc>

      {/* Kieu xem khong dung mau hong: ngan sach hong da chi het cho vien focus
          o tim kiem va gach chan bo loc dang bat. O day phan biet bang ink/muted. */}
      <div className="mb-6 flex items-baseline gap-6">
        <span className="text-[11px] uppercase tracking-[0.14em] text-hp-muted">
          {t.catalogue_sheet.xem_nhan}
        </span>
        {([
          ["bang", t.catalogue_sheet.xem_bang],
          ["luoi", t.catalogue_sheet.xem_luoi],
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

      {/* Luoi anh khong co hang tieu de de bam, nen cach xep phai co cho rieng.
          Bang thi khong can — dau cot cua no chinh la nut xep. */}
      {kieuXem === "luoi" && (
        <div className="mb-6 flex flex-wrap items-baseline gap-x-5 gap-y-2">
          <span className="text-[11px] uppercase tracking-[0.14em] text-hp-muted">
            {t.catalogue_sheet.sap_xep_nhan}
          </span>
          {([
            ["dong", t.catalogue_sheet.sap_theo_dong],
            ["maMau", t.catalogue_sheet.cot_ma_mau],
            ["loaiSp", t.catalogue_sheet.cot_loai_sp],
            ["chatLieu", t.catalogue_sheet.cot_chat_lieu],
            ["tlVang", t.catalogue_sheet.cot_tl_vang],
            ["size", t.catalogue_sheet.cot_size],
          ] as const).map(([khoa, nhan]) => (
            <Link
              key={khoa}
              href={urlSapXep(sp, sap, khoa)}
              aria-current={sap.khoa === khoa ? "true" : undefined}
              className={`inline-flex items-center gap-1 border-b-2 pb-0.5 text-[11px]
                          uppercase tracking-[0.14em] transition-colors duration-150
                          ${sap.khoa === khoa
                            ? "border-hp-ink text-hp-ink"
                            : "border-transparent text-hp-muted hover:text-hp-ink"}`}
            >
              {nhan}
              <span className="flex h-3 w-3 shrink-0 items-center justify-center">
                {sap.khoa === khoa &&
                  (sap.chieu === "giam"
                    ? <ChevronDown aria-hidden strokeWidth={2} className="h-3 w-3" />
                    : <ChevronUp aria-hidden strokeWidth={2} className="h-3 w-3" />)}
              </span>
            </Link>
          ))}
        </div>
      )}

      {ds.length === 0 ? (
        <p className="text-sm text-hp-muted">{t.catalogue_sheet.khong_khop}</p>
      ) : (
        <ChonMau>
          <NganChiTiet>
            {kieuXem === "bang" ? (
              <BangCatalogue
                ds={ds}
                an={cotRong(tatCa)}
                sap={sap}
                urlSap={(khoa) => urlSapXep(sp, sap, khoa)}
              />
            ) : (
              <ul className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
                {ds.map((d) => <The key={d.dongSheet} d={d} />)}
              </ul>
            )}
          </NganChiTiet>
        </ChonMau>
      )}

      {daLoc.length > 0 && (
        <nav
          aria-label={t.catalogue_sheet.trang_nhan}
          className="mt-8 flex flex-wrap items-center justify-between gap-x-8 gap-y-4
                     border-t border-hp-rule pt-5"
        >
          <PhanTrang
            trang={trang}
            soTrang={soTrang}
            urlTrang={(n) => urlDoi(sp, "trang", String(n))}
            t={t}
          />
          <span className="ml-auto text-xs tabular-nums text-hp-muted">
            {t.catalogue_sheet.pham_vi
              .replace("{tu}", String(tu))
              .replace("{den}", String(den))
              .replace("{tong}", String(daLoc.length))}
          </span>
        </nav>
      )}
      </KetQuaLoc>
      </NguonLoc>
    </>
  );
}
