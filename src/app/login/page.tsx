import { redirect } from "next/navigation";
import { dangNhap, dangNhapGoogle } from "@/auth/actions";
import { LoiMatKhau } from "./loi-mat-khau";
import { NutGui } from "@/ui/nut-gui";
import { layChu } from "@/messages/may-chu";
import { NhomDoiNgonNgu } from "@/messages/dung-chu";
import type { BoChu } from "@/messages";
import { Logo } from "@/app/thuong-hieu";

function lyDo(t: BoChu): Record<string, string> {
  return {
    chua_dang_nhap: t.dang_nhap.chua_dang_nhap,
    bi_vo_hieu_hoa: t.dang_nhap.bi_vo_hieu_hoa,
    sai_thong_tin: t.dang_nhap.sai_thong_tin,
    khong_du_quyen: t.dang_nhap.khong_du_quyen,
    loi_google: t.dang_nhap.loi_google,
    sai_ten_mien: t.dang_nhap.sai_ten_mien,
  };
}

/** Logo Google. Ve thang bang SVG — mot the <img> se them mot luot tai mang. */
function LogoGoogle() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className="h-[18px] w-[18px] shrink-0">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

export default async function TrangDangNhap({
  searchParams,
}: {
  searchParams: Promise<{ loi?: string }>;
}) {
  const t = await layChu();
  const { loi } = await searchParams;
  const thongBao = loi ? lyDo(t)[loi] : null;

  async function guiForm(form: FormData) {
    "use server";
    const maLoi = await dangNhap(null, form);
    if (maLoi) redirect(`/login?loi=${maLoi}`);
  }

  return (
    <div className="relative flex min-h-screen flex-col">
      {/* Doi ngon ngu o goc tren phai (anh gop y 11/09/2026): nguoi dung tieng
          Anh phai doi duoc ngay tu man hinh DAU TIEN, truoc khi dang nhap. Cung
          goc va cung mot nut voi thanh dau trang ben trong, nen vao roi van thay
          no o cho quen; cookie dung chung nen ngon ngu chon o day giu nguyen sau
          khi dang nhap. Nam NGOAI the: the dung giua man hinh, goc tren phai con
          trong tren moi co man hinh, ke ca khi mo form mat khau tren dien thoai. */}
      <div className="absolute right-5 top-5 sm:right-8 sm:top-6">
        <NhomDoiNgonNgu />
      </div>

      {/* KHONG w-full: the co theo noi dung nhu truoc khi co nut ngon ngu. Them
          w-full hom 11/09/2026 lam the rong ra ~60px ma khong ai yeu cau. */}
      <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-10">
        <div className="border border-hp-rule bg-hp-card p-8 sm:p-10">
          <Logo alt={t.catalogue_sheet.thuong_hieu} />
          <h1 className="mt-3 font-title text-[28px] leading-none tracking-[0.02em] text-hp-ink">
            {t.dang_nhap.tieu_de}
          </h1>
          <p className="mt-3 text-sm text-hp-body">{t.dang_nhap.mo_ta}</p>

          {thongBao && (
            // Loi dang nhap la mot trong ba cho duy nhat duoc dung mau hong tren
            // man hinh nay — xem ngan sach hong cua he thiet ke.
            <p
              role="alert"
              className="mt-5 border-l-2 border-hp-pink bg-hp-inset px-4 py-3 text-sm text-hp-body"
            >
              {thongBao}
            </p>
          )}

          <form action={dangNhapGoogle} className="mt-7">
            {/* Bam nut nay la roi khoi trang: server action chuyen huong sang
                Google. Duong truyen cham thi man hinh dung im vai giay, va nguoi
                dung bam lan hai — mo mot luong dang nhap thu hai chong len. */}
            <NutGui
              nhanCho={
                <>
                  <LogoGoogle />
                  {t.dang_nhap.dang_vao}
                </>
              }
              lop="flex w-full items-center justify-center gap-3 border border-hp-rule
                   bg-hp-foundation px-5 py-3.5 text-sm text-hp-ink
                   transition-colors duration-150 hover:border-hp-ink
                   disabled:cursor-not-allowed disabled:opacity-40"
            >
              <LogoGoogle />
              {t.dang_nhap.nut_google}
            </NutGui>
          </form>

          {/* Duong lui bang mat khau: cac tai khoan co tu truoc van dung duoc, va
              neu Google gap su co thi he thong khong bi khoa cung. */}
          <LoiMatKhau guiForm={guiForm} />
        </div>
      </main>
    </div>
  );
}
