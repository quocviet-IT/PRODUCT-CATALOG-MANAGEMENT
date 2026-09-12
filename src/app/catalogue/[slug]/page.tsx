import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { layTheoMa, layTheoSlug } from "@/modules/catalogue-share/chia-se.service";
import { maCuaSlug } from "@/modules/catalogue-share/chia-se.model";
import { conMoDuoc } from "@/modules/catalogue-share/hieu-luc.model";
import { boChu } from "@/messages";
import { NguonNgonNgu } from "@/messages/dung-chu";
import { MoHopThoaiIn } from "./nut-in";
import { PhongToAnh } from "./phong-to";
import {
  KhoiLienHe, LOP_TONE, ThanCatalogue, ThanhLienHe, TrangBia, bienMauNhan,
} from "./bo-cuc";
import { LinkHetHieuLuc } from "./het-hieu-luc";
import { Logo } from "@/app/thuong-hieu";

/**
 * Dang duong dan hop le: cac cum chu-so noi bang dau gach.
 *
 * Chan o day de mot duong dan bay khong di toi tan cau lenh SQL. Nhan CA HAI
 * doi: slug cu (12 ky tu lien, vi du "zxhpnhyrtpu3") va slug moi
 * ("chi-lan-nhan-cuoi-k3m9x2p4") — link cu da nam trong may khach hang tuan,
 * khong bao gio duoc phep hong.
 *
 * Khong the trung "tao": moi slug moi deu ket thuc bang "-<8 ky tu>", va
 * Next.js uu tien doan tinh /catalogue/tao hon doan dong nay.
 */
const DANG_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DAI_SLUG_TOI_DA = 80;

function slugHopLe(s: string): boolean {
  return s.length <= DAI_SLUG_TOI_DA && DANG_SLUG.test(s);
}

/**
 * Khop nguyen duong dan truoc; khong khop thi tim theo MA o cuoi — link cu sau
 * khi sale doi ten link van phai mo duoc (xem layTheoMa).
 */
async function timCatalogue(slug: string) {
  return (await layTheoSlug(slug)) ?? (await layTheoMa(maCuaSlug(slug)));
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params;
  const macDinh = boChu("vi").catalogue_sheet.tieu_de;
  if (!slugHopLe(slug)) return { title: macDinh };
  const c = await timCatalogue(slug);
  // robots noindex da khai o layout goc — trang nay dac biet khong duoc len
  // ket qua tim kiem vi no la ban gui rieng cho mot khach.
  //
  // Link da dong thi tieu de tab cung khong duoc mang ten catalogue: ten do
  // thuong co ten khach hang trong no.
  if (!c || !conMoDuoc(c.hetHanLuc, c.khoaLuc, new Date())) return { title: macDinh };
  return { title: c.ten };
}

export default async function TrangKhachXem({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { slug } = await params;
  const ts = await searchParams;
  // "?in=1" chi sale moi gan vao (tu man hinh cua ho). Link gui khach la link
  // tran, nen khach khong bao gio thay hop thoai in.
  const moIn = ts.in === "1";
  if (!slugHopLe(slug)) notFound();

  const c = await timCatalogue(slug);
  if (!c) notFound();

  const g = c.giaoDien;

  // Het han hoac bi khoa: dung han o day, TRUOC khi dung bat cu phan noi dung
  // nao. Khong hien ma mau, khong hien anh, khong hien so luong — mot trang
  // "het hieu luc" ma van lo ra catalogue co bao nhieu mau thi khoa lam gi.
  //
  // Khong noi ro la het han hay bi khoa: noi ro la xac nhan voi nguoi cam link
  // rang day tung la mot link that.
  if (!conMoDuoc(c.hetHanLuc, c.khoaLuc, new Date())) {
    return <LinkHetHieuLuc t={boChu(g.ngonNgu)} tone={g.tone} />;
  }

  // Link cu, truoc khi sale doi ten: chuyen sang duong dan hien tai. Dat SAU buoc
  // chan o tren — link da dong thi dung han tai cho, khong lo ra ten link moi.
  //
  // 307 (redirect) chu khong 308: sale co the doi ten lan nua, hay doi nguoc ve
  // ten cu. Mot chuyen huong VINH VIEN bi trinh duyet nho lai se thanh vong lap.
  if (c.slug !== slug) redirect(`/catalogue/${c.slug}${moIn ? "?in=1" : ""}`);

  // Ngon ngu do SALE chot luc tao catalogue, khach khong doi duoc (quyet dinh
  // 08/09/2026). Truoc day co nut VI/EN tren trang khach; bo di vi day la ban
  // gui rieng cho mot nguoi, sale da biet khach doc thu tieng nao.
  //
  // Cung KHONG doc cookie: cookie la lua chon cua nhan vien tren may cua ho.
  const nn = g.ngonNgu;
  const t = boChu(nn);

  return (
    <NguonNgonNgu ngonNgu={nn}>
      <div className={`mau-nhan min-h-screen ${LOP_TONE[g.tone]}`} style={bienMauNhan(g.nhan)}>
        <main className="mx-auto max-w-4xl px-6 py-10 print:max-w-none print:py-0">
          {g.bia && (
            <TrangBia
              bia={g.bia}
              lienHe={g.lienHe}
              tieuDe={c.ten}
              thuongHieu={t.catalogue_sheet.thuong_hieu}
              t={t}
            />
          )}

          {/* Co trang bia thi ten catalogue DA nam tren do, chu to. Lap lai o
              day chi lam khach doc mot cai ten hai lan o hai co chu khac nhau. */}
          <header className="mb-10">
            {g.bia ? (
              <p className="text-xs tabular-nums text-hp-muted">
                {t.chia_se.khach_gom.replace("{n}", String(c.noiDung.muc.length))}
              </p>
            ) : (
              <>
                <Logo alt={t.catalogue_sheet.thuong_hieu} theoMau lop="text-hp-pink" />
                <h1 className="mt-3 font-title text-[32px] leading-tight tracking-[0.02em] text-hp-ink">
                  {c.ten}
                </h1>
                <p className="mt-2 text-xs tabular-nums text-hp-muted">
                  {t.chia_se.khach_gom.replace("{n}", String(c.noiDung.muc.length))}
                </p>
              </>
            )}
          </header>

          {/* Thu tu anh o day PHAI trung thu tu tren trang: khung phong to bam
              qua lai theo chinh mang nay. Ca ba bo cuc deu giu dung thu tu do. */}
          <PhongToAnh anh={c.noiDung.muc.flatMap((m) => m.anh)}>
            <ThanCatalogue muc={c.noiDung.muc} g={g} t={t} />
          </PhongToAnh>

          {/* KhoiLienHe tu quyet dinh hien hay an (coKhoiLienHe): co the chi co loi
              keu goi ma chua co ten hay so. */}
          <KhoiLienHe lienHe={g.lienHe} loiKeuGoi={g.loiKeuGoi} t={t} />

          {moIn && <MoHopThoaiIn />}

          <footer className="mt-14 border-t border-hp-rule pt-6 text-xs text-hp-muted">
            {t.chia_se.lien_he}
          </footer>
        </main>

        {g.lienHe && <ThanhLienHe lienHe={g.lienHe} t={t} />}
      </div>
    </NguonNgonNgu>
  );
}
