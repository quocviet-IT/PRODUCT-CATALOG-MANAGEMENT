import { describe, expect, it } from "vitest";
import {
  BO_CUC,
  GIAO_DIEN_MAC_DINH,
  MAU_NHAN,
  NHAN,
  TONE,
  TONE_TOI,
  THONG_SO,
  coThongSo,
  docGiaoDien,
  DAI_DIEN_THOAI,
  DAI_LOI_CHAO,
  DAI_TEN_KHACH,
  DAI_TEN_SALE,
  DAI_LOI_KEU_GOI,
  CACH_NHAN,
  LOI_KEU_GOI,
  cauKeuGoi,
  coKhoiLienHe,
  goiYCachNhan,
  lienKetNhan,
  soGoiDuoc,
  type CachNhan,
  type LienHe,
} from "@/modules/catalogue-share/giao-dien.model";
import { boChu } from "@/messages";

describe("docGiaoDien", () => {
  it("cot rong cua catalogue cu doc ra dung bo mac dinh", () => {
    // Cot giao_dien mac dinh la {} — moi catalogue tao truoc khi co tinh nang
    // nay deu di qua duong nay, va phai hien Y HET luc no duoc gui cho khach.
    expect(docGiaoDien({})).toEqual(GIAO_DIEN_MAC_DINH);
  });

  it("khong nem loi voi gia tri la", () => {
    for (const tho of [null, undefined, 0, "", "beige", [], true]) {
      expect(docGiaoDien(tho)).toEqual(GIAO_DIEN_MAC_DINH);
    }
  });

  it("bo cuc, tone va mau nhan la thi lui ve mac dinh, khong lam hong ca bo", () => {
    const g = docGiaoDien({
      boCuc: "ban-do-kho-bau", tone: "cau-vong", nhan: "#ff0000", ngonNgu: "fr",
    });
    expect(g.boCuc).toBe("danh-sach");
    expect(g.tone).toBe("beige");
    expect(g.nhan).toBe("hong");
    expect(g.ngonNgu).toBe("vi");
  });

  it("giu lua chon hop le", () => {
    const g = docGiaoDien({ boCuc: "lookbook", tone: "toi", ngonNgu: "en" });
    expect(g.boCuc).toBe("lookbook");
    expect(g.tone).toBe("toi");
    expect(g.ngonNgu).toBe("en");
  });

  it("thieu mot khoa trong hien thi BAT khoa do", () => {
    // Quan trong: mot ban ghi cu chi co vai khoa khong duoc bien thanh mot
    // catalogue giau mat thong so ma khach truoc do van thay.
    const g = docGiaoDien({ hien: { tlVang: false } });
    expect(g.hien.tlVang).toBe(false);
    expect(g.hien.loaiSp).toBe(true);
    expect(g.hien.size).toBe(true);
  });

  it("chi dung false moi tat, gia tri la khong tat nham", () => {
    const g = docGiaoDien({ hien: { loaiSp: "khong", chatLieu: 0, mau: null } });
    expect(g.hien.loaiSp).toBe(true);
    expect(g.hien.chatLieu).toBe(true);
    expect(g.hien.mau).toBe(true);
  });

  it("bia toan chuoi rong thi khong phai bia", () => {
    expect(docGiaoDien({ bia: { tenKhach: "  ", loiChao: "" } }).bia).toBeNull();
    expect(docGiaoDien({ bia: {} }).bia).toBeNull();
    expect(docGiaoDien({ bia: "co" }).bia).toBeNull();
  });

  it("bia co chu thi giu, da cat khoang trang", () => {
    const g = docGiaoDien({ bia: { tenKhach: "  Chị Lan  ", loiChao: "Kính gửi chị" } });
    expect(g.bia).toEqual({ tenKhach: "Chị Lan", loiChao: "Kính gửi chị" });
  });

  it("cat chuoi bia qua dai", () => {
    // Chuoi nay di thang ra trang khach dang mo. Khong chan do dai thi mot cu
    // dan nham ca trang van ban se pha vo bo cuc trang bia.
    const g = docGiaoDien({
      bia: { tenKhach: "a".repeat(500), loiChao: "b".repeat(1000) },
    });
    expect(g.bia!.tenKhach).toHaveLength(DAI_TEN_KHACH);
    expect(g.bia!.loiChao).toHaveLength(DAI_LOI_CHAO);
  });

  it("bo qua khoa la, khong chep no vao ket qua", () => {
    const g = docGiaoDien({ boCuc: "luoi", giaBan: 5_000_000, noiBo: "SO-123" });
    expect(Object.keys(g).sort()).toEqual(
      ["bia", "boCuc", "hien", "lienHe", "loiKeuGoi", "ngonNgu", "nhan", "phienBan", "tone"],
    );
  });

  it("phienBan luon la 1 du dau vao noi gi", () => {
    expect(docGiaoDien({ phienBan: 99 }).phienBan).toBe(1);
  });
});

