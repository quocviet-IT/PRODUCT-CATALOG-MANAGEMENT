"use client";

import { useActionState, useState } from "react";
import {
  MUC_HOAT_DONG,
  tenVaiTro,
  type CachDangNhap,
  type MucHoatDong,
  type VaiTro,
} from "@/modules/nguoi-dung/nguoi-dung.model";
import type { NguoiDungHang } from "@/modules/nguoi-dung/nguoi-dung.service";
import { datLaiMatKhau, doiTrangThai, doiVaiTro } from "./actions";
import { ChonVaiTro } from "./chon-vai-tro";
import { KeyRound, Lock, LockOpen, Shield, type LucideIcon } from "lucide-react";
import { useChu, useNgonNgu } from "@/messages/dung-chu";
import type { BoChu } from "@/messages";
import { MA_HTML, type NgonNgu } from "@/messages/ngon-ngu";
import { NutGui } from "@/ui/nut-gui";

const O_TIEU_DE =
  "whitespace-nowrap border-b border-hp-rule px-4 py-3 text-left " +
  "text-[11px] uppercase tracking-[0.14em] text-hp-muted";
const O = "border-b border-hp-rule px-4 py-3 align-middle text-sm text-hp-body";
const NUT =
  "inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.14em] " +
  "text-hp-muted transition-colors duration-150 hover:text-hp-ink " +
  "disabled:cursor-not-allowed disabled:opacity-40";
const LOP_ICON = "h-4 w-4 shrink-0";
/** Cham hoat dong — cung mot hinh o bang va o dong chu giai. */
const CHAM = "inline-block h-2 w-2 shrink-0 rounded-full";
/** Ten lop viet san day du: Tailwind chi sinh lop ma no doc thay nguyen van trong ma nguon. */
const LOP_CHAM: Record<MucHoatDong, string> = {
  "trong-ngay": "bg-hp-hoat-dong-ngay",
  "trong-tuan": "bg-hp-hoat-dong-tuan",
  lau: "bg-hp-hoat-dong-lau",
};

function nhanCach(t: BoChu): Record<CachDangNhap, string> {
  return {
    google: t.nguoi_dung.vao_google,
    "mat-khau": t.nguoi_dung.vao_mat_khau,
    "ca-hai": t.nguoi_dung.vao_ca_hai,
    khac: t.nguoi_dung.vao_khac,
  };
}

function nhanHoatDong(t: BoChu): Record<MucHoatDong, string> {
  return {
    "trong-ngay": t.nguoi_dung.hoat_dong_trong_ngay,
    "trong-tuan": t.nguoi_dung.hoat_dong_trong_tuan,
    lau: t.nguoi_dung.hoat_dong_lau,
  };
}

function loiThanhChu(t: BoChu): Record<string, string> {
  return {
    mat_khau_qua_ngan: t.nguoi_dung.mat_khau_qua_ngan,
    mat_khau_qua_dai: t.nguoi_dung.mat_khau_qua_dai,
    tu_khoa_chinh_minh: t.nguoi_dung.tu_khoa_chinh_minh,
    tu_ha_quyen_chinh_minh: t.nguoi_dung.tu_ha_quyen_chinh_minh,
    vai_tro_he_thong: t.vai_tro.he_thong_khong_sua,
    loi_he_thong: t.nguoi_dung.loi_he_thong,
  };
}

/** Ngay theo dung ngon ngu dang xem: 7/9/2026 o tieng Viet, 9/7/2026 o tieng Anh. */
function ngay(d: Date | null, nn: NgonNgu, t: BoChu): string {
  return d
    ? new Date(d).toLocaleDateString(MA_HTML[nn])
    : t.nguoi_dung.chua_vao_lan_nao;
}

