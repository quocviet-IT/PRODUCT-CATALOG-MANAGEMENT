/** Mot o cua Sheets API, chi giu ba truong ma man hinh nay can. */
export type OTho = {
  formattedValue?: string;
  userEnteredValue?: { formulaValue?: string; numberValue?: number };
  hyperlink?: string;
};

export type CoBatThuong =
  | "thieu-sku" | "thieu-anh" | "thieu-mo-ta" | "trung" | "tl-vang-lech";

export type DongCatalogue = {
  dongSheet: number;
  sku: string | null;
  maMau: string | null;
  mo: string | null;
  chiTiet: string | null;
  chatLieu: string | null;
  loaiXoan: "lab" | "tu-nhien" | null;
  tlVang: number | null;
  size: string | null;
  fileIdAnh: string | null;
  urlThuMuc: string | null;
  co: CoBatThuong[];
};

export class LoiThieuCot extends Error {
  constructor(public readonly cotThieu: string[]) {
    super(`Bảng tính thiếu cột bắt buộc: ${cotThieu.join(", ")}`);
    this.name = "LoiThieuCot";
  }
}

/**
 * Mot o tieu de trong bang that chua ky tu xuong dong ("TL VANG\n (gr)").
 * So khop truc tiep se truot, nen phai chuan hoa truoc khi doi chieu.
 */
export function chuanHoaTieuDe(s: string): string {
  // Chuan NFC truoc: Sheets API co the tra tieu de co dau duoi dang to hop
  // NFD (chu cai + dau rieng). Khong chuan hoa thi so khop chuoi truot ngay
  // ca khi mat ky tu nhin giong het nhau.
  return s.normalize("NFC").replace(/\s+/g, " ").trim().toLowerCase();
}

/**
 * Moi truong logic nhan nhieu ten tieu de. Tab khac co the bo phan "(gr)",
 * nen liet ke ca hai thay vi cot chet mot chuoi.
 */
const COT = {
  sku:      { ten: "SKU",         batBuoc: true,  nhan: ["sku"] },
  mo:       { ten: "MO",          batBuoc: true,  nhan: ["mo"] },
  chiTiet:  { ten: "Chi tiết SP", batBuoc: true,  nhan: ["chi tiết sp"] },
  maMau:    { ten: "MÃ MẪU",      batBuoc: true,  nhan: ["mã mẫu"] },
  chatLieu: { ten: "CHẤT LIỆU",   batBuoc: true,  nhan: ["chất liệu"] },
  tlVang:   { ten: "TL VÀNG",     batBuoc: true,  nhan: ["tl vàng (gr)", "tl vàng"] },
  hinh:     { ten: "HÌNH",        batBuoc: true,  nhan: ["hình"] },
  size:     { ten: "SIZE",        batBuoc: false, nhan: ["size"] },
  thuMuc:   { ten: "FOLDER HÌNH", batBuoc: false, nhan: ["folder hình"] },
} as const;

type TenTruong = keyof typeof COT;

const DONG_TIEU_DE = 1; // chi so 0-based; dong 1 cua bang la bang tieu de gop o
const HE_SO_CARAT_SANG_GRAM = 0.2;
const NGUONG_LECH_TL_VANG = 0.005; // cot hien thi lam tron hai chu so thap phan

