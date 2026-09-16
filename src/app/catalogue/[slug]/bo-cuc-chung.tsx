import type { BoChu } from "@/messages";
import { AnhTai } from "@/ui/anh-tai";
import type { MucCatalogue } from "@/modules/catalogue-share/chia-se.model";
import type { GiaoDienCatalogue } from "@/modules/catalogue-share/giao-dien.model";

/**
 * Phan dung chung cua moi bo cuc — tach khoi bo-cuc.tsx ngay 15/09/2026 khi them ba bo
 * cuc xu huong (bo-cuc-xu-huong.tsx). Chuyen NGUYEN, khong doi hanh vi. Nguyen tac chung
 * cua anh (nen plate, ty le 4:3, ma mau la nhan nho) xem dau bo-cuc.tsx.
 */

function gam(v: number | null): string | null {
  return v === null ? null : `${v.toFixed(2).replace(".", ",")} g`;
}

/** Cac thong so duoc phep hien, theo dung lua chon cua sale. */
export function thongSo(m: MucCatalogue, g: GiaoDienCatalogue, t: BoChu): [string, string][] {
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

export function Anh({
  m,
  fileId,
  ten,
  uuTien,
  tyLe,
  rong,
  chinh,
}: {
  m: MucCatalogue;
  fileId: string;
  ten: string;
  uuTien: boolean;
  tyLe: string;
  rong: number;
  /**
   * O LON cua mau: cho nay la cho anh nho nhay len khi khach bam (xem doi-anh.tsx).
   * Moi mau nhieu nhat MOT o — hai o thi khong biet nhay len cai nao. Bo cuc bay moi anh
   * ngang hang nhau (Danh sach, Luoi) hay chi hien mot anh (Bang mau, The tieu ban) thi
   * khong danh dau o nao ca.
   */
  chinh?: boolean;
}) {
  return (
    <div
      data-anh={fileId}
      data-anh-chinh={chinh ? "" : undefined}
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
export function MaMau({ m, t, lop }: { m: MucCatalogue; t: BoChu; lop?: string }) {
  return (
    <span className={`block text-[11px] uppercase tracking-[0.18em] text-hp-muted ${lop ?? ""}`}>
      {m.maMau ?? t.catalogue_sheet.chua_co_ma_mau}
    </span>
  );
}

/** Thong so tren mot dong, ngan cach bang dau cham giua. */
export function ThongSoDong({ ds, lop }: { ds: [string, string][]; lop?: string }) {
  if (ds.length === 0) return null;
  return (
    <p className={`text-sm leading-relaxed text-hp-body ${lop ?? ""}`}>
      {ds.map(([, v]) => v).join(" · ")}
    </p>
  );
}

/**
 * Thong so xep cot, co nhan — dung o bo cuc con nhieu cho. `gon` cho hang cua Bang mau:
 * khoang cach nho hon de nhieu mau vua mot trang.
 */
export function ThongSoBang({ ds, lop, gon }: { ds: [string, string][]; lop?: string; gon?: boolean }) {
  if (ds.length === 0) return null;
  const khoang = gon ? "gap-x-6 gap-y-2" : "gap-x-8 gap-y-4";
  return (
    <dl className={`grid grid-cols-2 ${khoang} sm:grid-cols-4 ${lop ?? ""}`}>
      {ds.map(([nhan, v]) => (
        <div key={nhan}>
          <dt className="text-[10px] uppercase tracking-[0.14em] text-hp-muted">{nhan}</dt>
          <dd className={`${gon ? "mt-0.5" : "mt-1.5"} text-sm text-hp-body`}>{v}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Duong trang tri: vach – hat thoi mau nhan – vach. `lop` dat be rong va khoang cach. */
export function DuongTrangTri({ lop }: { lop: string }) {
  return (
    <div aria-hidden className={`flex items-center ${lop}`}>
      <span className="h-px flex-grow bg-hp-rule" />
      <span className="h-1.5 w-1.5 rotate-45 bg-hp-pink" />
      <span className="h-px flex-grow bg-hp-rule" />
    </div>
  );
}

/**
 * Loi gioi thieu sale tu viet cho mot mau (gop y 11/09/2026). Giu dung cho xuong
 * dong sale go. Catalogue cu khong co truong nay thi khong ve gi.
 */
export function GioiThieu({ m, lop }: { m: MucCatalogue; lop?: string }) {
  if (!m.gioiThieu) return null;
  return (
    <p className={`max-w-2xl whitespace-pre-line text-sm leading-relaxed text-hp-body ${lop ?? ""}`}>
      {m.gioiThieu}
    </p>
  );
}

export type DoiSo = { muc: MucCatalogue[]; g: GiaoDienCatalogue; t: BoChu };

/**
 * Vi tri anh dau tien cua tung muc trong mang anh PHANG.
 *
 * Can no de biet anh nao la anh dau ca trang (anh do tai ngay, so con lai cho
 * cuon toi). Tinh truoc thanh mang thay vi cong don trong luc ve: cong don la
 * sua mot bien ben ngoai giua chung render, va React khong bao dam render chay
 * mot lan tu dau den cuoi.
 */
export function mocAnh(muc: MucCatalogue[]): number[] {
  const ra: number[] = [];
  let n = 0;
  for (const m of muc) {
    ra.push(n);
    n += m.anh.length;
  }
  return ra;
}