describe("coThongSo", () => {
  it("mac dinh la co", () => {
    expect(coThongSo(GIAO_DIEN_MAC_DINH)).toBe(true);
  });

  it("tat het thi khong con", () => {
    const hien = Object.fromEntries(THONG_SO.map((k) => [k, false]));
    expect(coThongSo(docGiaoDien({ hien }))).toBe(false);
  });
});

describe("docGiaoDien — khối liên hệ", () => {
  it("không có gì thì null", () => {
    expect(docGiaoDien({}).lienHe).toBeNull();
    expect(docGiaoDien({ lienHe: {} }).lienHe).toBeNull();
    expect(docGiaoDien({ lienHe: "0909" }).lienHe).toBeNull();
  });

  it("giữ tên và điện thoại, đã cắt khoảng trắng", () => {
    const g = docGiaoDien({ lienHe: { ten: " Ngọc Anh ", dienThoai: " 0909 123 456 " } });
    expect(g.lienHe).toEqual({ ten: "Ngọc Anh", dienThoai: "0909 123 456", cachNhan: "zalo" });
  });

  it("chỉ có điện thoại vẫn là một khối liên hệ hợp lệ", () => {
    expect(docGiaoDien({ lienHe: { dienThoai: "0909123456" } }).lienHe).toEqual({
      ten: "",
      dienThoai: "0909123456",
      cachNhan: "zalo",
    });
  });

  it("BẢN GHI CŨ: tên người tư vấn nằm trong bia.tenSale thì phải lấy ra", () => {
    // Catalogue tạo trước 08/09/2026 lưu tên người tư vấn ở bia.tenSale. Bỏ qua
    // là những link đã gửi mất một dòng thông tin mà không ai biết.
    const g = docGiaoDien({ bia: { tenKhach: "Chị Lan", tenSale: "Ngọc Anh" } });
    expect(g.lienHe).toEqual({ ten: "Ngọc Anh", dienThoai: "", cachNhan: "zalo" });
    expect(g.bia).toEqual({ tenKhach: "Chị Lan", loiChao: "" });
  });

  it("có lienHe mới thì KHÔNG lấy tên cũ nữa", () => {
    const g = docGiaoDien({
      bia: { tenKhach: "Chị Lan", tenSale: "Tên cũ" },
      lienHe: { ten: "Tên mới", dienThoai: "0909" },
    });
    expect(g.lienHe).toEqual({ ten: "Tên mới", dienThoai: "0909", cachNhan: "zalo" });
  });

  it("cắt chuỗi quá dài", () => {
    const g = docGiaoDien({
      lienHe: { ten: "a".repeat(200), dienThoai: "9".repeat(200) },
    });
    expect(g.lienHe!.ten).toHaveLength(DAI_TEN_SALE);
    expect(g.lienHe!.dienThoai).toHaveLength(DAI_DIEN_THOAI);
  });

  it("BẢN GHI CŨ không có cachNhan: vẫn là Zalo như lúc gửi", () => {
    // Trước 12/09/2026 nút thứ hai luôn là Zalo. Đổi mặc định ở đây là đổi nút
    // trên những link đang nằm trong máy khách.
    expect(docGiaoDien({ lienHe: { ten: "A", dienThoai: "0909" } }).lienHe!.cachNhan).toBe("zalo");
  });

  it("giữ cách nhắn đã chọn; giá trị lạ thì về Zalo", () => {
    for (const k of CACH_NHAN) {
      expect(docGiaoDien({ lienHe: { dienThoai: "1", cachNhan: k } }).lienHe!.cachNhan).toBe(k);
    }
    expect(docGiaoDien({ lienHe: { dienThoai: "1", cachNhan: "telegram" } }).lienHe!.cachNhan)
      .toBe("zalo");
  });
});

