import type { BoChu } from "@/messages";
import type { Tone } from "@/modules/catalogue-share/giao-dien.model";
import { Logo } from "@/app/thuong-hieu";
import { LOP_TONE } from "./bo-cuc";

/**
 * Man hinh khach thay khi link da het han hoac bi khoa.
 *
 * Giu dung tong mau cua catalogue de nguoi nhan biet minh khong go nham dia
 * chi — chi la no khong con mo nua.
 *
 * KHONG co nut "yeu cau mo lai", khong co o nhap gi: trang nay den tay mot
 * nguoi ma he thong khong biet la ai.
 */
export function LinkHetHieuLuc({ t, tone }: { t: BoChu; tone: Tone }) {
  return (
    <div className={`min-h-screen ${LOP_TONE[tone]}`}>
      <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-6 py-10">
        <Logo alt={t.catalogue_sheet.thuong_hieu} theoMau lop="text-hp-pink" />
        <h1 className="mt-4 font-title text-[28px] leading-tight text-hp-ink">
          {t.chia_se.link_het_hieu_luc}
        </h1>
        <p className="mt-3 text-sm text-hp-body">{t.chia_se.lien_he}</p>
      </main>
    </div>
  );
}
