import { existsSync } from "node:fs";
import { join } from "node:path";
import { requireUser } from "@/auth/guard";
import { layChu } from "@/messages/may-chu";
import type { BoChu } from "@/messages";
import { AnhChuThich, ChuaCoAnh, type Diem } from "./anh-chu-thich";

export async function generateMetadata() {
  const t = await layChu();
  return { title: t.huong_dan.tieu_de };
}

type Buoc = { ten: string; moTa: string; anh: string; diem: Diem[] };

/**
 * Bay buoc tu luc dang nhap den luc xem lai link da gui.
 *
 * Toa do cac diem chu thich lay tu chinh anh chup trong public/huong-dan —
 * chup lai bang `npm run huong-dan:anh` sau moi lan doi giao dien, roi doi lai
 * toa do o day neu bo cuc xe dich.
 */
function cacBuoc(t: BoChu): Buoc[] {
  return [
    {
      ten: t.huong_dan.b1_ten,
      moTa: t.huong_dan.b1_mo_ta,
      anh: "01-dang-nhap",
      diem: [
        { x: 24, y: 37, chu: t.huong_dan.b1_c1, huong: "phai" },
        { x: 24, y: 51, chu: t.huong_dan.b1_c2, huong: "phai" },
      ],
    },
    {
      ten: t.huong_dan.b2_ten,
      moTa: t.huong_dan.b2_mo_ta,
      anh: "02-tim-mau",
      diem: [
        { x: 33, y: 46, chu: t.huong_dan.b2_c1 },
        { x: 45, y: 54, chu: t.huong_dan.b2_c2, huong: "tren" },
        { x: 17, y: 70, chu: t.huong_dan.b2_c3 },
      ],
    },
    {
      ten: t.huong_dan.b3_ten,
      moTa: t.huong_dan.b3_mo_ta,
      anh: "03-tich-chon",
      diem: [
        { x: 5, y: 32, chu: t.huong_dan.b3_c1 },
        { x: 9, y: 94, chu: t.huong_dan.b3_c2, huong: "duoi" },
        { x: 89, y: 94, chu: t.huong_dan.b3_c3, huong: "duoi" },
      ],
    },
    {
      ten: t.huong_dan.b4_ten,
      moTa: t.huong_dan.b4_mo_ta,
      anh: "04-dat-ten-va-kieu",
      diem: [
        { x: 46, y: 17, chu: t.huong_dan.b4_c1 },
        { x: 17, y: 35, chu: t.huong_dan.b4_c2, huong: "phai" },
        { x: 17, y: 49, chu: t.huong_dan.b4_c3, huong: "phai" },
      ],
    },
    {
      ten: t.huong_dan.b5_ten,
      moTa: t.huong_dan.b5_mo_ta,
      anh: "05-bo-anh",
      diem: [
        { x: 18, y: 42, chu: t.huong_dan.b5_c1, huong: "phai" },
        { x: 26, y: 28, chu: t.huong_dan.b5_c2 },
        { x: 76, y: 28, chu: t.huong_dan.b5_c3, huong: "phai" },
      ],
    },
    {
      ten: t.huong_dan.b6_ten,
      moTa: t.huong_dan.b6_mo_ta,
      anh: "06-tao-link",
      diem: [
        { x: 34, y: 56, chu: t.huong_dan.b6_c1, huong: "duoi" },
        { x: 41, y: 63, chu: t.huong_dan.b6_c2, huong: "tren" },
        { x: 46, y: 56, chu: t.huong_dan.b6_c3, huong: "duoi" },
      ],
    },
    {
      ten: t.huong_dan.b7_ten,
      moTa: t.huong_dan.b7_mo_ta,
      anh: "07-danh-sach",
      diem: [
        { x: 63, y: 4, chu: t.huong_dan.b7_c1, huong: "tren" },
        { x: 80, y: 42, chu: t.huong_dan.b7_c2, huong: "tren" },
        { x: 86, y: 39, chu: t.huong_dan.b7_c3, huong: "duoi" },
      ],
    },
  ];
}

const THU_MUC_ANH = "huong-dan";

/**
 * Anh chup nam trong public/ nen kiem su ton tai bang he thong tep la dung —
 * day la server component, no chay tren cung may voi thu muc do.
 *
 * Vi sao phai kiem: anh chup duoc sinh bang mot lenh rieng, khong nam trong
 * git. Thieu anh thi trang van phai doc duoc, chu khong hien mot o vo anh.
 */
function coAnh(ten: string): boolean {
  return existsSync(join(process.cwd(), "public", THU_MUC_ANH, `${ten}.png`));
}

export default async function TrangHuongDan() {
  await requireUser();
  const t = await layChu();
  const buoc = cacBuoc(t);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-10">
        <span className="block text-[11px] uppercase tracking-[0.14em] text-hp-muted">
          {t.catalogue_sheet.thuong_hieu}
        </span>
        <h1 className="mt-2 font-title text-[32px] leading-none tracking-[0.02em] text-hp-ink">
          {t.huong_dan.tieu_de}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-hp-body">{t.huong_dan.mo_ta}</p>
        <div className="mt-5 h-px bg-hp-rule" />
      </div>

      <ol className="space-y-16">
        {buoc.map((b, i) => (
          <li key={b.anh}>
            <span className="block text-[11px] uppercase tracking-[0.14em] text-hp-muted">
              {t.huong_dan.buoc.replace("{n}", String(i + 1))}
            </span>
            <h2 className="mt-2 font-title text-2xl leading-tight text-hp-ink">{b.ten}</h2>
            <p className="mt-3 text-sm leading-relaxed text-hp-body">{b.moTa}</p>

            <div className="mt-6">
              {coAnh(b.anh) ? (
                <AnhChuThich
                  src={`/${THU_MUC_ANH}/${b.anh}.png`}
                  alt={b.ten}
                  diem={b.diem}
                />
              ) : (
                <ChuaCoAnh t={t} />
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
