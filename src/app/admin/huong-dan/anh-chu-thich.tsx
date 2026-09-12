import type { BoChu } from "@/messages";

/**
 * Mot anh man hinh kem cac diem chu thich danh so.
 *
 * Toa do la PHAN TRAM chu khong phai pixel: anh chup o mot be rong roi hien ra
 * o be rong khac (dien thoai, may in), pixel se troi con phan tram thi khong.
 *
 * (x, y) la CHO MUI TEN CHAM VAO — khong phai goc cua o so. Nho vay dat toa do
 * chi viec nhin vao anh xem muon chi vao dau, con viec dat o so o phia nao thi
 * `huong` lo.
 *
 * So tren anh va so trong danh sach ben duoi la CUNG mot mang — khong the lech
 * nhau, vi ca hai deu duyet chinh mang do.
 */

export type Diem = {
  /** Diem mui ten cham vao, tinh theo phan tram be rong / chieu cao cua anh. */
  x: number;
  y: number;
  /** Cau chu thich. */
  chu: string;
  /**
   * Mui ten chi ve huong nao. Mac dinh "trai": mui ten cham vao (x, y) va o so
   * nam ben PHAI diem do. Chon huong sao cho o so roi vao cho trong cua anh.
   */
  huong?: "trai" | "phai" | "tren" | "duoi";
};

/**
 * Moi huong can ba thu khop nhau: chieu xep (mui ten truoc hay so truoc), goc
 * xoay cua mui ten, va cach keo ca cum ra khoi diem cham.
 */
const KIEU: Record<
  NonNullable<Diem["huong"]>,
  { xep: string; xoay: string; keo: string; khung: string }
> = {
  trai: { xep: "flex-row", xoay: "rotate-0", keo: "-translate-y-1/2", khung: "h-3 w-6" },
  phai: { xep: "flex-row-reverse", xoay: "rotate-180", keo: "-translate-x-full -translate-y-1/2", khung: "h-3 w-6" },
  // Mui ten DOC: svg ngang xoay 90 do van giu khung 24x12 nam ngang, nen dau mui ten lo
  // ra 6px ngoai khung va de len chinh chu no dang chi (soat anh huong dan 12/09/2026).
  // Khung boc 12x24 cho kich thuoc bang dung hinh sau khi xoay.
  tren: { xep: "flex-col", xoay: "rotate-90", keo: "-translate-x-1/2", khung: "h-6 w-3" },
  duoi: { xep: "flex-col-reverse", xoay: "-rotate-90", keo: "-translate-x-1/2 -translate-y-full", khung: "h-6 w-3" },
};

export function AnhChuThich({
  src,
  alt,
  diem,
}: {
  src: string;
  alt: string;
  diem: Diem[];
}) {
  return (
    <figure>
      <div className="relative border border-hp-rule bg-hp-inset">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} loading="lazy" className="block w-full" />

        {diem.map((d, i) => {
          const k = KIEU[d.huong ?? "trai"];
          return (
            <span
              key={i}
              style={{ left: `${d.x}%`, top: `${d.y}%` }}
              className={`absolute flex items-center ${k.xep} ${k.keo}`}
            >
              <span aria-hidden className={`flex shrink-0 items-center justify-center ${k.khung}`}>
                <svg
                  viewBox="0 0 24 12"
                  className={`h-3 w-6 shrink-0 fill-hp-pink drop-shadow-[0_0_2px_rgba(255,255,255,0.9)] ${k.xoay}`}
                >
                  <path d="M0 6 L8 1 L8 4 L24 4 L24 8 L8 8 L8 11 Z" />
                </svg>
              </span>
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full
                           bg-hp-pink text-[12px] font-medium tabular-nums text-white
                           shadow-[0_0_0_3px_rgba(255,255,255,0.9)]"
              >
                {i + 1}
              </span>
            </span>
          );
        })}
      </div>

      <figcaption className="mt-4">
        <ol className="space-y-2">
          {diem.map((d, i) => (
            <li key={i} className="flex gap-3 text-sm leading-relaxed text-hp-body">
              <span
                className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center
                           rounded-full border border-hp-pink text-[11px] tabular-nums
                           text-hp-pink-strong"
              >
                {i + 1}
              </span>
              {d.chu}
            </li>
          ))}
        </ol>
      </figcaption>
    </figure>
  );
}

/** Cho hien khi anh chup chua co — tot hon mot o vo anh khong giai thich gi. */
export function ChuaCoAnh({ t }: { t: BoChu }) {
  return (
    <p
      className="border border-dashed border-hp-rule bg-hp-inset px-4 py-10
                 text-center text-xs text-hp-muted"
    >
      {t.huong_dan.chua_co_anh}
    </p>
  );
}
