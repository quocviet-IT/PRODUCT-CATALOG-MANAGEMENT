"use client";

import { useActionState, useState } from "react";
import { Plus, Save, Trash2 } from "lucide-react";
import type { BoChu } from "@/messages";
import { useChu, useNgonNgu } from "@/messages/dung-chu";
import {
  DAI_TEN_VAI_TRO_TOI_DA,
  MUC_QUYEN,
  tenVaiTro,
  type MucQuyen,
  type VaiTro,
} from "@/modules/nguoi-dung/nguoi-dung.model";
import { NutGui } from "@/ui/nut-gui";
import { boVaiTro, luuVaiTro, themVaiTroMoi } from "./actions";

/**
 * Danh muc vai tro. Admin them "GSNB", "R&D", "Thuc tap sinh"... ma khong can
 * ai deploy lai.
 *
 * Man hinh nay phai noi that mot dieu de gay hieu nham: them mot vai tro la
 * them mot CAI TEN, khong phai them mot bac quyen. He thong chi cuong che hai
 * bac — quan tri va khong-phai-quan-tri — nen moi vai tro buoc phai chon mot
 * trong hai, va cot "Quyen" o day noi ro nguoi mang vai tro do lam duoc gi.
 */

const O_TIEU_DE =
  "whitespace-nowrap border-b border-hp-rule px-4 py-3 text-left " +
  "text-[11px] uppercase tracking-[0.14em] text-hp-muted";
const O = "border-b border-hp-rule px-4 py-3 align-middle text-sm text-hp-body";
const NUT =
  "inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.14em] " +
  "text-hp-muted transition-colors duration-150 hover:text-hp-ink " +
  "disabled:cursor-not-allowed disabled:opacity-40";
const LOP_ICON = "h-4 w-4 shrink-0";
const O_NHAP =
  "w-full border-0 border-b border-hp-rule bg-transparent px-0.5 py-1 text-sm " +
  "text-hp-body transition-colors duration-150 focus:border-b-2 " +
  "focus:border-hp-pink focus:pb-[3px] focus:outline-none";

function loiThanhChu(t: BoChu): Record<string, string> {
  return {
    thieu_ten_vai_tro: t.vai_tro.thieu_ten,
    ten_vai_tro_qua_dai: t.vai_tro.ten_qua_dai,
    ma_vai_tro_khong_hop_le: t.vai_tro.ma_khong_hop_le,
    vai_tro_da_ton_tai: t.vai_tro.da_ton_tai,
    vai_tro_he_thong: t.vai_tro.he_thong_khong_sua,
    vai_tro_dang_co_nguoi_giu: t.vai_tro.dang_co_nguoi_giu,
    loi_he_thong: t.nguoi_dung.loi_he_thong,
  };
}

function nhanMucQuyen(t: BoChu): Record<MucQuyen, string> {
  return { admin: t.vai_tro.quyen_admin, sale: t.vai_tro.quyen_sale };
}

function ChonMucQuyen({
  macDinh,
  tat,
  nhanAria,
  form,
}: {
  macDinh: MucQuyen;
  tat?: boolean;
  nhanAria: string;
  /**
   * Id cua form nay thuoc ve, khi o chon nam ngoai the <form>.
   *
   * Trong bang, moi hang la mot form nhung cac o trai ra nhieu <td> khac nhau,
   * ma <form> khong the om ngang qua cac o. Thieu thuoc tinh nay thi o chon
   * KHONG duoc gui di, va may chu se doc ra gia tri mac dinh "sale" — moi lan
   * sua ten vai tro se lang le ha quyen no xuong.
   */
  form?: string;
}) {
  const t = useChu();
  const nhan = nhanMucQuyen(t);
  return (
    <select
      form={form}
      name="muc_quyen"
      defaultValue={macDinh}
      disabled={tat}
      aria-label={nhanAria}
      className={`${O_NHAP} cursor-pointer disabled:cursor-not-allowed disabled:opacity-40`}
    >
      {MUC_QUYEN.map((q) => (
        <option key={q} value={q}>
          {nhan[q]}
        </option>
      ))}
    </select>
  );
}

