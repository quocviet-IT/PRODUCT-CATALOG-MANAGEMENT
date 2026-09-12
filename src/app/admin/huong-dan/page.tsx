import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ArrowUp } from "lucide-react";
import { requireUser } from "@/auth/guard";
import { layChu, layNgonNgu } from "@/messages/may-chu";
import type { BoChu } from "@/messages";
import { NGON_NGU, type NgonNgu } from "@/messages/ngon-ngu";
import { AnhChuThich, ChuaCoAnh, type Diem } from "./anh-chu-thich";

export async function generateMetadata() {
  const t = await layChu();
  return { title: t.huong_dan.tieu_de };
}

/**
 * Moi ngon ngu mot bo anh chup rieng (12/09/2026): nguoi doc huong dan bang tieng Anh
 * phai thay dung man hinh tieng Anh ho dang dung, khong phai nut "Tao link gui khach"
 * trong khi chu thich noi "Create customer link". Chup bang npm run huong-dan:anh.
 */
const THU_MUC_ANH: Record<NgonNgu, string> = {
  vi: "huong-dan",
  en: "huong-dan/en",
};

/** Chu cua mot buoc, lay nguyen tu bo chu (huong-dan.vi.ts / huong-dan.en.ts). */
type NoiDungBuoc = { ten: string; mo_ta: string; chu: readonly string[]; meo: readonly string[] };

/** Mot buoc: cau chu do nguoi viet dat, vi tri mui ten do may do (theo ten anh). */
type Buoc = { anh: string; nd: NoiDungBuoc };

/**
 * Mot phan cua huong dan.
 *
 * `chiAdmin` cho nhung man hinh sale khong mo duoc. Day la de KHOI BAY ra mot huong
 * dan lam nguoi ta di tim mot nut khong ton tai voi ho — khong phai de giau bi mat,
 * vi noi dung khong co gi bi mat ca. Phan do de CUOI de so buoc cua sale va cua quan
 * tri trung nhau o moi phan truoc no.
 */
type Phan = { ten: string; buoc: Buoc[]; chiAdmin?: true };

/**
 * Ten anh o day phai trung ten anh trong scripts/chup-huong-dan.mts, va so chu thich
 * (`chu`) phai bang so moc cua anh do. Trang lay phan giao nen lech thi mat mui ten chu
 * khong tro bay.
 */
function cacPhan(t: BoChu): Phan[] {
  const h = t.huong_dan;
  return [
    {
      ten: h.phan.bat_dau,
      buoc: [
        { anh: "01-dang-nhap", nd: h.dang_nhap },
        { anh: "02-thanh-dau-trang", nd: h.thanh_dau_trang },
      ],
    },
    {
      ten: h.phan.chon_mau,
      buoc: [
        { anh: "03-tim-mau", nd: h.tim_mau },
        { anh: "04-chi-tiet-mau", nd: h.chi_tiet_mau },
        { anh: "05-tich-chon", nd: h.tich_chon },
      ],
    },
    {
      ten: h.phan.tao,
      buoc: [
        { anh: "06-ten-link", nd: h.ten_link },
        { anh: "07-chu-de", nd: h.chu_de },
        { anh: "07-bo-cuc-mau", nd: h.bo_cuc_mau },
        { anh: "08-thong-so-ngon-ngu", nd: h.thong_so_ngon_ngu },
        { anh: "09-lien-he", nd: h.lien_he },
        { anh: "10-trang-bia", nd: h.trang_bia },
        { anh: "11-thu-tu", nd: h.thu_tu },
        { anh: "12-gioi-thieu", nd: h.gioi_thieu },
        { anh: "13-anh-mau", nd: h.anh_mau },
        { anh: "14-xem-truoc", nd: h.xem_truoc },
        { anh: "15-tao-link", nd: h.tao_link },
      ],
    },
    {
      ten: h.phan.khach,
      buoc: [
        { anh: "16-trang-khach", nd: h.trang_khach },
        { anh: "17-lien-he-khach", nd: h.lien_he_khach },
      ],
    },
    { ten: h.phan.quan_ly, buoc: [{ anh: "18-danh-sach", nd: h.danh_sach }] },
    { ten: h.phan.gop_y, buoc: [{ anh: "19-gop-y", nd: h.gop_y }] },
    {
      ten: h.phan.quan_tri,
      chiAdmin: true,
      buoc: [
        { anh: "20-hop-gop-y", nd: h.hop_gop_y },
        { anh: "21-tai-khoan", nd: h.tai_khoan },
      ],
    },
  ];
}

