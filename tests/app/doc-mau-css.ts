import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Doc bang mau cua cac tong THANG tu globals.css — dung chung cho test tuong phan cua
 * tong va cua mau nhan, de hai test khong tu giu hai ban sao cua mot bang mau.
 */
export const CSS = readFileSync(join(process.cwd(), "src", "app", "globals.css"), "utf8");

export function docBien(nguon: string): Record<string, string> {
  const ra: Record<string, string> = {};
  for (const m of nguon.matchAll(/--color-hp-([a-z-]+):\s*(#[0-9A-Fa-f]{6})/g)) ra[m[1]] = m[2];
  return ra;
}

const batDauTheme = CSS.indexOf("@theme");
export const GOC = docBien(CSS.slice(batDauTheme, CSS.indexOf("}", batDauTheme)));

/**
 * Khoang [bat dau, ket thuc) cua moi khoi @media print. Bang mau ben trong la cua BAN IN,
 * khong phai cua man hinh — dem nham vao la kiem sai tong.
 *
 * Dem ngoac chu khong cat theo thu tu trong tep: mot tong co the dat khoi in rieng ngay
 * canh dinh nghia cua no (nhu tong hoa van).
 */
export function vungIn(css: string): [number, number][] {
  const ra: [number, number][] = [];
  let i = css.indexOf("@media print");
  while (i !== -1) {
    let sau = 0;
    let j = css.indexOf("{", i);
    for (; j < css.length; j++) {
      if (css[j] === "{") sau++;
      else if (css[j] === "}" && --sau === 0) break;
    }
    ra.push([i, j]);
    i = css.indexOf("@media print", j);
  }
  return ra;
}

export const VUNG_IN = vungIn(CSS);
export const trongVungIn = (vt: number) => VUNG_IN.some(([a, b]) => vt >= a && vt < b);

/** Bang mau cua mot tong = bien goc cua @theme, ghi de boi cac khoi .tone-<ten> ngoai phan in. */
export function bangMau(tone: string): Record<string, string> {
  if (tone === "beige") return GOC;
  const ra = { ...GOC };
  let thay = false;
  for (const m of CSS.matchAll(new RegExp(`\\.tone-${tone}\\s*\\{([^}]*)\\}`, "g"))) {
    if (trongVungIn(m.index ?? 0)) continue;
    thay = true;
    Object.assign(ra, docBien(m[1]));
  }
  if (!thay) throw new Error(`globals.css khong co khoi .tone-${tone}`);
  return ra;
}

export function doSang(hex: string): number {
  const kenh = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const [r, g, b] = kenh.map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function tuongPhan(a: string, b: string): number {
  const [x, y] = [doSang(a), doSang(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
}
