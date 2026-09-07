import type { CoBatThuong, DongCatalogue } from "@/modules/sheet/catalogue.mapper";
import { vi } from "@/messages/vi";

const NHAN_CO: Record<CoBatThuong, string> = {
  "thieu-sku": vi.catalogue_sheet.co_thieu_sku,
  "thieu-anh": vi.catalogue_sheet.co_thieu_anh,
  "thieu-mo-ta": vi.catalogue_sheet.co_thieu_mo_ta,
  "trung": vi.catalogue_sheet.co_trung,
  "tl-vang-lech": vi.catalogue_sheet.co_tl_vang_lech,
};

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
function Trong() {
  return <span className="text-hp-muted">{vi.catalogue_sheet.o_trong}</span>;
}

function Chu({ v }: { v: string | null }) {
  return v === null ? <Trong /> : <>{v}</>;
}

export function BangCatalogue({ ds }: { ds: DongCatalogue[] }) {
  return (
    // Bang rong hon man hinh phai tu cuon trong khung cua no, khong day ca trang
    // truot ngang.
    <div className="overflow-x-auto border border-hp-rule">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-hp-inset">
            <th className={O_TIEU_DE}>{vi.catalogue_sheet.cot_anh}</th>
            <th className={O_TIEU_DE}>{vi.catalogue_sheet.cot_sku}</th>
            <th className={O_TIEU_DE}>{vi.catalogue_sheet.cot_so}</th>
            <th className={O_TIEU_DE}>{vi.catalogue_sheet.cot_mo}</th>
            <th className={O_TIEU_DE}>{vi.catalogue_sheet.cot_chi_tiet}</th>
            <th className={O_TIEU_DE}>{vi.catalogue_sheet.cot_ma_mau}</th>
            <th className={O_TIEU_DE}>{vi.catalogue_sheet.cot_loai}</th>
            <th className={O_TIEU_DE}>{vi.catalogue_sheet.cot_dong_sp}</th>
            <th className={O_TIEU_DE}>{vi.catalogue_sheet.cot_chat_lieu}</th>
            <th className={O_TIEU_DE}>{vi.catalogue_sheet.cot_tl_vang}</th>
            <th className={O_TIEU_DE}>{vi.catalogue_sheet.cot_size}</th>
            <th className={O_TIEU_DE}>{vi.catalogue_sheet.cot_o_chu}</th>
            <th className={O_TIEU_DE}>{vi.catalogue_sheet.cot_thu_muc}</th>
            <th className={O_TIEU_DE}>{vi.catalogue_sheet.cot_canh_bao}</th>
          </tr>
        </thead>
        <tbody>
          {ds.map((d) => (
            <tr
              key={d.dongSheet}
              className="bg-hp-card transition-colors duration-150 hover:bg-hp-inset"
            >
              <td className={O_DU_LIEU}>
                <div className="flex h-14 w-14 items-center justify-center bg-hp-inset">
                  {d.fileIdAnh ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={`/api/anh-drive/${d.fileIdAnh}`}
                      alt={d.maMau ?? vi.catalogue_sheet.anh_chua_co_ma_mau}
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
              <td className={`${O_GON} text-hp-ink`}><Chu v={d.maMau} /></td>
              <td className={O_GON}><Chu v={d.loai} /></td>
              <td className={O_GON}><Chu v={d.dongSp} /></td>
              <td className={O_GON}><Chu v={d.chatLieu} /></td>
              <td className={O_SO}>{dinhDangGam(d.tlVang) ?? <Trong />}</td>
              <td className={O_SO}><Chu v={d.size} /></td>
              <td className={O_GON}><Chu v={d.oChu} /></td>

              <td className={O_GON}>
                {d.urlThuMuc ? (
                  <a
                    href={d.urlThuMuc}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] uppercase tracking-[0.14em] text-hp-muted
                               transition-colors duration-150 hover:text-hp-ink hover:underline"
                  >
                    {vi.catalogue_sheet.mo_thu_muc}
                  </a>
                ) : (
                  <Trong />
                )}
              </td>

              <td className={`${O_DU_LIEU} text-[10px] uppercase tracking-[0.14em] text-hp-muted`}>
                {d.co.length === 0 ? null : d.co.map((c) => NHAN_CO[c]).join(" · ")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
