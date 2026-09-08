import { requireAdmin } from "@/auth/guard";
import { danhSachNguoiDung } from "@/modules/nguoi-dung/nguoi-dung.service";
import { BangTaiKhoan } from "./bang-tai-khoan";
import { ThemTaiKhoan } from "./them-tai-khoan";
import { layChu } from "@/messages/may-chu";

export async function generateMetadata() {
  const t = await layChu();
  return { title: t.nguoi_dung.tieu_de };
}

/**
 * Man hinh quan tri tai khoan. CHI admin vao duoc.
 *
 * requireAdmin() o day khong phai lop gac duy nhat: moi server action trong
 * actions.ts cung tu goi lai. Giau man hinh di khong ngan duoc ai goi thang
 * server action.
 */
export default async function TrangNguoiDung() {
  const t = await layChu();
  const toi = await requireAdmin();
  const ds = await danhSachNguoiDung();

  return (
    <>
      <div className="mb-8">
        <h1 className="font-title text-[32px] leading-none tracking-[0.02em] text-hp-ink">
          {t.nguoi_dung.tieu_de}
        </h1>
        <p className="mt-3 text-sm text-hp-muted">{t.nguoi_dung.mo_ta}</p>
        <div className="mt-5 h-px bg-hp-rule" />
      </div>

      <ThemTaiKhoan />
      <BangTaiKhoan ds={ds} idCuaToi={toi.id} />
    </>
  );
}
