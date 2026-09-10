import { requireAdmin } from "@/auth/guard";
import { danhSachNguoiDung } from "@/modules/nguoi-dung/nguoi-dung.service";
import { danhSachVaiTro, demTheoVaiTro } from "@/modules/nguoi-dung/vai-tro.service";
import { BangTaiKhoan } from "./bang-tai-khoan";
import { QuanLyVaiTro } from "./quan-ly-vai-tro";
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
  // Ba truy van doc lap — chay song song, khong xep hang sau nhau.
  const [ds, vaiTros, dem] = await Promise.all([
    danhSachNguoiDung(),
    danhSachVaiTro(),
    demTheoVaiTro(),
  ]);

  return (
    <>
      <div className="mb-8">
        <h1 className="font-title text-[32px] leading-none tracking-[0.02em] text-hp-ink">
          {t.nguoi_dung.tieu_de}
        </h1>
        <p className="mt-3 text-sm text-hp-muted">{t.nguoi_dung.mo_ta}</p>
        <div className="mt-5 h-px bg-hp-rule" />
      </div>

      <QuanLyVaiTro vaiTros={vaiTros} dem={dem} />

      <ThemTaiKhoan vaiTros={vaiTros} />
      <BangTaiKhoan ds={ds} idCuaToi={toi.id} vaiTros={vaiTros} />
    </>
  );
}
