import { Anh, GioiThieu, ThongSoDong, mocAnh, thongSo, type DoiSo } from "./bo-cuc-chung";

/**
 * Ba bo cuc XU HUONG 2026 (15/09/2026) — tach khoi bo-cuc.tsx de tep do khong phinh them.
 * Nguon xu huong da kiem ghi trong docs/superpowers/specs/2026-09-15-bo-cuc-xu-huong-design.md.
 *
 * Cung luat voi tam bo cuc cu (xem dau bo-cuc.tsx): duyet mau va anh theo dung thu tu goc,
 * duoc phep chi hien mot phan anh — khung phong to tim anh theo fileId. Them hai luat: moi
 * mau mot <li data-muc>, va KHONG chu nao de len anh (anh de anh thi duoc) — chu mau nhan
 * de len nen anh gan trang da tung khong doc duoc tren tong toi.
 *
 * Tep nay KHONG import tu bo-cuc.tsx (bo-cuc.tsx import tu day): chi dung bo-cuc-chung.
 */

/** Net hoa tiet giu dung mot pixel du khung SVG phong to hay thu nho. */
const NET = { vectorEffect: "non-scaling-stroke" } as const;

/**
 * Goc bac thang — ba duong gap long nhau, hoa tiet goc khung Art Deco. `lop` dat vi tri va
 * lat guong cho ba goc con lai.
 */
function GocBacThang({ lop }: { lop: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1}
      className={`pointer-events-none absolute h-5 w-5 text-hp-pink sm:h-6 sm:w-6 ${lop}`}
    >
      <path {...NET} d="M1 23V1h22" />
      <path {...NET} d="M5 17V5h12" />
      <path {...NET} d="M9 11V9h2" />
    </svg>
  );
}

/** Quat toa tia (nua mat troi): cung tron, bay tia va duong day — ngan anh voi ten mau. */
function QuatToaTia({ lop }: { lop: string }) {
  const tia = [0, 30, 60, 90, 120, 150, 180].map((goc) => {
    const r = (goc * Math.PI) / 180;
    return {
      x1: (50 - 12 * Math.cos(r)).toFixed(2),
      y1: (46 - 12 * Math.sin(r)).toFixed(2),
      x2: (50 - 40 * Math.cos(r)).toFixed(2),
      y2: (46 - 40 * Math.sin(r)).toFixed(2),
    };
  });
  return (
    <svg
      aria-hidden
      viewBox="0 0 100 50"
      fill="none"
      stroke="currentColor"
      strokeWidth={1}
      className={`text-hp-pink ${lop}`}
    >
      <path {...NET} d="M6 46A44 44 0 0 1 94 46" />
      {tia.map((d, k) => (
        <line key={k} {...NET} x1={d.x1} y1={d.y1} x2={d.x2} y2={d.y2} />
      ))}
      <line {...NET} x1="0" y1="46" x2="100" y2="46" />
    </svg>
  );
}

/** Khien nho chua so thu tu — "dau kiem dinh" dau moi khung Art Deco. */
function KhienSo({ so }: { so: number }) {
  return (
    <span className="relative flex h-11 w-9 items-center justify-center">
      <svg
        aria-hidden
        viewBox="0 0 36 44"
        fill="none"
        stroke="currentColor"
        strokeWidth={1}
        className="absolute inset-0 h-full w-full text-hp-pink"
      >
        <path {...NET} d="M2 2h32v24c0 8-8 13-16 16C10 39 2 34 2 26Z" />
      </svg>
      <span className="relative font-title text-[13px] tabular-nums leading-none text-hp-ink">
        {String(so).padStart(2, "0")}
      </span>
    </span>
  );
}

/**
 * Bo cuc 9 — khung Art Deco (xu huong "Neodeco", Pinterest Predicts 2026).
 *
 * Khung ke doi nhu Khung co dien nhung co HOA TIET: goc bac thang, quat toa tia, khien so;
 * thong so chia hai cot doi xung. Mot anh chinh lon; anh thu hai (neu co) nam trong huy
 * hieu tron de len goc anh chinh. Cac anh con lai chi dem so — bam anh la luot du. Moi mau
 * mot to giay khi in.
 */
