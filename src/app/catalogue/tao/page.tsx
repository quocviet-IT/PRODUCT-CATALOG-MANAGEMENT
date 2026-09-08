import { requireUser } from "@/auth/guard";
import { TaoCatalogue } from "./tao-catalogue";
import { vi } from "@/messages/vi";

export const metadata = { title: vi.chia_se.tao_tieu_de };

/**
 * Man hinh sale dung, nam NGOAI /admin de khong keo theo thanh dau trang cua
 * khu quan tri — o day sale chi lam mot viec duy nhat.
 *
 * Toan bo noi dung do phia trinh duyet dung len: danh sach mau da chon nam
 * trong localStorage, may chu khong the biet truoc.
 */
export default async function TrangTaoCatalogue() {
  // Trang nay nam NGOAI /admin nen khung kia khong gac ho — phai tu goi.
  await requireUser();
  return (
    <main className="mx-auto min-h-screen max-w-5xl px-6 py-10">
      <span className="block text-[11px] uppercase tracking-[0.14em] text-hp-muted">
        {vi.catalogue_sheet.thuong_hieu}
      </span>
      <h1 className="mt-2 font-title text-[32px] leading-none tracking-[0.02em] text-hp-ink">
        {vi.chia_se.tao_tieu_de}
      </h1>
      <p className="mt-3 text-sm text-hp-muted">{vi.chia_se.tao_mo_ta}</p>
      <div className="mt-5 mb-8 h-px bg-hp-rule" />

      <TaoCatalogue />
    </main>
  );
}
