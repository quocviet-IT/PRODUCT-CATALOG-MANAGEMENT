import Link from "next/link";
import type { ThongKe } from "@/modules/sheet/catalogue.view";
import type { BoLocCatalogue } from "@/modules/sheet/catalogue.view";
import { vi } from "@/messages/vi";

const NHAN_EYEBROW = "block text-[11px] uppercase tracking-[0.14em] text-hp-muted";

function MucLoc({
  ten, giaTri, hienTai, nhan, soLuong,
}: {
  ten: string; giaTri: string; hienTai: string | null; nhan: string; soLuong?: number;
}) {
  const dangBat = (hienTai ?? "") === giaTri;
  return (
    <label className="cursor-pointer">
      <input type="radio" name={ten} value={giaTri} defaultChecked={dangBat} className="sr-only peer" />
      <span
        className={`inline-block border-b-2 pb-0.5 text-[11px] uppercase tracking-[0.14em]
                    transition-colors duration-150
                    ${dangBat ? "border-hp-pink text-hp-ink" : "border-transparent text-hp-muted hover:text-hp-ink"}`}
      >
        {nhan}
        {soLuong !== undefined && <span className="ml-1.5 tabular-nums">{soLuong}</span>}
      </span>
    </label>
  );
}

export function ThanhBoLoc({ thongKe, hienTai }: { thongKe: ThongKe; hienTai: BoLocCatalogue }) {
  return (
    <form method="get" className="mb-10 space-y-6">
      <div className="max-w-sm">
        <label className={NHAN_EYEBROW} htmlFor="q">
          {vi.catalogue_sheet.tim_kiem_nhan}
        </label>
        <input
          id="q" name="q" defaultValue={hienTai.q ?? ""}
          className="mt-2 w-full border-0 border-b border-hp-rule bg-transparent px-0.5 py-1.5
                     font-body text-base text-hp-body transition-colors duration-150
                     focus:border-b-2 focus:border-hp-pink focus:pb-[5px] focus:outline-none"
        />
      </div>

      <div className="flex flex-wrap items-baseline gap-x-6 gap-y-3">
        <span className={`${NHAN_EYEBROW} w-24`}>{vi.catalogue_sheet.chat_lieu}</span>
        <MucLoc ten="chat_lieu" giaTri="" hienTai={hienTai.chatLieu}
                nhan={vi.catalogue_sheet.tat_ca} soLuong={thongKe.tong} />
        {thongKe.theoChatLieu.map((m) => (
          <MucLoc key={m.gia_tri} ten="chat_lieu" giaTri={m.gia_tri} hienTai={hienTai.chatLieu}
                  nhan={m.gia_tri} soLuong={m.soLuong} />
        ))}
      </div>

      <div className="flex flex-wrap items-baseline gap-x-6 gap-y-3">
        <span className={`${NHAN_EYEBROW} w-24`}>{vi.catalogue_sheet.loai_xoan}</span>
        <MucLoc ten="loai_xoan" giaTri="" hienTai={hienTai.loaiXoan}
                nhan={vi.catalogue_sheet.tat_ca} />
        {thongKe.theoLoaiXoan.map((m) => (
          <MucLoc key={m.gia_tri} ten="loai_xoan" giaTri={m.gia_tri} hienTai={hienTai.loaiXoan}
                  nhan={m.gia_tri === "lab" ? vi.catalogue_sheet.xoan_lab : vi.catalogue_sheet.xoan_tu_nhien}
                  soLuong={m.soLuong} />
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-6">
        <label className="flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-hp-muted">
          <input type="checkbox" name="canh_bao" value="1" defaultChecked={hienTai.chiCanhBao}
                 className="accent-hp-ink" />
          {vi.catalogue_sheet.chi_canh_bao}
        </label>

        <button
          className="rounded-sm bg-hp-ink px-[22px] py-[14px] text-xs uppercase tracking-[0.14em]
                     text-hp-foundation transition-colors duration-150 hover:bg-hp-pink-strong"
        >
          {vi.catalogue_sheet.loc}
        </button>

        <Link href="/admin/catalogue-sheet"
              className="text-[11px] uppercase tracking-[0.14em] text-hp-muted hover:text-hp-ink">
          {vi.catalogue_sheet.xoa_loc}
        </Link>
      </div>
    </form>
  );
}
