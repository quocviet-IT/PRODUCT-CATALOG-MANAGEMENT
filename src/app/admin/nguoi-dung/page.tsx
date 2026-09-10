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
  // TUAN TU, co chu y — dung doi lai thanh Promise.all.
  //
  // Ba truy van nay doc lap nen chay song song la "dung" ve ly thuyet, nhung
  // db/client.ts giu max: 1, ma postgres.js gop nhieu truy van len CUNG mot
  // ket noi khi chung chay cung luc. Ngay 10/09/2026 chinh Promise.all o day
  // (cong voi cua gac chay hai lan) da de lai nhung phien Postgres ket cung o
  // `active / Client:ClientRead` tren ban chay that, moi phien ket lam treo
  // toan bo mot ban ham — ke ca trang cong khai khong lien quan. Xem chu thich
  // trong auth/guard.ts.
  //
  // Cai gia phai tra la vai tram mili giay moi lan mo trang. Re hon nhieu so
  // voi mot khu quan tri treo.
  const ds = await danhSachNguoiDung();
  const vaiTros = await danhSachVaiTro();
  const dem = await demTheoVaiTro();

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