export function tachFileIdAnh(congThuc: string | undefined): string | null {
  if (!congThuc) return null;
  const m = /^=IMAGE\(.*?\/d\/([A-Za-z0-9_-]+)/i.exec(congThuc);
  return m ? m[1] : null;
}

export function tachSize(chiTiet: string | null): string | null {
  if (!chiTiet) return null;
  const m = /Size:\s*(\S+)/i.exec(chiTiet);
  return m ? m[1] : null;
}

export function tinhTlVangSuyRa(chiTiet: string | null): number | null {
  if (!chiTiet) return null;
  const gr = /([\d.]+)\s*gr\b/i.exec(chiTiet);
  if (!gr) return null;
  const cts = [...chiTiet.matchAll(/([\d.]+)\s*cts\b/gi)].map((m) => Number(m[1]));
  const tongCts = cts.reduce((a, b) => a + b, 0);
  return Number(gr[1]) - HE_SO_CARAT_SANG_GRAM * tongCts;
}

function chu(o: OTho | undefined): string | null {
  const v = o?.formattedValue?.trim();
  return v ? v : null;
}

export function anhXaBang(hang: OTho[][]): DongCatalogue[] {
  const tieuDe = (hang[DONG_TIEU_DE] ?? []).map((o) => chuanHoaTieuDe(o.formattedValue ?? ""));

  const viTri = {} as Record<TenTruong, number>;
  const thieu: string[] = [];
  for (const [khoa, dinhNghia] of Object.entries(COT) as [TenTruong, typeof COT[TenTruong]][]) {
    const i = tieuDe.findIndex((t) => (dinhNghia.nhan as readonly string[]).includes(t));
    viTri[khoa] = i;
    if (i === -1 && dinhNghia.batBuoc) thieu.push(dinhNghia.ten);
  }
  if (thieu.length > 0) throw new LoiThieuCot(thieu);

  const lay = (h: OTho[], khoa: TenTruong): OTho | undefined =>
    viTri[khoa] === -1 ? undefined : h[viTri[khoa]];

  const ds: DongCatalogue[] = [];
  for (let i = DONG_TIEU_DE + 1; i < hang.length; i++) {
    const h = hang[i] ?? [];
    const sku = chu(lay(h, "sku"));
    const maMau = chu(lay(h, "maMau"));
    const mo = chu(lay(h, "mo"));
    const chiTiet = chu(lay(h, "chiTiet"));
    const fileIdAnh = tachFileIdAnh(lay(h, "hinh")?.userEnteredValue?.formulaValue);

    // includeGridData=true tra ca dong trong nhung con dinh dang (border,
    // mau nen do da to tu truoc). Bo qua truoc khi gop nhom trung, khong thi
    // moi dong trong bien thanh mot the toan null va con bi gan nham co "trung"
    // vi tat ca cung chia se khoa rong giong nhau.
    if (sku === null && maMau === null && mo === null && chiTiet === null && fileIdAnh === null) {
      continue;
    }

    // formattedValue la chuoi DA HIEN THI theo locale bang tinh (vi du "2,78"
    // o locale Viet). Number("2,78") ra NaN nen phai uu tien userEnteredValue
    // .numberValue — gia tri so goc, khong phu thuoc cach hien thi — va chi
    // lui ve doc chuoi khi khong co (o thuc su rong).
    const oTlVang = lay(h, "tlVang");
    const tlVangSo = oTlVang?.userEnteredValue?.numberValue;
    const tlVangThoc = chu(oTlVang);
    const tlVang = tlVangSo !== undefined ? tlVangSo
      : tlVangThoc === null ? null : Number(tlVangThoc);

    const dong: DongCatalogue = {
      dongSheet: i + 1,
      sku,
      maMau,
      mo,
      chiTiet,
      chatLieu: chu(lay(h, "chatLieu")),
      loaiXoan: chiTiet === null ? null
        : /^LGDRI/i.test(chiTiet) ? "lab"
        : /^DIARI/i.test(chiTiet) ? "tu-nhien"
        : null,
      tlVang: tlVang !== null && Number.isFinite(tlVang) ? tlVang : null,
      size: chu(lay(h, "size")) ?? tachSize(chiTiet),
      fileIdAnh,
      urlThuMuc: lay(h, "thuMuc")?.hyperlink ?? null,
      co: [],
    };

    if (dong.sku === null) dong.co.push("thieu-sku");
    if (dong.fileIdAnh === null) dong.co.push("thieu-anh");
    if (dong.chiTiet === null) dong.co.push("thieu-mo-ta");

    const suyRa = tinhTlVangSuyRa(chiTiet);
    if (suyRa !== null && dong.tlVang !== null
        && Math.abs(suyRa - dong.tlVang) > NGUONG_LECH_TL_VANG) {
      dong.co.push("tl-vang-lech");
    }

    ds.push(dong);
  }

  // Co "trung" gan cho MOI dong trong nhom, khong phai chi ban sao thu hai:
  // nguoi doc can thay ca hai de biet nen giu dong nao.
  // Khoa trung la cap (MA MAU, MO) theo dung spec. Dung JSON.stringify thay vi
  // noi chuoi bang dau cach: noi chuoi co the khien hai cap gia tri khac nhau
  // tao ra cung mot khoa (vi du maMau="A" + mo="B C" trung voi maMau="A B" +
  // mo="C"), con JSON.stringify giu ranh gioi tung phan tu ro rang.
  const dem = new Map<string, number>();
  const khoaTrung = (d: DongCatalogue) => JSON.stringify([d.maMau, d.mo]);
  for (const d of ds) dem.set(khoaTrung(d), (dem.get(khoaTrung(d)) ?? 0) + 1);
  for (const d of ds) if ((dem.get(khoaTrung(d)) ?? 0) > 1) d.co.push("trung");

  return ds;
}