/** Mot hang = mot form sua. Luu ca ten va muc quyen trong mot lan bam. */
function HangVaiTro({ v, soNguoi }: { v: VaiTro; soNguoi: number }) {
  const t = useChu();
  const nn = useNgonNgu();
  const [loi, luu, dangLuu] = useActionState(luuVaiTro, null);
  const [loiXoa, xoa, dangXoa] = useActionState(boVaiTro, null);
  const loiHien = loi ?? loiXoa;

  return (
    <tr className="bg-hp-card">
      <td className={O}>
        <form action={luu} id={`vt-${v.ma}`} className="contents">
          <input type="hidden" name="ma" value={v.ma} />
          <input
            name="ten"
            defaultValue={v.ten}
            required
            maxLength={DAI_TEN_VAI_TRO_TOI_DA}
            aria-label={`${t.vai_tro.cot_ten} — ${v.ten}`}
            className={O_NHAP}
          />
        </form>
      </td>
      <td className={O}>
        <input
          form={`vt-${v.ma}`}
          name="ten_en"
          defaultValue={v.tenEn}
          maxLength={DAI_TEN_VAI_TRO_TOI_DA}
          placeholder={t.vai_tro.trong_thi_dung_tieng_viet}
          aria-label={`${t.vai_tro.cot_ten_en} — ${v.ten}`}
          className={`${O_NHAP} placeholder:text-hp-muted/60`}
        />
      </td>
      <td className={`${O} whitespace-nowrap`}>
        <ChonMucQuyen
          form={`vt-${v.ma}`}
          macDinh={v.mucQuyen}
          // Ha muc quyen cua vai tro goc `admin` la khong con ai vao duoc man
          // hinh nay nua. May chu chan lan nua — day chi de nut khong moi
          // nguoi bam vao mot viec chac chan that bai.
          tat={v.heThong}
          nhanAria={`${t.vai_tro.cot_quyen} — ${tenVaiTro(v, nn === "en")}`}
        />
      </td>
      <td className={`${O} whitespace-nowrap tabular-nums`}>
        {soNguoi > 0 ? soNguoi : <span className="text-hp-muted">—</span>}
      </td>
      <td className={O}>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <NutGui
            form={`vt-${v.ma}`}
            dangChay={dangLuu}
            lop={NUT}
            nhanCho={<>
              <Save aria-hidden strokeWidth={1.5} className={LOP_ICON} />
              {t.nguoi_dung.dang_luu}
            </>}
          >
            <Save aria-hidden strokeWidth={1.5} className={LOP_ICON} />
            {t.vai_tro.luu}
          </NutGui>

          <form action={xoa} className="inline">
            <input type="hidden" name="ma" value={v.ma} />
            <NutGui
              dangChay={dangXoa}
              // Vai tro goc khong xoa duoc; vai tro con nguoi giu cung vay —
              // ho so cua ho se tro toi mot vai tro khong con ton tai.
              tat={v.heThong || soNguoi > 0}
              lop={NUT}
              nhanCho={<>
                <Trash2 aria-hidden strokeWidth={1.5} className={LOP_ICON} />
                {t.nguoi_dung.dang_chay}
              </>}
            >
              <Trash2 aria-hidden strokeWidth={1.5} className={LOP_ICON} />
              {t.vai_tro.xoa}
            </NutGui>
          </form>

          {loiHien && (
            <span className="text-xs text-hp-pink-strong">
              {loiThanhChu(t)[loiHien] ?? t.nguoi_dung.loi_he_thong}
            </span>
          )}
        </div>
      </td>
    </tr>
  );
}

