import type { DongCatalogue } from "@/modules/sheet/catalogue.mapper";
import { khoaMau } from "@/modules/catalogue-share/chia-se.model";
import { DauCungMau, OTich } from "./chon-mau";
import { layChu } from "@/messages/may-chu";
import { nhanCo } from "./nhan-co";
import { LienKetDrive } from "./lien-ket-drive";
import { ClipDaXuLy } from "./clip-da-xu-ly";
import { AnhTai } from "@/ui/anh-tai";
import { DauCot } from "./dau-cot";
import { dongLapMa, type CotAnDuoc, type KhoaSap, type SapXep } from "@/modules/sheet/catalogue.view";
import { anhThuNho } from "@/modules/sheet/anh-dai-dien";


/** Chuan tieng Viet dung dau phay thap phan, du bang tinh ghi dau cham. */
function dinhDangGam(v: number | null): string | null {
  return v === null ? null : v.toFixed(2).replace(".", ",");
}

// Dem ngang 12px thay vi 16px va doc 10px thay vi 12px: 16 cot nhan voi 8px
// tiet kiem la gan mot cot. Cham vao con so nay thi nho do lai be ngang bang.
const O_TIEU_DE =
  "whitespace-nowrap border-b border-hp-rule px-2.5 py-2.5 text-left " +
  "text-[11px] uppercase tracking-[0.14em] text-hp-muted";
const O_DU_LIEU = "border-b border-hp-rule px-2.5 py-2.5 align-top text-hp-body";
const O_GON = `${O_DU_LIEU} whitespace-nowrap`;
const O_SO = `${O_GON} tabular-nums`;

/** O rong hien dau gach thay vi de trong, de phan biet voi loi trinh bay. */
async function Trong() {
  const t = await layChu();
  return <span className="text-hp-muted">{t.catalogue_sheet.o_trong}</span>;
}

function Chu({ v }: { v: string | null }) {
  return v === null ? <Trong /> : <>{v}</>;
}

