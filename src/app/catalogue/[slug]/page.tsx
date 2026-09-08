import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { layTheoSlug } from "@/modules/catalogue-share/chia-se.service";
import { boChu } from "@/messages";
import { NGON_NGU, NHAN_NGAN, docNgonNgu, type NgonNgu } from "@/messages/ngon-ngu";
import { NguonNgonNgu } from "@/messages/dung-chu";
import { MoHopThoaiIn } from "./nut-in";
import { PhongToAnh } from "./phong-to";
import { LOP_TONE, ThanCatalogue, TrangBia } from "./bo-cuc";
import { Logo } from "@/app/thuong-hieu";

/**
 * Dang duong dan hop le: cac cum chu-so noi bang dau gach.
 *
 * Chan o day de mot duong dan bay khong di toi tan cau lenh SQL. Nhan CA HAI
 * doi: slug cu (12 ky tu lien, vi du "zxhpnhyrtpu3") va slug moi
 * ("chi-lan-nhan-cuoi-k3m9x2p4") — link cu da nam trong may khach hang tuan,
 * khong bao gio duoc phep hong.
 *
 * Khong the trung "tao": moi slug moi deu ket thuc bang "-<8 ky tu>", va
 * Next.js uu tien doan tinh /catalogue/tao hon doan dong nay.
 */
const DANG_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DAI_SLUG_TOI_DA = 80;

function slugHopLe(s: string): boolean {
  return s.length <= DAI_SLUG_TOI_DA && DANG_SLUG.test(s);
}

/**
 * Ngon ngu trang khach.
 *
 * KHONG doc cookie: cookie la lua chon cua NHAN VIEN tren may cua ho, con day
 * la trang cua khach. Mac dinh lay ngon ngu sale da chon luc tao catalogue,
 * khach doi bang "?lang=" — mot duong dan thuong nen bam duoc, chia se duoc,
 * va in ra dung thu ngon ngu dang hien.
 */
function ngonNguTrang(daChon: NgonNgu, thamSo: string | undefined): NgonNgu {
  return thamSo === undefined ? daChon : docNgonNgu(thamSo);
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params;
  const macDinh = boChu("vi").catalogue_sheet.tieu_de;
  if (!slugHopLe(slug)) return { title: macDinh };
  const c = await layTheoSlug(slug);
  // robots noindex da khai o layout goc — trang nay dac biet khong duoc len
  // ket qua tim kiem vi no la ban gui rieng cho mot khach.
  return { title: c?.ten ?? macDinh };
}

export default async function TrangKhachXem({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { slug } = await params;
  const ts = await searchParams;
  // "?in=1" chi sale moi gan vao (tu man hinh cua ho). Link gui khach la link
  // tran, nen khach khong bao gio thay hop thoai in.
  const moIn = ts.in === "1";
  if (!slugHopLe(slug)) notFound();

  const c = await layTheoSlug(slug);
  if (!c) notFound();

  const g = c.giaoDien;
  const nn = ngonNguTrang(g.ngonNgu, ts.lang);
  const t = boChu(nn);

  return (
    <NguonNgonNgu ngonNgu={nn}>
      <div className={`min-h-screen ${LOP_TONE[g.tone]}`}>
        <main className="mx-auto max-w-4xl px-6 py-10 print:max-w-none print:py-0">
          {g.bia && (
            <TrangBia
              bia={g.bia}
              tieuDe={c.ten}
              thuongHieu={t.catalogue_sheet.thuong_hieu}
            />
          )}

          {/* Co trang bia thi ten catalogue DA nam tren do, chu to. Lap lai o day
              chi lam khach doc mot cai ten hai lan trong hai co chu khac nhau. */}
          <header className="mb-10">
            {!g.bia && (
              <Logo alt={t.catalogue_sheet.thuong_hieu} />
            )}
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
              {!g.bia && (
                <h1 className="mt-2 font-title text-[32px] leading-tight tracking-[0.02em] text-hp-ink">
                  {c.ten}
                </h1>
              )}
              {/* Doi ngon ngu bang duong dan thuong: khong can JavaScript, bam
                  chuot phai mo tab moi duoc, va ban in giu dung ngon ngu. */}
              <nav className="flex items-center gap-2 print:hidden">
                {NGON_NGU.map((x, i) => (
                  <span key={x} className="flex items-center gap-2">
                    {i > 0 && <span aria-hidden className="text-hp-rule">/</span>}
                    <Link
                      href={`?lang=${x}`}
                      scroll={false}
                      aria-current={x === nn ? "true" : undefined}
                      className={
                        "text-[11px] uppercase tracking-[0.14em] transition-colors duration-150 " +
                        (x === nn
                          ? "text-hp-ink underline underline-offset-4"
                          : "text-hp-muted hover:text-hp-ink")
                      }
                    >
                      {NHAN_NGAN[x]}
                    </Link>
                  </span>
                ))}
              </nav>
              {g.bia && (
                <p className="text-xs tabular-nums text-hp-muted">
                  {t.chia_se.khach_gom.replace("{n}", String(c.noiDung.muc.length))}
                </p>
              )}
            </div>
            {!g.bia && (
              <p className="mt-2 text-xs tabular-nums text-hp-muted">
                {t.chia_se.khach_gom.replace("{n}", String(c.noiDung.muc.length))}
              </p>
            )}
          </header>

          {/* Thu tu anh o day PHAI trung thu tu tren trang: khung phong to bam
              qua lai theo chinh mang nay. Ca ba bo cuc deu giu dung thu tu do. */}
          <PhongToAnh anh={c.noiDung.muc.flatMap((m) => m.anh)}>
            <ThanCatalogue muc={c.noiDung.muc} g={g} t={t} />
          </PhongToAnh>

          {moIn && <MoHopThoaiIn />}

          <footer className="mt-14 border-t border-hp-rule pt-6 text-xs text-hp-muted">
            {t.chia_se.lien_he}
          </footer>
        </main>
      </div>
    </NguonNgonNgu>
  );
}
