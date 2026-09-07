import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { layTheoSlug } from "@/modules/catalogue-share/chia-se.service";
import type { MucCatalogue } from "@/modules/catalogue-share/chia-se.model";
import { NutInPdf } from "./nut-in";
import { PhongToAnh } from "./phong-to";
import { vi } from "@/messages/vi";

/** Slug do ta sinh ra: 12 ky tu trong bang chu cai da biet. Chan truoc khi hoi DB. */
const DANG_SLUG = /^[a-z0-9]{12}$/;

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params;
  if (!DANG_SLUG.test(slug)) return { title: vi.catalogue_sheet.tieu_de };
  const c = await layTheoSlug(slug);
  // robots noindex da khai o layout goc — trang nay dac biet khong duoc len
  // ket qua tim kiem vi no la ban gui rieng cho mot khach.
  return { title: c?.ten ?? vi.catalogue_sheet.tieu_de };
}

function dinhDangGam(v: number | null): string | null {
  return v === null ? null : `${v.toFixed(2).replace(".", ",")} g`;
}

function Muc({ m, thuTu }: { m: MucCatalogue; thuTu: number }) {
  const thongSo: [string, string | null][] = [
    [vi.catalogue_sheet.cot_loai_sp, m.loaiSp],
    [vi.catalogue_sheet.cot_chat_lieu, m.chatLieu],
    [vi.catalogue_sheet.cot_mau, m.mau],
    [vi.catalogue_sheet.cot_size, m.size],
    [vi.catalogue_sheet.cot_tl_vang, dinhDangGam(m.tlVang)],
  ];
  const co = thongSo.filter((x): x is [string, string] => x[1] !== null);

  return (
    // break-inside-avoid: mot mau khong duoc bi cat doi giua hai trang giay.
    <li className="break-inside-avoid border-t border-hp-rule pt-8">
      <div className="flex flex-wrap items-baseline gap-x-4">
        <h2 className="font-title text-2xl leading-none text-hp-ink">
          {m.maMau ?? vi.catalogue_sheet.chua_co_ma_mau}
        </h2>
        <span className="text-[11px] tabular-nums text-hp-muted">{thuTu}</span>
      </div>

      {co.length > 0 && (
        <dl className="mt-3 flex flex-wrap gap-x-8 gap-y-1">
          {co.map(([nhan, v]) => (
            <div key={nhan} className="flex items-baseline gap-2">
              <dt className="text-[10px] uppercase tracking-[0.14em] text-hp-muted">{nhan}</dt>
              <dd className="text-sm text-hp-body">{v}</dd>
            </div>
          ))}
        </dl>
      )}

      {m.anh.length > 0 && (
        <ul className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {m.anh.map((a, i) => (
            <li key={a.fileId} className="border border-hp-rule bg-hp-card">
              <div
                data-anh={a.fileId}
                title={vi.chia_se.phong_to}
                className="flex aspect-square cursor-zoom-in items-center justify-center
                           bg-hp-inset transition-colors duration-150 hover:bg-hp-rule/40"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/api/anh-drive/${a.fileId}?w=1400`}
                  alt={m.maMau ?? vi.catalogue_sheet.anh_chua_co_ma_mau}
                  // Anh dau cua moi mau tai ngay; nhung anh sau cho toi khi
                  // khach cuon toi. Mot catalogue 40 mau co the co hon 200 anh.
                  loading={i === 0 ? "eager" : "lazy"}
                  className="h-full w-full object-contain"
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

export default async function TrangKhachXem(
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  if (!DANG_SLUG.test(slug)) notFound();

  const c = await layTheoSlug(slug);
  if (!c) notFound();

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-6 py-10 print:max-w-none print:py-0">
      <header className="mb-10">
        <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
          <span className="block text-[11px] uppercase tracking-[0.14em] text-hp-muted">
            {vi.catalogue_sheet.thuong_hieu}
          </span>
          {/* Nut in khong duoc xuat hien trong chinh ban in. */}
          <div className="ml-auto print:hidden">
            <NutInPdf />
          </div>
        </div>
        <h1 className="mt-2 font-title text-[32px] leading-tight tracking-[0.02em] text-hp-ink">
          {c.ten}
        </h1>
        <p className="mt-2 text-xs tabular-nums text-hp-muted">
          {vi.chia_se.khach_gom.replace("{n}", String(c.noiDung.muc.length))}
        </p>
      </header>

      {/* Thu tu anh o day PHAI trung thu tu tren trang: khung phong to bam
          qua lai theo chinh mang nay. */}
      <PhongToAnh anh={c.noiDung.muc.flatMap((m) => m.anh)}>
        <ul className="space-y-10">
          {c.noiDung.muc.map((m, i) => (
            <Muc key={`${m.maMau ?? "x"}-${i}`} m={m} thuTu={i + 1} />
          ))}
        </ul>
      </PhongToAnh>

      <footer className="mt-14 border-t border-hp-rule pt-6 text-xs text-hp-muted">
        {vi.chia_se.lien_he}
      </footer>
    </main>
  );
}
