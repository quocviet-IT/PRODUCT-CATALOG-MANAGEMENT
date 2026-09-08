import type { BoChu } from "@/messages";
import type { MucCatalogue } from "@/modules/catalogue-share/chia-se.model";
import type { Bia, BoCuc, GiaoDienCatalogue, Tone } from "@/modules/catalogue-share/giao-dien.model";
import { Logo } from "@/app/thuong-hieu";

/**
 * Ba cach bay mot catalogue ra truoc mat khach.
 *
 * Ca ba nhan CUNG mot du lieu va CUNG mot thu tu anh — thu tu do phai trung
 * voi mang truyen cho PhongToAnh, neu khong khach bam mot anh se thay ra mot
 * anh khac. Do la ly do moi bo cuc deu duyet muc theo dung thu tu goc va duyet
 * anh trong tung muc theo dung thu tu goc.
 */

export const LOP_TONE: Record<Tone, string> = {
  beige: "",
  trang: "tone-trang",
  toi: "tone-toi",
};

function gam(v: number | null): string | null {
  return v === null ? null : `${v.toFixed(2).replace(".", ",")} g`;
}

/** Cac thong so duoc phep hien, theo dung lua chon cua sale. */
function thongSo(m: MucCatalogue, g: GiaoDienCatalogue, t: BoChu): [string, string][] {
  const tatCa: [boolean, string, string | null][] = [
    [g.hien.loaiSp, t.catalogue_sheet.cot_loai_sp, m.loaiSp],
    [g.hien.chatLieu, t.catalogue_sheet.cot_chat_lieu, m.chatLieu],
    [g.hien.mau, t.catalogue_sheet.cot_mau, m.mau],
    [g.hien.size, t.catalogue_sheet.cot_size, m.size],
    [g.hien.tlVang, t.catalogue_sheet.cot_tl_vang, gam(m.tlVang)],
  ];
  return tatCa
    .filter((x): x is [boolean, string, string] => x[0] && x[2] !== null)
    .map(([, nhan, v]) => [nhan, v]);
}

