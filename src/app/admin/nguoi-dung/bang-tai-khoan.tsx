"use client";

import { useActionState, useState } from "react";
import type { CachDangNhap } from "@/modules/nguoi-dung/nguoi-dung.model";
import type { NguoiDungHang } from "@/modules/nguoi-dung/nguoi-dung.service";
import { datLaiMatKhau, doiTrangThai, doiVaiTro } from "./actions";
import { vi } from "@/messages/vi";

const O_TIEU_DE =
  "whitespace-nowrap border-b border-hp-rule px-4 py-3 text-left " +
  "text-[11px] uppercase tracking-[0.14em] text-hp-muted";
const O = "border-b border-hp-rule px-4 py-3 align-middle text-sm text-hp-body";
const NUT =
  "text-[11px] uppercase tracking-[0.14em] text-hp-muted " +
  "transition-colors duration-150 hover:text-hp-ink hover:underline " +
  "disabled:cursor-not-allowed disabled:opacity-40";

const NHAN_CACH: Record<CachDangNhap, string> = {
  google: vi.nguoi_dung.vao_google,
  "mat-khau": vi.nguoi_dung.vao_mat_khau,
  "ca-hai": vi.nguoi_dung.vao_ca_hai,
  khac: vi.nguoi_dung.vao_khac,
};

const LOI: Record<string, string> = {
  mat_khau_qua_ngan: vi.nguoi_dung.mat_khau_qua_ngan,
  mat_khau_qua_dai: vi.nguoi_dung.mat_khau_qua_dai,
  tu_khoa_chinh_minh: vi.nguoi_dung.tu_khoa_chinh_minh,
  tu_ha_quyen_chinh_minh: vi.nguoi_dung.tu_ha_quyen_chinh_minh,
  loi_he_thong: vi.nguoi_dung.loi_he_thong,
};

function ngay(d: Date | null): string {
  return d ? new Date(d).toLocaleDateString("vi-VN") : vi.nguoi_dung.chua_vao_lan_nao;
}