describe("goiYCachNhan", () => {
  it("số Việt Nam gợi ý Zalo", () => {
    expect(goiYCachNhan("0909 123 456")).toBe("zalo");
    expect(goiYCachNhan("+84 909 123 456")).toBe("zalo");
  });

  it("số Mỹ gợi ý Tin nhắn — kể cả đúng dạng trong ảnh góp ý (14083049094)", () => {
    expect(goiYCachNhan("(408) 304-9094")).toBe("tin-nhan");
    expect(goiYCachNhan("14083049094")).toBe("tin-nhan");
    expect(goiYCachNhan("+1 408 304 9094")).toBe("tin-nhan");
  });

  it("chưa đủ số hay dạng lạ thì không gợi ý — giữ lựa chọn đang có", () => {
    expect(goiYCachNhan("")).toBeNull();
    expect(goiYCachNhan("408")).toBeNull();
    expect(goiYCachNhan("+44 20 7946 0958")).toBeNull();
  });
});

describe("lienKetNhan", () => {
  const lh = (cachNhan: CachNhan, dienThoai = "0909 123 456"): LienHe =>
    ({ ten: "", dienThoai, cachNhan });

  it("Zalo giữ đúng dạng link cũ", () => {
    expect(lienKetNhan(lh("zalo"))).toBe("https://zalo.me/0909123456");
  });

  it("Tin nhắn mở app Tin nhắn của máy", () => {
    expect(lienKetNhan(lh("tin-nhan", "(408) 304-9094"))).toBe("sms:4083049094");
    expect(lienKetNhan(lh("tin-nhan", "+1 408 304 9094"))).toBe("sms:+14083049094");
  });

  it("WhatsApp luôn có mã quốc gia, không dấu + — số địa phương vẫn ra link đúng", () => {
    expect(lienKetNhan(lh("whatsapp", "(408) 304-9094"))).toBe("https://wa.me/14083049094");
    expect(lienKetNhan(lh("whatsapp", "14083049094"))).toBe("https://wa.me/14083049094");
    expect(lienKetNhan(lh("whatsapp", "0909 123 456"))).toBe("https://wa.me/84909123456");
    expect(lienKetNhan(lh("whatsapp", "+84 909 123 456"))).toBe("https://wa.me/84909123456");
  });

  it("Chỉ gọi điện, hoặc không có số, thì không có nút nhắn", () => {
    expect(lienKetNhan(lh("khong"))).toBeNull();
    expect(lienKetNhan(lh("zalo", ""))).toBeNull();
  });
});

describe("lời kêu gọi (góp ý 11/09/2026)", () => {
  const vi = boChu("vi").chia_se;
  const en = boChu("en").chia_se;

  it("BẢN GHI CŨ không có loiKeuGoi: vẫn là câu mặc định như lúc gửi", () => {
    expect(docGiaoDien({}).loiKeuGoi).toEqual({ mau: "mac-dinh", tuViet: "" });
    expect(cauKeuGoi(docGiaoDien({}).loiKeuGoi, "Ngọc Anh", vi)).toBe(vi.cta_tieu_de);
  });

  it("giữ câu đã chọn; khoá lạ hay sai kiểu thì về mặc định", () => {
    for (const k of LOI_KEU_GOI.filter((x) => x !== "tu-viet")) {
      expect(docGiaoDien({ loiKeuGoi: { mau: k } }).loiKeuGoi.mau).toBe(k);
    }
    expect(docGiaoDien({ loiKeuGoi: { mau: "khuyen-mai" } }).loiKeuGoi.mau).toBe("mac-dinh");
    expect(docGiaoDien({ loiKeuGoi: "goi-ngay" }).loiKeuGoi.mau).toBe("mac-dinh");
  });

  it("tự viết: cắt khoảng trắng và độ dài; ô trống thì về mặc định", () => {
    expect(docGiaoDien({ loiKeuGoi: { mau: "tu-viet", tuViet: "  Chúc chị Lan  " } }).loiKeuGoi)
      .toEqual({ mau: "tu-viet", tuViet: "Chúc chị Lan" });
    expect(docGiaoDien({ loiKeuGoi: { mau: "tu-viet", tuViet: "x".repeat(500) } }).loiKeuGoi.tuViet)
      .toHaveLength(DAI_LOI_KEU_GOI);
    expect(docGiaoDien({ loiKeuGoi: { mau: "tu-viet", tuViet: "   " } }).loiKeuGoi.mau).toBe("mac-dinh");
  });

  it("gọi ngay: điền tên người tư vấn; chưa có tên thì không để trống chỗ tên", () => {
    const goiNgay = { mau: "goi-ngay", tuViet: "" } as const;
    expect(cauKeuGoi(goiNgay, "Ngọc Anh", vi)).toBe("Hãy gọi ngay cho Ngọc Anh để được tư vấn");
    expect(cauKeuGoi(goiNgay, "  ", vi)).toBe("Hãy gọi ngay cho em để được tư vấn");
    expect(cauKeuGoi(goiNgay, "Ngoc Anh", en)).toBe("Call Ngoc Anh now for personal advice");
  });

  it("câu có sẵn đi theo ngôn ngữ catalogue", () => {
    expect(cauKeuGoi({ mau: "custom", tuViet: "" }, "", vi)).toBe("Nhận custom theo yêu cầu");
    expect(cauKeuGoi({ mau: "custom", tuViet: "" }, "", en)).toBe("Custom pieces made to order");
    expect(cauKeuGoi({ mau: "size-mau", tuViet: "" }, "", vi)).toBe("Cần size hay màu vàng khác, cứ nhắn em");
    expect(cauKeuGoi({ mau: "hen-xem", tuViet: "" }, "", en)).toBe("Book a visit to see it in person");
  });

  it("tự viết hiện đúng chữ sale gõ, không dịch; ô trống thì về câu mặc định", () => {
    expect(cauKeuGoi({ mau: "tu-viet", tuViet: "Chúc chị Lan chọn được mẫu ưng ý" }, "", en))
      .toBe("Chúc chị Lan chọn được mẫu ưng ý");
    expect(cauKeuGoi({ mau: "tu-viet", tuViet: "  " }, "", vi)).toBe(vi.cta_tieu_de);
  });
});

