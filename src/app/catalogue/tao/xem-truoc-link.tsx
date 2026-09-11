"use client";

import { useSyncExternalStore } from "react";
import { useChu } from "@/messages/dung-chu";
import { chuanHoaSlug } from "@/modules/catalogue-share/chia-se.model";

/**
 * Dong "Link se la …" duoi o ten link tren man hinh tao catalogue.
 *
 * Tinh bang CUNG ham chuanHoaSlug voi may chu va CUNG thu tu lui: ten link → ten
 * catalogue → "catalogue-<so>" (xem taoCatalogue). Ma cuoi chua co — may chu chi
 * sinh no luc tao — nen hien bang dau cham, kem mot cau noi vi sao co no.
 */
export function XemTruocLink({ tenLink, ten }: { tenLink: string; ten: string }) {
  const t = useChu();
  // Ten mien lay tu trinh duyet: he thong chay o ca hpcatalogue.app, ban xem thu
  // tren Vercel va localhost. Khong bao gio doi giua chung nen nguoi nghe rong.
  const host = useSyncExternalStore(
    () => () => {},
    () => window.location.host,
    () => "",
  );
  const phanTen = chuanHoaSlug(tenLink) || chuanHoaSlug(ten) || t.chia_se.ten_link_mac_dinh;

  return (
    <div className="mt-2 text-xs text-hp-muted">
      <p className="break-all">
        {t.chia_se.ten_link_se_la}{" "}
        <span className="text-hp-body">
          {host}/catalogue/{phanTen}-
        </span>
        <span aria-hidden className="tracking-[0.2em]">········</span>
      </p>
      <p className="mt-1">{t.chia_se.ten_link_ma}</p>
    </div>
  );
}