/** Mot form mot nut — dung cho khoa/mo khoa va doi vai tro. */
function NutHanhDong({
  hanhDong,
  truong,
  nhan,
  Icon,
  tat,
}: {
  hanhDong: (truoc: string | null, form: FormData) => Promise<string | null>;
  truong: Record<string, string>;
  nhan: string;
  Icon: LucideIcon;
  tat?: boolean;
}) {
  const t = useChu();
  const [loi, gui, dangChay] = useActionState(hanhDong, null);
  return (
    <form action={gui} className="inline">
      {Object.entries(truong).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
      <NutGui
        dangChay={dangChay}
        tat={tat}
        lop={NUT}
        nhanCho={<>
          <Icon aria-hidden strokeWidth={1.5} className={LOP_ICON} />
          {t.nguoi_dung.dang_chay}
        </>}
      >
        <Icon aria-hidden strokeWidth={1.5} className={LOP_ICON} />
        {nhan}
      </NutGui>
      {loi && <span className="ml-2 text-xs text-hp-pink-strong">{loiThanhChu(t)[loi] ?? loi}</span>}
    </form>
  );
}

/**
 * Doi vai tro cua mot tai khoan.
 *
 * Truoc day day la mot nut bat-tat giua admin va sale. Gio vai tro la du lieu
 * nen phai la mot o CHON — mot nut khong the dua ra sau lua chon.
 *
 * Nut Luu chi bat khi gia tri da khac: mot nut luon bam duoc trong khi khong
 * co gi de luu khien nguoi dung bam thu de xem co gi doi khong.
 */
function DoiVaiTro({ u, vaiTros }: { u: NguoiDungHang; vaiTros: readonly VaiTro[] }) {
  const t = useChu();
  const [chon, setChon] = useState(u.vaiTro);
  const [loi, gui, dangChay] = useActionState(doiVaiTro, null);

  return (
    <form action={gui} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="id" value={u.id} />
      <ChonVaiTro
        vaiTros={vaiTros}
        giaTri={chon}
        onChange={setChon}
        nhanAria={`${t.nguoi_dung.cot_vai_tro} — ${u.email}`}
        lop="cursor-pointer border-0 border-b border-hp-rule bg-transparent px-0.5 py-1
             text-sm text-hp-body transition-colors duration-150 focus:border-b-2
             focus:border-hp-pink focus:pb-[3px] focus:outline-none"
      />
      <NutGui
        dangChay={dangChay}
        tat={chon === u.vaiTro}
        lop={NUT}
        nhanCho={<>
          <Shield aria-hidden strokeWidth={1.5} className={LOP_ICON} />
          {t.nguoi_dung.dang_chay}
        </>}
      >
        <Shield aria-hidden strokeWidth={1.5} className={LOP_ICON} />
        {t.nguoi_dung.doi_vai_tro}
      </NutGui>
      {loi && <span className="text-xs text-hp-pink-strong">{loiThanhChu(t)[loi] ?? loi}</span>}
    </form>
  );
}

function DatMatKhau({ id, tenHien }: { id: string; tenHien: string }) {
  const t = useChu();
  const [mo, setMo] = useState(false);
  const [loi, gui, dangChay] = useActionState(datLaiMatKhau, null);
  const [xong, setXong] = useState(false);

  if (!mo) {
    return (
      <>
        <button type="button" onClick={() => setMo(true)} className={NUT}>
          <KeyRound aria-hidden strokeWidth={1.5} className={LOP_ICON} />
          {t.nguoi_dung.dat_mat_khau}
        </button>
        {xong && <span className="ml-2 text-xs text-hp-muted">{t.nguoi_dung.da_doi_mat_khau}</span>}
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
        aria-label={`${t.nguoi_dung.dat_mat_khau} — ${tenHien}`}
        className="w-40 border-0 border-b border-hp-rule bg-transparent px-0.5 py-1 text-sm
                   text-hp-body transition-colors duration-150 focus:border-b-2
                   focus:border-hp-pink focus:pb-[3px] focus:outline-none"
      />
      <button type="submit" disabled={dangChay} className={NUT}>
        {dangChay ? t.nguoi_dung.dang_luu : t.nguoi_dung.dat_mat_khau}
      </button>
      <button type="button" onClick={() => setMo(false)} className={NUT}>
        {t.nguoi_dung.huy}
      </button>
      {loi && <span className="text-xs text-hp-pink-strong">{loiThanhChu(t)[loi] ?? loi}</span>}
    </form>
  );
}

/**
 * Dong chu giai ngay tren bang: xanh, vang, xam theo thu tu MUC_HOAT_DONG.
 * aria-label dat ten cho danh sach de trinh doc man hinh doc ra day la chu giai mau.
 */
function ChuGiaiHoatDong() {
  const t = useChu();
  const nhan = nhanHoatDong(t);
  return (
    <ul
      aria-label={t.nguoi_dung.chu_giai_hoat_dong}
      className="mb-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-hp-muted"
    >
      {MUC_HOAT_DONG.map((m) => (
        <li key={m} className="inline-flex items-center gap-2">
          <span aria-hidden className={`${CHAM} ${LOP_CHAM[m]}`} />
          {nhan[m]}
        </li>
      ))}
    </ul>
  );
}

export function BangTaiKhoan({
  ds,
  idCuaToi,
  vaiTros,
}: {
  ds: NguoiDungHang[];
  idCuaToi: string;
  vaiTros: readonly VaiTro[];
}) {
  const t = useChu();
  const nn = useNgonNgu();
  const cach = nhanCach(t);
  const nhanMuc = nhanHoatDong(t);
  /** Ma vai tro -> ten hien. Ma la la thi hien nguyen ma, hon la hien trong khong. */
  const ten = (ma: string) => {
    const v = vaiTros.find((x) => x.ma === ma);
    return v ? tenVaiTro(v, nn === "en") : ma;
  };
  return (
    <>
      <ChuGiaiHoatDong />
      <div className="overflow-x-auto border border-hp-rule">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-hp-inset">
              <th className={O_TIEU_DE}>{t.nguoi_dung.cot_email}</th>
              <th className={O_TIEU_DE}>{t.nguoi_dung.cot_ho_ten}</th>
              <th className={O_TIEU_DE}>{t.nguoi_dung.cot_vai_tro}</th>
              <th className={O_TIEU_DE}>{t.nguoi_dung.cot_cach_vao}</th>
              <th className={O_TIEU_DE}>{t.nguoi_dung.cot_lan_cuoi}</th>
              <th className={O_TIEU_DE}>{t.nguoi_dung.cot_trang_thai}</th>
              <th className={O_TIEU_DE}>{t.nguoi_dung.cot_thao_tac}</th>
            </tr>
          </thead>
          <tbody>
            {ds.map((u) => {
              const laToi = u.id === idCuaToi;
              return (
                <tr key={u.id} className="bg-hp-card">
                  <td className={`${O} whitespace-nowrap text-hp-ink`}>
                    {/* Cham: mau cho mat, title khi re chuot, chu an cho trinh doc man hinh.
                        Ngay o cot Lan cuoi vao la kenh thu hai — thong tin khong chi nam o mau. */}
                    <span
                      aria-hidden
                      title={nhanMuc[u.mucHoatDong]}
                      data-muc-hoat-dong={u.mucHoatDong}
                      className={`${CHAM} ${LOP_CHAM[u.mucHoatDong]} mr-2 align-middle`}
                    />
                    <span className="sr-only">{nhanMuc[u.mucHoatDong]}</span>
                    <span data-email>{u.email}</span>
                    {laToi && <span className="ml-2 text-xs text-hp-muted">{t.nguoi_dung.la_ban}</span>}
                  </td>
                  <td className={O}>{u.hoTen}</td>
                  <td className={`${O} whitespace-nowrap`}>{ten(u.vaiTro)}</td>
                  <td className={`${O} whitespace-nowrap`}>
                    {u.cachDangNhap ? cach[u.cachDangNhap] : t.nguoi_dung.vao_khac}
                  </td>
                  <td className={`${O} whitespace-nowrap tabular-nums`}>{ngay(u.lanCuoiVao, nn, t)}</td>
                  <td className={`${O} whitespace-nowrap`}>
                    {u.dangHoatDong ? (
                      t.nguoi_dung.dang_hoat_dong
                    ) : (
                      <span className="text-hp-pink-strong">{t.nguoi_dung.da_khoa}</span>
                    )}
                  </td>
                  <td className={O}>
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                      <DatMatKhau id={u.id} tenHien={u.email} />
                      <NutHanhDong
                        hanhDong={doiTrangThai}
                        truong={{ id: u.id, bat: u.dangHoatDong ? "0" : "1" }}
                        nhan={u.dangHoatDong ? t.nguoi_dung.khoa : t.nguoi_dung.mo_khoa}
                        Icon={u.dangHoatDong ? Lock : LockOpen}
                        // Tu khoa chinh minh la khong con ai vao duoc man hinh
                        // nay. Server van chan lan nua — day chi la de nut khong
                        // moi nguoi bam vao mot viec chac chan that bai.
                        tat={laToi && u.dangHoatDong}
                      />
                      <DoiVaiTro u={u} vaiTros={vaiTros} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