/** Mot form mot nut — dung cho khoa/mo khoa va doi vai tro. */
function NutHanhDong({
  hanhDong,
  truong,
  nhan,
  tat,
}: {
  hanhDong: (truoc: string | null, form: FormData) => Promise<string | null>;
  truong: Record<string, string>;
  nhan: string;
  tat?: boolean;
}) {
  const [loi, gui, dangChay] = useActionState(hanhDong, null);
  return (
    <form action={gui} className="inline">
      {Object.entries(truong).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
      <button type="submit" disabled={tat || dangChay} className={NUT}>
        {nhan}
      </button>
      {loi && <span className="ml-2 text-xs text-hp-pink-strong">{LOI[loi] ?? loi}</span>}
    </form>
  );
}

function DatMatKhau({ id, tenHien }: { id: string; tenHien: string }) {
  const [mo, setMo] = useState(false);
  const [loi, gui, dangChay] = useActionState(datLaiMatKhau, null);
  const [xong, setXong] = useState(false);

  if (!mo) {
    return (
      <>
        <button type="button" onClick={() => setMo(true)} className={NUT}>
          {vi.nguoi_dung.dat_mat_khau}
        </button>
        {xong && <span className="ml-2 text-xs text-hp-muted">{vi.nguoi_dung.da_doi_mat_khau}</span>}
      </>
    );
  }

  return (
    <form
      action={(f) => {
        setXong(true);
        gui(f);
      }}
      className="flex flex-wrap items-center gap-2"
    >
      <input type="hidden" name="id" value={id} />
      <input
        name="mat_khau"
        type="password"
        required
        minLength={8}
        autoComplete="new-password"
        aria-label={`${vi.nguoi_dung.dat_mat_khau} — ${tenHien}`}
        className="w-40 border-0 border-b border-hp-rule bg-transparent px-0.5 py-1 text-sm
                   text-hp-body transition-colors duration-150 focus:border-b-2
                   focus:border-hp-pink focus:pb-[3px] focus:outline-none"
      />
      <button type="submit" disabled={dangChay} className={NUT}>
        {dangChay ? vi.nguoi_dung.dang_luu : vi.nguoi_dung.dat_mat_khau}
      </button>
      <button type="button" onClick={() => setMo(false)} className={NUT}>
        {vi.nguoi_dung.huy}
      </button>
      {loi && <span className="text-xs text-hp-pink-strong">{LOI[loi] ?? loi}</span>}
    </form>
  );
}

export function BangTaiKhoan({ ds, idCuaToi }: { ds: NguoiDungHang[]; idCuaToi: string }) {
  return (
    <div className="overflow-x-auto border border-hp-rule">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-hp-inset">
            <th className={O_TIEU_DE}>{vi.nguoi_dung.cot_email}</th>
            <th className={O_TIEU_DE}>{vi.nguoi_dung.cot_ho_ten}</th>
            <th className={O_TIEU_DE}>{vi.nguoi_dung.cot_vai_tro}</th>
            <th className={O_TIEU_DE}>{vi.nguoi_dung.cot_cach_vao}</th>
            <th className={O_TIEU_DE}>{vi.nguoi_dung.cot_lan_cuoi}</th>
            <th className={O_TIEU_DE}>{vi.nguoi_dung.cot_trang_thai}</th>
            <th className={O_TIEU_DE}>{vi.nguoi_dung.cot_thao_tac}</th>
          </tr>
        </thead>
        <tbody>
          {ds.map((u) => {
            const laToi = u.id === idCuaToi;
            return (
              <tr key={u.id} className="bg-hp-card">
                <td className={`${O} whitespace-nowrap text-hp-ink`}>
                  {u.email}
                  {laToi && <span className="ml-2 text-xs text-hp-muted">{vi.nguoi_dung.la_ban}</span>}
                </td>
                <td className={O}>{u.hoTen}</td>
                <td className={`${O} whitespace-nowrap`}>
                  {u.vaiTro === "admin" ? vi.nguoi_dung.vai_tro_admin : vi.nguoi_dung.vai_tro_sale}
                </td>
                <td className={`${O} whitespace-nowrap`}>
                  {u.cachDangNhap ? NHAN_CACH[u.cachDangNhap] : vi.nguoi_dung.vao_khac}
                </td>
                <td className={`${O} whitespace-nowrap tabular-nums`}>{ngay(u.lanCuoiDangNhap)}</td>
                <td className={`${O} whitespace-nowrap`}>
                  {u.dangHoatDong ? (
                    vi.nguoi_dung.dang_hoat_dong
                  ) : (
                    <span className="text-hp-pink-strong">{vi.nguoi_dung.da_khoa}</span>
                  )}
                </td>
                <td className={O}>
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                    <DatMatKhau id={u.id} tenHien={u.email} />
                    <NutHanhDong
                      hanhDong={doiTrangThai}
                      truong={{ id: u.id, bat: u.dangHoatDong ? "0" : "1" }}
                      nhan={u.dangHoatDong ? vi.nguoi_dung.khoa : vi.nguoi_dung.mo_khoa}
                      // Tu khoa chinh minh la khong con ai vao duoc man hinh
                      // nay. Server van chan lan nua — day chi la de nut khong
                      // moi nguoi bam vao mot viec chac chan that bai.
                      tat={laToi && u.dangHoatDong}
                    />
                    <NutHanhDong
                      hanhDong={doiVaiTro}
                      truong={{ id: u.id, vai_tro: u.vaiTro === "admin" ? "sale" : "admin" }}
                      nhan={u.vaiTro === "admin" ? vi.nguoi_dung.xuong_sale : vi.nguoi_dung.len_admin}
                      tat={laToi && u.vaiTro === "admin"}
                    />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
