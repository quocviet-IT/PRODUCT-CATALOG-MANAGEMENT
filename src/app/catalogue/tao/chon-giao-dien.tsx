"use client";

import { useState } from "react";
import { useChu } from "@/messages/dung-chu";
import { boChu, type BoChu } from "@/messages";
import { NGON_NGU, NHAN_NGON_NGU } from "@/messages/ngon-ngu";
import {
  BO_CUC, CACH_NHAN, CHU_DE, DAI_DIEN_THOAI, DAI_LOI_CHAO, DAI_LOI_KEU_GOI, DAI_TEN_KHACH,
  DAI_TEN_SALE, LOI_KEU_GOI, MAU_NHAN, NHAN, NHAN_GOI_Y, NHOM_CHU_DE, THONG_SO, TONE, TONE_TOI,
  cauKeuGoi, chuDeDangChon, coKhoiLienHe, goiYCachNhan,
  type BoCuc, type CachNhan, type GiaoDienCatalogue, type KhoaChuDe, type LienHe, type Nhan,
  type NhomChuDe, type ThongSo, type Tone,
} from "@/modules/catalogue-share/giao-dien.model";

/**
 * Chon kieu trinh bay cho catalogue sap gui.
 *
 * Toan bo lua chon o day duoc DONG BANG vao ban ghi luc bam Tao — giong noi
 * dung. Sale doi kieu o day khong lam thay doi cac catalogue da gui truoc do.
 *
 * Khong co nut "xem thu" rieng: bo cuc va tong mau doi ngay tren chinh khung
 * xem thu ben duoi, nen sale thay ket qua trong luc chon.
 */

const NHAN_NHOM = "block text-[11px] uppercase tracking-[0.14em] text-hp-muted";
const O_NHAP =
  "mt-2 w-full border-0 border-b border-hp-rule bg-transparent px-0.5 py-1.5 " +
  "text-sm text-hp-body transition-colors duration-150 " +
  "focus:border-b-2 focus:border-hp-pink focus:pb-[5px] focus:outline-none";

function nhanBoCuc(t: BoChu): Record<BoCuc, { ten: string; moTa: string }> {
  return {
    "danh-sach": {
      ten: t.mau_giao_dien.bo_cuc_danh_sach,
      moTa: t.mau_giao_dien.bo_cuc_danh_sach_mo_ta,
    },
    luoi: {
      ten: t.mau_giao_dien.bo_cuc_luoi,
      moTa: t.mau_giao_dien.bo_cuc_luoi_mo_ta,
    },
    lookbook: {
      ten: t.mau_giao_dien.bo_cuc_lookbook,
      moTa: t.mau_giao_dien.bo_cuc_lookbook_mo_ta,
    },
    "trien-lam": {
      ten: t.mau_giao_dien.bo_cuc_trien_lam,
      moTa: t.mau_giao_dien.bo_cuc_trien_lam_mo_ta,
    },
    "khung-co-dien": {
      ten: t.mau_giao_dien.bo_cuc_khung,
      moTa: t.mau_giao_dien.bo_cuc_khung_mo_ta,
    },
    "tap-chi": {
      ten: t.mau_giao_dien.bo_cuc_tap_chi,
      moTa: t.mau_giao_dien.bo_cuc_tap_chi_mo_ta,
    },
    "bang-mau": {
      ten: t.mau_giao_dien.bo_cuc_bang_mau,
      moTa: t.mau_giao_dien.bo_cuc_bang_mau_mo_ta,
    },
    "thu-moi": {
      ten: t.mau_giao_dien.bo_cuc_thu_moi,
      moTa: t.mau_giao_dien.bo_cuc_thu_moi_mo_ta,
    },
  };
}

/**
 * Ten va dong goi y cua tung tong. Dong goi y noi tong do HOP VOI nhom san pham
 * nao — nguoi dung xin chon theme "theo tung nhom san pham hoac phong cach", va
 * tam o mau thi khong tu noi duoc dieu do.
 */
