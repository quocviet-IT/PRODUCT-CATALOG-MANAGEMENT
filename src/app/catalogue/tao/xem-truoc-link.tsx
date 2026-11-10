"use client";

import { useChu } from "@/messages/dung-chu";
import { chuanHoaSlug } from "@/modules/catalogue-share/chia-se.model";
import { useGocLink } from "@/ui/goc-link";

/**
 * Dong "Link se la …" duoi o ten link tren man hinh tao catalogue.
 *
 * Tinh bang CUNG ham chuanHoaSlug voi may chu va CUNG thu tu lui: ten link → ten
 * catalogue → "catalogue-<so>" (xem taoCatalogue). Ma cuoi chua co — may chu chi
 * sinh no luc tao — nen hien bang dau cham, kem mot cau noi vi sao co no.
 */
export function XemTruocLink({ tenLink, ten }: { tenLink: string; ten: string }) {
  const t = useChu();
  // Cung goc voi link se chep ra (xem useGocLink), bo phan https:// cho gon.
  const host = useGocLink().replace(/^https?:\/\//, "");
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
