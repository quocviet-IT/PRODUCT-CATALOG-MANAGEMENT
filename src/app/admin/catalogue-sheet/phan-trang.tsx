import Link from "next/link";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import type { BoChu } from "@/messages";

/**
 * Thanh phan trang: ve dau, lui mot trang, so trang, tien mot trang, trang cuoi.
 *
 * Truoc day chi co "Truoc" va "Sau" — dang o trang 6 muon ve trang 1 phai bam
 * nam lan. Cac nut nhay thang moi la thu nguoi ta thuc su can khi luot qua vai
 * chuc trang.
 */

const NUT =
  "flex items-center gap-1 text-[11px] uppercase tracking-[0.14em] text-hp-muted " +
  "transition-colors duration-150 hover:text-hp-ink";

const TAT = "flex items-center gap-1 text-[11px] uppercase tracking-[0.14em] text-hp-rule";

/** So o so trang hien cung luc. Le de trang hien tai nam giua. */
export const SO_O_TOI_DA = 7;

/**
 * Day so trang hien quanh trang dang xem.
 *
 * Ham thuan, co test. Luon tra ve dung SO_O_TOI_DA o khi con du trang — day
 * so co lung linh (khi 5 khi 7) lam ca thanh nhay ngang moi lan doi trang.
 */
export function cuaSoTrang(trang: number, soTrang: number, toiDa = SO_O_TOI_DA): number[] {
  const day = (tu: number, den: number) =>
    Array.from({ length: den - tu + 1 }, (_, i) => tu + i);
  if (soTrang <= toiDa) return day(1, soTrang);
  const nua = Math.floor(toiDa / 2);
  const cuoi = Math.min(soTrang, Math.max(1, trang - nua) + toiDa - 1);
  return day(Math.max(1, cuoi - toiDa + 1), cuoi);
}

export function PhanTrang({
  trang,
  soTrang,
  urlTrang,
  t,
}: {
  trang: number;
  soTrang: number;
  /** Dung duong dan cua mot trang, giu nguyen moi tham so loc dang co. */
  urlTrang: (n: number) => string;
  t: BoChu;
}) {
  if (soTrang <= 1) return null;
  const o = cuaSoTrang(trang, soTrang);
  const dauTien = trang === 1;
  const cuoiCung = trang === soTrang;

  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
      {/* Ve dau va Trang cuoi van hien khi khong bam duoc, chi doi sang mau
          mo: nut bien mat lam ca thanh xe dich moi lan doi trang, va nguoi
          dung mat dau moc de nham. */}
      {dauTien ? (
        <span className={TAT} aria-hidden>
          <ChevronsLeft className="h-4 w-4" />
          {t.catalogue_sheet.trang_dau}
        </span>
      ) : (
        <Link href={urlTrang(1)} className={NUT}>
          <ChevronsLeft className="h-4 w-4" />
          {t.catalogue_sheet.trang_dau}
        </Link>
      )}

      {dauTien ? (
        <span className={TAT} aria-hidden>
          <ChevronLeft className="h-4 w-4" />
          {t.catalogue_sheet.trang_truoc}
        </span>
      ) : (
        <Link href={urlTrang(trang - 1)} className={NUT} rel="prev">
          <ChevronLeft className="h-4 w-4" />
          {t.catalogue_sheet.trang_truoc}
        </Link>
      )}

      <ol className="flex items-center gap-1">
        {o.map((n) => (
          <li key={n}>
            <Link
              href={urlTrang(n)}
              aria-current={n === trang ? "page" : undefined}
              className={
                "flex h-8 min-w-8 items-center justify-center border px-2 " +
                "text-xs tabular-nums transition-colors duration-150 " +
                (n === trang
                  ? "border-hp-ink bg-hp-ink text-hp-foundation"
                  : "border-hp-rule text-hp-body hover:border-hp-ink")
              }
            >
              {n}
            </Link>
          </li>
        ))}
      </ol>

      {cuoiCung ? (
        <span className={TAT} aria-hidden>
          {t.catalogue_sheet.trang_sau}
          <ChevronRight className="h-4 w-4" />
        </span>
      ) : (
        <Link href={urlTrang(trang + 1)} className={NUT} rel="next">
          {t.catalogue_sheet.trang_sau}
          <ChevronRight className="h-4 w-4" />
        </Link>
      )}

      {cuoiCung ? (
        <span className={TAT} aria-hidden>
          {t.catalogue_sheet.trang_cuoi}
          <ChevronsRight className="h-4 w-4" />
        </span>
      ) : (
        <Link href={urlTrang(soTrang)} className={NUT}>
          {t.catalogue_sheet.trang_cuoi}
          <ChevronsRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}