function nhanTone(t: BoChu): Record<Tone, { ten: string; moTa: string }> {
  const m = t.mau_giao_dien;
  return {
    beige: { ten: m.tone_beige, moTa: m.tone_beige_mo_ta },
    trang: { ten: m.tone_trang, moTa: m.tone_trang_mo_ta },
    toi: { ten: m.tone_toi, moTa: m.tone_toi_mo_ta },
    reu: { ten: m.tone_reu, moTa: m.tone_reu_mo_ta },
    "hoa-van": { ten: m.tone_hoa_van, moTa: m.tone_hoa_van_mo_ta },
    champagne: { ten: m.tone_champagne, moTa: m.tone_champagne_mo_ta },
    "bach-kim": { ten: m.tone_bach_kim, moTa: m.tone_bach_kim_mo_ta },
    "hong-phan": { ten: m.tone_hong_phan, moTa: m.tone_hong_phan_mo_ta },
    "do-ruou": { ten: m.tone_do_ruou, moTa: m.tone_do_ruou_mo_ta },
    "than-chi": { ten: m.tone_than_chi, moTa: m.tone_than_chi_mo_ta },
    "xanh-dem": { ten: m.tone_xanh_dem, moTa: m.tone_xanh_dem_mo_ta },
    "oai-huong": { ten: m.tone_oai_huong, moTa: m.tone_oai_huong_mo_ta },
    "suong-bien": { ten: m.tone_suong_bien, moTa: m.tone_suong_bien_mo_ta },
  };
}

function nhanChuDe(t: BoChu): Record<KhoaChuDe, { ten: string; moTa: string }> {
  const m = t.mau_giao_dien;
  return {
    valentine: { ten: m.chu_de_valentine, moTa: m.chu_de_valentine_mo_ta },
    "ngay-cua-me": { ten: m.chu_de_ngay_cua_me, moTa: m.chu_de_ngay_cua_me_mo_ta },
    "giang-sinh": { ten: m.chu_de_giang_sinh, moTa: m.chu_de_giang_sinh_mo_ta },
    nam: { ten: m.chu_de_nam, moTa: m.chu_de_nam_mo_ta },
    cuoi: { ten: m.chu_de_cuoi, moTa: m.chu_de_cuoi_mo_ta },
    "ngoc-trai": { ten: m.chu_de_ngoc_trai, moTa: m.chu_de_ngoc_trai_mo_ta },
    "khach-my": { ten: m.chu_de_khach_my, moTa: m.chu_de_khach_my_mo_ta },
    "viet-kieu": { ten: m.chu_de_viet_kieu, moTa: m.chu_de_viet_kieu_mo_ta },
    "khach-si": { ten: m.chu_de_khach_si, moTa: m.chu_de_khach_si_mo_ta },
    vip: { ten: m.chu_de_vip, moTa: m.chu_de_vip_mo_ta },
  };
}

function nhanNhomChuDe(t: BoChu): Record<NhomChuDe, string> {
  return {
    dip: t.mau_giao_dien.chu_de_nhom_dip,
    "nhom-hang": t.mau_giao_dien.chu_de_nhom_nhom_hang,
    khach: t.mau_giao_dien.chu_de_nhom_khach,
  };
}

function nhanMauNhan(t: BoChu): Record<Nhan, string> {
  return {
    hong: t.mau_giao_dien.nhan_hong,
    dong: t.mau_giao_dien.nhan_dong,
    luc: t.mau_giao_dien.nhan_luc,
    man: t.mau_giao_dien.nhan_man,
    ruby: t.mau_giao_dien.nhan_ruby,
    "luc-bao": t.mau_giao_dien.nhan_luc_bao,
    sapphire: t.mau_giao_dien.nhan_sapphire,
  };
}

/**
 * Mau thuc te cua tung tong — trung voi bang bien trong globals.css. O vuong nho
 * chi 24px nen khong ve noi hoa van mo; tong hoa van dung cham hong lam dau hieu,
 * con hoa van that thi hien ngay tren khung xem thu.
 */
const O_MAU: Record<Tone, { nen: string; muc: string }> = {
  beige: { nen: "#F7F1EB", muc: "#2A2725" },
  trang: { nen: "#FFFFFF", muc: "#1B1A19" },
  toi: { nen: "#1A1815", muc: "#F4EEE6" },
  reu: { nen: "#1B231D", muc: "#EDF0E9" },
  "hoa-van": { nen: "#F7F1EB", muc: "#E91D79" },
  champagne: { nen: "#F5EDDD", muc: "#2B2419" },
  "bach-kim": { nen: "#F1F2F4", muc: "#1D2125" },
  "hong-phan": { nen: "#F8EDEC", muc: "#2E2325" },
  "do-ruou": { nen: "#2A1418", muc: "#F6ECEA" },
  "than-chi": { nen: "#1B1E22", muc: "#EEF1F4" },
  "xanh-dem": { nen: "#141B2B", muc: "#EEF1F7" },
  "oai-huong": { nen: "#EFE9F6", muc: "#25202D" },
  "suong-bien": { nen: "#E6F0EE", muc: "#1A2624" },
};

