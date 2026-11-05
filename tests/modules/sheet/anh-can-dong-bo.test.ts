import { describe, it, expect } from "vitest";
import { anhCanDongBo } from "@/modules/sheet/anh-can-dong-bo";

const banDo = {
  q1: [{ fileId: "a1" }, { fileId: "a2" }],
  q2: [{ fileId: "b1" }],
  cu1: [{ fileId: "x1" }, { fileId: "x2" }],
  cu2: [{ fileId: "y1" }],
};

describe("anhCanDongBo", () => {
  it("chi lay anh cua thu muc ma bang DANG tro toi, bo qua thu muc cu con sot trong ban do", () => {
    // Ban do chi gop them, khong tu xoa. Tab rut tu 1.839 dong xuong 12 thi ban
    // do van con hang nghin thu muc cu — chung KHONG duoc keo duong nap anh theo.
    expect(anhCanDongBo([{ idThuMuc: "q1" }, { idThuMuc: "q2" }], banDo)).toEqual(["a1", "a2", "b1"]);
  });

  it("bo qua dong khong co thu muc cot Hinh da xu ly", () => {
    expect(anhCanDongBo([{ idThuMuc: null }, { idThuMuc: "q2" }], banDo)).toEqual(["b1"]);
  });

  it("giu thu tu dong trong bang, roi thu tu anh trong thu muc", () => {
    expect(anhCanDongBo([{ idThuMuc: "q2" }, { idThuMuc: "q1" }], banDo)).toEqual(["b1", "a1", "a2"]);
  });

  // Tu 05/11/2026 o anh tren bang lay tam o cot HINH. Tam do thuong KHONG nam
  // trong thu muc da xu ly, nen neu duong nap anh chi gom anh trong thu muc thi
  // no khong bao gio duoc nap — va web khong tu keo tu Drive duoc (tai khoan may
  // bi chan), nen o anh ra 502.
  it("nap CA anh cot HINH, khong chi anh trong thu muc", () => {
    expect(anhCanDongBo([{ idThuMuc: "q1", fileIdAnh: "h1" }], banDo)).toEqual(["h1", "a1", "a2"]);
  });

  it("anh cot HINH dung TRUOC — do la tam nguoi dung thay dau tien tren bang", () => {
    const r = anhCanDongBo([{ idThuMuc: "q1", fileIdAnh: "h1" }, { idThuMuc: "q2", fileIdAnh: "h2" }], banDo);
    expect(r.indexOf("h1")).toBeLessThan(r.indexOf("a1"));
    expect(r.indexOf("h2")).toBeLessThan(r.indexOf("b1"));
  });

  it("anh cot HINH trung voi anh trong thu muc thi chi nap mot lan", () => {
    expect(anhCanDongBo([{ idThuMuc: "q1", fileIdAnh: "a2" }], banDo)).toEqual(["a2", "a1"]);
  });

  it("dong chi co cot HINH, khong co thu muc, van duoc nap", () => {
    expect(anhCanDongBo([{ idThuMuc: null, fileIdAnh: "h9" }], banDo)).toEqual(["h9"]);
  });

  it("khong lap khi hai dong chung mot thu muc, hay hai thu muc chung mot anh", () => {
    const chung = { ...banDo, q3: [{ fileId: "a2" }, { fileId: "c1" }] };
    expect(
      anhCanDongBo([{ idThuMuc: "q1" }, { idThuMuc: "q1" }, { idThuMuc: "q3" }], chung),
    ).toEqual(["a1", "a2", "c1"]);
  });

  it("thu muc chua duoc liet ke thi chua co gi, khong nem loi", () => {
    expect(anhCanDongBo([{ idThuMuc: "chua-liet-ke" }, { idThuMuc: "q2" }], banDo)).toEqual(["b1"]);
  });

  it("bang rong thi khong nap gi, du ban do con day", () => {
    expect(anhCanDongBo([], banDo)).toEqual([]);
  });
});
