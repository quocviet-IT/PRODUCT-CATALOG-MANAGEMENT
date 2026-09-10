import Link from "next/link";
import { requireUser } from "@/auth/guard";
import { danhSachCatalogue } from "@/modules/catalogue-share/chia-se.service";
import { layChu, layNgonNgu } from "@/messages/may-chu";
import { MA_HTML } from "@/messages/ngon-ngu";
import type { BoChu } from "@/messages";
import { ExternalLink, Plus, Printer } from "lucide-react";
import { SO_NGAY_SONG, soNgayConLai, type TrangThaiLink } from "@/modules/catalogue-share/hieu-luc.model";
import { locDanhSachDaTao } from "@/modules/catalogue-share/danh-sach.view";
import { catTrang, docTrang } from "@/modules/sheet/catalogue.view";
import { PhanTrang } from "@/ui/phan-trang";
import { OTimNhanh } from "@/ui/o-tim-nhanh";
import { KetQuaLoc, NguonLoc } from "@/ui/vung-loc";
import { NutChep } from "./nut-chep";
import { NutKhoa } from "./nut-khoa";

export async function generateMetadata() {
  const t = await layChu();
  return { title: t.danh_sach_catalogue.tieu_de };
}

const O_TIEU_DE =
  "whitespace-nowrap border-b border-hp-rule px-4 py-3 text-left " +
  "text-[11px] uppercase tracking-[0.14em] text-hp-muted";
const O = "border-b border-hp-rule px-4 py-3 align-middle text-sm text-hp-body";
const NUT =
  "flex items-center gap-1.5 text-[11px] uppercase tracking-[0.14em] text-hp-muted " +
  "transition-colors duration-150 hover:text-hp-ink";
const ICON = { "aria-hidden": true, strokeWidth: 1.5, className: "h-4 w-4 shrink-0" } as const;

/** Duong dan mot trang, giu nguyen cau tim dang go. */
function urlTrang(sp: Record<string, string | undefined>, n: number): string {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) if (v && k !== "trang") q.set(k, v);
  q.set("trang", String(n));
  return `/admin/catalogue?${q.toString()}`;
}

/**
 * Danh sach catalogue da tao.
 *
 * Sale thay cua minh, admin thay het — quyet dinh do nam trong
 * danhSachCatalogue() chu khong o day: loc sau khi lay ve la lay ve roi moi an
 * di, van la mot cach ro ri.
 *
 * Thay the cho danh sach cu luu trong localStorage. Danh sach do theo TRINH
 * DUYET: doi may hay xoa lich su la mat. Bang nay theo NGUOI, va vi vay chi co
 * duoc sau khi he thong bat dang nhap.
 */
/** Nhan trang thai. Chi "Dang mo" moi khong phai canh bao, nen chi no dung mau chu thuong. */
function NhanTrangThai({
  trangThai,
  hetHanLuc,
  bayGio,
  t,
}: {
  trangThai: TrangThaiLink;
  hetHanLuc: Date;
  bayGio: Date;
  t: BoChu;
}) {
  if (trangThai === "mo") {
    return (
      <>
        <span className="block text-hp-body">{t.danh_sach_catalogue.trang_thai_mo}</span>
        <span className="mt-0.5 block text-xs tabular-nums text-hp-muted">
          {t.danh_sach_catalogue.con_ngay.replace(
            "{n}",
            String(soNgayConLai(hetHanLuc, bayGio)),
          )}
        </span>
      </>
    );
  }
  return (
    <span className="text-hp-pink-strong">
      {trangThai === "khoa"
        ? t.danh_sach_catalogue.trang_thai_khoa
        : t.danh_sach_catalogue.trang_thai_het_han}
    </span>
  );
}

