import { readFileSync } from "node:fs";
import { join } from "node:path";
import vm from "node:vm";
import { describe, expect, it } from "vitest";

/**
 * google-apps-script/DongBo.gs chay tren Apps Script, ngoai ung dung. Mot loi o
 * day lam dung ca duong dong bo — va chi lo ra SAU khi da dan len
 * script.google.com. Nap tep vao vm voi cac dich vu Google gia de kiem truoc.
 *
 * Trong tam: duong NOI BUOC (11/09/2026) — bang doi thi liet ke thu muc MOI va day
 * anh ngay trong luot dongBoBang, co "cho" chong chay chong voi hai lich du phong.
 */

const MA = readFileSync(join(process.cwd(), "google-apps-script", "DongBo.gs"), "utf8");
const WEB = "https://web.test";

type TuyChon = {
  doiBang: boolean;
  thieuThuMuc?: Record<string, unknown>;
  loiThieuThuMuc?: boolean;
  khiDayAnh?: (thuocTinh: Map<string, string>) => void;
};

function dungScript(tuy: TuyChon) {
  const thuocTinh = new Map<string, string>([
    ["URL_WEB", WEB],
    ["KHOA", "khoa-gia"],
    ["SHEET_ID", "bang-gia"],
    ["TAB", "Catalogue-OL"],
  ]);
  const goi: { duong: string; than: unknown }[] = [];
  const phanHoi = (ma: number, noiDung: unknown) => ({
    getResponseCode: () => ma,
    getContentText: () => JSON.stringify(noiDung),
    getBlob: () => ({ getBytes: () => [1, 2, 3] }),
  });

  const ngoaiCanh = vm.createContext({
    Logger: { log: () => {} },
    PropertiesService: {
      getScriptProperties: () => ({
        getProperty: (k: string) => thuocTinh.get(k) ?? null,
        setProperty: (k: string, v: string) => {
          thuocTinh.set(k, v);
        },
        deleteProperty: (k: string) => {
          thuocTinh.delete(k);
        },
      }),
    },
    LockService: { getScriptLock: () => ({ tryLock: () => true, releaseLock: () => {} }) },
    SpreadsheetApp: { openById: () => ({ getName: () => "ONLINE CATALOGUE" }) },
    ScriptApp: {
      getOAuthToken: () => "token-gia",
      getProjectTriggers: () => [],
      deleteTrigger: () => {},
      newTrigger: () => ({ timeBased: () => ({ everyMinutes: () => ({ create: () => ({}) }) }) }),
    },
    Utilities: { base64Encode: () => "QUJD" },
    DriveApp: {
      getFolderById: (id: string) => {
        let con = 1;
        return {
          getFiles: () => ({
            hasNext: () => con-- > 0,
            next: () => ({
              getMimeType: () => "image/jpeg",
              getId: () => `anh-cua-${id}`,
              getName: () => "a.jpg",
            }),
          }),
        };
      },
    },
    UrlFetchApp: {
      fetch: (url: string, opts?: { payload?: string }) => {
        if (url.startsWith("https://sheets.googleapis.com/")) {
          return phanHoi(200, { sheets: [{ data: [{ rowData: [] }] }] });
        }
        if (url.startsWith("https://www.googleapis.com/drive/")) {
          return phanHoi(200, { thumbnailLink: "https://lh3.test/anh=s220" });
        }
        if (url.startsWith("https://lh3.test/")) return phanHoi(200, {});
        if (!url.startsWith(WEB)) throw new Error(`goi ra ngoai la: ${url}`);

        const duong = url.slice(WEB.length);
        goi.push({ duong, than: opts?.payload ? JSON.parse(opts.payload) : null });
        switch (duong) {
          case "/api/dong-bo/du-lieu":
            return phanHoi(200, { doiBang: tuy.doiBang, soDong: 12 });
          case "/api/dong-bo/thieu-thu-muc":
            return tuy.loiThieuThuMuc
              ? phanHoi(500, { loi: "hong" })
              : phanHoi(
                  200,
                  tuy.thieuThuMuc ?? {
                    thieu: ["thu-muc-moi", "thu-muc-qua-han"],
                    tongThieu: 2,
                    tong: 12,
                    soMoi: 1,
                    soCu: 1,
                  },
                );
          case "/api/dong-bo/anh-thu-muc":
            return phanHoi(200, { tong: 13, themMoi: 1, soAnh: 65, giuLai: [] });
          case "/api/dong-bo/thieu-anh":
            return phanHoi(200, { thieu: ["anh-cua-thu-muc-moi"], tongThieu: 1, tongAnh: 65 });
          case "/api/dong-bo/anh":
            tuy.khiDayAnh?.(thuocTinh);
            return phanHoi(200, { xong: 1, hong: [] });
          default:
            throw new Error(`duong la: ${duong}`);
        }
      },
    },
  });
  vm.runInContext(MA, ngoaiCanh, { filename: "DongBo.gs" });

  const ham = ngoaiCanh as unknown as Record<string, () => unknown>;
  return {
    /** Gia tri tra ve di qua JSON: doi tuong tao trong vm thuoc mot "realm" khac. */
    chay: (ten: string) => {
      const kq = ham[ten]();
      return kq === undefined ? undefined : (JSON.parse(JSON.stringify(kq)) as Record<string, unknown>);
    },
    duong: () => goi.map((g) => g.duong),
    than: (duong: string) => goi.find((g) => g.duong === duong)?.than as Record<string, unknown> | undefined,
    thuocTinh,
  };
}

const tuongLai = () => String(Date.now() + 60_000);
const quaKhu = () => String(Date.now() - 1_000);