type ViTri = { x: number; y: number; huong: Diem["huong"] };

/**
 * Vi tri mui ten cua MOT bo anh, do tu chinh trang luc chup va ghi ra diem.json cua thu
 * muc do. Truoc day toa do go tay vao tep nay; moi lan bo cuc xe dich la mui ten tro vao
 * cho trong ma khong ai biet.
 *
 * Thieu tep hay tep hong deu KHONG duoc lam sap trang — huong dan mat mui ten van con
 * doc duoc, mot trang loi thi khong.
 */
function docViTri(thuMuc: string): Record<string, ViTri[]> {
  try {
    const tho = readFileSync(join(process.cwd(), "public", thuMuc, "diem.json"), "utf8");
    return JSON.parse(tho) as Record<string, ViTri[]>;
  } catch {
    return {};
  }
}

/** Doc MOT lan luc nap module: cac tep nay nam trong ma nguon, khong doi luc chay. */
const VI_TRI = Object.fromEntries(NGON_NGU.map((nn) => [nn, docViTri(THU_MUC_ANH[nn])])) as Record<
  NgonNgu,
  Record<string, ViTri[]>
>;

/**
 * Bo anh dung cho mot buoc: bo cua ngon ngu dang xem; buoc nao ngon ngu do chua chup thi
 * lui ve anh tieng Viet. Anh tieng Viet kem chu thich tieng Anh con hon mot o "chua chup".
 */
function nguonAnh(nn: NgonNgu, anh: string): NgonNgu {
  return VI_TRI[nn][anh] ? nn : "vi";
}

/**
 * Ghep cau chu voi vi tri theo thu tu.
 *
 * Hai danh sach den tu hai noi — cau chu tu bo chu, vi tri tu script chup — nen
 * chung co the lech nhau khi ai do them mot chu thich ma quen them moc do trong
 * script. Lay phan giao: tha thieu mot mui ten con hon hien mot mui ten tro vao
 * cho trong.
 */
function ghep(chu: readonly string[], viTri: ViTri[] | undefined): Diem[] {
  if (!viTri) return [];
  return viTri.slice(0, chu.length).map((v, i) => ({ ...v, chu: chu[i] }));
}

const NHAN_NHO = "block text-[11px] uppercase tracking-[0.14em] text-hp-muted";

function VeMucLuc({ chu }: { chu: string }) {
  return (
    <a
      href="#muc-luc"
      className="mt-12 inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.14em]
                 text-hp-muted transition-colors duration-150 hover:text-hp-ink"
    >
      <ArrowUp aria-hidden strokeWidth={1.5} className="h-4 w-4 shrink-0" />
      {chu}
    </a>
  );
}

