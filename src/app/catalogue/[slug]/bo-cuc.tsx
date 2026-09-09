import { MessageCircle, Phone } from "lucide-react";
import type { BoChu } from "@/messages";
import { AnhTai } from "@/ui/anh-tai";
import type { MucCatalogue } from "@/modules/catalogue-share/chia-se.model";
import {
  MAU_NHAN,
  soGoiDuoc,
  type Bia,
  type BoCuc,
  type GiaoDienCatalogue,
  type LienHe,
  type Nhan,
  type Tone,
} from "@/modules/catalogue-share/giao-dien.model";
import { Logo } from "@/app/thuong-hieu";

/**
 * Ba cach bay mot catalogue ra truoc mat khach.
 *
 * Ca ba nhan CUNG mot du lieu va CUNG mot thu tu anh — thu tu do phai trung
 * voi mang truyen cho PhongToAnh, neu khong khach bam mot anh se thay ra mot
 * anh khac. Do la ly do moi bo cuc deu duyet muc theo dung thu tu goc va duyet
 * anh trong tung muc theo dung thu tu goc.
 *
 * NGUYEN TAC CHUNG cho ca ba (nang cap 08/09/2026):
 *   - Anh la thu ban hang, khong phai minh hoa cho chu. Anh to, it vien, nhieu
 *     khoang tho quanh no.
 *   - Nen anh la mot mau gan trang (--color-hp-plate) chu khong phai mau be
 *     xam cua the: anh chup studio co nen sang, dat len nen xam thi lo ra mot
 *     hinh chu nhat giua o.
 *   - TY LE O phai bam sat ty le anh goc (4:3 — anh san pham cua tiem chup
 *     ngang). Ep anh ngang vao mot o doc 4:5 thi tren duoi hien ra hai dai nen
 *     va moi tam anh trong nhu bi dong khung. Da thu 4:5 va phai bo.
 *   - Ma mau la MOT DAY KY TU voi khach ("D12741" khong noi len dieu gi), nen
 *     no di xuong lam nhan nho chu khong lam tieu de to.
 */

export const LOP_TONE: Record<Tone, string> = {
  beige: "",
  trang: "tone-trang",
  toi: "tone-toi",
  reu: "tone-reu",
};

/**
 * Mau nhan cua catalogue, dat bang cach GHI DE hai bien mau hong.
 *
 * Nho vay moi cho dang dung `text-hp-pink` hay `bg-hp-pink-strong` deu doi theo
 * ma khong phai sua tung noi — va catalogue khong chon gi van ra dung hong
 * thuong hieu, vi mac dinh la "hong".
 */
export function bienMauNhan(nhan: Nhan): React.CSSProperties {
  const m = MAU_NHAN[nhan] ?? MAU_NHAN.hong;
  return {
    "--color-hp-pink": m.nhat,
    "--color-hp-pink-strong": m.dam,
  } as React.CSSProperties;
}

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
  tyLe,
  rong,
}: {
  m: MucCatalogue;
  fileId: string;
  ten: string;
  uuTien: boolean;
  tyLe: string;
  rong: number;
}) {
  return (
    <div
      data-anh={fileId}
      title={ten}
      className={`flex cursor-zoom-in items-center justify-center overflow-hidden
                  bg-hp-plate ${tyLe}`}
    >
      <AnhTai
        src={`/api/anh-drive/${fileId}?w=${rong}`}
        alt={m.maMau ?? ten}
        // Anh dau tien tai ngay; phan con lai cho toi khi khach cuon toi. Mot
        // catalogue 40 mau co the co hon 200 anh.
        tai={uuTien ? "eager" : "lazy"}
        // scale nhe khi re chuot: dau hieu cho biet anh bam duoc, va no khong
        // lam xe dich bat cu thu gi quanh no vi da co overflow-hidden.
        lop="h-full w-full object-contain transition-transform duration-300
             hover:scale-[1.03]"
      />
    </div>
  );
}

/** Ma mau: nhan nho, khong phai tieu de. Voi khach no chi la mot ma tham chieu. */
function MaMau({ m, t, lop }: { m: MucCatalogue; t: BoChu; lop?: string }) {
  return (
    <span className={`block text-[11px] uppercase tracking-[0.18em] text-hp-muted ${lop ?? ""}`}>
      {m.maMau ?? t.catalogue_sheet.chua_co_ma_mau}
    </span>
  );
}

