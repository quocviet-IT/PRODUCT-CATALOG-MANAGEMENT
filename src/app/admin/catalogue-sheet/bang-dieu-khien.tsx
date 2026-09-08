import Link from "next/link";
import { Barcode, Copy, Gem, ImageOff, Scale, type LucideIcon } from "lucide-react";
import type { CoBatThuong } from "@/modules/sheet/catalogue.mapper";
import type { ThongKe } from "@/modules/sheet/catalogue.view";
import type { BoChu } from "@/messages";

/**
 * Bang chi so dau man hinh catalogue.
 *
 * Truoc day day chi la nam con so nam canh nhau. Nguoi dung doc "21 thieu SKU"
 * roi phai tu di mo o loc "Canh bao" chon dung muc do — hai buoc cho mot viec
 * hien nhien. Gio moi o LA mot bo loc: bam vao la thay dung nhung mau do, bam
 * lan nua la bo.
 *
 * Moi o co them mot vach ty le. Con so tran khong noi duoc "21" la nhieu hay
 * it; vach cho thay ngay no chiem bao nhieu phan cua kho.
 *
 * Vach dung mau muc chu KHONG dung hong: ngan sach hong cua he thiet ke chi cho
 * ba diem moi man hinh, va o day da co logo hong roi.
 */

type OChiSo = {
  co: CoBatThuong;
  so: number;
  nhan: string;
  Icon: LucideIcon;
};

function phanTram(so: number, tong: number): number {
  return tong === 0 ? 0 : Math.round((so / tong) * 100);
}

/** Duong dan bat/tat mot canh bao, giu nguyen moi tham so khac va ve trang 1. */
function urlLoc(
  sp: Record<string, string | undefined>,
  thamSoCanhBao: string,
  co: CoBatThuong | null,
): string {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    if (v && k !== thamSoCanhBao && k !== "trang") q.set(k, v);
  }
  if (co) q.set(thamSoCanhBao, co);
  const s = q.toString();
  return s ? `/admin/catalogue-sheet?${s}` : "/admin/catalogue-sheet";
}

function O({
  so,
  tong,
  nhan,
  Icon,
  href,
  dangBat,
  tieuDe,
}: {
  so: number;
  tong: number;
  nhan: string;
  Icon: LucideIcon;
  href: string;
  dangBat: boolean;
  tieuDe: string;
}) {
  const tyLe = phanTram(so, tong);
  return (
    <Link
      href={href}
      title={tieuDe}
      aria-current={dangBat ? "true" : undefined}
      className={
        "group flex flex-col justify-between gap-6 border p-5 " +
        "transition-colors duration-150 " +
        (dangBat
          ? "border-hp-ink bg-hp-inset"
          : "border-hp-rule bg-hp-card hover:border-hp-ink")
      }
    >
      <div className="flex items-start justify-between gap-3">
        {/* So 0 phai TRONG nhu 0: mot con so mau muc dam nhu cac o khac se
            khien nguoi doc tuong co van de trong khi khong co van de nao. */}
        <span
          className={`font-title text-[32px] leading-none tabular-nums
                      ${so === 0 ? "text-hp-muted" : "text-hp-ink"}`}
        >
          {so}
        </span>
        <Icon
          aria-hidden
          strokeWidth={1.25}
          className={`h-5 w-5 shrink-0 transition-colors duration-150
                      ${dangBat ? "text-hp-ink" : "text-hp-rule group-hover:text-hp-muted"}`}
        />
      </div>

      <div>
        <span className="block text-[11px] uppercase tracking-[0.14em] text-hp-muted">
          {nhan}
        </span>
        {/* Vach ty le: cho thay con so nay chiem bao nhieu phan cua kho.
            2px chu khong phai 1px — o ty le nho (2/71) mot vach mot cham gan
            nhu khong nhin thay, va luc do vach khong con noi duoc gi. */}
        <span aria-hidden className="mt-3 block h-0.5 w-full bg-hp-rule">
          <span
            className={`block h-0.5 ${so === 0 ? "" : "bg-hp-ink"}`}
            // Ty le duoi 1.5% van phai thay duoc la CO, khong phai bang khong.
            style={{ width: so === 0 ? "0%" : `max(2px, ${tyLe}%)` }}
          />
        </span>
      </div>
    </Link>
  );
}