export async function BangCatalogue({
  ds,
  an,
  sap,
  urlSap,
}: {
  ds: DongCatalogue[];
  /** Cot khong bao gio co du lieu — bo han khoi bang. */
  an: Set<CotAnDuoc>;
  sap: SapXep;
  urlSap: (khoa: KhoaSap) => string;
}) {
  const t = await layChu();
  const nhan = nhanCo(t);
  const hien = (c: CotAnDuoc) => !an.has(c);
  // Mot ma mau trai tren nhieu dong thi chi dong dau mang o tich — xem dongLapMa.
  const lap = dongLapMa(ds, khoaMau);
  return (
    // Bang rong hon man hinh phai tu cuon trong khung cua no, khong day ca trang
    // truot ngang.
    <div className="overflow-x-auto border border-hp-rule">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-hp-inset">
            {/* Cot o tich khong co tieu de chu: mot chu "Chon" o day chi lam
                hang tieu de nang them ma khong noi gi hon chinh cai o tich. */}
            <th className={O_TIEU_DE} aria-label={t.chia_se.tao_catalogue} />
            <th className={O_TIEU_DE}>{t.catalogue_sheet.cot_anh}</th>
            {hien("sku") && (
              <th className={O_TIEU_DE}>
                <DauCot khoa="sku" nhan={t.catalogue_sheet.cot_sku} sap={sap} urlSap={urlSap} />
              </th>
            )}
            {hien("so") && (
              <th className={O_TIEU_DE}>
                <DauCot khoa="so" nhan={t.catalogue_sheet.cot_so} sap={sap} urlSap={urlSap} />
              </th>
            )}
            {hien("mo") && (
              <th className={O_TIEU_DE}>
                <DauCot khoa="mo" nhan={t.catalogue_sheet.cot_mo} sap={sap} urlSap={urlSap} />
              </th>
            )}
            {hien("chiTiet") && (
              <th className={O_TIEU_DE}>
                <DauCot khoa="chiTiet" nhan={t.catalogue_sheet.cot_chi_tiet} sap={sap} urlSap={urlSap} />
              </th>
            )}
            <th className={O_TIEU_DE}>
              <DauCot khoa="maMau" nhan={t.catalogue_sheet.cot_ma_mau} sap={sap} urlSap={urlSap} />
            </th>
            <th className={O_TIEU_DE}>
              <DauCot khoa="loaiSp" nhan={t.catalogue_sheet.cot_loai_sp} sap={sap} urlSap={urlSap} />
            </th>
            <th className={O_TIEU_DE}>
              <DauCot khoa="dongSp" nhan={t.catalogue_sheet.cot_dong_sp} sap={sap} urlSap={urlSap} />
            </th>
            <th className={O_TIEU_DE}>
              <DauCot khoa="chatLieu" nhan={t.catalogue_sheet.cot_chat_lieu} sap={sap} urlSap={urlSap} />
            </th>
            <th className={O_TIEU_DE}>
              <DauCot khoa="mau" nhan={t.catalogue_sheet.cot_mau} sap={sap} urlSap={urlSap} />
            </th>
            <th className={O_TIEU_DE}>
              <DauCot khoa="tlVang" nhan={t.catalogue_sheet.cot_tl_vang} sap={sap} urlSap={urlSap} />
            </th>
            {hien("size") && (
              <th className={O_TIEU_DE}>
                <DauCot khoa="size" nhan={t.catalogue_sheet.cot_size} sap={sap} urlSap={urlSap} />
              </th>
            )}
            {hien("oChu") && <th className={O_TIEU_DE}>{t.catalogue_sheet.cot_o_chu}</th>}
            {hien("thuMuc") && <th className={O_TIEU_DE}>{t.catalogue_sheet.cot_thu_muc}</th>}
            {hien("clip") && <th className={O_TIEU_DE}>{t.catalogue_sheet.cot_clip}</th>}
            <th className={O_TIEU_DE}>{t.catalogue_sheet.cot_canh_bao}</th>
          </tr>
        </thead>
        <tbody>
          {ds.map((d) => (
            <tr
              key={d.dongSheet}
              data-dong={d.dongSheet}
              className="cursor-pointer bg-hp-card transition-colors duration-150 hover:bg-hp-inset"
            >
              <td className={`${O_DU_LIEU} w-px`}>
                {lap.has(d.dongSheet)
                  ? <DauCungMau ma={khoaMau(d)} />
                  : <OTich ma={khoaMau(d)} />}
              </td>
              <td className={O_DU_LIEU}>
                <div className="flex h-11 w-11 items-center justify-center bg-hp-inset">
                  {anhThuNho(d) ? (
                    <AnhTai
                      src={`/api/anh-drive/${anhThuNho(d)}`}
                      alt={d.maMau ?? t.catalogue_sheet.anh_chua_co_ma_mau}
                      lop="h-full w-full object-contain"
                    />
                  ) : null}
                </div>
              </td>

              {hien("sku") && <td className={O_SO}><Chu v={d.sku} /></td>}
              {hien("so") && <td className={O_SO}><Chu v={d.so} /></td>}
              {hien("mo") && <td className={O_SO}><Chu v={d.mo} /></td>}
              {hien("chiTiet") && (
                /* Cot dai nhat bang: 70 ky tu. Truoc day no doi min-w 24rem va
                   mot minh no day ca bang vuot ra ngoai man hinh. Cat bot va
                   giu nguyen van o thuoc tinh title — ban day du van doc duoc o
                   ngan chi tiet, chi mot cu bam. */
                <td className={O_DU_LIEU}>
                  {d.chiTiet === null ? <Trong /> : (
                    <span className="block max-w-[12rem] truncate" title={d.chiTiet}>
                      {d.chiTiet}
                    </span>
                  )}
                </td>
              )}
              <td className={`${O_GON} text-hp-ink`}>
                {d.maMau ?? t.catalogue_sheet.chua_co_ma_mau}
              </td>
              <td className={O_GON}><Chu v={d.loaiSp} /></td>
              <td className={O_GON}><Chu v={d.dongSp} /></td>
              <td className={O_GON}><Chu v={d.chatLieu} /></td>
              <td className={O_GON}><Chu v={d.mau} /></td>
              <td className={O_SO}>{dinhDangGam(d.tlVang) ?? <Trong />}</td>
              {hien("size") && <td className={O_SO}><Chu v={d.size} /></td>}
              {hien("oChu") && <td className={O_GON}><Chu v={d.oChu} /></td>}

              {hien("thuMuc") && (
                <td className={O_GON}>
                  <LienKetDrive d={d} t={t} />
                </td>
              )}
              {hien("clip") && (
                <td className={O_GON}>
                  <ClipDaXuLy d={d} t={t} />
                </td>
              )}

              <td className={`${O_DU_LIEU} text-[10px] uppercase tracking-[0.14em] text-hp-muted`}>
                {d.co.length === 0 ? null : d.co.map((c) => nhan[c]).join(" · ")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