function ThemVaiTro() {
  const t = useChu();
  const [loi, gui, dangChay] = useActionState(themVaiTroMoi, null);
  const [mo, setMo] = useState(false);

  if (!mo) {
    return (
      <button type="button" onClick={() => setMo(true)} className={`${NUT} mt-4`}>
        <Plus aria-hidden strokeWidth={1.5} className={LOP_ICON} />
        {t.vai_tro.them_tieu_de}
      </button>
    );
  }

  return (
    <form action={gui} className="mt-5 grid gap-5 border border-hp-rule bg-hp-card p-6 sm:grid-cols-3">
      <div>
        <label className="block text-[11px] uppercase tracking-[0.14em] text-hp-muted" htmlFor="vt-ten">
          {t.vai_tro.cot_ten}
        </label>
        <input
          id="vt-ten"
          name="ten"
          required
          maxLength={DAI_TEN_VAI_TRO_TOI_DA}
          autoComplete="off"
          placeholder={t.vai_tro.vi_du_ten}
          className={`${O_NHAP} mt-2 placeholder:text-hp-muted/60`}
        />
      </div>
      <div>
        <label className="block text-[11px] uppercase tracking-[0.14em] text-hp-muted" htmlFor="vt-ten-en">
          {t.vai_tro.cot_ten_en}
        </label>
        <input
          id="vt-ten-en"
          name="ten_en"
          maxLength={DAI_TEN_VAI_TRO_TOI_DA}
          autoComplete="off"
          placeholder={t.vai_tro.trong_thi_dung_tieng_viet}
          className={`${O_NHAP} mt-2 placeholder:text-hp-muted/60`}
        />
      </div>
      <div>
        <label className="block text-[11px] uppercase tracking-[0.14em] text-hp-muted" htmlFor="vt-quyen">
          {t.vai_tro.cot_quyen}
        </label>
        <div className="mt-2">
          <ChonMucQuyen macDinh="sale" nhanAria={t.vai_tro.cot_quyen} />
        </div>
      </div>

      <div className="flex items-center gap-5 sm:col-span-3">
        <NutGui
          dangChay={dangChay}
          lop="border border-hp-ink bg-hp-ink px-6 py-2.5 text-[11px] uppercase
               tracking-[0.14em] text-hp-foundation transition-colors duration-150
               hover:border-hp-pink hover:bg-hp-pink
               disabled:cursor-not-allowed disabled:opacity-40"
          nhanCho={t.nguoi_dung.dang_luu}
        >
          {t.vai_tro.nut_them}
        </NutGui>
        <button
          type="button"
          onClick={() => setMo(false)}
          className="text-[11px] uppercase tracking-[0.14em] text-hp-muted
                     transition-colors duration-150 hover:text-hp-ink hover:underline"
        >
          {t.nguoi_dung.huy}
        </button>
        {loi && (
          <span className="text-xs text-hp-pink-strong">
            {loiThanhChu(t)[loi] ?? t.nguoi_dung.loi_he_thong}
          </span>
        )}
      </div>
    </form>
  );
}

export function QuanLyVaiTro({
  vaiTros,
  dem,
}: {
  vaiTros: readonly VaiTro[];
  dem: Record<string, number>;
}) {
  const t = useChu();
  return (
    <section className="mb-10">
      <h2 className="font-title text-xl leading-none text-hp-ink">{t.vai_tro.tieu_de}</h2>
      <p className="mt-2 max-w-2xl text-xs text-hp-muted">{t.vai_tro.mo_ta}</p>

      <div className="mt-5 overflow-x-auto border border-hp-rule">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-hp-inset">
              <th className={O_TIEU_DE}>{t.vai_tro.cot_ten}</th>
              <th className={O_TIEU_DE}>{t.vai_tro.cot_ten_en}</th>
              <th className={O_TIEU_DE}>{t.vai_tro.cot_quyen}</th>
              <th className={O_TIEU_DE}>{t.vai_tro.cot_so_nguoi}</th>
              <th className={O_TIEU_DE}>{t.nguoi_dung.cot_thao_tac}</th>
            </tr>
          </thead>
          <tbody>
            {vaiTros.map((v) => (
              <HangVaiTro key={v.ma} v={v} soNguoi={dem[v.ma] ?? 0} />
            ))}
          </tbody>
        </table>
      </div>

      <ThemVaiTro />
    </section>
  );
}
