import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const css = readFileSync("src/app/globals.css", "utf8");
const layout = readFileSync("src/app/layout.tsx", "utf8");

describe("token thiet ke Hung Phat", () => {
  it("khai bao du token mau trong khoi @theme", () => {
    for (const ten of [
      "--color-hp-foundation: #F7F1EB",
      "--color-hp-card: #FBF7F1",
      "--color-hp-inset: #EFE8DD",
      "--color-hp-ink: #2A2725",
      "--color-hp-body: #4A4540",
      "--color-hp-muted: #6E6760",
      "--color-hp-rule: #D4CFC4",
      "--color-hp-pink: #E91D79",
      "--color-hp-pink-strong: #C4165F",
    ]) {
      expect(css.replace(/\s+/g, " ")).toContain(ten);
    }
  });

  // Boilerplate Next.js dat nen #0a0a0a khi may bat che do toi. De lai thi
  // choi voi toan bo he mau be. Cong phai doc STYLESHEET, khong doc trang.
  it("khong con khoi prefers-color-scheme cua boilerplate", () => {
    expect(css).not.toContain("prefers-color-scheme");
  });

  it("khong dung mau muted goc cua he thiet ke — no rot WCAG AA o nhan 11px", () => {
    expect(css).not.toContain("#8A8178");
  });

  it("font nap kem bo dau tieng Viet", () => {
    expect(layout).toContain("Cormorant_Garamond");
    expect(layout).toContain("EB_Garamond");
    // Thieu "vietnamese" trong subsets thi Google khong gui font co dau ve,
    // du da chon dung font. Day la loi im lang: chu van hien, bang font khac.
    expect(layout).not.toContain('subsets: ["latin"]');
    const soLanCoTiengViet = layout.match(/subsets: \["latin", "vietnamese"\]/g) ?? [];
    expect(soLanCoTiengViet.length).toBe(2);
  });

  it("khong con font Geist cua boilerplate", () => {
    expect(layout).not.toContain("Geist");
  });
});
