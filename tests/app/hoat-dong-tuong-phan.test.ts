import { describe, expect, it } from "vitest";
import { MUC_HOAT_DONG, type MucHoatDong } from "@/modules/nguoi-dung/nguoi-dung.model";
import { GOC, tuongPhan } from "./doc-mau-css";

/**
 * Cham hoat dong o trang Tai khoan la thanh phan do hoa MANG THONG TIN: WCAG 1.4.11
 * doi >= 3:1 voi nen ngay canh — nen hang (card) va nen dong chu giai (foundation).
 *
 * Vang TUOI khong dat muc nay tren nen be, nen muc "trong 7 ngay" la vang ho phach.
 */
const BIEN: Record<MucHoatDong, string> = {
  "trong-ngay": "hoat-dong-ngay",
  "trong-tuan": "hoat-dong-tuan",
  lau: "hoat-dong-lau",
};

describe("tuong phan cua cham hoat dong", () => {
  it("@theme co dung mot bien mau cho moi muc, khong thua khong thieu", () => {
    const coTrongCss = Object.keys(GOC).filter((k) => k.startsWith("hoat-dong-")).sort();
    expect(coTrongCss).toEqual(MUC_HOAT_DONG.map((m) => BIEN[m]).sort());
  });

  for (const muc of MUC_HOAT_DONG) {
    it(`${muc}: >= 3:1 tren nen the va nen trang`, () => {
      const mau = GOC[BIEN[muc]];
      expect(mau, `globals.css thieu --color-hp-${BIEN[muc]}`).toBeDefined();
      for (const nen of ["card", "foundation"] as const) {
        const tl = tuongPhan(mau, GOC[nen]);
        expect(tl, `${muc} tren ${nen} chi ${tl.toFixed(2)}:1`).toBeGreaterThanOrEqual(3);
      }
    });
  }
});
