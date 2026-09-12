import { describe, expect, it } from "vitest";
import { MAU_NHAN, NHAN, TONE, TONE_TOI } from "@/modules/catalogue-share/giao-dien.model";
import { CSS, VUNG_IN, bangMau, doSang, trongVungIn, tuongPhan } from "./doc-mau-css";

/**
 * Mau nhan phai DOC DUOC tren moi tong: sac nhat tren nen sang, sac sang tren nen toi,
 * sac dam cho nut chu trang.
 *
 * Truoc 12/09/2026 bienMauNhan gan thang --color-hp-pink bang style, ma bien gan truc
 * tiep thang moi lop CSS — tong toi dung chung sac nhat, Man chin tren Xanh reu chi
 * 2.89:1. Gio CSS chon sac qua lop .mau-nhan; test doi chieu danh sach tong toi trong
 * model voi bo chon trong CSS de hai noi khong lech nhau.
 */
const laToi = (tone: string) => (TONE_TOI as readonly string[]).includes(tone);

describe("tuong phan cua mau nhan", () => {
  for (const nhan of NHAN) {
    it(`${nhan}: chu trang tren sac dam dat AA`, () => {
      const tl = tuongPhan("#FFFFFF", MAU_NHAN[nhan].dam);
      expect(tl, `${nhan}: trang tren dam chi ${tl.toFixed(2)}:1`).toBeGreaterThanOrEqual(4.5);
    });

    it(`${nhan}: sac nhat tren tong sang >= 3:1, sac sang tren tong toi >= 4.5:1`, () => {
      for (const tone of TONE) {
        const b = bangMau(tone);
        const sac = laToi(tone) ? MAU_NHAN[nhan].sang : MAU_NHAN[nhan].nhat;
        const can = laToi(tone) ? 4.5 : 3;
        for (const nen of ["foundation", "card"] as const) {
          const tl = tuongPhan(sac, b[nen]);
          expect(tl, `${nhan} tren ${tone}/${nen} chi ${tl.toFixed(2)}:1`).toBeGreaterThanOrEqual(can);
        }
      }
    });
  }

  it("TONE_TOI dung la cac tong co nen toi trong CSS", () => {
    for (const tone of TONE) {
      const nen = bangMau(tone).foundation;
      expect(laToi(tone), `${tone}: nen ${nen}`).toBe(doSang(nen) < 0.2);
    }
  });

  it("bo chon .mau-nhan:is(...) o man hinh VA o ban in liet ke dung TONE_TOI", () => {
    const ds = [...CSS.matchAll(/\.mau-nhan:is\(([^)]*)\)/g)].map((m) => ({
      vt: m.index ?? 0,
      tone: [...m[1].matchAll(/\.tone-([a-z-]+)/g)].map((x) => x[1]).sort(),
    }));
    const mongDoi = [...TONE_TOI].sort();
    expect(ds.filter((x) => !trongVungIn(x.vt)).map((x) => x.tone)).toEqual([mongDoi]);
    expect(ds.filter((x) => trongVungIn(x.vt)).map((x) => x.tone)).toEqual([mongDoi]);
  });

  it("ban in ep MOI tong toi ve nen trang", () => {
    const trongIn = VUNG_IN.map(([a, b]) => CSS.slice(a, b)).join("\n");
    const khoi = [...trongIn.matchAll(/([^{}]+)\{([^{}]*)\}/g)];
    for (const tone of TONE_TOI) {
      const co = khoi.some((m) => m[1].includes(`.tone-${tone}`) && /--color-hp-foundation:\s*#FFFFFF/i.test(m[2]));
      expect(co, `ban in chua ep .tone-${tone} ve nen trang`).toBe(true);
    }
  });

  it("khoi .mau-nhan dat SAU moi khoi .tone-* — cung do uu tien thi khoi viet sau thang", () => {
    const viTriMauNhan = CSS.indexOf(".mau-nhan {");
    expect(viTriMauNhan, "khong tim thay khoi .mau-nhan {").toBeGreaterThan(-1);
    for (const tone of TONE) {
      if (tone === "beige") continue;
      const khoi = [...CSS.matchAll(new RegExp(`^\\s*\\.tone-${tone}\\s*[{,]`, "gm"))];
      const cuoi = khoi.at(-1)?.index ?? -1;
      expect(cuoi, `.tone-${tone} khai bao sau .mau-nhan`).toBeLessThan(viTriMauNhan);
    }
  });
});
