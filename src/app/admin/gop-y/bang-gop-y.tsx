"use client";

import { useActionState } from "react";
import { Check, ImageIcon, RotateCcw } from "lucide-react";
import type { BoChu } from "@/messages";
import { useChu, useNgonNgu } from "@/messages/dung-chu";
import { MA_HTML } from "@/messages/ngon-ngu";
import type { GopYHang } from "@/modules/gop-y/gop-y.service";
import { NutGui } from "@/ui/nut-gui";
import { doiTrangThaiGopY } from "./actions";

const O_TIEU_DE =
  "whitespace-nowrap border-b border-hp-rule px-4 py-3 text-left " +
  "text-[11px] uppercase tracking-[0.14em] text-hp-muted";
const O = "border-b border-hp-rule px-4 py-3 align-top text-sm text-hp-body";
const NUT =
  "inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.14em] " +
  "text-hp-muted transition-colors duration-150 hover:text-hp-ink " +
  "disabled:cursor-not-allowed disabled:opacity-40";
const ICON = { "aria-hidden": true, strokeWidth: 1.5, className: "h-4 w-4 shrink-0" } as const;

function NutDoi({ g, t }: { g: GopYHang; t: BoChu }) {
  const [loi, gui, dangChay] = useActionState(doiTrangThaiGopY, null);
  const daXuLy = g.trangThai === "da-xu-ly";
  return (
    <form action={gui} className="inline">
      <input type="hidden" name="id" value={g.id} />
      <input type="hidden" name="trang_thai" value={daXuLy ? "moi" : "da-xu-ly"} />
      <NutGui
        dangChay={dangChay}
        lop={NUT}
        nhanCho={<>{daXuLy ? <RotateCcw {...ICON} /> : <Check {...ICON} />}{t.nguoi_dung.dang_chay}</>}
      >
        {daXuLy ? <RotateCcw {...ICON} /> : <Check {...ICON} />}
        {daXuLy ? t.gop_y.mo_lai : t.gop_y.danh_dau_xong}
      </NutGui>
      {loi && <span className="ml-2 text-xs text-hp-pink-strong">{t.nguoi_dung.loi_he_thong}</span>}
    </form>
  );
}

export function BangGopY({ ds }: { ds: GopYHang[] }) {
  const t = useChu();
  const nn = useNgonNgu();

  if (ds.length === 0) {
    return <p className="text-sm text-hp-muted">{t.gop_y.chua_co}</p>;
  }

  return (
    <div className="overflow-x-auto border border-hp-rule">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-hp-inset">
            <th className={O_TIEU_DE}>{t.gop_y.cot_loai}</th>
            <th className={O_TIEU_DE}>{t.gop_y.cot_noi_dung}</th>
            <th className={O_TIEU_DE}>{t.gop_y.cot_man_hinh}</th>
            <th className={O_TIEU_DE}>{t.gop_y.cot_nguoi_gui}</th>
            <th className={O_TIEU_DE}>{t.gop_y.cot_luc}</th>
            <th className={O_TIEU_DE}>{t.nguoi_dung.cot_thao_tac}</th>
          </tr>
        </thead>
        <tbody>
          {ds.map((g) => {
            const daXuLy = g.trangThai === "da-xu-ly";
            return (
              <tr key={g.id} className={daXuLy ? "bg-hp-card opacity-55" : "bg-hp-card"}>
                <td className={`${O} whitespace-nowrap`}>
                  {g.loai === "hong" ? (
                    <span className="text-hp-pink-strong">{t.gop_y.loai_hong_ngan}</span>
                  ) : (
                    t.gop_y.loai_y_kien_ngan
                  )}
                </td>
                {/* whitespace-pre-line: nguoi go xuong dong de tach y, nuot mat
                    cac dau xuong dong la dinh ba y vao mot khoi kho doc. */}
                <td className={`${O} min-w-[24rem] whitespace-pre-line`}>
                  {g.noiDung}
                  {g.coAnh && (
                    <a
                      href={`/api/gop-y/anh/${g.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 flex w-fit items-center gap-1.5 text-[11px] uppercase
                                 tracking-[0.14em] text-hp-muted transition-colors duration-150
                                 hover:text-hp-ink hover:underline"
                    >
                      <ImageIcon {...ICON} />
                      {t.gop_y.xem}
                    </a>
                  )}
                </td>
                <td className={`${O} whitespace-nowrap text-xs text-hp-muted`}>
                  {g.duongDan || "—"}
                </td>
                <td className={`${O} whitespace-nowrap text-xs`}>
                  {g.hoTen ?? g.nguoiGuiEmail}
                  <span className="block text-hp-muted">{g.nguoiGuiEmail}</span>
                </td>
                <td className={`${O} whitespace-nowrap tabular-nums text-xs`}>
                  {new Date(g.taoLuc).toLocaleString(MA_HTML[nn])}
                </td>
                <td className={O}>
                  <NutDoi g={g} t={t} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