function Anh({
  m,
  fileId,
  ten,
  uuTien,
  lop,
  rong,
}: {
  m: MucCatalogue;
  fileId: string;
  ten: string;
  uuTien: boolean;
  lop?: string;
  rong: number;
}) {
  return (
    <div
      data-anh={fileId}
      title={ten}
      className={
        "flex cursor-zoom-in items-center justify-center bg-hp-inset " +
        "transition-colors duration-150 hover:bg-hp-rule/40 " + (lop ?? "")
      }
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/api/anh-drive/${fileId}?w=${rong}`}
        alt={m.maMau ?? ten}
        // Anh dau tien tai ngay; phan con lai cho toi khi khach cuon toi. Mot
        // catalogue 40 mau co the co hon 200 anh.
        loading={uuTien ? "eager" : "lazy"}
        className="h-full w-full object-contain"
      />
    </div>
  );
}

function DongThongSo({ ds }: { ds: [string, string][] }) {
  if (ds.length === 0) return null;
  return (
    <dl className="mt-3 flex flex-wrap gap-x-8 gap-y-1">
      {ds.map(([nhan, v]) => (
        <div key={nhan} className="flex items-baseline gap-2">
          <dt className="text-[10px] uppercase tracking-[0.14em] text-hp-muted">{nhan}</dt>
          <dd className="text-sm text-hp-body">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Bo cuc 1 — danh sach doc. Day la cach catalogue van hien tu truoc den nay. */
function DanhSach({ muc, g, t }: DoiSo) {
  const moc = mocAnh(muc);
  return (
    <ul className="space-y-10">
      {muc.map((m, i) => {
        const dau = moc[i];
        return (
          <li key={`${m.maMau ?? "x"}-${i}`} className="break-inside-avoid border-t border-hp-rule pt-8">
            <div className="flex flex-wrap items-baseline gap-x-4">
              <h2 className="font-title text-2xl leading-none text-hp-ink">
                {m.maMau ?? t.catalogue_sheet.chua_co_ma_mau}
              </h2>
              <span className="text-[11px] tabular-nums text-hp-muted">{i + 1}</span>
            </div>
            <DongThongSo ds={thongSo(m, g, t)} />
            {m.anh.length > 0 && (
              <ul className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
                {m.anh.map((a, j) => (
                  <li key={a.fileId} className="border border-hp-rule bg-hp-card">
                    <Anh m={m} fileId={a.fileId} ten={a.ten} rong={1400}
                         uuTien={dau + j === 0} lop="aspect-square" />
                  </li>
                ))}
              </ul>
            )}
          </li>
        );
      })}
    </ul>
  );
}

/**
 * Bo cuc 2 — luoi anh.
 *
 * MOI anh la mot o, khong phai moi mau mot o: sale da chon tung tam anh mot,
 * gom lai chi hien anh dau la vut di lua chon cua ho.
 */
function Luoi({ muc, g, t }: DoiSo) {
  const o = muc.flatMap((m, i) =>
    m.anh.map((a) => ({ m, a, thuTu: i + 1, chiTiet: thongSo(m, g, t) })),
  );
  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3">
      {o.map((x, i) => (
        <li key={`${x.a.fileId}-${i}`} className="break-inside-avoid">
          <div className="border border-hp-rule bg-hp-card">
            <Anh m={x.m} fileId={x.a.fileId} ten={x.a.ten} rong={1000}
                 uuTien={i < 3} lop="aspect-square" />
          </div>
          <p className="mt-2 font-title text-base leading-tight text-hp-ink">
            {x.m.maMau ?? t.catalogue_sheet.chua_co_ma_mau}
          </p>
          {x.chiTiet.length > 0 && (
            <p className="mt-0.5 text-xs leading-relaxed text-hp-muted">
              {x.chiTiet.map(([, v]) => v).join(" · ")}
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}

/**
 * Bo cuc 3 — lookbook.
 *
 * Moi mau mot khoi rong het be ngang, anh lon, chu thua. Dung khi catalogue chi
 * co vai mau va muc dich la gay an tuong chu khong phai de so sanh.
 */
function Lookbook({ muc, g, t }: DoiSo) {
  const moc = mocAnh(muc);
  return (
    <ul className="space-y-20 print:space-y-0">
      {muc.map((m, i) => {
        const dau = moc[i];
        const ct = thongSo(m, g, t);
        return (
          <li
            key={`${m.maMau ?? "x"}-${i}`}
            // Moi mau mot to giay khi in — day la bo cuc de ngam, khong phai de
            // nhoi cho nhieu mau vao mot trang.
            className="break-inside-avoid print:break-after-page"
          >
            <div className="flex items-baseline justify-between gap-4 border-b border-hp-rule pb-3">
              <h2 className="font-title text-[28px] leading-none tracking-[0.01em] text-hp-ink">
                {m.maMau ?? t.catalogue_sheet.chua_co_ma_mau}
              </h2>
              <span className="text-[11px] tabular-nums text-hp-muted">
                {String(i + 1).padStart(2, "0")}
              </span>
            </div>

            {m.anh.length > 0 && (
              <ul className="mt-6 space-y-6">
                {m.anh.map((a, j) => (
                  <li key={a.fileId} className="border border-hp-rule bg-hp-card">
                    <Anh m={m} fileId={a.fileId} ten={a.ten} rong={1800}
                         uuTien={dau + j === 0} lop="aspect-[4/3]" />
                  </li>
                ))}
              </ul>
            )}

            {ct.length > 0 && (
              <dl className="mt-6 grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-4">
                {ct.map(([nhan, v]) => (
                  <div key={nhan}>
                    <dt className="text-[10px] uppercase tracking-[0.14em] text-hp-muted">{nhan}</dt>
                    <dd className="mt-1 text-sm text-hp-body">{v}</dd>
                  </div>
                ))}
              </dl>
            )}
          </li>
        );
      })}
    </ul>
  );
}

type DoiSo = { muc: MucCatalogue[]; g: GiaoDienCatalogue; t: BoChu };

/**
 * Vi tri anh dau tien cua tung muc trong mang anh PHANG.
 *
 * Can no de biet anh nao la anh dau ca trang (anh do tai ngay, so con lai cho
 * cuon toi). Tinh truoc thanh mang thay vi cong don trong luc ve: cong don la
 * sua mot bien ben ngoai giua chung render, va React khong bao dam render chay
 * mot lan tu dau den cuoi.
 */
function mocAnh(muc: MucCatalogue[]): number[] {
  const ra: number[] = [];
  let n = 0;
  for (const m of muc) {
    ra.push(n);
    n += m.anh.length;
  }
  return ra;
}

const BANG: Record<BoCuc, (p: DoiSo) => React.ReactElement> = {
  "danh-sach": DanhSach,
  luoi: Luoi,
  lookbook: Lookbook,
};

export function ThanCatalogue(p: DoiSo) {
  const Ve = BANG[p.g.boCuc] ?? DanhSach;
  return <Ve {...p} />;
}

/** Trang bia. Chi hien khi sale co nhap it nhat mot dong. */
export function TrangBia({ bia, tieuDe, thuongHieu }: {
  bia: Bia;
  tieuDe: string;
  thuongHieu: string;
}) {
  return (
    <section className="bia-catalogue mb-16 border-b border-hp-rule pb-16 text-center">
      <Logo co="lon" alt={thuongHieu} lop="mx-auto" />

      <h1 className="mx-auto mt-8 max-w-2xl font-title text-[40px] leading-[1.15] tracking-[0.02em] text-hp-ink sm:text-[52px]">
        {tieuDe}
      </h1>

      {bia.tenKhach && (
        <p className="mt-8 font-title text-2xl leading-tight text-hp-ink">{bia.tenKhach}</p>
      )}

      {bia.loiChao && (
        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-hp-body">
          {bia.loiChao}
        </p>
      )}

      {bia.tenSale && (
        <p className="mt-10 text-[11px] uppercase tracking-[0.14em] text-hp-muted">
          {bia.tenSale}
        </p>
      )}
    </section>
  );
}
