import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { TONE } from "@/modules/catalogue-share/giao-dien.model";

/**
 * Moi tong mau cua trang khach xem phai DOC DUOC.
 *
 * Mau chu xam cua he thiet ke (#8A8178) tung rot AA tren nen kem ma khong ai hay.
 * Tu 11/09/2026 co tam tong — test nay doc THANG globals.css, nen them mot tong
 * moi voi mau chu qua nhat la do ngay, khong phai doi ai do nhin ra tren man hinh.
 */

const CSS = readFileSync(join(process.cwd(), "src", "app", "globals.css"), "utf8");

function docBien(nguon: string): Record<string, string> {
  const ra: Record<string, string> = {};
  for (const m of nguon.matchAll(/--color-hp-([a-z-]+):\s*(#[0-9A-Fa-f]{6})/g)) ra[m[1]] = m[2];
  return ra;
}

const batDauTheme = CSS.indexOf("@theme");
const GOC = docBien(CSS.slice(batDauTheme, CSS.indexOf("}", batDauTheme)));

/**
 * Khoang [bat dau, ket thuc) cua moi khoi @media print. Bang mau ben trong la cua
 * BAN IN, khong phai cua man hinh — dem nham vao la kiem sai tong.
 *
 * Dem ngoac chu khong cat theo thu tu trong tep: mot tong co the dat khoi in rieng
 * ngay canh dinh nghia cua no (nhu tong hoa van).
 */
function vungIn(css: string): [number, number][] {
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
const VUNG_IN = vungIn(CSS);
const trongVungIn = (vt: number) => VUNG_IN.some(([a, b]) => vt >= a && vt < b);

/** Bang mau cua mot tong = bien goc cua @theme, ghi de boi cac khoi .tone-<ten> ngoai phan in. */
function bangMau(tone: string): Record<string, string> {
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

function doSang(hex: string): number {
  const kenh = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const [r, g, b] = kenh.map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function tuongPhan(a: string, b: string): number {
  const [x, y] = [doSang(a), doSang(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
}

describe("tuong phan chu cua tung tong mau", () => {
  for (const tone of TONE) {
    it(`${tone}: chu than bai va chu phu dat AA, chu dam dat AAA, tren nen lan tren the`, () => {
      const b = bangMau(tone);
      for (const nen of ["foundation", "card"] as const) {
        for (const chu of ["body", "muted"] as const) {
          const tl = tuongPhan(b[chu], b[nen]);
          expect(tl, `${tone}: ${chu} tren ${nen} chi ${tl.toFixed(2)}:1`).toBeGreaterThanOrEqual(4.5);
        }
        const dam = tuongPhan(b.ink, b[nen]);
        expect(dam, `${tone}: ink tren ${nen} chi ${dam.toFixed(2)}:1`).toBeGreaterThanOrEqual(7);
      }
    });
  }

  it("tong hoa van tro toi mot tep hoa van co that trong public/", () => {
    const m = /\.tone-hoa-van\s*\{[^}]*url\("([^"]+)"\)/.exec(CSS);
    expect(m, "khoi .tone-hoa-van khong co background-image").not.toBeNull();
    expect(existsSync(join(process.cwd(), "public", m![1]))).toBe(true);
  });
});
