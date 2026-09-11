import { describe, expect, it } from "vitest";
import {
  LoiThieuCot, anhXaBang, chuanHoaTieuDe, tachFileIdAnh, tachSize, tinhTlVangSuyRa,
  type OTho,
} from "@/modules/sheet/catalogue.mapper";
import { bangMau } from "./fixtures/bang-mau";

describe("chuanHoaTieuDe", () => {
  it("gop xuong dong va khoang trang thanh mot dau cach", () => {
    expect(chuanHoaTieuDe("TL VÀNG\n (gr)")).toBe("tl vàng (gr)");
  });
  it("bo khoang trang dau cuoi va khong phan biet hoa thuong", () => {
    expect(chuanHoaTieuDe("  Chi Tiết SP  ")).toBe("chi tiết sp");
  });
  it("khop duoc tieu de dang to hop NFD giong het dang NFC", () => {
    // Sheets API co the tra Unicode dang NFD (chu cai + dau ghep rieng) thay
    // vi NFC (mot ky tu san dau). Dung .normalize() de tao fixture thay vi go
    // tay ky tu to hop — go tay de sai ma khong ai nhin ra bang mat thuong.
    const nfd = "Chi tiết SP".normalize("NFD");
    expect(nfd).not.toBe("Chi tiết SP"); // dam bao fixture nay that su la NFD
    expect(chuanHoaTieuDe(nfd)).toBe("chi tiết sp");
  });
});

describe("tachFileIdAnh", () => {
  it("tach duoc id tu cong thuc IMAGE", () => {
    expect(tachFileIdAnh('=IMAGE("https://lh3.google.com/u/0/d/abc-DEF_123")'))
      .toBe("abc-DEF_123");
  });
  it("tra null khi o rong hoac khong phai cong thuc IMAGE", () => {
    expect(tachFileIdAnh(undefined)).toBeNull();
    expect(tachFileIdAnh("chu thuong")).toBeNull();
  });
});

describe("tachSize", () => {
  it("lay phan sau chu Size", () => {
    expect(tachSize("DIARI: 18KW 11RD/0.398cts 4.07gr D11031 Size: 18VN")).toBe("18VN");
    expect(tachSize("LGDRI: 14KY 7RD/0.326cts 2.85gr D12741 Size: 10")).toBe("10");
  });
  it("tra null khi khong co", () => {
    expect(tachSize("khong co gi")).toBeNull();
    expect(tachSize(null)).toBeNull();
  });
});

describe("tinhTlVangSuyRa", () => {
  it("tru khoi luong da quy tu carat", () => {
    // 2.85 - 0.2*0.326 = 2.7848
    expect(tinhTlVangSuyRa("LGDRI: 14KY 7RD/0.326cts 2.85gr D12741 Size: 10"))
      .toBeCloseTo(2.7848, 4);
  });
  it("cong don MOI cum cts trong mo ta", () => {
    // 5.18 - 0.2*(0.116+0.441) = 5.0686
    expect(tinhTlVangSuyRa("LGDRI: 18KY 4RD/0.116cts+6MQ/0.441cts 5.18gr B12741 Size: 7"))
      .toBeCloseTo(5.0686, 4);
  });
  it("tra null khi khong co gr", () => {
    expect(tinhTlVangSuyRa("khong co so")).toBeNull();
  });
});