describe("coKhoiLienHe — khi nào khối liên hệ hiện ra", () => {
  // Lỗi thật 12/09/2026: sale tự viết lời kêu gọi nhưng bỏ trống người tư vấn và
  // số điện thoại → lienHe null → khối liên hệ (chứa lời kêu gọi) không hiện ở cả
  // Xem trước lẫn trang khách, dù câu đã lưu đúng.
  const mac = { mau: "mac-dinh", tuViet: "" } as const;
  const lh = { ten: "Ngọc Anh", dienThoai: "", cachNhan: "zalo" } as const;

  it("BẢN GHI CŨ không có liên hệ, lời kêu gọi mặc định: vẫn KHÔNG hiện, như lúc gửi", () => {
    expect(coKhoiLienHe({ lienHe: null, loiKeuGoi: mac })).toBe(false);
    expect(coKhoiLienHe(docGiaoDien({}))).toBe(false);
  });

  it("có người tư vấn hoặc số điện thoại thì hiện", () => {
    expect(coKhoiLienHe({ lienHe: lh, loiKeuGoi: mac })).toBe(true);
  });

  it("chưa có liên hệ nhưng đã chọn câu có sẵn thì vẫn hiện", () => {
    expect(coKhoiLienHe({ lienHe: null, loiKeuGoi: { mau: "custom", tuViet: "" } })).toBe(true);
  });

  it("chưa có liên hệ nhưng đã tự viết thì hiện — đúng dữ liệu của lỗi", () => {
    const g = docGiaoDien({
      loiKeuGoi: { mau: "tu-viet", tuViet: "Nhận custom theo yêu cầu ạ, thích gọi cho em qua số điện thoại" },
    });
    expect(g.lienHe).toBeNull();
    expect(coKhoiLienHe(g)).toBe(true);
  });

  it("bấm Tự viết mà chưa gõ chữ nào thì chưa hiện", () => {
    expect(coKhoiLienHe({ lienHe: null, loiKeuGoi: { mau: "tu-viet", tuViet: "   " } })).toBe(false);
  });
});

describe("soGoiDuoc", () => {
  it("bỏ mọi thứ không phải chữ số", () => {
    expect(soGoiDuoc("0909 123 456")).toBe("0909123456");
    expect(soGoiDuoc("(408) 555-0199")).toBe("4085550199");
    expect(soGoiDuoc("0909.123.456")).toBe("0909123456");
  });

  it("giữ dấu + ở đầu — số quốc tế gọi được, thiếu dấu + là gọi sai nước", () => {
    expect(soGoiDuoc("+84 909 123 456")).toBe("+84909123456");
    expect(soGoiDuoc(" +1 408 555 0199 ")).toBe("+14085550199");
  });

  it("dấu + ở giữa không phải mã quốc gia nên bỏ", () => {
    expect(soGoiDuoc("0909+123")).toBe("0909123");
  });

  it("không có chữ số nào thì trả chuỗi rỗng", () => {
    expect(soGoiDuoc("")).toBe("");
    expect(soGoiDuoc("gọi em nhé")).toBe("");
    expect(soGoiDuoc("+")).toBe("");
  });
});

