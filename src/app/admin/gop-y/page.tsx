import { requireAdmin } from "@/auth/guard";
import { layChu } from "@/messages/may-chu";
import { danhSachGopY } from "@/modules/gop-y/gop-y.service";
import { BangGopY } from "./bang-gop-y";

export async function generateMetadata() {
  const t = await layChu();
  return { title: t.gop_y.tieu_de_trang };
}

/**
 * Man hinh doc gop y. CHI quan tri vao duoc.
 *
 * Gui thi ai cung gui duoc (xem actions.ts), doc thi khong: gop y hay kem theo
 * ten dong nghiep va cho lam viec bi hong, khong phai thu de ca cong ty luot.
 */
export default async function TrangGopY() {
  const t = await layChu();
  await requireAdmin();
  const ds = await danhSachGopY();
  const soMoi = ds.filter((g) => g.trangThai === "moi").length;

  return (
    <>
      <div className="mb-8">
        <h1 className="font-title text-[32px] leading-none tracking-[0.02em] text-hp-ink">
          {t.gop_y.tieu_de_trang}
        </h1>
        <p className="mt-3 text-sm text-hp-muted">
          {t.gop_y.mo_ta_trang.replace("{n}", String(soMoi))}
        </p>
        <div className="mt-5 h-px bg-hp-rule" />
      </div>

      <BangGopY ds={ds} />
    </>
  );
}
