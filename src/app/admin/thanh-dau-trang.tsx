"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronUp, Inbox, Menu, Users } from "lucide-react";
import { useChu } from "@/messages/dung-chu";
import { MUC_CHINH, laTrangDangMo, lopDongMenu } from "./dieu-huong";

/**
 * Thanh dau trang cua khu noi bo, dung lai 11/09/2026.
 *
 * Truoc day tam muc — ba trang lam viec, hop gop y, tai khoan, ten nguoi dung,
 * ngon ngu, dang xuat — nam ngang hang, moi muc mot icon. Man hinh 1280px la chu
 * xuong dong, thanh cao gap doi, va khong muc nao noi len duoc.
 *
 * Nay chia theo tan suat dung:
 *  - Ba trang lam viec hang ngay nam ngang, chi chu, co gach duoi trang dang mo.
 *  - Doi ngon ngu VI / EN nam ngay tren thanh (xem layout.tsx): de trong menu
 *    thi nguoi dung khong biet la co ban tieng Anh.
 *  - Moi thu con lai (hop gop y, tai khoan, dang xuat) vao menu cua nguoi dung o
 *    goc phai — nhung thu mot tuan bam vai lan thi khong can cho tren thanh.
 *  - Duoi 1024px: ca ba trang cung vao menu, thanh chi con logo, ngon ngu va nut
 *    "Menu". Nguong la 1024 chu khong phai 768: do that o 768px, logo + ba muc +
 *    mot ten dai da tran ra ngoai mep phai.
 */

const MUC = "text-[11px] uppercase tracking-[0.14em] whitespace-nowrap transition-colors duration-150";
const ICON = { "aria-hidden": true, strokeWidth: 1.5, className: "h-4 w-4 shrink-0" } as const;

/** Ba trang lam viec, nam ngang tu 1024px tro len. */
export function MenuChinh() {
  const t = useChu();
  const duongDan = usePathname();

  return (
    <nav aria-label={t.dieu_huong.trang_chinh} className="hidden self-stretch lg:flex lg:gap-8">
      {MUC_CHINH.map((m) => {
        const dangMo = laTrangDangMo(duongDan, m.href);
        return (
          <Link
            key={m.href}
            href={m.href}
            aria-current={dangMo ? "page" : undefined}
            // Trang dang mo: mot net muc 1px de len duong ke day thanh — cung cach
            // danh dau voi "Bang / Luoi anh" trong trang, khong them mau.
            className={`relative flex items-center ${MUC} ${
              dangMo
                ? "text-hp-ink after:absolute after:inset-x-0 after:-bottom-px after:h-px after:bg-hp-ink"
                : "text-hp-muted hover:text-hp-ink"
            }`}
          >
            {m.chu(t)}
          </Link>
        );
      })}
    </nav>
  );
}

/**
 * Menu cua nguoi dung o goc phai: ten -> bang tha xuong.
 *
 * Nut dang xuat do khung may chu dung roi truyen vao (`nutDangXuat`): no la mot
 * form goi server action, de phia may chu lo thi thanh phan nay khong phai biet
 * toi cach dang xuat.
 */