describe("anhXaBang", () => {
  const ds = anhXaBang(bangMau);

  it("bo hai dong dau, giu dung so dong du lieu", () => {
    expect(ds).toHaveLength(9);
  });

  it("bo qua dong rong nhung con dinh dang, khong bien thanh the gia", () => {
    // bangMau co them hai dong hoan toan rong o cuoi (dong 12, 13) — mo phong
    // ket qua includeGridData=true tra ve cho o da to mau nhung chua go du
    // lieu. Neu khong bi bo qua, tong so the se la 11 va hai the gia do se
    // dung chung mot khoa trung (null, null) roi bi gan nham co "trung".
    expect(ds).toHaveLength(9);
    expect(ds.some((d) => d.sku === null && d.maMau === null && d.mo === null
      && d.chiTiet === null && d.fileIdAnh === null)).toBe(false);
  });

  it("giu so dong that cua bang de doi chieu", () => {
    expect(ds[0].dongSheet).toBe(3);
    expect(ds[8].dongSheet).toBe(11);
  });

  it("doc dung cot du tieu de co ky tu xuong dong", () => {
    expect(ds[0].tlVang).toBe(2.78);
  });

  it("tach duoc fileId anh", () => {
    expect(ds[0].fileIdAnh).toBe("18I_Y9I_tLtnizSbupQclY48QBxG3I3XB");
  });

  it("lay hyperlink cot Hinh da xu ly lam duong dan thu muc", () => {
    expect(ds[1].urlThuMuc).toContain("/drive/folders/");
  });

  describe("CHI lay thu muc cot Hinh da xu ly (chot 11/09/2026)", () => {
    // Truoc day co duong lui ve cot raw "Hinh raw - luu mau" khi cot da xu ly
    // trong (luc chuyen 09/09 cot moi chi co 7/71 mau). Tab Catalogue-OL da lam
    // lai, 12/12 dong co cot da xu ly, va cong ty chot chi dong bo va hien anh
    // DA XU LY — giu duong lui la de anh raw lot vao catalogue gui khach.
    it("dong co CA HAI cot thi lay cot da xu ly", () => {
      expect(ds[1].urlThuMuc).toContain("1QqXuLy");
      expect(ds[1].idThuMuc).toBe("1QqXuLy0000000000000000000000");
    });

    it("dong chi co cot raw thi KHONG co thu muc anh — khong lui ve cot raw", () => {
      expect(ds[0].urlThuMuc).toBeNull();
      expect(ds[0].idThuMuc).toBeNull();
    });

    it("bang chua co cot da xu ly van doc duoc, chi la khong dong nao co thu muc", () => {
      // Cot "Hinh da xu ly" KHONG bat buoc: mot ban sao bang tinh chua kip them
      // cot van phai doc duoc — nhung khong con lay thu muc raw thay the.
      const khongCotMoi = bangMau.map((h) => h.slice(0, 13));
      const lai = anhXaBang(khongCotMoi);
      expect(lai.length).toBe(ds.length);
      expect(lai.every((d) => d.idThuMuc === null)).toBe(true);
    });
  });

  describe("thu muc dat bang chip Drive", () => {
    // Bang tinh dung CA HAI kieu trong cung mot cot: dong cu la hyperlink, dong
    // moi la chip (chen bang @ hoac keo tep tu Drive). Google KHONG dat lien ket
    // cua chip vao hyperlink — doc mot kieu thoi thi nhung dong dung chip mat
    // thu vien anh ma khong bao loi gi. Nay chi con doc cot Hinh da xu ly.
    const chip = (v: string, uri: string): OTho => ({
      formattedValue: v,
      chipRuns: [
        { chip: { richLinkProperties: { mimeType: "application/vnd.google-apps.folder", uri } } },
      ],
    });
    const URI = "https://drive.google.com/drive/folders/1AbcDefGhiJklMnoPqr?usp=drive_link";

    // Tim cot theo TIEU DE, khong ghi cung so thu tu: bang tinh doi cot lien
    // tuc, mot con so cung o day se lang le thay the nham cot khac.
    const cotThuMuc = bangMau[1].findIndex(
      (o) => chuanHoaTieuDe(o.formattedValue ?? "").toLowerCase() === "hình đã xử lý",
    );

    it("fixture co cot thu muc de thay the", () => {
      expect(cotThuMuc).toBeGreaterThanOrEqual(0);
    });

    function dungBang(oThuMuc: OTho): OTho[][] {
      const h = [...bangMau[2]];
      h[cotThuMuc] = oThuMuc;
      return [bangMau[0], bangMau[1], h];
    }

    it("doc duoc lien ket khi o chi co chip, khong co hyperlink", () => {
      const [d] = anhXaBang(dungBang(chip("N10145", URI)));
      expect(d.urlThuMuc).toBe(URI);
      // Duoi cuoi phai ra id sach, khong dinh "?usp=drive_link".
      expect(d.idThuMuc).toBe("1AbcDefGhiJklMnoPqr");
    });

    it("hyperlink duoc uu tien khi o co ca hai", () => {
      const ca_hai: OTho = { ...chip("N10145", URI), hyperlink: "https://drive.google.com/drive/folders/1XXlienketthuong" };
      expect(anhXaBang(dungBang(ca_hai))[0].idThuMuc).toBe("1XXlienketthuong");
    });

    it("chipRuns rong hoac khong co uri thi coi nhu khong co thu muc", () => {
      for (const o of [{ formattedValue: "x", chipRuns: [] }, { formattedValue: "x", chipRuns: [{}] }]) {
        expect(anhXaBang(dungBang(o))[0].urlThuMuc).toBeNull();
      }
    });
  });

  it("uu tien cot SIZE, trong thi tach tu mo ta", () => {
    expect(ds[0].size).toBe("10");   // co trong cot
    expect(ds[1].size).toBe("18VN"); // chi co trong mo ta
  });

  it("suy loai xoan tu tien to LGDRI / DIARI", () => {
    expect(ds[0].loaiXoan).toBe("lab");
    expect(ds[1].loaiXoan).toBe("tu-nhien");
  });

  it("gan co thieu-anh dung dong", () => {
    expect(ds.filter((d) => d.co.includes("thieu-anh")).map((d) => d.dongSheet)).toEqual([5]);
  });

  it("gan co thieu-sku dung dong", () => {
    expect(ds.filter((d) => d.co.includes("thieu-sku")).map((d) => d.dongSheet))
      .toEqual([6, 7, 9, 10]);
  });

  it("gan co thieu-mo-ta dung dong", () => {
    expect(ds.filter((d) => d.co.includes("thieu-mo-ta")).map((d) => d.dongSheet)).toEqual([7]);
  });

  it("gan co trung cho CA HAI dong trung nhau", () => {
    expect(ds.filter((d) => d.co.includes("trung")).map((d) => d.dongSheet)).toEqual([9, 10]);
  });

  it("gan co tl-vang-lech dung dong, va KHONG bao nham dong hop le", () => {
    expect(ds.filter((d) => d.co.includes("tl-vang-lech")).map((d) => d.dongSheet)).toEqual([8]);
  });

  it("dong day du khong mang co nao", () => {
    expect(ds[0].co).toEqual([]);
  });

  it("nem LoiThieuCot neu thieu cot bat buoc, va neu dich danh cot nao", () => {
    const thieu = bangMau.map((h) => [...h]);
    thieu[1][3] = { formattedValue: "Ghi chu" }; // doi ten cot "Chi tiết SP"
    try {
      anhXaBang(thieu);
      throw new Error("le ra phai nem loi");
    } catch (e) {
      expect(e).toBeInstanceOf(LoiThieuCot);
      expect((e as LoiThieuCot).cotThieu).toContain("Chi tiết SP");
    }
  });
});