export function BangDieuKhien({
  thongKe,
  thongKeHien,
  dangLoc,
  canhBaoDangBat,
  thamSoCanhBao,
  sp,
  t,
}: {
  /** Toan kho, khong loc — mau so cua moi ty le. */
  thongKe: ThongKe;
  /** Sau khi loc — con so hien tren tung o. */
  thongKeHien: ThongKe;
  dangLoc: boolean;
  canhBaoDangBat: readonly CoBatThuong[];
  thamSoCanhBao: string;
  sp: Record<string, string | undefined>;
  t: BoChu;
}) {
  const o: OChiSo[] = [
    { co: "thieu-anh", so: thongKeHien.thieuAnh, nhan: t.catalogue_sheet.dem_thieu_anh, Icon: ImageOff },
    { co: "thieu-sku", so: thongKeHien.thieuSku, nhan: t.catalogue_sheet.dem_thieu_sku, Icon: Barcode },
    { co: "tl-vang-lech", so: thongKeHien.tlVangLech, nhan: t.catalogue_sheet.dem_tl_vang_lech, Icon: Scale },
    { co: "trung", so: thongKeHien.trung, nhan: t.catalogue_sheet.dem_trung, Icon: Copy },
  ];

  return (
    <div className="mb-10">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {/* O tong: khong phai bo loc ma la loi ve — bam vao la xoa moi canh bao. */}
        <Link
          href={urlLoc(sp, thamSoCanhBao, null)}
          title={t.catalogue_sheet.dashboard_xem_het}
          className={
            "group flex flex-col justify-between gap-6 border p-5 " +
            "transition-colors duration-150 " +
            (canhBaoDangBat.length === 0
              ? "border-hp-ink bg-hp-inset"
              : "border-hp-rule bg-hp-card hover:border-hp-ink")
          }
        >
          <div className="flex items-start justify-between gap-3">
            <span className="font-title text-[32px] leading-none tabular-nums text-hp-ink">
              {thongKeHien.tong}
              {dangLoc && (
                <span className="text-xl text-hp-muted"> / {thongKe.tong}</span>
              )}
            </span>
            <Gem
              aria-hidden
              strokeWidth={1.25}
              className="h-5 w-5 shrink-0 text-hp-rule transition-colors duration-150 group-hover:text-hp-muted"
            />
          </div>
          <div>
            <span className="block text-[11px] uppercase tracking-[0.14em] text-hp-muted">
              {t.catalogue_sheet.dem_mau}
            </span>
            {/* "Du du lieu" = khong dinh canh bao nao. Dem rieng chu khong lay
                tong tru bon con so ben canh: mot mau vua thieu anh vua thieu
                SKU se bi tru hai lan. */}
            <span className="mt-3 block text-xs tabular-nums text-hp-muted">
              {thongKe.duDuLieu}/{thongKe.tong} {t.catalogue_sheet.dem_du_du_lieu.toLowerCase()}
              {" · "}
              {t.catalogue_sheet.dem_ty_le.replace(
                "{n}",
                String(phanTram(thongKe.duDuLieu, thongKe.tong)),
              )}
            </span>
          </div>
        </Link>

        {o.map((x) => {
          const bat = canhBaoDangBat.includes(x.co);
          return (
            <O
              key={x.co}
              so={x.so}
              tong={thongKe.tong}
              nhan={x.nhan}
              Icon={x.Icon}
              dangBat={bat}
              href={urlLoc(sp, thamSoCanhBao, bat ? null : x.co)}
              tieuDe={(bat
                ? t.catalogue_sheet.dashboard_bo_loc
                : t.catalogue_sheet.dashboard_loc
              ).replace("{nhan}", x.nhan)}
            />
          );
        })}
      </div>
    </div>
  );
}
