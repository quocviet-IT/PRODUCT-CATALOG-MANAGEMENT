import { describe, it, expect } from "vitest";
import {
  dungPath, laToTien, laConCua, doiPathKhiChuyenNhanh, taoVongLap,
} from "@/modules/catalog/category-path";

describe("dungPath", () => {
  it("nut goc co path chi gom chinh no", () => {
    expect(dungPath(null, "a")).toBe("/a/");
  });
  it("nut con noi tiep path cua cha", () => {
    expect(dungPath("/a/", "b")).toBe("/a/b/");
  });
  it("nut chau noi tiep tiep", () => {
    expect(dungPath("/a/b/", "c")).toBe("/a/b/c/");
  });
});

describe("laToTien", () => {
  it("tra ve rong cho nut goc", () => {
    expect(laToTien("/a/")).toEqual([]);
  });
  it("tra ve to tien theo thu tu tu goc xuong", () => {
    expect(laToTien("/a/b/c/")).toEqual(["a", "b"]);
  });
});

describe("laConCua", () => {
  it("nhan dien con truc tiep", () => {
    expect(laConCua("/a/b/", "/a/")).toBe(true);
  });
  it("nhan dien chau", () => {
    expect(laConCua("/a/b/c/", "/a/")).toBe(true);
  });
  it("chinh no khong phai con cua chinh no", () => {
    expect(laConCua("/a/", "/a/")).toBe(false);
  });
  it("nhanh khac khong phai con", () => {
    expect(laConCua("/x/y/", "/a/")).toBe(false);
  });
});

describe("doiPathKhiChuyenNhanh", () => {
  it("doi tien to cho chinh nut duoc chuyen", () => {
    expect(doiPathKhiChuyenNhanh("/a/b/", "/a/b/", "/x/b/")).toBe("/x/b/");
  });
  it("doi tien to cho toan bo con chau", () => {
    expect(doiPathKhiChuyenNhanh("/a/b/c/d/", "/a/b/", "/x/b/")).toBe("/x/b/c/d/");
  });
});

describe("taoVongLap", () => {
  it("chan keo mot nut vao chinh no", () => {
    expect(taoVongLap("/a/b/", "b")).toBe(true);
  });
  it("chan keo mot nut vao con cua no", () => {
    expect(taoVongLap("/a/b/", "a")).toBe(true);
  });
  it("cho phep keo sang nhanh khac", () => {
    expect(taoVongLap("/a/b/", "z")).toBe(false);
  });
  it("ghim chieu goi: tham so 1 la path DICH, tham so 2 la id nut DANG DI CHUYEN", () => {
    // Cay: goc "g" co con "c".
    // Keo "g" xuong duoi "c" -> vong lap, phai chan.
    expect(taoVongLap("/g/c/", "g")).toBe(true);
    // Keo "c" len duoi "g" -> hop le, khong duoc chan.
    // Neu ai do goi nguoc thu tu thi ca hai dong tren se cho ket qua nguoc lai.
    expect(taoVongLap("/g/", "c")).toBe(false);
  });
});