export default async function TrangDanhSachCatalogue({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const user = await requireUser();
  const t = await layChu();
  const nn = await layNgonNgu();
  const sp = await searchParams;
  const laAdmin = user.mucQuyen === "admin";
  const tatCa = await danhSachCatalogue(user.id, laAdmin);
  const daLoc = locDanhSachDaTao(tatCa, sp.q?.trim() || null);
  const { ds, trang, soTrang, tu, den } = catTrang(daLoc, docTrang(sp));
  const bayGio = new Date();

  return (
    <>
      <div className="mb-8">
        <h1 className="font-title text-[32px] leading-none tracking-[0.02em] text-hp-ink">
          {t.danh_sach_catalogue.tieu_de}
        </h1>
        <p className="mt-3 text-sm text-hp-muted">
          {laAdmin ? t.danh_sach_catalogue.mo_ta_admin : t.danh_sach_catalogue.mo_ta_sale}
        </p>
        <p className="mt-1 text-sm text-hp-muted">
          {t.danh_sach_catalogue.giai_thich_han.replace("{n}", String(SO_NGAY_SONG))}
        </p>
        <div className="mt-5 h-px bg-hp-rule" />
      </div>

      <Link
        href="/admin/catalogue-sheet"
        className="mb-8 inline-flex items-center gap-2 border border-hp-ink bg-hp-ink
                   px-5 py-2.5 text-[11px] uppercase tracking-[0.14em] text-hp-foundation
                   transition-colors duration-150 hover:border-hp-pink hover:bg-hp-pink"
      >
        <Plus {...ICON} />
        {t.danh_sach_catalogue.nut_tao}
      </Link>

      {/* O tim chi hien khi da co du lieu de tim: mot o tim tren mot bang rong
          chi lam nguoi ta go thu roi tuong minh go sai. */}
      <NguonLoc>
        {tatCa.length > 0 && (
          <OTimNhanh
            nhan={t.danh_sach_catalogue.tim_kiem_nhan}
            goiY={t.danh_sach_catalogue.tim_kiem_goi_y}
            nhanXoa={t.catalogue_sheet.xoa_loc}
            chuDangCapNhat={t.phan_hoi.dang_cap_nhat}
          />
        )}

      <KetQuaLoc>
      {tatCa.length === 0 ? (
        <p className="text-sm text-hp-muted">{t.danh_sach_catalogue.chua_co}</p>
      ) : daLoc.length === 0 ? (
        <p className="text-sm text-hp-muted">{t.danh_sach_catalogue.khong_khop}</p>
      ) : (
        <div className="overflow-x-auto border border-hp-rule">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-hp-inset">
                <th className={O_TIEU_DE}>{t.danh_sach_catalogue.cot_ten}</th>
                <th className={O_TIEU_DE}>{t.danh_sach_catalogue.cot_noi_dung}</th>
                <th className={O_TIEU_DE}>{t.danh_sach_catalogue.cot_ngay}</th>
                <th className={O_TIEU_DE}>{t.danh_sach_catalogue.cot_hieu_luc}</th>
                {/* Cot nguoi tao chi co nghia voi admin: sale chi thay cua
                    chinh minh nen mot cot lap lai ten ho la cot thua. */}
                {laAdmin && (
                  <th className={O_TIEU_DE}>{t.danh_sach_catalogue.cot_nguoi_tao}</th>
                )}
                <th className={O_TIEU_DE}>{t.danh_sach_catalogue.cot_thao_tac}</th>
              </tr>
            </thead>
            <tbody>
              {ds.map((c) => (
                <tr key={c.slug} className="bg-hp-card">
                  <td className={`${O} text-hp-ink`}>
                    <Link
                      href={`/catalogue/${c.slug}`}
                      className="transition-colors duration-150 hover:text-hp-pink hover:underline"
                    >
                      {c.ten}
                    </Link>
                    <span className="mt-0.5 block text-xs text-hp-muted">/{c.slug}</span>
                  </td>
                  <td className={`${O} whitespace-nowrap tabular-nums`}>
                    {t.danh_sach_catalogue.dem
                      .replace("{n}", String(c.soMuc))
                      .replace("{a}", String(c.soAnh))}
                  </td>
                  <td className={`${O} whitespace-nowrap tabular-nums`}>
                    {c.taoLuc.toLocaleDateString(MA_HTML[nn])}
                  </td>
                  <td className={`${O} whitespace-nowrap`}>
                    <NhanTrangThai
                      trangThai={c.trangThai}
                      hetHanLuc={c.hetHanLuc}
                      bayGio={bayGio}
                      t={t}
                    />
                  </td>
                  {laAdmin && (
                    <td className={`${O} whitespace-nowrap`}>
                      {c.nguoiTao ?? t.danh_sach_catalogue.khong_ro_nguoi_tao}
                    </td>
                  )}
                  <td className={O}>
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                      <Link
                        href={`/catalogue/${c.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className={NUT}
                      >
                        <ExternalLink {...ICON} />
                        {t.danh_sach_catalogue.mo}
                      </Link>
                      <NutChep slug={c.slug} />
                      <NutKhoa slug={c.slug} trangThai={c.trangThai} />
                      {/* ?in=1 mo san hop thoai in — duong nay chi sale dung,
                          link gui khach la link tran. */}
                      <a
                        href={`/catalogue/${c.slug}?in=1`}
                        target="_blank"
                        rel="noreferrer"
                        className={NUT}
                      >
                        <Printer {...ICON} />
                        {t.danh_sach_catalogue.in}
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
            urlTrang={(n) => urlTrang(sp, n)}
            t={t}
          />
          <span className="ml-auto text-xs tabular-nums text-hp-muted">
            {t.danh_sach_catalogue.pham_vi
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