function nhanThongSo(t: BoChu): Record<ThongSo, string> {
  return {
    loaiSp: t.catalogue_sheet.cot_loai_sp,
    chatLieu: t.catalogue_sheet.cot_chat_lieu,
    mau: t.catalogue_sheet.cot_mau,
    size: t.catalogue_sheet.cot_size,
    tlVang: t.catalogue_sheet.cot_tl_vang,
  };
}

/**
 * Mot o vuong minh hoa bo cuc. Ve bang chinh cac o mau — khong tai anh.
 *
 * Chan be rong lai: de no gian het o thi luoi 3x3 cao gan 400px, ba the chon
 * day man hinh xuong va phan con lai cua bang chon (tong mau, ngon ngu, bia)
 * bi day khuat.
 */
function HinhBoCuc({ kieu }: { kieu: BoCuc }) {
  const o = "bg-hp-rule";
  if (kieu === "bang-mau") {
    return (
      <div aria-hidden className="mx-auto max-w-[150px] divide-y divide-hp-rule border-y border-hp-rule">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="flex items-center gap-2 py-1.5">
            <div className={`${o} aspect-[4/3] w-9 shrink-0`} />
            <div className="flex flex-grow flex-col gap-1">
              <div className="h-1.5 w-1/2 bg-hp-ink/40" />
              <div className="h-1 w-full bg-hp-rule" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  if (kieu === "thu-moi") {
    return (
      <div aria-hidden className="mx-auto flex max-w-[150px] flex-col items-center gap-1.5">
        <div className="h-1 w-1/3 bg-hp-rule" />
        <div className="w-4/5 border border-hp-rule p-1">
          <div className={`${o} aspect-[4/3]`} />
        </div>
        <div className="h-1.5 w-1/3 bg-hp-ink/40" />
        <div className="h-1 w-1/2 bg-hp-rule" />
      </div>
    );
  }
  if (kieu === "trien-lam") {
    return (
      <div aria-hidden className="mx-auto max-w-[150px] space-y-1.5">
        <div className={`${o} aspect-[4/3]`} />
        <div className="h-3 w-8 bg-hp-ink/40" />
        <div className="h-1 w-2/3 bg-hp-rule" />
      </div>
    );
  }
  if (kieu === "khung-co-dien") {
    return (
      <div aria-hidden className="mx-auto max-w-[150px] border border-hp-rule p-1">
        <div className="border border-hp-rule p-2">
          <div className={`${o} aspect-[16/9]`} />
          <div className="mx-auto mt-2 h-1.5 w-1/2 bg-hp-ink/40" />
          <div className="mx-auto mt-1.5 h-1 w-3/4 bg-hp-rule" />
        </div>
      </div>
    );
  }
  if (kieu === "tap-chi") {
    return (
      <div aria-hidden className="mx-auto max-w-[150px] space-y-2">
        <div className="flex gap-1.5">
          <div className={`${o} aspect-square w-3/5`} />
          <div className="flex flex-grow flex-col justify-center gap-1">
            <div className="h-1.5 w-2/3 bg-hp-ink/40" />
            <div className="h-1 w-full bg-hp-rule" />
          </div>
        </div>
        <div className="flex flex-row-reverse gap-1.5">
          <div className={`${o} aspect-square w-3/5`} />
          <div className="flex flex-grow flex-col justify-center gap-1">
            <div className="h-1.5 w-2/3 bg-hp-ink/40" />
            <div className="h-1 w-full bg-hp-rule" />
          </div>
        </div>
      </div>
    );
  }
  if (kieu === "luoi") {
    return (
      <div aria-hidden className="mx-auto grid max-w-[150px] grid-cols-3 gap-1">
        {Array.from({ length: 9 }, (_, i) => (
          <div key={i} className={`${o} aspect-square`} />
        ))}
      </div>
    );
  }
  if (kieu === "lookbook") {
    return (
      <div aria-hidden className="mx-auto max-w-[150px] space-y-1.5">
        <div className="h-1.5 w-1/3 bg-hp-ink/40" />
        <div className={`${o} aspect-[16/9]`} />
        <div className="flex gap-1">
          <div className="h-1 w-1/4 bg-hp-rule" />
          <div className="h-1 w-1/4 bg-hp-rule" />
        </div>
      </div>
    );
  }
  return (
    <div aria-hidden className="mx-auto max-w-[150px] space-y-2">
      <div className="h-1.5 w-1/2 bg-hp-ink/40" />
      <div className="grid grid-cols-3 gap-1">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className={`${o} aspect-square`} />
        ))}
      </div>
      <div className="h-1.5 w-1/3 bg-hp-ink/40" />
      <div className="grid grid-cols-3 gap-1">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className={`${o} aspect-square`} />
        ))}
      </div>
    </div>
  );
}

