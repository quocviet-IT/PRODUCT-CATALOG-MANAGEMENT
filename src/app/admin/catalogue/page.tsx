import Link from "next/link";
import { requireUser } from "@/auth/guard";
import { danhSachCatalogue } from "@/modules/catalogue-share/chia-se.service";
import { layChu, layNgonNgu } from "@/messages/may-chu";
import { MA_HTML } from "@/messages/ngon-ngu";
import { NutChep } from "./nut-chep";

export async function generateMetadata() {
  const t = await layChu();
  return { title: t.danh_sach_catalogue.tieu_de };
}

const O_TIEU_DE =
  "whitespace-nowrap border-b border-hp-rule px-4 py-3 text-left " +
  "text-[11px] uppercase tracking-[0.14em] text-hp-muted";
const O = "border-b border-hp-rule px-4 py-3 align-middle text-sm text-hp-body";
const NUT =
  "text-[11px] uppercase tracking-[0.14em] text-hp-muted " +
  "transition-colors duration-150 hover:text-hp-ink hover:underline";

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
export default async function TrangDanhSachCatalogue() {
  const user = await requireUser();
  const t = await layChu();
  const nn = await layNgonNgu();
  const laAdmin = user.role === "admin";
  const ds = await danhSachCatalogue(user.id, laAdmin);

  return (
    <>
      <div className="mb-8">
        <span className="block text-[11px] uppercase tracking-[0.14em] text-hp-muted">
          {t.catalogue_sheet.thuong_hieu}
        </span>
        <h1 className="mt-2 font-title text-[32px] leading-none tracking-[0.02em] text-hp-ink">
          {t.danh_sach_catalogue.tieu_de}
        </h1>
        <p className="mt-3 text-sm text-hp-muted">
          {laAdmin ? t.danh_sach_catalogue.mo_ta_admin : t.danh_sach_catalogue.mo_ta_sale}
        </p>
        <div className="mt-5 h-px bg-hp-rule" />
      </div>

      <Link
        href="/admin/catalogue-sheet"
        className="mb-8 inline-block border border-hp-ink bg-hp-ink px-5 py-2.5
                   text-[11px] uppercase tracking-[0.14em] text-hp-foundation
                   transition-colors duration-150 hover:border-hp-pink hover:bg-hp-pink"
      >
        {t.danh_sach_catalogue.nut_tao}
      </Link>

      {ds.length === 0 ? (
        <p className="text-sm text-hp-muted">{t.danh_sach_catalogue.chua_co}</p>
      ) : (
        <div className="overflow-x-auto border border-hp-rule">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-hp-inset">
                <th className={O_TIEU_DE}>{t.danh_sach_catalogue.cot_ten}</th>
                <th className={O_TIEU_DE}>{t.danh_sach_catalogue.cot_noi_dung}</th>
                <th className={O_TIEU_DE}>{t.danh_sach_catalogue.cot_ngay}</th>
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
                        {t.danh_sach_catalogue.mo}
                      </Link>
                      <NutChep slug={c.slug} />
                      {/* ?in=1 mo san hop thoai in — duong nay chi sale dung,
                          link gui khach la link tran. */}
                      <a
                        href={`/catalogue/${c.slug}?in=1`}
                        target="_blank"
                        rel="noreferrer"
                        className={NUT}
                      >
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
    </>
  );
}
