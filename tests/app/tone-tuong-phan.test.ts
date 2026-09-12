import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { TONE } from "@/modules/catalogue-share/giao-dien.model";
import { CSS, bangMau, tuongPhan } from "./doc-mau-css";

/**
 * Moi tong mau cua trang khach xem phai DOC DUOC.
 *
 * Mau chu xam cua he thiet ke (#8A8178) tung rot AA tren nen kem ma khong ai hay.
 * Test nay doc THANG globals.css, nen them mot tong moi voi mau chu qua nhat la do
 * ngay, khong phai doi ai do nhin ra tren man hinh.
 */
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