export function ChonGiaoDien({
  gia,
  khiDoi,
}: {
  gia: GiaoDienCatalogue;
  khiDoi: (moi: GiaoDienCatalogue) => void;
}) {
  const t = useChu();
  const chuDe = nhanChuDe(t);
  const nhomChuDe = nhanNhomChuDe(t);
  const chuDeChon = chuDeDangChon(gia);
  const boCuc = nhanBoCuc(t);
  const tone = nhanTone(t);
  const mauNhan = nhanMauNhan(t);
  const thongSo = nhanThongSo(t);
  const nhanCachNhan: Record<CachNhan, string> = {
    zalo: t.mau_giao_dien.cach_nhan_zalo,
    "tin-nhan": t.mau_giao_dien.cach_nhan_tin_nhan,
    whatsapp: t.mau_giao_dien.cach_nhan_whatsapp,
    khong: t.mau_giao_dien.cach_nhan_khong,
  };
  /**
   * Cach nhan sale TU bam chon. null = chua chon: cach nhan di theo dang so vua go
   * (goiYCachNhan). Giu o day chu khong chi trong lienHe, vi lienHe con null khi
   * chua go ten hay so — bam chon truoc roi moi go so thi khong duoc mat lua chon.
   */
  const [cachNhanTay, setCachNhanTay] = useState<CachNhan | null>(null);
  const bia = gia.bia ?? { tenKhach: "", loiChao: "" };
  const lienHe: LienHe = gia.lienHe ?? { ten: "", dienThoai: "", cachNhan: cachNhanTay ?? "zalo" };

  function dat(phan: Partial<GiaoDienCatalogue>) {
    khiDoi({ ...gia, ...phan });
  }

  /** Chon tong moi thi doi luon mau nhan goi y (xem NHAN_GOI_Y); tong cu thi giu nguyen. */
  function datTone(k: Tone) {
    const goiY = NHAN_GOI_Y[k];
    dat(goiY ? { tone: k, nhan: goiY } : { tone: k });
  }

  function datBia(phan: Partial<typeof bia>) {
    const moi = { ...bia, ...phan };
    // Xoa het chu thi khong con trang bia — dung dung quy tac cua docGiaoDien
    // de cai sale thay o day trung voi cai duoc luu xuong.
    dat({ bia: moi.tenKhach || moi.loiChao ? moi : null });
  }

  function datLienHe(phan: Partial<LienHe>) {
    const moi = { ...lienHe, ...phan };
    dat({ lienHe: moi.ten || moi.dienThoai ? moi : null });
  }

  /** Go so thi cach nhan doi theo dang so (so My -> Tin nhan) — tru khi sale da tu chon. */
  function datDienThoai(dienThoai: string) {
    const goiY = cachNhanTay === null ? goiYCachNhan(dienThoai) : null;
    datLienHe(goiY ? { dienThoai, cachNhan: goiY } : { dienThoai });
  }

  function datCachNhan(k: CachNhan) {
    setCachNhanTay(k);
    datLienHe({ cachNhan: k });
  }

  return (
    <section className="border border-hp-rule bg-hp-card p-6">
      <h2 className="font-title text-xl leading-none text-hp-ink">
        {t.mau_giao_dien.tieu_de}
      </h2>
      <p className="mt-2 text-xs text-hp-muted">{t.mau_giao_dien.mo_ta}</p>

      {/* --- Chu de --- (12/09/2026) Loi tat dat bo cuc + tong + mau nhan hop nhau. Khong
          luu xuong ban ghi: o nao khop ca ba gia tri dang chon thi o do duoc chon. */}
      <fieldset className="mt-7">
        <legend className={NHAN_NHOM}>{t.mau_giao_dien.chu_de_nhan}</legend>
        <p className="mt-1 text-xs text-hp-muted">{t.mau_giao_dien.chu_de_mo_ta}</p>
        <div className="mt-3 grid gap-5 sm:grid-cols-3">
          {NHOM_CHU_DE.map((nhom) => (
            <div key={nhom}>
              <span className="text-xs text-hp-muted">{nhomChuDe[nhom]}</span>
              <div className="mt-2 grid gap-2">
                {CHU_DE.filter((c) => c.nhom === nhom).map((c) => (
                  <label
                    key={c.khoa}
                    className={
                      "flex cursor-pointer items-start gap-3 border px-3 py-2.5 " +
                      "transition-colors duration-150 " +
                      (chuDeChon === c.khoa
                        ? "border-hp-ink bg-hp-inset"
                        : "border-hp-rule hover:border-hp-ink")
                    }
                  >
                    <input
                      type="radio"
                      name="chu_de"
                      value={c.khoa}
                      checked={chuDeChon === c.khoa}
                      onChange={() => dat({ boCuc: c.boCuc, tone: c.tone, nhan: c.nhan })}
                      className="sr-only"
                    />
                    {/* O mau: nen cua tong + cham mau nhan, dung sac khach se thay (nen toi
                        thi sac sang). */}
                    <span
                      aria-hidden
                      className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center border border-hp-rule"
                      style={{ background: O_MAU[c.tone].nen }}
                    >
                      <span
                        className="h-2 w-2"
                        style={{
                          background: TONE_TOI.includes(c.tone) ? MAU_NHAN[c.nhan].sang : MAU_NHAN[c.nhan].nhat,
                        }}
                      />
                    </span>
                    <span>
                      <span className="block text-sm text-hp-ink">{chuDe[c.khoa].ten}</span>
                      <span className="mt-0.5 block text-xs leading-relaxed text-hp-muted">
                        {chuDe[c.khoa].moTa}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </fieldset>

      {/* --- Bo cuc --- */}
      <fieldset className="mt-7">
        <legend className={NHAN_NHOM}>{t.mau_giao_dien.bo_cuc_nhan}</legend>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {BO_CUC.map((k) => (
            <label
              key={k}
              className={
                "cursor-pointer border p-3 transition-colors duration-150 " +
                (gia.boCuc === k
                  ? "border-hp-ink bg-hp-inset"
                  : "border-hp-rule hover:border-hp-ink")
              }
            >
              <input
                type="radio"
                name="bo_cuc"
                value={k}
                checked={gia.boCuc === k}
                onChange={() => dat({ boCuc: k })}
                className="sr-only"
              />
              <HinhBoCuc kieu={k} />
              <span className="mt-3 block text-sm text-hp-ink">{boCuc[k].ten}</span>
              <span className="mt-1 block text-xs leading-relaxed text-hp-muted">
                {boCuc[k].moTa}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* --- Tong mau --- */}
      <fieldset className="mt-7">
        <legend className={NHAN_NHOM}>{t.mau_giao_dien.tone_nhan}</legend>
        <div className="mt-3 flex flex-wrap gap-3">
          {TONE.map((k) => (
            <label
              key={k}
              className={
                "flex cursor-pointer items-center gap-3 border px-4 py-2.5 " +
                "transition-colors duration-150 " +
                (gia.tone === k
                  ? "border-hp-ink bg-hp-inset"
                  : "border-hp-rule hover:border-hp-ink")
              }
            >
              <input
                type="radio"
                name="tone"
                value={k}
                checked={gia.tone === k}
                onChange={() => datTone(k)}
                className="sr-only"
              />
              <span
                aria-hidden
                className="flex h-6 w-6 items-center justify-center border border-hp-rule"
                style={{ background: O_MAU[k].nen }}
              >
                <span className="h-2 w-2" style={{ background: O_MAU[k].muc }} />
              </span>
              <span className="text-sm text-hp-body">{tone[k].ten}</span>
            </label>
          ))}
        </div>
        {/* Goi y cua tong DANG CHON: hop voi nhom san pham nao. aria-live de trinh
            doc man hinh doc lai khi sale doi tong. */}
        <p aria-live="polite" className="mt-3 text-xs leading-relaxed text-hp-muted">
          {tone[gia.tone].moTa}
        </p>
      </fieldset>

      {/* --- Mau nhan --- */}
      <fieldset className="mt-7">
        <legend className={NHAN_NHOM}>{t.mau_giao_dien.nhan_mau_nhan}</legend>
        <p className="mt-1 text-xs text-hp-muted">{t.mau_giao_dien.nhan_mau_mo_ta}</p>
        <div className="mt-3 flex flex-wrap gap-3">
          {NHAN.map((k) => (
            <label
              key={k}
              className={
                "flex cursor-pointer items-center gap-3 border px-4 py-2.5 " +
                "transition-colors duration-150 " +
                (gia.nhan === k
                  ? "border-hp-ink bg-hp-inset"
                  : "border-hp-rule hover:border-hp-ink")
              }
            >
              <input
                type="radio"
                name="mau_nhan"
                value={k}
                checked={gia.nhan === k}
                onChange={() => dat({ nhan: k })}
                className="sr-only"
              />
              <span
                aria-hidden
                className="h-6 w-6 shrink-0 border border-hp-rule"
                style={{ background: MAU_NHAN[k].nhat }}
              />
              <span className="text-sm text-hp-body">{mauNhan[k]}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* --- Thong so hien --- */}
      <fieldset className="mt-7">
        <legend className={NHAN_NHOM}>{t.mau_giao_dien.hien_nhan}</legend>
        <p className="mt-1 text-xs text-hp-muted">{t.mau_giao_dien.hien_mo_ta}</p>
        <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
          {THONG_SO.map((k) => (
            <label key={k} className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={gia.hien[k]}
                onChange={() => dat({ hien: { ...gia.hien, [k]: !gia.hien[k] } })}
                className="h-4 w-4 accent-hp-pink"
              />
              <span className="text-sm text-hp-body">{thongSo[k]}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* --- Ngon ngu --- */}
      <fieldset className="mt-7">
        <legend className={NHAN_NHOM}>{t.mau_giao_dien.ngon_ngu_nhan}</legend>
        <p className="mt-1 text-xs text-hp-muted">{t.mau_giao_dien.ngon_ngu_mo_ta}</p>
        <div className="mt-3 flex flex-wrap gap-3">
          {NGON_NGU.map((k) => (
            <label
              key={k}
              className={
                "cursor-pointer border px-4 py-2 text-sm transition-colors duration-150 " +
                (gia.ngonNgu === k
                  ? "border-hp-ink bg-hp-inset text-hp-ink"
                  : "border-hp-rule text-hp-body hover:border-hp-ink")
              }
            >
              <input
                type="radio"
                name="ngon_ngu_catalogue"
                value={k}
                checked={gia.ngonNgu === k}
                onChange={() => dat({ ngonNgu: k })}
                className="sr-only"
              />
              {NHAN_NGON_NGU[k]}
            </label>
          ))}
        </div>
      </fieldset>

      {/* --- Lien he dat hang --- */}
      <fieldset className="mt-7">
        <legend className={NHAN_NHOM}>{t.mau_giao_dien.lien_he_nhan}</legend>
        <p className="mt-1 text-xs text-hp-muted">{t.mau_giao_dien.lien_he_mo_ta}</p>
        <div className="mt-3 grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs text-hp-muted">{t.mau_giao_dien.lien_he_ten}</span>
            <input
              value={lienHe.ten}
              onChange={(e) => datLienHe({ ten: e.target.value })}
              maxLength={DAI_TEN_SALE}
              placeholder={t.mau_giao_dien.lien_he_ten_goi_y}
              className={O_NHAP}
            />
          </label>
          <label className="block">
            <span className="text-xs text-hp-muted">{t.mau_giao_dien.lien_he_dien_thoai}</span>
            <input
              value={lienHe.dienThoai}
              onChange={(e) => datDienThoai(e.target.value)}
              maxLength={DAI_DIEN_THOAI}
              inputMode="tel"
              placeholder={t.mau_giao_dien.lien_he_dien_thoai_goi_y}
              className={O_NHAP}
            />
          </label>
        </div>

        {/* Nut thu hai tren trang khach. Truoc 12/09/2026 no LUON la Zalo — sale
            ben My bao khach cua ho khong dung Zalo. */}
        <fieldset className="mt-5">
          <legend className="text-xs text-hp-muted">{t.mau_giao_dien.lien_he_cach_nhan}</legend>
          <p className="mt-0.5 text-xs text-hp-muted">{t.mau_giao_dien.lien_he_cach_nhan_mo_ta}</p>
          <div className="mt-2 flex flex-wrap gap-3">
            {CACH_NHAN.map((k) => (
              <label
                key={k}
                className={
                  "cursor-pointer border px-4 py-2 text-sm transition-colors duration-150 " +
                  (lienHe.cachNhan === k
                    ? "border-hp-ink bg-hp-inset text-hp-ink"
                    : "border-hp-rule text-hp-body hover:border-hp-ink")
                }
              >
                <input
                  type="radio"
                  name="cach_nhan"
                  value={k}
                  checked={lienHe.cachNhan === k}
                  onChange={() => datCachNhan(k)}
                  className="sr-only"
                />
                {nhanCachNhan[k]}
              </label>
            ))}
          </div>
        </fieldset>

        {/* Loi keu goi — dong tieu de to cua khoi lien he (gop y 11/09/2026: cho
            chon cau co san hoac tu viet). Moi cau hien DUNG nhu khach se doc:
            theo ngon ngu catalogue, da dien ten nguoi tu van. */}
        <fieldset className="mt-5">
          <legend className="text-xs text-hp-muted">{t.mau_giao_dien.loi_keu_goi_nhan}</legend>
          <p className="mt-0.5 text-xs text-hp-muted">{t.mau_giao_dien.loi_keu_goi_mo_ta}</p>
          {/* Da chon loi keu goi ma chua co ten hay so: noi truoc rang khach chi
              thay cau nay, khong co nut goi hay nhan (loi that 12/09/2026). */}
          {gia.lienHe === null && coKhoiLienHe(gia) && (
            <p className="mt-1 text-xs text-hp-body">{t.mau_giao_dien.loi_keu_goi_chua_lien_he}</p>
          )}
          <div className="mt-2 grid gap-2">
            {LOI_KEU_GOI.map((k) => (
              <label
                key={k}
                className={
                  "block cursor-pointer border px-4 py-2 text-sm transition-colors duration-150 " +
                  (gia.loiKeuGoi.mau === k
                    ? "border-hp-ink bg-hp-inset text-hp-ink"
                    : "border-hp-rule text-hp-body hover:border-hp-ink")
                }
              >
                <input
                  type="radio"
                  name="loi_keu_goi"
                  value={k}
                  checked={gia.loiKeuGoi.mau === k}
                  onChange={() => dat({ loiKeuGoi: { ...gia.loiKeuGoi, mau: k } })}
                  className="sr-only"
                />
                {k === "tu-viet"
                  ? t.mau_giao_dien.loi_keu_goi_tu_viet
                  : cauKeuGoi({ mau: k, tuViet: "" }, lienHe.ten, boChu(gia.ngonNgu).chia_se)}
              </label>
            ))}
            {/* Go vao day la chon luon "Tu viet": bat sale bam nut roi moi go la
                mot buoc thua. */}
            <input
              value={gia.loiKeuGoi.tuViet}
              onChange={(e) => dat({ loiKeuGoi: { mau: "tu-viet", tuViet: e.target.value } })}
              maxLength={DAI_LOI_KEU_GOI}
              aria-label={t.mau_giao_dien.loi_keu_goi_tu_viet}
              placeholder={t.mau_giao_dien.loi_keu_goi_tu_viet_goi_y}
              className={O_NHAP}
            />
          </div>
        </fieldset>
      </fieldset>

      {/* --- Trang bia --- */}
      <fieldset className="mt-7">
        <legend className={NHAN_NHOM}>{t.mau_giao_dien.bia_nhan}</legend>
        <p className="mt-1 text-xs text-hp-muted">{t.mau_giao_dien.bia_mo_ta}</p>
        <div className="mt-3 grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs text-hp-muted">{t.mau_giao_dien.bia_ten_khach}</span>
            <input
              value={bia.tenKhach}
              onChange={(e) => datBia({ tenKhach: e.target.value })}
              maxLength={DAI_TEN_KHACH}
              placeholder={t.mau_giao_dien.bia_ten_khach_goi_y}
              className={O_NHAP}
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-xs text-hp-muted">{t.mau_giao_dien.bia_loi_chao}</span>
            <textarea
              value={bia.loiChao}
              onChange={(e) => datBia({ loiChao: e.target.value })}
              maxLength={DAI_LOI_CHAO}
              rows={2}
              placeholder={t.mau_giao_dien.bia_loi_chao_goi_y}
              className={`${O_NHAP} resize-none`}
            />
          </label>
        </div>
      </fieldset>
    </section>
  );
}
