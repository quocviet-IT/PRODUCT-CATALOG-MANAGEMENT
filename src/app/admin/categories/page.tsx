import { requireUser } from "@/auth/guard";
import { layTatCa, dungCay, type NutCay } from "@/modules/catalog/categories.service";
import { themDanhMuc, doiTenDanhMuc, xoaDanhMuc } from "./actions";
import { layChu } from "@/messages/may-chu";

async function Nhanh({ nut, mucLui }: { nut: NutCay; mucLui: number }) {
  const t = await layChu();
  return (
    <>
      <li style={{ paddingLeft: `${mucLui * 20}px` }} className="flex items-center gap-2 py-1">
        <span className="flex-1 text-sm">{nut.name}</span>
        <form action={doiTenDanhMuc} className="flex gap-1">
          <input type="hidden" name="id" value={nut.id} />
          <input name="name" defaultValue={nut.name}
                 className="w-40 rounded border px-2 py-0.5 text-xs" />
          <button className="text-xs text-teal-800 hover:underline">{t.chung.luu}</button>
        </form>
        <form action={xoaDanhMuc}>
          <input type="hidden" name="id" value={nut.id} />
          <button className="text-xs text-red-700 hover:underline">{t.chung.xoa}</button>
        </form>
      </li>
      {nut.con.map((c) => <Nhanh key={c.id} nut={c} mucLui={mucLui + 1} />)}
    </>
  );
}

export default async function TrangDanhMuc() {
  const user = await requireUser();
  const t = await layChu();
  // Lay mot lan roi dung cho ca cay lan o chon danh muc cha.
  const phang = await layTatCa();
  const cay = dungCay(phang);

  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 text-xl font-bold">{t.dieu_huong.danh_muc}</h1>

      {cay.length === 0
        ? <p className="text-sm text-neutral-500">{t.chung.khong_co_du_lieu}</p>
        : <ul className="mb-8 divide-y">{cay.map((n) => <Nhanh key={n.id} nut={n} mucLui={0} />)}</ul>}

      {user.role === "admin" && (
        <form action={themDanhMuc} className="flex gap-2">
          <input name="name" placeholder={t.danh_muc.ten_moi_placeholder} required
                 className="flex-1 rounded border px-3 py-2 text-sm" />
          <select name="parent_id" className="rounded border px-3 py-2 text-sm">
            <option value="">{t.danh_muc.danh_muc_goc}</option>
            {phang.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
          <button className="rounded bg-teal-800 px-4 py-2 text-sm text-white">
            {t.chung.them}
          </button>
        </form>
      )}
    </div>
  );
}
