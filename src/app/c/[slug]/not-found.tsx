import { vi } from "@/messages/vi";

/**
 * Nguoi doc trang nay la KHACH HANG, khong phai nhan vien. Ho khong biet
 * "catalogue" la mot ban ghi trong co so du lieu, va cang khong quan tam. Cau
 * chu phai noi duoc mot dieu duy nhat co ich cho ho: link co the bi chep thieu,
 * hoi lai nguoi da gui.
 */
export default function KhongThayCatalogue() {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-6 py-10">
      <span className="block text-[11px] uppercase tracking-[0.14em] text-hp-muted">
        {vi.catalogue_sheet.thuong_hieu}
      </span>
      <h1 className="mt-3 font-title text-[28px] leading-tight text-hp-ink">
        {vi.chia_se.khong_thay}
      </h1>
      <p className="mt-3 text-sm text-hp-body">{vi.chia_se.lien_he}</p>
    </main>
  );
}