/** Thong so tren mot dong, ngan cach bang dau cham giua. */
function ThongSoDong({ ds, lop }: { ds: [string, string][]; lop?: string }) {
  if (ds.length === 0) return null;
  return (
    <p className={`text-sm leading-relaxed text-hp-body ${lop ?? ""}`}>
      {ds.map(([, v]) => v).join(" · ")}
    </p>
  );
}

/** Thong so xep cot, co nhan — dung o bo cuc con nhieu cho. */
function ThongSoBang({ ds, lop }: { ds: [string, string][]; lop?: string }) {
  if (ds.length === 0) return null;
  return (
    <dl className={`grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-4 ${lop ?? ""}`}>
      {ds.map(([nhan, v]) => (
        <div key={nhan}>
          <dt className="text-[10px] uppercase tracking-[0.14em] text-hp-muted">{nhan}</dt>
          <dd className="mt-1.5 text-sm text-hp-body">{v}</dd>
        </div>
      ))}
    </dl>
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

/**
 * Bo cuc 1 — danh sach doc.
 *
 * De SO SANH nhieu mau: moi mau mot khoi, thong so tren mot dong de doc luot,
 * anh xep luoi ba o.
 */
function DanhSach({ muc, g, t }: DoiSo) {
  const moc = mocAnh(muc);
  return (
    <ul className="space-y-16">
      {muc.map((m, i) => {
        const dau = moc[i];
        return (
          <li
            key={`${m.maMau ?? "x"}-${i}`}
            className="break-inside-avoid border-t border-hp-rule pt-8"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
              <MaMau m={m} t={t} />
              <span className="text-[11px] tabular-nums text-hp-muted">
                {String(i + 1).padStart(2, "0")}
              </span>
            </div>

            <ThongSoDong ds={thongSo(m, g, t)} lop="mt-2" />

            {m.anh.length > 0 && (
              <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {m.anh.map((a, j) => (
                  <li key={a.fileId}>
                    <Anh
                      m={m}
                      fileId={a.fileId}
                      ten={a.ten}
                      rong={1400}
                      tyLe="aspect-[4/3]"
                      uuTien={dau + j === 0}
                    />
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
 * De LUOT: moi anh la mot o, khong phai moi mau mot o. Sale da chon tung tam
 * anh mot; gom lai chi hien anh dau la vut di lua chon cua ho.
 *
 * Chu duoi moi o cot toi thieu — mot luoi ma o nao cung ba dong chu thi khong
 * con la luoi anh nua.
 */
function Luoi({ muc, g, t }: DoiSo) {
  // `dauMuc`: o dau tien cua mot mau. Chi o do moi hien dong thong so — mot mau
  // nam anh se lap y het mot dong chu nam lan lien nhau, va luc do luoi doc nhu
  // mot bang du lieu chu khong phai mot luoi anh.
  const o = muc.flatMap((m) =>
    m.anh.map((a, j) => ({ m, a, dauMuc: j === 0, chiTiet: thongSo(m, g, t) })),
  );
  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3">
      {o.map((x, i) => (
        <li key={`${x.a.fileId}-${i}`} className="break-inside-avoid">
          <Anh
            m={x.m}
            fileId={x.a.fileId}
            ten={x.a.ten}
            rong={1000}
            tyLe="aspect-[4/3]"
            uuTien={i < 3}
          />
          <MaMau m={x.m} t={t} lop="mt-3" />
          {x.dauMuc && x.chiTiet.length > 0 && (
            <p className="mt-1 text-xs leading-relaxed text-hp-muted">
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
 * De GAY AN TUONG: mot anh lon het be ngang cho moi mau, cac anh con lai xep
 * thanh mot hang nho ben duoi.
 *
 * Truoc day bo cuc nay xep MOI anh o kho lon — mot mau nam anh thanh nam tam
 * anh khong lo noi duoi nhau, khach cuon mai khong het mot mau va cai cam giac
 * "lookbook" bien mat.
 */
function Lookbook({ muc, g, t }: DoiSo) {
  const moc = mocAnh(muc);
  return (
    <ul className="space-y-24 print:space-y-0">
      {muc.map((m, i) => {
        const dau = moc[i];
        const ct = thongSo(m, g, t);
        const [chinh, ...phu] = m.anh;
        return (
          <li
            key={`${m.maMau ?? "x"}-${i}`}
            // Moi mau mot to giay khi in — day la bo cuc de ngam, khong phai de
            // nhoi cho nhieu mau vao mot trang.
            className="break-inside-avoid print:break-after-page"
          >
            {chinh && (
              <Anh
                m={m}
                fileId={chinh.fileId}
                ten={chinh.ten}
                rong={2000}
                tyLe="aspect-[4/3]"
                uuTien={dau === 0}
              />
            )}

            <div className="mt-8 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
              <MaMau m={m} t={t} />
              <span className="text-[11px] tabular-nums text-hp-muted">
                {String(i + 1).padStart(2, "0")} / {String(muc.length).padStart(2, "0")}
              </span>
            </div>

            <ThongSoBang ds={ct} lop="mt-6 border-t border-hp-rule pt-6" />

            {phu.length > 0 && (
              <ul className="mt-6 grid grid-cols-4 gap-3">
                {phu.map((a) => (
                  <li key={a.fileId}>
                    <Anh
                      m={m}
                      fileId={a.fileId}
                      ten={a.ten}
                      rong={800}
                      tyLe="aspect-[4/3]"
                      uuTien={false}
                    />
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
 * Bo cuc 4 — trien lam.
 *
 * Anh tran het be ngang, ke ca ra ngoai le trang; so thu tu co lon de len mep
 * anh. Sang nhat trong sau, danh cho catalogue it mau — moi mau chiem gan mot
 * man hinh dien thoai.
 */
function TrienLam({ muc, g, t }: DoiSo) {
  const moc = mocAnh(muc);
  return (
    <ul className="space-y-20 print:space-y-0">
      {muc.map((m, i) => {
        const dau = moc[i];
        const [chinh, ...phu] = m.anh;
        return (
          <li key={`${m.maMau ?? "x"}-${i}`} className="break-inside-avoid print:break-after-page">
            {chinh && (
              <div className="relative">
                {/* -mx-6 huy le trang: anh cham hai mep man hinh dien thoai. */}
                <div className="-mx-6">
                  <Anh
                    m={m}
                    fileId={chinh.fileId}
                    ten={chinh.ten}
                    rong={2000}
                    tyLe="aspect-[4/3]"
                    uuTien={dau === 0}
                  />
                </div>
                <span
                  aria-hidden
                  className="pointer-events-none absolute -bottom-6 left-0 font-title
                             text-[64px] leading-none text-hp-pink sm:text-[76px]"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
            )}

            <div className="mt-11 flex flex-col gap-2">
              <MaMau m={m} t={t} />
              <ThongSoDong ds={thongSo(m, g, t)} />
            </div>

            {phu.length > 0 && (
              <ul className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-4">
                {phu.map((a) => (
                  <li key={a.fileId}>
                    <Anh m={m} fileId={a.fileId} ten={a.ten} rong={800}
                         tyLe="aspect-[4/3]" uuTien={false} />
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
 * Bo cuc 5 — khung co dien.
 *
 * Moi mau nam trong mot khung ke doi, thong so xep can giua nhu mot tam chung
 * nhan. De doc thong so nhat trong sau; doi lai anh phai nho hon vi duong ke va
 * le chiem cho.
 */
function KhungCoDien({ muc, g, t }: DoiSo) {
  const moc = mocAnh(muc);
  return (
    <ul className="space-y-8">
      {muc.map((m, i) => {
        const dau = moc[i];
        const ct = thongSo(m, g, t);
        return (
          <li key={`${m.maMau ?? "x"}-${i}`} className="break-inside-avoid border border-hp-rule p-2">
            <div className="flex flex-col items-center gap-5 border border-hp-rule px-5 py-6">
              {m.anh.length > 0 && (
                <ul className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
                  {m.anh.slice(0, 2).map((a, j) => (
                    <li key={a.fileId}>
                      <Anh m={m} fileId={a.fileId} ten={a.ten} rong={1200}
                           tyLe="aspect-[4/3]" uuTien={dau + j === 0} />
                    </li>
                  ))}
                </ul>
              )}

              <span className="font-title text-[26px] leading-none tracking-[0.06em] text-hp-ink">
                {m.maMau ?? t.catalogue_sheet.chua_co_ma_mau}
              </span>

              {/* Duong phan cach co mot vien kim cuong o giua. */}
              <div aria-hidden className="flex w-full items-center gap-3">
                <span className="h-px flex-grow bg-hp-rule" />
                <span className="h-1.5 w-1.5 rotate-45 bg-hp-pink" />
                <span className="h-px flex-grow bg-hp-rule" />
              </div>

              {ct.length > 0 && (
                <dl className="flex flex-wrap justify-center gap-x-8 gap-y-4">
                  {ct.map(([nhan, v]) => (
                    <div key={nhan} className="flex flex-col items-center gap-1">
                      <dt className="text-[10px] uppercase tracking-[0.18em] text-hp-muted">{nhan}</dt>
                      <dd className="text-sm text-hp-body">{v}</dd>
                    </div>
                  ))}
                </dl>
              )}

              {m.anh.length > 2 && (
                <ul className="grid w-full grid-cols-3 gap-3 sm:grid-cols-4">
                  {m.anh.slice(2).map((a) => (
                    <li key={a.fileId}>
                      <Anh m={m} fileId={a.fileId} ten={a.ten} rong={700}
                           tyLe="aspect-[4/3]" uuTien={false} />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * Bo cuc 6 — tap chi.
 *
 * Anh mot ben, chu ben kia, doi ben so le tung mau. Luot nhanh nhat trong sau,
 * hop khi gui nhieu mau mot luc; doi lai anh nho nhat.
 */
function TapChi({ muc, g, t }: DoiSo) {
  const moc = mocAnh(muc);
  return (
    <ul className="space-y-10">
      {muc.map((m, i) => {
        const dau = moc[i];
        const ct = thongSo(m, g, t);
        const [chinh] = m.anh;
        // So le tung mau: mau chan anh ben trai, mau le anh ben phai.
        const nghich = i % 2 === 1;
        return (
          <li key={`${m.maMau ?? "x"}-${i}`} className="break-inside-avoid">
            <div className={`flex items-stretch gap-4 ${nghich ? "flex-row-reverse" : "flex-row"}`}>
              {chinh && (
                <div className="w-3/5 shrink-0">
                  <Anh m={m} fileId={chinh.fileId} ten={chinh.ten} rong={1200}
                       tyLe="aspect-square" uuTien={dau === 0} />
                </div>
              )}
              <div className="flex flex-grow flex-col justify-center gap-2.5">
                <span className="font-title text-3xl leading-none text-hp-pink">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span aria-hidden className="h-px w-7 bg-hp-rule" />
                <MaMau m={m} t={t} />
                {ct.length > 0 && (
                  <div className="flex flex-col gap-0.5">
                    {ct.map(([nhan, v]) => (
                      <span key={nhan} className="text-sm leading-relaxed text-hp-body">{v}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {m.anh.length > 1 && (
              <ul className="mt-3 grid grid-cols-4 gap-2">
                {m.anh.slice(1).map((a) => (
                  <li key={a.fileId}>
                    <Anh m={m} fileId={a.fileId} ten={a.ten} rong={600}
                         tyLe="aspect-square" uuTien={false} />
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

const BANG: Record<BoCuc, (p: DoiSo) => React.ReactElement> = {
  "danh-sach": DanhSach,
  luoi: Luoi,
  lookbook: Lookbook,
  "trien-lam": TrienLam,
  "khung-co-dien": KhungCoDien,
  "tap-chi": TapChi,
};

export function ThanCatalogue(p: DoiSo) {
  const Ve = BANG[p.g.boCuc] ?? DanhSach;
  return <Ve {...p} />;
}

/**
 * Trang bia.
 *
 * Mot khung ke mong bao quanh — day la trang dau tien khach nhin thay, no phai
 * co cam giac cua mot cuon catalogue chu khong phai mot trang web.
 */
export function TrangBia({
  bia,
  lienHe,
  tieuDe,
  thuongHieu,
  t,
}: {
  bia: Bia;
  lienHe: LienHe | null;
  tieuDe: string;
  thuongHieu: string;
  t: BoChu;
}) {
  return (
    <section className="bia-catalogue mb-20 border border-hp-rule px-6 py-16 text-center sm:px-12 sm:py-24">
      <Logo co="lon" alt={thuongHieu} theoMau lop="mx-auto text-hp-pink" />

      {bia.tenKhach && (
        <p className="mt-12 text-[11px] uppercase tracking-[0.22em] text-hp-muted">
          {bia.tenKhach}
        </p>
      )}

      <h1 className="mx-auto mt-5 max-w-2xl font-title text-[40px] leading-[1.15] tracking-[0.02em] text-hp-ink sm:text-[54px]">
        {tieuDe}
      </h1>

      {bia.loiChao && (
        <>
          <span aria-hidden className="mx-auto mt-8 block h-px w-16 bg-hp-rule" />
          <p className="mx-auto mt-8 max-w-xl text-base leading-relaxed text-hp-body">
            {bia.loiChao}
          </p>
        </>
      )}

      {lienHe?.ten && (
        <p className="mt-12 text-[11px] uppercase tracking-[0.14em] text-hp-muted">
          {t.chia_se.cta_nguoi_tu_van} · {lienHe.ten}
        </p>
      )}
    </section>
  );
}

/**
 * Khoi keu goi dat hang o cuoi trang.
 *
 * Day la thu bien mot catalogue dep thanh mot don hang. Khach dang thich mot
 * mau ma khong biet nhan ai thi ho dong tab — va sale khong bao gio biet minh
 * vua mat don do.
 *
 * Nut goi dung hong DAM (--color-hp-pink-strong): hong thuong hieu chi dat
 * 3.81:1 tren nen kem, khong du cho chu trang tren nut.
 */
export function KhoiLienHe({ lienHe, t }: { lienHe: LienHe; t: BoChu }) {
  const so = soGoiDuoc(lienHe.dienThoai);

  return (
    <section className="mt-20 border-t border-hp-rule pt-10">
      <h2 className="font-title text-2xl leading-tight text-hp-ink">
        {t.chia_se.cta_tieu_de}
      </h2>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-hp-body">
        {t.chia_se.cta_mo_ta}
      </p>

      {lienHe.ten && (
        <p className="mt-6 text-[11px] uppercase tracking-[0.14em] text-hp-muted">
          {t.chia_se.cta_nguoi_tu_van} · <span className="text-hp-ink">{lienHe.ten}</span>
        </p>
      )}

      {so !== "" && (
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <a
            href={`tel:${so}`}
            className="flex items-center gap-2 bg-hp-pink-strong px-6 py-3 text-[11px]
                       uppercase tracking-[0.14em] text-white transition-colors
                       duration-150 hover:bg-hp-ink"
          >
            <Phone aria-hidden strokeWidth={1.5} className="h-4 w-4 shrink-0" />
            {t.chia_se.cta_goi} {lienHe.dienThoai}
          </a>
          <a
            href={`https://zalo.me/${so}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 border border-hp-ink px-6 py-3 text-[11px]
                       uppercase tracking-[0.14em] text-hp-ink transition-colors
                       duration-150 hover:bg-hp-ink hover:text-hp-foundation"
          >
            <MessageCircle aria-hidden strokeWidth={1.5} className="h-4 w-4 shrink-0" />
            {t.chia_se.cta_zalo}
          </a>
        </div>
      )}
    </section>
  );
}

/**
 * Thanh lien he dinh o day man hinh dien thoai.
 *
 * Chi hien tren man hinh nho: tren may tinh khoi cuoi trang la du, con tren
 * dien thoai khach cuon rat lau va khoi do o mai tan duoi cung.
 *
 * print:hidden — mot thanh dinh khong co nghia gi tren giay.
 */
export function ThanhLienHe({ lienHe, t }: { lienHe: LienHe; t: BoChu }) {
  const so = soGoiDuoc(lienHe.dienThoai);
  if (so === "") return null;

  return (
    <div
      className="sticky bottom-0 z-20 flex gap-px border-t border-hp-rule bg-hp-rule
                 sm:hidden print:hidden"
    >
      <a
        href={`tel:${so}`}
        className="flex flex-1 items-center justify-center gap-2 bg-hp-pink-strong px-4 py-3.5
                   text-[11px] uppercase tracking-[0.14em] text-white"
      >
        <Phone aria-hidden strokeWidth={1.5} className="h-4 w-4 shrink-0" />
        {t.chia_se.cta_goi}
      </a>
      <a
        href={`https://zalo.me/${so}`}
        target="_blank"
        rel="noreferrer"
        className="flex flex-1 items-center justify-center gap-2 bg-hp-card px-4 py-3.5
                   text-[11px] uppercase tracking-[0.14em] text-hp-ink"
      >
        <MessageCircle aria-hidden strokeWidth={1.5} className="h-4 w-4 shrink-0" />
        {t.chia_se.cta_zalo}
      </a>
    </div>
  );
}
