import type { BoChu } from "@/messages";

/**
 * Ba trang lam viec hang ngay — nam ngang tren thanh dau trang.
 *
 * Nhung thu con lai (hop gop y, tai khoan, ngon ngu, dang xuat) vao menu cua
 * nguoi dung o goc phai: truoc 11/09/2026 ca tam muc nam ngang hang tren mot
 * thanh, man hinh 1280px la chu da xuong dong va thanh dau trang cao gap doi.
 */
export const MUC_CHINH = [
  { href: "/admin/catalogue-sheet", chu: (t: BoChu) => t.catalogue_sheet.tieu_de },
  { href: "/admin/catalogue", chu: (t: BoChu) => t.danh_sach_catalogue.nut_menu },
  { href: "/admin/huong-dan", chu: (t: BoChu) => t.huong_dan.nut_menu },
] as const;

/**
 * Trang dang mo co thuoc muc `href` khong: dung trang do, hoac mot trang con.
 *
 * So theo TUNG DOAN duong dan, khong so tien to tho: "/admin/catalogue-sheet"
 * bat dau bang "/admin/catalogue", so tien to tho thi ca hai muc cung sang.
 */
export function laTrangDangMo(duongDan: string | null, href: string): boolean {
  if (!duongDan) return false;
  return duongDan === href || duongDan.startsWith(`${href}/`);
}

/** Mot dong trong menu nguoi dung. Dung chung cho link va nut dang xuat. */
export function lopDongMenu(dangMo = false): string {
  return (
    "flex w-full items-center gap-2.5 px-5 py-2.5 text-left text-[11px] uppercase " +
    "tracking-[0.14em] whitespace-nowrap transition-colors duration-150 hover:bg-hp-inset " +
    "disabled:cursor-not-allowed disabled:opacity-40 " +
    (dangMo ? "text-hp-ink" : "text-hp-muted hover:text-hp-ink")
  );
}
