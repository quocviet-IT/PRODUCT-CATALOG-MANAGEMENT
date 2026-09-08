import type { DongCatalogue } from "@/modules/sheet/catalogue.mapper";
import { khoaMau } from "@/modules/catalogue-share/chia-se.model";
import { OTich } from "./chon-mau";
import { layChu } from "@/messages/may-chu";
import { nhanCo } from "./nhan-co";
import { LienKetDrive } from "./lien-ket-drive";


/** Chuan tieng Viet dung dau phay thap phan, du bang tinh ghi dau cham. */
function dinhDangGam(v: number | null): string | null {
  return v === null ? null : v.toFixed(2).replace(".", ",");
}

const O_TIEU_DE =
  "whitespace-nowrap border-b border-hp-rule px-4 py-3 text-left " +
  "text-[11px] uppercase tracking-[0.14em] text-hp-muted";
const O_DU_LIEU = "border-b border-hp-rule px-4 py-3 align-top text-hp-body";
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

export async function BangCatalogue({ ds }: { ds: DongCatalogue[] }) {
  const t = await layChu();
  const nhan = nhanCo(t);
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
            <th className={O_TIEU_DE}>{t.catalogue_sheet.cot_sku}</th>
            <th className={O_TIEU_DE}>{t.catalogue_sheet.cot_so}</th>
            <th className={O_TIEU_DE}>{t.catalogue_sheet.cot_mo}</th>
            <th className={O_TIEU_DE}>{t.catalogue_sheet.cot_chi_tiet}</th>
            <th className={O_TIEU_DE}>{t.catalogue_sheet.cot_ma_mau}</th>
            <th className={O_TIEU_DE}>{t.catalogue_sheet.cot_loai_sp}</th>
            <th className={O_TIEU_DE}>{t.catalogue_sheet.cot_dong_sp}</th>
            <th className={O_TIEU_DE}>{t.catalogue_sheet.cot_chat_lieu}</th>
            <th className={O_TIEU_DE}>{t.catalogue_sheet.cot_mau}</th>
            <th className={O_TIEU_DE}>{t.catalogue_sheet.cot_tl_vang}</th>
            <th className={O_TIEU_DE}>{t.catalogue_sheet.cot_size}</th>
            <th className={O_TIEU_DE}>{t.catalogue_sheet.cot_o_chu}</th>
            <th className={O_TIEU_DE}>{t.catalogue_sheet.cot_thu_muc}</th>
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
                <OTich ma={khoaMau(d)} />
              </td>
              <td className={O_DU_LIEU}>
                <div className="flex h-14 w-14 items-center justify-center bg-hp-inset">
                  {d.fileIdAnh ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={`/api/anh-drive/${d.fileIdAnh}`}
                      alt={d.maMau ?? t.catalogue_sheet.anh_chua_co_ma_mau}
                      loading="lazy"
                      className="h-full w-full object-contain"
                    />
                  ) : null}
                </div>
              </td>

              <td className={O_SO}><Chu v={d.sku} /></td>
              <td className={O_SO}><Chu v={d.so} /></td>
              <td className={O_SO}><Chu v={d.mo} /></td>
              <td className={`${O_DU_LIEU} min-w-[24rem]`}><Chu v={d.chiTiet} /></td>
              <td className={`${O_GON} text-hp-ink`}>
                {d.maMau ?? t.catalogue_sheet.chua_co_ma_mau}
              </td>
              <td className={O_GON}><Chu v={d.loaiSp} /></td>
              <td className={O_GON}><Chu v={d.dongSp} /></td>
              <td className={O_GON}><Chu v={d.chatLieu} /></td>
              <td className={O_GON}><Chu v={d.mau} /></td>
              <td className={O_SO}>{dinhDangGam(d.tlVang) ?? <Trong />}</td>
              <td className={O_SO}><Chu v={d.size} /></td>
              <td className={O_GON}><Chu v={d.oChu} /></td>

              <td className={O_GON}>
                <LienKetDrive d={d} t={t} />
              </td>

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
