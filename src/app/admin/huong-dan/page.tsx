import { readFileSync } from "node:fs";
import { join } from "node:path";
import { requireUser } from "@/auth/guard";
import { layChu } from "@/messages/may-chu";
import type { BoChu } from "@/messages";
import { AnhChuThich, ChuaCoAnh, type Diem } from "./anh-chu-thich";

export async function generateMetadata() {
  const t = await layChu();
  return { title: t.huong_dan.tieu_de };
}

const THU_MUC_ANH = "huong-dan";

/**
 * Mot buoc: cau chu do nguoi viet dat, vi tri mui ten do may do.
 *
 * `chiAdmin` cho nhung buoc noi ve man hinh ma sale khong mo duoc. Day la de
 * KHOI BAY ra mot huong dan lam nguoi ta di tim mot nut khong ton tai voi ho —
 * khong phai de giau bi mat, vi noi dung buoc do khong co gi bi mat ca.
 */
type Buoc = { ten: string; moTa: string; anh: string; chu: string[]; chiAdmin?: true };

function cacBuoc(t: BoChu): Buoc[] {
  return [
    {
      ten: t.huong_dan.b1_ten,
      moTa: t.huong_dan.b1_mo_ta,
      anh: "01-dang-nhap",
      chu: [t.huong_dan.b1_c1, t.huong_dan.b1_c2],
    },
    {
      ten: t.huong_dan.b2_ten,
      moTa: t.huong_dan.b2_mo_ta,
      anh: "02-tim-mau",
      chu: [t.huong_dan.b2_c1, t.huong_dan.b2_c2, t.huong_dan.b2_c3, t.huong_dan.b2_c4],
    },
    {
      ten: t.huong_dan.b3_ten,
      moTa: t.huong_dan.b3_mo_ta,
      anh: "03-tich-chon",
      chu: [t.huong_dan.b3_c1, t.huong_dan.b3_c2, t.huong_dan.b3_c3],
    },
    {
      ten: t.huong_dan.b4_ten,
      moTa: t.huong_dan.b4_mo_ta,
      anh: "04-dat-ten-va-kieu",
      chu: [t.huong_dan.b4_c1, t.huong_dan.b4_c2, t.huong_dan.b4_c3],
    },
    {
      ten: t.huong_dan.b5_ten,
      moTa: t.huong_dan.b5_mo_ta,
      anh: "05-bo-anh",
      chu: [t.huong_dan.b5_c1, t.huong_dan.b5_c2, t.huong_dan.b5_c3],
    },
    {
      ten: t.huong_dan.b6_ten,
      moTa: t.huong_dan.b6_mo_ta,
      anh: "06-tao-link",
      chu: [t.huong_dan.b6_c1, t.huong_dan.b6_c2, t.huong_dan.b6_c3],
    },
    {
      ten: t.huong_dan.b7_ten,
      moTa: t.huong_dan.b7_mo_ta,
      anh: "07-danh-sach",
      chu: [t.huong_dan.b7_c1, t.huong_dan.b7_c2, t.huong_dan.b7_c3],
    },
    {
      ten: t.huong_dan.b8_ten,
      moTa: t.huong_dan.b8_mo_ta,
      anh: "08-tai-khoan-vai-tro",
      chu: [t.huong_dan.b8_c1, t.huong_dan.b8_c2, t.huong_dan.b8_c3],
      chiAdmin: true,
    },
  ];
}

type ViTri = { x: number; y: number; huong: Diem["huong"] };

/**
 * Vi tri mui ten, do tu chinh trang luc chup (npm run huong-dan:anh).
 *
 * Truoc day toa do go tay vao tep nay, do bang mat tren anh. Moi lan bo cuc xe
 * dich mot chut la mui ten tro vao cho trong ma khong ai biet — huong dan noi
 * doi mot cach im lang. Gio script do tu DOM va ghi ra diem.json.
 *
 * Doc MOT lan luc nap module: tep nay nam trong ma nguon, khong doi luc chay.
 * Thieu tep hay tep hong deu KHONG duoc lam sap trang — huong dan mat mui ten
 * van con doc duoc, mot trang loi thi khong.
 */
const VI_TRI: Record<string, ViTri[]> = (() => {
  try {
    const tho = readFileSync(join(process.cwd(), "public", THU_MUC_ANH, "diem.json"), "utf8");
    return JSON.parse(tho) as Record<string, ViTri[]>;
  } catch {
    return {};
  }
})();

/**
 * Ghep cau chu voi vi tri theo thu tu.
 *
 * Hai danh sach den tu hai noi — cau chu tu bo chu, vi tri tu script chup — nen
 * chung co the lech nhau khi ai do them mot chu thich ma quen them moc do trong
 * script. Lay phan giao: tha thieu mot mui ten con hon hien mot mui ten tro vao
 * cho trong.
 */
function ghep(chu: string[], viTri: ViTri[] | undefined): Diem[] {
  if (!viTri) return [];
  return viTri.slice(0, chu.length).map((v, i) => ({ ...v, chu: chu[i] }));
}

export default async function TrangHuongDan() {
  const toi = await requireUser();
  const t = await layChu();
  // Loc theo MUC QUYEN chu khong theo ten vai tro: mot vai tro tu dat mang bac
  // quan tri thi cung phai thay buoc nay.
  const buoc = cacBuoc(t).filter((b) => !b.chiAdmin || toi.mucQuyen === "admin");

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-10">
        <h1 className="font-title text-[32px] leading-none tracking-[0.02em] text-hp-ink">
          {t.huong_dan.tieu_de}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-hp-body">{t.huong_dan.mo_ta}</p>
        <div className="mt-5 h-px bg-hp-rule" />
      </div>

      <ol className="space-y-16">
        {buoc.map((b, i) => {
          const diem = ghep(b.chu, VI_TRI[b.anh]);
          return (
            <li key={b.anh}>
              <span className="block text-[11px] uppercase tracking-[0.14em] text-hp-muted">
                {t.huong_dan.buoc.replace("{n}", String(i + 1))}
              </span>
              <h2 className="mt-2 font-title text-2xl leading-tight text-hp-ink">{b.ten}</h2>
              <p className="mt-3 text-sm leading-relaxed text-hp-body">{b.moTa}</p>

              <div className="mt-6">
                {diem.length > 0 ? (
                  <AnhChuThich src={`/${THU_MUC_ANH}/${b.anh}.png`} alt={b.ten} diem={diem} />
                ) : (
                  <ChuaCoAnh t={t} />
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