describe("DongBo.gs — noi buoc", () => {
  it("bang KHONG doi: khong them mot loi goi nao ngoai buoc bang tinh", () => {
    const s = dungScript({ doiBang: false });
    s.chay("dongBoBang");
    expect(s.duong()).toEqual(["/api/dong-bo/du-lieu"]);
  });

  it("bang doi: liet ke CHI thu muc moi roi day anh ngay trong luot, xong thi go dau va tra cho", () => {
    const s = dungScript({ doiBang: true });
    s.chay("dongBoBang");
    expect(s.duong()).toEqual([
      "/api/dong-bo/du-lieu",
      "/api/dong-bo/thieu-thu-muc",
      "/api/dong-bo/anh-thu-muc",
      "/api/dong-bo/thieu-anh",
      "/api/dong-bo/anh",
    ]);
    // Thu muc QUA HAN khong lam o day — do la viec cua lich 10 phut.
    expect(Object.keys(s.than("/api/dong-bo/anh-thu-muc")!.anhThuMuc as object)).toEqual(["thu-muc-moi"]);
    expect(s.thuocTinh.has("CAN_NOI")).toBe(false);
    expect(s.thuocTinh.has("CHO_THU_MUC")).toBe(false);
    expect(s.thuocTinh.has("CHO_ANH")).toBe(false);
  });

  it("lich day anh dang giu cho: liet ke xong thi dung, GIU dau de phut sau lam tiep", () => {
    const s = dungScript({ doiBang: true });
    s.thuocTinh.set("CHO_ANH", tuongLai());
    s.chay("dongBoBang");
    expect(s.duong()).toEqual([
      "/api/dong-bo/du-lieu",
      "/api/dong-bo/thieu-thu-muc",
      "/api/dong-bo/anh-thu-muc",
    ]);
    expect(s.thuocTinh.has("CAN_NOI")).toBe(true);
    // Khong duoc tra cho cua mot luot khac.
    expect(Number(s.thuocTinh.get("CHO_ANH"))).toBeGreaterThan(Date.now());
  });

  it("phut sau, khi cho da trong, noi buoc lam not phan day anh roi go dau", () => {
    const s = dungScript({ doiBang: false });
    s.thuocTinh.set("CAN_NOI", "123");
    s.chay("dongBoBang");
    expect(s.duong()).toContain("/api/dong-bo/anh");
    expect(s.thuocTinh.has("CAN_NOI")).toBe(false);
  });

  it("cho het han (luot truoc bi Apps Script giet giua chung) thi lay lai duoc", () => {
    const s = dungScript({ doiBang: true });
    s.thuocTinh.set("CHO_ANH", quaKhu());
    s.thuocTinh.set("CHO_THU_MUC", quaKhu());
    s.chay("dongBoBang");
    expect(s.duong()).toContain("/api/dong-bo/anh-thu-muc");
    expect(s.duong()).toContain("/api/dong-bo/anh");
  });

  it("loi o duong noi KHONG lam hong luot bang tinh, tra cho, va giu dau de thu lai", () => {
    const s = dungScript({ doiBang: true, loiThieuThuMuc: true });
    expect(s.chay("dongBoBang")).toEqual({ doiBang: true, soDong: 12 });
    expect(s.thuocTinh.has("CAN_NOI")).toBe(true);
    expect(s.thuocTinh.has("CHO_THU_MUC")).toBe(false);
  });

  it("bang lai doi trong luc dang noi: dau MOI khong bi xoa", () => {
    const s = dungScript({ doiBang: true, khiDayAnh: (p) => p.set("CAN_NOI", "dau-moi-hon") });
    s.chay("dongBoBang");
    expect(s.thuocTinh.get("CAN_NOI")).toBe("dau-moi-hon");
  });

  it("may chu chua tra soMoi: duong noi khong liet ke thu muc nao", () => {
    const s = dungScript({ doiBang: true, thieuThuMuc: { thieu: ["a", "b"], tongThieu: 2, tong: 2 } });
    s.chay("dongBoBang");
    expect(s.duong()).not.toContain("/api/dong-bo/anh-thu-muc");
  });
});

describe("DongBo.gs — lich du phong", () => {
  it("dongBoThuMuc van lam CA thu muc qua han, va tra cho", () => {
    const s = dungScript({ doiBang: false });
    s.chay("dongBoThuMuc");
    expect(Object.keys(s.than("/api/dong-bo/anh-thu-muc")!.anhThuMuc as object)).toEqual([
      "thu-muc-moi",
      "thu-muc-qua-han",
    ]);
    expect(s.thuocTinh.has("CHO_THU_MUC")).toBe(false);
  });

  it("dongBoAnh bo qua khi duong noi dang giu cho, khong goi mang", () => {
    const s = dungScript({ doiBang: false });
    s.thuocTinh.set("CHO_ANH", tuongLai());
    expect(s.chay("dongBoAnh")).toMatchObject({ boQua: true });
    expect(s.duong()).toEqual([]);
  });

  it("datLichChay xoa cho va dau con sot tu mot luot bi giet", () => {
    const s = dungScript({ doiBang: false });
    s.thuocTinh.set("CHO_THU_MUC", tuongLai());
    s.thuocTinh.set("CHO_ANH", tuongLai());
    s.thuocTinh.set("CAN_NOI", "123");
    s.chay("datLichChay");
    expect(s.thuocTinh.has("CHO_THU_MUC")).toBe(false);
    expect(s.thuocTinh.has("CHO_ANH")).toBe(false);
    expect(s.thuocTinh.has("CAN_NOI")).toBe(false);
  });
});