describe("anhXaBang — khoa trung phai la (MÃ MẪU, MO), khong phai (MÃ MẪU, Chi tiết SP)", () => {
  // Bang toi gian, dung rieng cho test nay — khong dung chung bangMau vi so dong
  // cua bangMau da duoc nhieu test khac gan chet.
  const o = (v: string): OTho => ({ formattedValue: v });
  const rong: OTho = {};

  it("cung MÃ MẪU va cung Chi tiết SP nhung khac MO thi KHONG duoc gan co trung", () => {
    const bang: OTho[][] = [
      [],
      [o("SKU"), o("MO"), o("Chi tiết SP"), o("MÃ MẪU"), o("CHẤT LIỆU"), o("TL VÀNG"), o("HÌNH")],
      // Dong A va B: cung MÃ MẪU va cung Chi tiết SP (chinh la khoa cu, sai) —
      // nhung MO khac nhau nen KHONG phai ban ghi trung theo dung spec.
      [o("SKU-A"), o("MO-001"), o("LGDRI: 14KY TEST-KHONG-TRUNG"), o("D99999"),
        o("14KY"), o("1.00"), rong],
      [o("SKU-B"), o("MO-002"), o("LGDRI: 14KY TEST-KHONG-TRUNG"), o("D99999"),
        o("14KY"), o("1.00"), rong],
    ];

    const ds = anhXaBang(bang);

    expect(ds.filter((d) => d.co.includes("trung"))).toEqual([]);
  });
});

describe("anhXaBang — TL VANG doc tu userEnteredValue.numberValue, khong chi tu formattedValue", () => {
  const o = (v: string): OTho => ({ formattedValue: v });
  const rong: OTho = {};

  it("locale Viet hien thi dau phay (\"2,78\") van doc dung so nho numberValue", () => {
    const bang: OTho[][] = [
      [],
      [o("SKU"), o("MO"), o("Chi tiết SP"), o("MÃ MẪU"), o("CHẤT LIỆU"), o("TL VÀNG"), o("HÌNH")],
      [
        o("SKU-A"), o("MO-001"), o("LGDRI: 14KY TEST-LOCALE"), o("D99999"), o("14KY"),
        // formattedValue la chuoi hien thi theo locale Viet — Number("2,78")
        // se ra NaN neu bi doc tu day. userEnteredValue.numberValue moi la
        // gia tri so goc, khong phu thuoc cach hien thi.
        { formattedValue: "2,78", userEnteredValue: { numberValue: 2.78 } },
        rong,
      ],
    ];

    const ds = anhXaBang(bang);

    expect(ds[0].tlVang).toBe(2.78);
    expect(ds[0].co).not.toContain("tl-vang-lech");
  });
});