describe("bố cục và màu nhấn mới", () => {
  it("nhận cả sáu bố cục", () => {
    for (const k of BO_CUC) expect(docGiaoDien({ boCuc: k }).boCuc).toBe(k);
  });

  it("nhận mọi nền và mọi màu nhấn", () => {
    for (const k of TONE) expect(docGiaoDien({ tone: k }).tone).toBe(k);
    for (const k of NHAN) expect(docGiaoDien({ nhan: k }).nhan).toBe(k);
  });

  it("catalogue CŨ không có màu nhấn thì ra hồng thương hiệu", () => {
    // 27 catalogue tạo trước hôm nay có cột giao_dien rỗng. Chúng phải hiện y
    // như lúc gửi đi — tức bố cục danh sách, nền kem, hồng thương hiệu.
    const g = docGiaoDien({});
    expect(g.boCuc).toBe("danh-sach");
    expect(g.tone).toBe("beige");
    expect(g.nhan).toBe("hong");
  });

  it("mỗi màu nhấn có đủ ba sắc, và ba sắc khác nhau", () => {
    // Sắc đậm dành riêng cho nút có chữ trắng; dùng chung một sắc là chữ trắng
    // trên hồng thương hiệu, chỉ đạt 3.81:1. Sắc sáng để vẽ chữ trên nền tối.
    for (const k of NHAN) {
      const m = MAU_NHAN[k];
      expect(m.nhat).toMatch(/^#[0-9A-F]{6}$/i);
      expect(m.dam).toMatch(/^#[0-9A-F]{6}$/i);
      expect(m.sang).toMatch(/^#[0-9A-F]{6}$/i);
      expect(new Set([m.nhat, m.dam, m.sang]).size).toBe(3);
    }
  });

  it("bốn màu nhấn cũ giữ đúng hai sắc cũ — catalogue tông sáng đã gửi không đổi", () => {
    expect(MAU_NHAN.hong).toMatchObject({ nhat: "#E91D79", dam: "#C4165F" });
    expect(MAU_NHAN.dong).toMatchObject({ nhat: "#A96A00", dam: "#8A5600" });
    expect(MAU_NHAN.luc).toMatchObject({ nhat: "#00806B", dam: "#006956" });
    expect(MAU_NHAN.man).toMatchObject({ nhat: "#A0439B", dam: "#873781" });
  });
});

describe("năm tông và ba màu nhấn mới (12/09/2026)", () => {
  it("chỉ thêm vào cuối — thứ tự cũ giữ nguyên", () => {
    expect(TONE).toEqual([
      "beige", "trang", "toi", "reu", "hoa-van", "champagne", "bach-kim", "hong-phan",
      "do-ruou", "than-chi", "xanh-dem", "oai-huong", "suong-bien",
    ]);
    expect(NHAN).toEqual(["hong", "dong", "luc", "man", "ruby", "luc-bao", "sapphire"]);
  });

  it("ba màu nhấn mới đúng giá trị đã đo", () => {
    expect(MAU_NHAN.ruby).toEqual({ nhat: "#D33A3C", dam: "#B02A2D", sang: "#F47B74" });
    expect(MAU_NHAN["luc-bao"]).toEqual({ nhat: "#009342", dam: "#007835", sang: "#53BE70" });
    expect(MAU_NHAN.sapphire).toEqual({ nhat: "#2275E8", dam: "#145EC1", sang: "#68A5FF" });
  });

  it("tông tối là đúng năm tông", () => {
    expect([...TONE_TOI].sort()).toEqual(["do-ruou", "reu", "than-chi", "toi", "xanh-dem"]);
  });

  it("docGiaoDien nhận tông và màu nhấn mới", () => {
    expect(docGiaoDien({ tone: "xanh-dem", nhan: "sapphire" })).toMatchObject({
      tone: "xanh-dem",
      nhan: "sapphire",
    });
  });
});