export default async function TrangHuongDan() {
  const toi = await requireUser();
  const t = await layChu();
  const nn = await layNgonNgu();
  const h = t.huong_dan;
  // Loc theo MUC QUYEN chu khong theo ten vai tro: mot vai tro tu dat mang bac
  // quan tri thi cung phai thay phan nay.
  const phan = cacPhan(t).filter((p) => !p.chiAdmin || toi.mucQuyen === "admin");
  // So buoc chay LIEN qua cac phan: so thu tu cua buoc dau moi phan.
  const soDau = phan.map((_, i) => phan.slice(0, i).reduce((n, p) => n + p.buoc.length, 0));

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-10">
        <h1 className="font-title text-[32px] leading-none tracking-[0.02em] text-hp-ink">
          {h.tieu_de}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-hp-body">{h.mo_ta}</p>
        <div className="mt-5 h-px bg-hp-rule" />
      </div>

      {/* Muc luc: trang dai hai muoi buoc, khong co muc luc thi nguoi can dung mot
          buoc phai cuon qua het nhung buoc kia. */}
      <nav
        id="muc-luc"
        aria-labelledby="muc-luc-ten"
        className="mb-20 scroll-mt-8 border border-hp-rule bg-hp-card p-6 sm:p-8"
      >
        <h2 id="muc-luc-ten" className={NHAN_NHO}>{h.muc_luc}</h2>
        <ol className="mt-5 space-y-6">
          {phan.map((p, i) => (
            <li key={p.ten}>
              <a
                href={`#phan-${i + 1}`}
                className="font-title text-lg leading-tight text-hp-ink transition-colors
                           duration-150 hover:underline"
              >
                {p.ten}
              </a>
              <ol className="mt-2 grid gap-x-8 gap-y-1.5 sm:grid-cols-2">
                {p.buoc.map((b, j) => {
                  const n = soDau[i] + j + 1;
                  return (
                    <li key={b.anh}>
                      <a
                        href={`#buoc-${n}`}
                        className="flex gap-2 text-sm leading-snug text-hp-body transition-colors
                                   duration-150 hover:text-hp-ink hover:underline"
                      >
                        <span className="w-5 shrink-0 text-right tabular-nums text-hp-muted">{n}.</span>
                        {b.nd.ten}
                      </a>
                    </li>
                  );
                })}
              </ol>
            </li>
          ))}
          <li>
            <a
              href="#hoi-dap"
              className="font-title text-lg leading-tight text-hp-ink transition-colors
                         duration-150 hover:underline"
            >
              {h.hoi_dap}
            </a>
          </li>
        </ol>
      </nav>

      <div className="space-y-24">
        {phan.map((p, i) => (
          <section
            key={p.ten}
            id={`phan-${i + 1}`}
            aria-labelledby={`phan-${i + 1}-ten`}
            className="scroll-mt-8"
          >
            <div className="mb-12 border-b border-hp-rule pb-5">
              <span className={NHAN_NHO}>
                {h.phan_so.replace("{n}", String(i + 1))}
                {p.chiAdmin && ` · ${h.chi_quan_tri}`}
              </span>
              <h2
                id={`phan-${i + 1}-ten`}
                className="mt-2 font-title text-[28px] leading-tight tracking-[0.01em] text-hp-ink"
              >
                {p.ten}
              </h2>
            </div>

            <ol className="space-y-20">
              {p.buoc.map((b, j) => {
                const n = soDau[i] + j + 1;
                const nguon = nguonAnh(nn, b.anh);
                const diem = ghep(b.nd.chu, VI_TRI[nguon][b.anh]);
                return (
                  <li key={b.anh} id={`buoc-${n}`} className="scroll-mt-8">
                    <span className={NHAN_NHO}>{h.buoc.replace("{n}", String(n))}</span>
                    <h3 className="mt-2 font-title text-2xl leading-tight text-hp-ink">{b.nd.ten}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-hp-body">{b.nd.mo_ta}</p>

                    <div className="mt-6">
                      {diem.length > 0 ? (
                        <AnhChuThich
                          src={`/${THU_MUC_ANH[nguon]}/${b.anh}.png`}
                          alt={b.nd.ten}
                          diem={diem}
                        />
                      ) : (
                        <ChuaCoAnh t={t} />
                      )}
                    </div>

                    {b.nd.meo.length > 0 && (
                      <div className="mt-6 border-l-2 border-hp-rule bg-hp-inset/60 px-5 py-4">
                        <p className={NHAN_NHO}>{h.luu_y}</p>
                        <ul
                          className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed
                                     text-hp-body marker:text-hp-muted"
                        >
                          {b.nd.meo.map((m) => (
                            <li key={m}>{m}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </li>
                );
              })}
            </ol>

            <VeMucLuc chu={h.ve_muc_luc} />
          </section>
        ))}

        <section id="hoi-dap" aria-labelledby="hoi-dap-ten" className="scroll-mt-8">
          <div className="mb-8 border-b border-hp-rule pb-5">
            <h2
              id="hoi-dap-ten"
              className="font-title text-[28px] leading-tight tracking-[0.01em] text-hp-ink"
            >
              {h.hoi_dap}
            </h2>
          </div>
          <dl className="divide-y divide-hp-rule border-b border-hp-rule">
            {h.cau_hoi.map((c) => (
              <div key={c.hoi} className="py-5 first:pt-0">
                <dt className="text-base font-medium leading-snug text-hp-ink">{c.hoi}</dt>
                <dd className="mt-2 text-sm leading-relaxed text-hp-body">{c.dap}</dd>
              </div>
            ))}
          </dl>
          <VeMucLuc chu={h.ve_muc_luc} />
        </section>
      </div>
    </div>
  );
}
