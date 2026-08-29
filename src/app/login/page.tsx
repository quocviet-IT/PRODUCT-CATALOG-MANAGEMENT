import { redirect } from "next/navigation";
import { dangNhap } from "@/auth/actions";
import { vi } from "@/messages/vi";

const LY_DO: Record<string, string> = {
  chua_dang_nhap: vi.dang_nhap.chua_dang_nhap,
  bi_vo_hieu_hoa: vi.dang_nhap.bi_vo_hieu_hoa,
  sai_thong_tin: vi.dang_nhap.sai_thong_tin,
};

export default async function TrangDangNhap({
  searchParams,
}: {
  searchParams: Promise<{ loi?: string }>;
}) {
  const { loi } = await searchParams;
  const thong_bao = loi ? LY_DO[loi] : null;

  async function guiForm(form: FormData) {
    "use server";
    const ma_loi = await dangNhap(null, form);
    if (ma_loi) redirect(`/login?loi=${ma_loi}`);
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 px-6">
      <h1 className="text-2xl font-bold">{vi.dang_nhap.tieu_de}</h1>
      {thong_bao && (
        <p role="alert" className="rounded border border-amber-300 bg-amber-50 px-3 py-2 text-sm">
          {thong_bao}
        </p>
      )}
      <form action={guiForm} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm">
          {vi.dang_nhap.email}
          <input name="email" type="email" required autoComplete="email"
                 className="rounded border px-3 py-2" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          {vi.dang_nhap.mat_khau}
          <input name="mat_khau" type="password" required autoComplete="current-password"
                 className="rounded border px-3 py-2" />
        </label>
        <button type="submit" className="rounded bg-teal-800 px-4 py-2 font-medium text-white">
          {vi.dang_nhap.nut}
        </button>
      </form>
    </main>
  );
}
