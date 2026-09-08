"use client";

import { useChu } from "@/messages/dung-chu";
import type { BoChu } from "@/messages";
import { NGON_NGU, NHAN_NGON_NGU } from "@/messages/ngon-ngu";
import {
  BO_CUC, DAI_DIEN_THOAI, DAI_LOI_CHAO, DAI_TEN_KHACH, DAI_TEN_SALE, THONG_SO, TONE,
  type BoCuc, type GiaoDienCatalogue, type ThongSo, type Tone,
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
  };
}

function nhanTone(t: BoChu): Record<Tone, string> {
  return {
    beige: t.mau_giao_dien.tone_beige,
    trang: t.mau_giao_dien.tone_trang,
    toi: t.mau_giao_dien.tone_toi,
  };
}

/** Mau thuc te cua tung tong — trung voi bang bien trong globals.css. */
const O_MAU: Record<Tone, { nen: string; muc: string }> = {
  beige: { nen: "#F7F1EB", muc: "#2A2725" },
  trang: { nen: "#FFFFFF", muc: "#1B1A19" },
  toi: { nen: "#1A1815", muc: "#F4EEE6" },
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
  const boCuc = nhanBoCuc(t);
  const tone = nhanTone(t);
  const thongSo = nhanThongSo(t);
  const bia = gia.bia ?? { tenKhach: "", loiChao: "" };
  const lienHe = gia.lienHe ?? { ten: "", dienThoai: "" };

  function dat(phan: Partial<GiaoDienCatalogue>) {
    khiDoi({ ...gia, ...phan });
  }

  function datBia(phan: Partial<typeof bia>) {
    const moi = { ...bia, ...phan };
    // Xoa het chu thi khong con trang bia — dung dung quy tac cua docGiaoDien
    // de cai sale thay o day trung voi cai duoc luu xuong.
    dat({ bia: moi.tenKhach || moi.loiChao ? moi : null });
  }

  function datLienHe(phan: Partial<typeof lienHe>) {
    const moi = { ...lienHe, ...phan };
    dat({ lienHe: moi.ten || moi.dienThoai ? moi : null });
  }

  return (
    <section className="border border-hp-rule bg-hp-card p-6">
      <h2 className="font-title text-xl leading-none text-hp-ink">
        {t.mau_giao_dien.tieu_de}
      </h2>
      <p className="mt-2 text-xs text-hp-muted">{t.mau_giao_dien.mo_ta}</p>

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
                onChange={() => dat({ tone: k })}
                className="sr-only"
              />
              <span
                aria-hidden
                className="flex h-6 w-6 items-center justify-center border border-hp-rule"
                style={{ background: O_MAU[k].nen }}
              >
                <span className="h-2 w-2" style={{ background: O_MAU[k].muc }} />
              </span>
              <span className="text-sm text-hp-body">{tone[k]}</span>
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
              onChange={(e) => datLienHe({ dienThoai: e.target.value })}
              maxLength={DAI_DIEN_THOAI}
              inputMode="tel"
              placeholder={t.mau_giao_dien.lien_he_dien_thoai_goi_y}
              className={O_NHAP}
            />
          </label>
        </div>
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
