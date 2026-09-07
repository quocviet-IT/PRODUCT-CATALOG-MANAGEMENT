"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import type { MucDeChon } from "@/modules/catalogue-share/chia-se.model";
import {
  VUA_TAO_RONG, chupGio, chupVuaTao, dangKyVuaTao, datGio, themVuaTao,
} from "@/modules/catalogue-share/gio-chon";
import { vi } from "@/messages/vi";

type TrangThai = "dang-tai" | "san-sang" | "loi-tai";

const NUT_PHU =
  "text-[11px] uppercase tracking-[0.14em] text-hp-muted " +
  "transition-colors duration-150 hover:text-hp-ink hover:underline";

function ThongSo({ m }: { m: MucDeChon }) {
  const phan = [m.loaiSp, m.chatLieu, m.mau, m.size && `Size ${m.size}`]
    .filter((x): x is string => Boolean(x));
  return (
    <p className="mt-1 text-xs text-hp-muted">
      {phan.join(" · ")}
      {m.tlVang !== null && (
        <span className="tabular-nums">
          {phan.length > 0 && " · "}
          {m.tlVang.toFixed(2).replace(".", ",")} g
        </span>
      )}
    </p>
  );
}

export function TaoCatalogue() {
  const [trangThai, setTrangThai] = useState<TrangThai>("dang-tai");
  const [muc, setMuc] = useState<MucDeChon[]>([]);
  /** ma -> tap fileId dang giu. Mac dinh giu HET, sale bo bot. */
  const [anhGiu, setAnhGiu] = useState<Record<string, string[]>>({});
  const [ten, setTen] = useState("");
  const [dangTao, setDangTao] = useState(false);
  const [loiTao, setLoiTao] = useState<string | null>(null);
  const [slug, setSlug] = useState<string | null>(null);

  // Doc gio va nap du lieu trong MOT nhanh bat dong bo. Nhanh "gio rong" cung
  // di qua day chu khong goi setState thang trong than effect: goi dong bo o do
  // gay mot lan render day chuyen ngay sau lan dau.
  useEffect(() => {
    let con = true;
    (async () => {
      const ma = chupGio();
      if (ma.length === 0) {
        if (con) setTrangThai("san-sang");
        return;
      }
      try {
        const res = await fetch("/api/catalogue-chon", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ma }),
        });
        if (!res.ok) throw new Error(String(res.status));
        const d = (await res.json()) as { muc: MucDeChon[] };
        if (!con) return;
        setMuc(d.muc);
        setAnhGiu(Object.fromEntries(d.muc.map((m) => [m.ma, m.anh.map((a) => a.fileId)])));
        setTrangThai("san-sang");
      } catch {
        if (con) setTrangThai("loi-tai");
      }
    })();
    return () => {
      con = false;
    };
  }, []);

  function daoAnh(ma: string, fileId: string) {
    setAnhGiu((truoc) => {
      const dang = truoc[ma] ?? [];
      return {
        ...truoc,
        [ma]: dang.includes(fileId) ? dang.filter((x) => x !== fileId) : [...dang, fileId],
      };
    });
  }

  function goMau(ma: string) {
    setMuc((truoc) => truoc.filter((m) => m.ma !== ma));
    // Go khoi man hinh nay thi cung go khoi gio, khong thi quay lai danh sach
    // van thay no dang duoc tich.
    datGio(chupGio().filter((x) => x !== ma));
  }

  async function tao() {
    setDangTao(true);
    setLoiTao(null);
    try {
      const res = await fetch("/api/catalogue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ten,
          chon: muc.map((m) => ({ ma: m.ma, anh: anhGiu[m.ma] ?? [] })),
        }),
      });
      if (res.status === 422) {
        setLoiTao(vi.chia_se.loi_tao_rong);
        return;
      }
      if (!res.ok) {
        setLoiTao(vi.chia_se.loi_tao);
        return;
      }
      // Lay ten do MAY CHU tra ve, khong tu dung lai o day: khi sale khong dat
      // ten thi ten la "Catalogue #<so>", ma so do chi co so du lieu biet.
      const d = (await res.json()) as { slug: string; ten: string };
      themVuaTao({ slug: d.slug, ten: d.ten, luc: Date.now() });
      // Gio da dung xong — khong xoa thi lan tao sau sale lai thay nguyen cai cu.
      datGio([]);
      setSlug(d.slug);
    } catch {
      setLoiTao(vi.chia_se.loi_tao);
    } finally {
      setDangTao(false);
    }
  }

  if (trangThai === "dang-tai") {
    return (
      <p className="bg-hp-inset px-4 py-3 text-[11px] uppercase tracking-[0.14em] text-hp-muted">
        {vi.chia_se.dang_tai}
      </p>
    );
  }
  if (trangThai === "loi-tai") {
    return <p className="text-sm text-hp-pink-strong">{vi.chia_se.loi_tai_chon}</p>;
  }
  if (slug !== null) return <DaXong slug={slug} />;
  if (muc.length === 0) {
    return (
      <>
        <p className="text-sm text-hp-muted">{vi.chia_se.chua_chon_gi}</p>
        <Link href="/admin/catalogue-sheet" className={`mt-4 inline-block ${NUT_PHU}`}>
          {vi.chia_se.ve_danh_sach}
        </Link>
        <VuaTao />
      </>
    );
  }

  const tongAnh = muc.reduce((t, m) => t + (anhGiu[m.ma]?.length ?? 0), 0);

  return (
    <>
      <div className="mb-8 max-w-md">
        <label className="block text-[11px] uppercase tracking-[0.14em] text-hp-muted" htmlFor="ten">
          {vi.chia_se.ten_nhan}
        </label>
        <p className="mt-1 text-xs text-hp-muted">{vi.chia_se.ten_tuy_chon}</p>
        <input
          id="ten"
          value={ten}
          onChange={(e) => setTen(e.target.value)}
          placeholder={vi.chia_se.ten_goi_y}
          maxLength={120}
          className="mt-2 w-full border-0 border-b border-hp-rule bg-transparent px-0.5 py-1.5
                     font-body text-base text-hp-body transition-colors duration-150
                     placeholder:text-hp-rule focus:border-b-2 focus:border-hp-pink
                     focus:pb-[5px] focus:outline-none"
        />
      </div>

      <ul className="space-y-8">
        {muc.map((m) => {
          const giu = anhGiu[m.ma] ?? [];
          return (
            <li key={m.ma} className="border border-hp-rule bg-hp-card p-6">
              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                <h2 className="font-title text-xl leading-none text-hp-ink">
                  {m.maMau ?? m.ma}
                </h2>
                <span className="text-xs tabular-nums text-hp-muted">
                  {vi.chia_se.dem_anh_chon
                    .replace("{n}", String(giu.length))
                    .replace("{t}", String(m.anh.length))}
                </span>
                <button type="button" onClick={() => goMau(m.ma)} className={`ml-auto ${NUT_PHU}`}>
                  {vi.chia_se.go_mau}
                </button>
              </div>
              <ThongSo m={m} />

              {m.anh.length === 0 ? (
                <p className="mt-4 text-sm text-hp-muted">{vi.chia_se.khong_co_anh}</p>
              ) : (
                <ul className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
                  {m.anh.map((a) => {
                    const dangGiu = giu.includes(a.fileId);
                    return (
                      <li key={a.fileId}>
                        <label
                          className={`block cursor-pointer border transition-colors duration-150
                                      ${dangGiu ? "border-hp-ink" : "border-hp-rule opacity-45"}`}
                        >
                          <div className="flex aspect-square items-center justify-center bg-hp-inset">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={`/api/anh-drive/${a.fileId}`}
                              alt={a.ten}
                              loading="lazy"
                              className="h-full w-full object-contain"
                            />
                          </div>
                          <span className="flex items-center gap-2 px-2 py-1.5">
                            <input
                              type="checkbox"
                              checked={dangGiu}
                              onChange={() => daoAnh(m.ma, a.fileId)}
                              className="h-3.5 w-3.5 shrink-0 accent-hp-ink"
                            />
                            <span className="truncate text-[10px] text-hp-muted" title={a.ten}>
                              {a.ten}
                            </span>
                          </span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
          );
        })}
      </ul>

      {loiTao && <p className="mt-6 text-sm text-hp-pink-strong">{loiTao}</p>}

      <div className="sticky bottom-0 mt-8 flex flex-wrap items-center gap-x-6 gap-y-3
                      border-t border-hp-rule bg-hp-foundation/95 py-4 backdrop-blur">
        <span className="text-[11px] uppercase tracking-[0.14em] text-hp-muted">
          {vi.chia_se.da_chon.replace("{n}", String(muc.length))}
          <span className="ml-3 tabular-nums">{tongAnh} ảnh</span>
        </span>
        <Link href="/admin/catalogue-sheet" className={NUT_PHU}>
          {vi.chia_se.ve_danh_sach}
        </Link>
        <button
          type="button"
          onClick={tao}
          disabled={dangTao}
          className="ml-auto border border-hp-ink bg-hp-ink px-6 py-2.5 text-[11px]
                     uppercase tracking-[0.14em] text-hp-foundation transition-colors
                     duration-150 hover:border-hp-pink hover:bg-hp-pink
                     disabled:cursor-not-allowed disabled:opacity-40"
        >
          {dangTao ? vi.chia_se.dang_tao : vi.chia_se.nut_tao}
        </button>
      </div>
    </>
  );
}

function DaXong({ slug }: { slug: string }) {
  const [daChep, setDaChep] = useState(false);

  // Link tuyet doi phai dung o phia trinh duyet: may chu khong biet ten mien
  // that su nguoi dung dang mo (vercel.app hay ten mien rieng sau nay).
  // Ten mien khong bao gio doi giua chung nen nguoi nghe la mot ham rong.
  const origin = useSyncExternalStore(
    () => () => {},
    () => window.location.origin,
    () => "",
  );
  const link = `${origin}/c/${slug}`;

  async function chep() {
    try {
      await navigator.clipboard.writeText(link);
      setDaChep(true);
      setTimeout(() => setDaChep(false), 2000);
    } catch {
      // Trinh duyet tu choi quyen clipboard — o van la text, sale boi tay duoc.
    }
  }

  return (
    <div className="max-w-2xl">
      <h2 className="font-title text-[28px] leading-none text-hp-ink">
        {vi.chia_se.xong_tieu_de}
      </h2>
      <p className="mt-3 text-sm text-hp-body">{vi.chia_se.xong_mo_ta}</p>

      <p className="mt-6 border border-hp-rule bg-hp-card px-4 py-3 text-sm break-all text-hp-body">
        {link}
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={chep}
          className="border border-hp-ink bg-hp-ink px-5 py-2 text-[11px] uppercase
                     tracking-[0.14em] text-hp-foundation transition-colors duration-150
                     hover:border-hp-pink hover:bg-hp-pink"
        >
          {daChep ? vi.chia_se.da_chep : vi.chia_se.chep_link}
        </button>
        <a href={`/catalogue/${slug}`} target="_blank" rel="noreferrer" className={NUT_PHU}>
          {vi.chia_se.mo_thu}
        </a>
        <Link href="/admin/catalogue-sheet" className={NUT_PHU}>
          {vi.chia_se.tao_tiep}
        </Link>
      </div>
    </div>
  );
}

/**
 * Danh sach catalogue vua tao TREN MAY NAY.
 *
 * Day la thu thay the cho "catalogue cua toi" khi he thong chua co tai khoan:
 * no khong theo nguoi, no theo trinh duyet. Xoa lich su hoac doi may la mat
 * danh sach — nhung link da gui cho khach thi van song, nen mat o day khong
 * hong viec gi.
 */
function VuaTao() {
  const ds = useSyncExternalStore(dangKyVuaTao, chupVuaTao, () => VUA_TAO_RONG);
  if (ds.length === 0) return null;

  return (
    <section className="mt-12 border-t border-hp-rule pt-6">
      <h2 className="text-[11px] uppercase tracking-[0.14em] text-hp-muted">
        {vi.chia_se.vua_tao}
      </h2>
      <ul className="mt-4 space-y-2">
        {ds.map((c) => (
          <li key={c.slug}>
            <a
              href={`/catalogue/${c.slug}`}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-hp-body transition-colors duration-150
                         hover:text-hp-ink hover:underline"
            >
              {c.ten}
            </a>
            <span className="ml-3 text-xs tabular-nums text-hp-muted">
              {new Date(c.luc).toLocaleDateString("vi-VN")}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