export function MenuTaiKhoan({
  hoTen,
  email,
  laQuanTri,
  nutDangXuat,
}: {
  hoTen: string;
  email: string;
  laQuanTri: boolean;
  nutDangXuat: ReactNode;
}) {
  const t = useChu();
  const duongDan = usePathname();
  // Mo GAN VOI trang dang xem: sang trang khac thi tu dong lai, khong can mot
  // effect goi setState moi lan doi duong dan.
  const [moTai, setMoTai] = useState<string | null>(null);
  const mo = moTai !== null && moTai === duongDan;
  const khung = useRef<HTMLDivElement>(null);
  const nut = useRef<HTMLButtonElement>(null);
  const idBang = useId();

  useEffect(() => {
    if (!mo) return;
    const bamRaNgoai = (e: PointerEvent) => {
      if (khung.current && !khung.current.contains(e.target as Node)) setMoTai(null);
    };
    const bamPhim = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setMoTai(null);
      nut.current?.focus();
    };
    document.addEventListener("pointerdown", bamRaNgoai);
    document.addEventListener("keydown", bamPhim);
    return () => {
      document.removeEventListener("pointerdown", bamRaNgoai);
      document.removeEventListener("keydown", bamPhim);
    };
  }, [mo]);

  const dong = () => setMoTai(null);

  return (
    <div ref={khung} className="flex items-center self-stretch lg:relative">
      <button
        ref={nut}
        type="button"
        onClick={() => setMoTai(mo ? null : duongDan)}
        aria-expanded={mo}
        aria-controls={idBang}
        className={`flex items-center gap-1.5 ${MUC} ${mo ? "text-hp-ink" : "text-hp-muted hover:text-hp-ink"}`}
      >
        <span className="flex items-center gap-1.5 lg:hidden">
          <Menu {...ICON} />
          {t.dieu_huong.menu}
        </span>
        <span className="hidden items-center gap-1.5 lg:flex">
          {/* 12rem chu khong rong hon: tu khi doi ngon ngu nam tren thanh, o 1024px
              mot ten dai hon the nay se day ca thanh tran ra mep phai. */}
          <span className="max-w-[12rem] truncate">{hoTen}</span>
          {mo ? <ChevronUp {...ICON} /> : <ChevronDown {...ICON} />}
        </span>
      </button>

      {mo && (
        <div
          id={idBang}
          // Duoi 1024px: trai ngang duoi thanh. Tu 1024px: mot bang 18rem bam vao
          // goc phai, mep tren trung duong ke day thanh. z-[60] de nam TREN tab gop
          // y noi (z-[55]) — tren dien thoai tab do de len noi dung cua menu.
          className="absolute inset-x-0 top-full z-[60] border-b border-hp-rule bg-hp-card
                     lg:inset-x-auto lg:right-0 lg:-mt-px lg:w-72 lg:border
                     lg:shadow-[0_12px_40px_rgba(42,39,37,0.08)]"
        >
          <nav aria-label={t.dieu_huong.trang_chinh} className="border-b border-hp-rule py-2 lg:hidden">
            {MUC_CHINH.map((m) => {
              const dangMo = laTrangDangMo(duongDan, m.href);
              return (
                <Link
                  key={m.href}
                  href={m.href}
                  onClick={dong}
                  aria-current={dangMo ? "page" : undefined}
                  className={lopDongMenu(dangMo)}
                >
                  {m.chu(t)}
                </Link>
              );
            })}
          </nav>

          <div className="border-b border-hp-rule px-5 py-4">
            <p className="truncate text-sm text-hp-ink">{hoTen}</p>
            <p className="mt-0.5 truncate text-xs text-hp-muted">{email}</p>
          </div>

          {/* Chi admin moi thay loi vao hai man hinh nay. Day KHONG phai lop gac
              — ca hai trang va moi server action cua chung deu tu goi
              requireAdmin(); giau di chi de sale khong bam vao cho chac chan bi
              tu choi. "Hop gop y" chu khong phai "Gop y": tab gop y noi o mep
              phai cung mang chu "Gop y". */}
          {laQuanTri && (
            <div className="border-b border-hp-rule py-2">
              <p className="px-5 pb-1 pt-2 text-[10px] uppercase tracking-[0.14em] text-hp-muted">
                {t.dieu_huong.quan_tri}
              </p>
              <Link
                href="/admin/gop-y"
                onClick={dong}
                aria-current={laTrangDangMo(duongDan, "/admin/gop-y") ? "page" : undefined}
                className={lopDongMenu(laTrangDangMo(duongDan, "/admin/gop-y"))}
              >
                <Inbox {...ICON} />
                {t.gop_y.nut_menu}
              </Link>
              <Link
                href="/admin/nguoi-dung"
                onClick={dong}
                aria-current={laTrangDangMo(duongDan, "/admin/nguoi-dung") ? "page" : undefined}
                className={lopDongMenu(laTrangDangMo(duongDan, "/admin/nguoi-dung"))}
              >
                <Users {...ICON} />
                {t.nguoi_dung.nut_menu}
              </Link>
            </div>
          )}

          <div className="py-2">{nutDangXuat}</div>
        </div>
      )}
    </div>
  );
}
