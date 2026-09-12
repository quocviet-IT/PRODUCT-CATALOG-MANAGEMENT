import { describe, it, expect } from "vitest";
import {
  HAN_LIET_KE_LAI_MS,
  SO_LIET_KE_LAI_MOI_LUOT,
  luotLietKe,
  thuMucCanLietKe,
  tronBanDo,
} from "@/modules/sheet/thu-muc-can-liet-ke";

const BAY_GIO = Date.parse("2026-09-11T10:00:00Z");
const truoc = (phut: number) => new Date(BAY_GIO - phut * 60_000).toISOString();

describe("thuMucCanLietKe", () => {
  it("thu muc CHUA liet ke thi hoi, theo dung thu tu trong bang", () => {
    expect(thuMucCanLietKe(["b", "a"], {}, {}, BAY_GIO)).toEqual({ moi: ["b", "a"], cu: [] });
  });

  it("thu muc vua liet ke (chua qua han) thi khong hoi lai", () => {
    const r = thuMucCanLietKe(["a"], { a: [] }, { a: truoc(5) }, BAY_GIO);
    expect(r).toEqual({ moi: [], cu: [] });
  });

  it("thu muc liet ke QUA HAN thi hoi lai — anh them vao thu muc cu phai hien ra", () => {
    const r = thuMucCanLietKe(["a"], { a: [] }, { a: truoc(31) }, BAY_GIO);
    expect(r.cu).toEqual(["a"]);
  });

  it("dung o nguong 30 phut", () => {
    expect(HAN_LIET_KE_LAI_MS).toBe(30 * 60_000);
    expect(thuMucCanLietKe(["a"], { a: [] }, { a: truoc(30) }, BAY_GIO).cu).toEqual(["a"]);
    expect(thuMucCanLietKe(["a"], { a: [] }, { a: truoc(29) }, BAY_GIO).cu).toEqual([]);
  });

  it("khong co moc hay moc hong thi coi nhu cu nhat", () => {
    // Ban do liet ke tu truoc khi co tep moc: moi thu muc duoc lam moi mot luot.
    const r = thuMucCanLietKe(
      ["co-moc", "khong-moc", "moc-hong"],
      { "co-moc": [], "khong-moc": [], "moc-hong": [] },
      { "co-moc": truoc(40), "moc-hong": "khong phai ngay" },
      BAY_GIO,
    );
    expect(r.cu.slice(0, 2).sort()).toEqual(["khong-moc", "moc-hong"]);
    expect(r.cu[2]).toBe("co-moc");
  });

  it("thu muc MOI dung truoc, thu muc CU xep cu nhat truoc", () => {
    const r = thuMucCanLietKe(
      ["cu-40", "moi", "cu-90"],
      { "cu-40": [], "cu-90": [] },
      { "cu-40": truoc(40), "cu-90": truoc(90) },
      BAY_GIO,
    );
    expect(r).toEqual({ moi: ["moi"], cu: ["cu-90", "cu-40"] });
  });

  it("thu muc con sot trong ban do ma bang khong con tro toi thi khong liet ke lai", () => {
    const r = thuMucCanLietKe(["a"], { a: [], "da-bo": [] }, {}, BAY_GIO);
    expect(r.cu).toEqual(["a"]);
  });

  it("khong lap khi nhieu dong chung mot thu muc", () => {
    expect(thuMucCanLietKe(["a", "a", "b"], {}, {}, BAY_GIO).moi).toEqual(["a", "b"]);
  });
});

describe("luotLietKe", () => {
  it("chan 30 thu muc CU moi luot — gio chay Apps Script dung chung ca ngay cho moi job", () => {
    expect(SO_LIET_KE_LAI_MOI_LUOT).toBe(30);
  });

  it("dua HET thu muc moi, nhung chi toi da SO_LIET_KE_LAI_MOI_LUOT thu muc cu, cu nhat truoc", () => {
    // Bang tung tro toi 1.476 thu muc: liet ke lai het moi 30 phut la ~10,8 gio
    // chay moi ngay, qua han muc 6 gio — va dongBoBang moi phut chet theo.
    const moi = Array.from({ length: 45 }, (_, i) => `moi-${i}`);
    const cu = Array.from({ length: 100 }, (_, i) => `cu-${i}`);
    expect(luotLietKe({ moi, cu })).toEqual([...moi, ...cu.slice(0, SO_LIET_KE_LAI_MOI_LUOT)]);
  });

  it("it thu muc cu hon muc chan thi dua het", () => {
    expect(luotLietKe({ moi: ["m"], cu: ["a", "b"] })).toEqual(["m", "a", "b"]);
  });

  it("noi voi thuMucCanLietKe: thu muc cu nhat duoc lam truoc, cai con lai cho luot sau", () => {
    const ids = Array.from({ length: 40 }, (_, i) => `t-${i}`);
    const banDo = Object.fromEntries(ids.map((id) => [id, []]));
    // t-0 cu nhat (moc 40+39 phut truoc), t-39 moi nhat trong nhom qua han.
    const luc = Object.fromEntries(ids.map((id, i) => [id, truoc(79 - i)]));
    const r = luotLietKe(thuMucCanLietKe(ids, banDo, luc, BAY_GIO));
    expect(r).toEqual(ids.slice(0, SO_LIET_KE_LAI_MOI_LUOT));
  });
});

describe("tronBanDo", () => {
  it("them thu muc moi va thay danh sach cua thu muc da co", () => {
    const r = tronBanDo({ a: [1], b: [2] }, { b: [3, 4], c: [5] });
    expect(r.banDo).toEqual({ a: [1], b: [3, 4], c: [5] });
    expect(r.daGhi.sort()).toEqual(["b", "c"]);
    expect(r.giuLai).toEqual([]);
  });

  it("mang RONG KHONG xoa danh sach dang co anh — co the chi la Drive truc trac", () => {
    const r = tronBanDo({ a: [1, 2] }, { a: [] });
    expect(r.banDo).toEqual({ a: [1, 2] });
    expect(r.giuLai).toEqual(["a"]);
    expect(r.daGhi).toEqual([]);
  });

  it("thu muc chua co hoac dang rong thi nhan mang rong binh thuong", () => {
    // Co mat trong ban do la thu ngan script hoi lai no mai.
    const r = tronBanDo({ rong: [] }, { moi: [], rong: [] });
    expect(r.banDo).toEqual({ rong: [], moi: [] });
    expect(r.daGhi.sort()).toEqual(["moi", "rong"]);
    expect(r.giuLai).toEqual([]);
  });

  it("khong sua dau vao", () => {
    const cu = { a: [1] };
    const them = { a: [2] };
    tronBanDo(cu, them);
    expect(cu).toEqual({ a: [1] });
    expect(them).toEqual({ a: [2] });
  });
});