export function KhungArtDeco({ muc, g, t }: DoiSo) {
  const moc = mocAnh(muc);
  return (
    <ul data-bo-cuc="art-deco" className="space-y-14 print:space-y-0">
      {muc.map((m, i) => {
        const [chinh, huyHieu] = m.anh;
        const ct = thongSo(m, g, t);
        return (
          <li
            key={`${m.maMau ?? "x"}-${i}`}
            data-muc={i}
            className="break-inside-avoid border border-hp-rule p-1.5 sm:p-2 print:break-after-page"
          >
            <div className="relative flex flex-col items-center border border-hp-rule px-5 pb-8 pt-6 text-center sm:px-12 sm:pb-12">
              <GocBacThang lop="left-2 top-2" />
              <GocBacThang lop="right-2 top-2 -scale-x-100" />
              <GocBacThang lop="bottom-2 left-2 -scale-y-100" />
              <GocBacThang lop="bottom-2 right-2 -scale-x-100 -scale-y-100" />

              <KhienSo so={i + 1} />

              {chinh && (
                <div className="relative mt-6 w-full max-w-xl">
                  <Anh m={m} fileId={chinh.fileId} ten={chinh.ten} rong={1600}
                       tyLe="aspect-[4/3]" uuTien={moc[i] === 0} />
                  {huyHieu && (
                    <div
                      data-huy-hieu
                      className="absolute -bottom-6 -right-2 w-20 rounded-full border border-hp-rule
                                 bg-hp-foundation p-1 sm:-right-6 sm:w-28"
                    >
                      <Anh m={m} fileId={huyHieu.fileId} ten={huyHieu.ten} rong={400}
                           tyLe="aspect-square rounded-full" uuTien={false} />
                    </div>
                  )}
                </div>
              )}

              <QuatToaTia lop="mt-10 h-8 w-36 sm:w-44" />

              {/* Khong dung MaMau: o day ma mau la tieu de cua khung, MaMau la nhan nho. */}
              <span className="mt-4 font-title text-[20px] uppercase leading-tight tracking-[0.28em] text-hp-ink sm:text-[24px]">
                {m.maMau ?? t.catalogue_sheet.chua_co_ma_mau}
              </span>

              {/* Hai cot doi xung — ThongSoBang luon thanh bon cot tren man hinh lon. */}
              {ct.length > 0 && (
                <dl className="mt-6 grid w-full max-w-md grid-cols-2 gap-x-10 gap-y-4 border-t border-hp-rule pt-6">
                  {ct.map(([nhan, v]) => (
                    <div key={nhan}>
                      <dt className="text-[10px] uppercase tracking-[0.18em] text-hp-muted">{nhan}</dt>
                      <dd className="mt-1 text-sm text-hp-body">{v}</dd>
                    </div>
                  ))}
                </dl>
              )}

              <GioiThieu m={m} lop="mx-auto mt-5" />

              {m.anh.length > 1 && (
                <span className="mt-5 text-[11px] tabular-nums text-hp-muted">
                  {t.chia_se.bang_mau_so_anh.replace("{n}", String(m.anh.length))}
                </span>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * Bo cuc 10 — the tieu ban (xu huong "The visual index" / "Trinket design" 2026).
 *
 * Nhieu mau mot trang nhu tu trung bay bao tang: anh nen trang dat thang tren nen trang,
 * khong khung; duoi moi anh mot nhan so kieu tieu ban, chu don cach. Chi hien anh CHINH —
 * bam vao van luot du anh. Khac Bang mau (hang du lieu, chu dan dat) va Luoi anh (moi anh
 * mot o): o day moi MAU mot the, anh dan dat. Vach cham duoi moi the nhu khay trung bay,
 * de trang khong trong tron.
 *
 * Khong co dong dem rieng: dau trang khach va ban Xem truoc da hien so mau (anh chot 15/09/2026).
 */
export function TheTieuBan({ muc, g, t }: DoiSo) {
  return (
    <ul
      data-bo-cuc="tieu-ban"
      className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 sm:gap-x-8 print:grid-cols-3"
    >
      {muc.map((m, i) => {
        const [chinh] = m.anh;
        const nhan = [
          t.chia_se.tieu_ban_so.replace("{n}", String(i + 1).padStart(3, "0")),
          m.maMau ?? t.catalogue_sheet.chua_co_ma_mau,
          ...(m.anh.length > 1 ? [t.chia_se.bang_mau_so_anh.replace("{n}", String(m.anh.length))] : []),
        ].join(" · ");
        return (
          <li
            key={`${m.maMau ?? "x"}-${i}`}
            data-muc={i}
            className="break-inside-avoid border-b border-dotted border-hp-rule pb-6"
          >
            {chinh ? (
              // Ba the dau nam tren man hinh dau tien: tai ngay.
              <Anh m={m} fileId={chinh.fileId} ten={chinh.ten} rong={900}
                   tyLe="aspect-[4/3]" uuTien={i < 3} />
            ) : (
              <div aria-hidden className="aspect-[4/3] bg-hp-plate" />
            )}
            <span aria-hidden className="mt-3 block h-px bg-hp-rule" />
            <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.08em] text-hp-muted">{nhan}</p>
            <ThongSoDong ds={thongSo(m, g, t)} lop="mt-1.5" />
            <GioiThieu m={m} lop="mt-2" />
          </li>
        );
      })}
    </ul>
  );
}
