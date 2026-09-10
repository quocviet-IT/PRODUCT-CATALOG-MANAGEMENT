import { requireUser } from "@/auth/guard";
import { TaoCatalogue } from "./tao-catalogue";
import { layChu } from "@/messages/may-chu";
import { Logo } from "@/app/thuong-hieu";
import { NutGopY } from "@/app/admin/gop-y/nut-gop-y";

export async function generateMetadata() {
  const t = await layChu();
  return { title: t.chia_se.tao_tieu_de };
}

/**
 * Man hinh sale dung, nam NGOAI /admin de khong keo theo thanh dau trang cua
 * khu quan tri — o day sale chi lam mot viec duy nhat.
 *
 * Toan bo noi dung do phia trinh duyet dung len: danh sach mau da chon nam
 * trong localStorage, may chu khong the biet truoc.
 */
export default async function TrangTaoCatalogue() {
  const t = await layChu();
  // Trang nay nam NGOAI /admin nen khung kia khong gac ho — phai tu goi.
  await requireUser();
  return (
    <main className="mx-auto min-h-screen max-w-5xl px-6 py-10">
      {/* Nut gop y phai co CA o day, du man hinh nay nam ngoai khung /admin.
          Day la cho sale lam viec that va cung la cho hay hong nhat — bat ho
          quay ve mot man hinh khac moi bao duoc loi la mat luon cai loi. */}
      <div className="flex items-center justify-between gap-4">
        <Logo alt={t.catalogue_sheet.thuong_hieu} />
        <NutGopY />
      </div>
      <h1 className="mt-2 font-title text-[32px] leading-none tracking-[0.02em] text-hp-ink">
        {t.chia_se.tao_tieu_de}
      </h1>
      <p className="mt-3 text-sm text-hp-muted">{t.chia_se.tao_mo_ta}</p>
      <div className="mt-5 mb-8 h-px bg-hp-rule" />

      <TaoCatalogue />
    </main>
  );
}
