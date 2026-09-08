"use client";

import { useActionState, useState } from "react";
import { themTaiKhoan } from "./actions";
import { useChu } from "@/messages/dung-chu";
import type { BoChu } from "@/messages";

const NHAN = "block text-[11px] uppercase tracking-[0.14em] text-hp-muted";
const O_NHAP =
  "mt-2 w-full border-0 border-b border-hp-rule bg-transparent px-0.5 py-1.5 " +
  "font-body text-base text-hp-body transition-colors duration-150 " +
  "focus:border-b-2 focus:border-hp-pink focus:pb-[5px] focus:outline-none";

function loiThanhChu(t: BoChu): Record<string, string> {
  return {
    email_khong_hop_le: t.nguoi_dung.email_khong_hop_le,
    thieu_ho_ten: t.nguoi_dung.thieu_ho_ten,
    mat_khau_qua_ngan: t.nguoi_dung.mat_khau_qua_ngan,
    mat_khau_qua_dai: t.nguoi_dung.mat_khau_qua_dai,
    email_da_ton_tai: t.nguoi_dung.email_da_ton_tai,
    loi_he_thong: t.nguoi_dung.loi_he_thong,
  };
}

export function ThemTaiKhoan() {
  const t = useChu();
  const [mo, setMo] = useState(false);
  const [loi, guiForm, dangChay] = useActionState(themTaiKhoan, null);
  // Form da gui thanh cong (loi === null) SAU khi tung chay — dung de bao xong.
  const [daGui, setDaGui] = useState(false);

  if (!mo) {
    return (
      <div className="mb-8">
        <button
          type="button"
          onClick={() => setMo(true)}
          className="border border-hp-ink bg-hp-ink px-5 py-2.5 text-[11px] uppercase
                     tracking-[0.14em] text-hp-foundation transition-colors duration-150
                     hover:border-hp-pink hover:bg-hp-pink"
        >
          {t.nguoi_dung.them_tieu_de}
        </button>
        {daGui && (
          <p className="mt-3 text-sm text-hp-body">{t.nguoi_dung.da_them}</p>
        )}
      </div>
    );
  }

  return (
    <section className="mb-10 border border-hp-rule bg-hp-card p-6">
      <h2 className="font-title text-xl leading-none text-hp-ink">
        {t.nguoi_dung.them_tieu_de}
      </h2>
      <p className="mt-2 text-xs text-hp-muted">{t.nguoi_dung.them_mo_ta}</p>

      {loi && (
        <p role="alert" className="mt-4 border-l-2 border-hp-pink bg-hp-inset px-4 py-3 text-sm text-hp-body">
          {loiThanhChu(t)[loi] ?? t.nguoi_dung.loi_he_thong}
        </p>
      )}

      <form
        action={(f) => {
          setDaGui(false);
          guiForm(f);
        }}
        onSubmit={() => setDaGui(true)}
        className="mt-5 grid gap-5 sm:grid-cols-2"
      >
        <div>
          <label className={NHAN} htmlFor="email">{t.nguoi_dung.o_email}</label>
          <input id="email" name="email" type="email" required autoComplete="off" className={O_NHAP} />
        </div>
        <div>
          <label className={NHAN} htmlFor="ho_ten">{t.nguoi_dung.o_ho_ten}</label>
          <input id="ho_ten" name="ho_ten" required autoComplete="off" className={O_NHAP} />
        </div>
        <div>
          <label className={NHAN} htmlFor="mat_khau">{t.nguoi_dung.o_mat_khau}</label>
          {/* new-password: khong de trinh duyet dien mat khau CUA ADMIN vao day. */}
          <input
            id="mat_khau"
            name="mat_khau"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className={O_NHAP}
          />
          <p className="mt-1 text-xs text-hp-muted">{t.nguoi_dung.goi_y_mat_khau}</p>
        </div>
        <div>
          <label className={NHAN} htmlFor="vai_tro">{t.nguoi_dung.o_vai_tro}</label>
          <select id="vai_tro" name="vai_tro" defaultValue="sale" className={`${O_NHAP} cursor-pointer`}>
            <option value="sale">{t.nguoi_dung.vai_tro_sale}</option>
            <option value="admin">{t.nguoi_dung.vai_tro_admin}</option>
          </select>
        </div>

        <div className="flex items-center gap-5 sm:col-span-2">
          <button
            type="submit"
            disabled={dangChay}
            className="border border-hp-ink bg-hp-ink px-6 py-2.5 text-[11px] uppercase
                       tracking-[0.14em] text-hp-foundation transition-colors duration-150
                       hover:border-hp-pink hover:bg-hp-pink
                       disabled:cursor-not-allowed disabled:opacity-40"
          >
            {dangChay ? t.nguoi_dung.dang_luu : t.nguoi_dung.nut_them}
          </button>
          <button
            type="button"
            onClick={() => setMo(false)}
            className="text-[11px] uppercase tracking-[0.14em] text-hp-muted
                       transition-colors duration-150 hover:text-hp-ink hover:underline"
          >
            {t.nguoi_dung.huy}
          </button>
        </div>
      </form>
    </section>
  );
}
