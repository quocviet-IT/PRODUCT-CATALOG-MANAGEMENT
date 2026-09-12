import { config } from "dotenv";
config({ path: ".env.local" });

import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { randomBytes } from "node:crypto";
import postgres from "postgres";
import { createClient } from "@supabase/supabase-js";
import { chromium, type Browser, type Locator, type Page } from "playwright";
// Khong ghi duoi .ts: tep nay nam trong pham vi tsc cua du an (build chan loi TS5097),
// con tsx tu tim ra tep .ts.
import { boChu, type BoChu } from "../src/messages/index";
import { COOKIE_NGON_NGU, NGON_NGU, NHAN_NGON_NGU, type NgonNgu } from "../src/messages/ngon-ngu";

/**
 * Chup anh minh hoa cho trang /admin/huong-dan — MOT BO CHO MOI NGON NGU (12/09/2026).
 *
 * Chay: npm run huong-dan:anh          (ca tieng Viet lan tieng Anh)
 *       npm run huong-dan:anh -- en    (chi mot ngon ngu)
 * May chu phai dang chay o CONG duoi day.
 *
 * Tieng Viet ghi vao public/huong-dan/, tieng Anh vao public/huong-dan/en/, moi thu
 * muc mot diem.json rieng: chu tieng Anh dai ngan khac nen vi tri mui ten khac.
 * Giao dien doi ngon ngu bang CHINH cookie cua nut VI/EN. Catalogue chup o luot tieng
 * Anh cung chon ngon ngu English, de trang khach trong anh cung la tieng Anh.
 *
 * Moi cho tim nut/chu deu dung lai BO CHU cua app (src/messages), khong go tay chu
 * tieng Viet: doi mot nhan tren giao dien la script tu theo, ca hai ngon ngu.
 *
 * So moc cua moi anh phai bang so chu thich (`chu`) cua buoc do trong
 * src/messages/huong-dan.*.ts; ten anh phai trung page.tsx. Chon `huong` sao cho o so
 * roi vao cho trong — o so ve bang px cua KHUNG huong dan (rong 768) nen tren anh
 * 1440px no to gan gap doi. Soat bang mat tren chinh trang huong dan.
 *
 * Tai khoan tam va catalogue tam bi XOA trong finally. Script KHONG gui gop y nao.
 */

const CONG = Number(process.env.CONG_CHUP ?? 3100);
const GOC = `http://localhost:${CONG}`;
const THU_MUC_GOC = join(process.cwd(), "public", "huong-dan");

const RONG = 1440;
const CAO = 900;

const sql = postgres(process.env.DATABASE_URL!, { max: 1, prepare: false });
const kho = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const EMAIL = `chup-huong-dan-${randomBytes(4).toString("hex")}@ctyhp.vn`;
const MAT_KHAU = randomBytes(18).toString("base64url");

/** Ten va email HIEN TREN ANH (hang users), khong phai email that cua tai khoan tam. */
const TEN_HIEN = "Ngọc Anh";
const EMAIL_HIEN = "ngoc.anh@ctyhp.vn";

const EMAIL_MINH_HOA = [
  "ngoc.anh@ctyhp.vn", "minh.thu@ctyhp.vn", "gia.bao@ctyhp.vn",
  "thuy.linh@ctyhp.vn", "quang.huy@ctyhp.vn", "kim.ngan@ctyhp.vn",
];
const HO_TEN_MINH_HOA = ["Ngọc Anh", "Minh Thư", "Gia Bảo", "Thuỳ Linh", "Quang Huy", "Kim Ngân"];

/** Du lieu minh hoa go vao man hinh, theo ngon ngu cua luot chup. */
const MAU = {
  vi: {
    emailDangNhap: "ten.ban@ctyhp.vn",
    tenCatalogue: "Chị Lan — nhẫn cưới 18K",
    tenLink: "Nhẫn cưới 18K",
    tenKhach: "Chị Lan",
    loiChao: "Kính gửi chị Lan bộ sưu tập nhẫn cưới 18K em chọn riêng theo sở thích của chị.",
    // Dong dau DAI gan kin be ngang: o buoc 16 mui ten chi vao mep phai doan gioi thieu.
    gioiThieu:
      "Dây mặt thánh giá bạc đan tay, đeo lâu không xoắn, sáng bóng như mới sau nhiều năm đeo hằng ngày.\nHợp làm quà tặng dịp lễ.",
    gopY: [
      "Bấm Tạo link thì không thấy gì xảy ra, thử lại ba lần vẫn vậy.",
      "Cho thêm tông màu cho catalogue gửi khách bên Mỹ.",
      "Ảnh mẫu này bị mờ khi phóng to trên điện thoại.",
      "Muốn sắp xếp ảnh theo thứ tự tuỳ ý.",
    ],
    tenDanhSach: [
      "Chị Lan — nhẫn cưới 18K", "Anh Tuấn — bộ cưới", "Chị Mai — nhẫn kim cương",
      "Khách Hà Nội — dây chuyền", "Chị Hương — bông tai", "Anh Nam — nhẫn nam",
      "Chị Thảo — lắc tay", "Khách quen — vòng cổ",
    ],
  },
  en: {
    emailDangNhap: "your.name@ctyhp.vn",
    tenCatalogue: "Ms. Lan — 18K wedding rings",
    tenLink: "18K wedding rings",
    tenKhach: "Ms. Lan",
    loiChao: "Dear Ms. Lan, here is the 18K wedding ring collection I picked out with your taste in mind.",
    gioiThieu:
      "Hand-woven cross pendant chain that lies flat and keeps its shine after years of everyday wear, day in and day out.\nA lovely holiday gift.",
    gopY: [
      "Pressing Create customer link does nothing — I tried three times.",
      "Please add more colour themes for customers in the US.",
      "This model's photo looks blurry when zoomed in on a phone.",
      "Let us put the images in any order we like.",
    ],
    tenDanhSach: [
      "Ms. Lan — 18K wedding rings", "Mr. Tuan — wedding set", "Ms. Mai — diamond ring",
      "Hanoi client — necklace", "Ms. Huong — earrings", "Mr. Nam — men's ring",
      "Ms. Thao — bracelet", "Regular client — pendant",
    ],
  },
} as const;

type Huong = "trai" | "phai" | "tren" | "duoi";
type Khung = { x: number; y: number; width: number; height: number };
type Diem = { x: number; y: number; huong: Huong };
type Moc = { o: Locator; huong: Huong };

// --- Tim theo chu cua bo chu ---------------------------------------------------------

const thoat = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
/** Khop DUNG ca cau (khong phan biet hoa thuong). */
const dung = (s: string) => new RegExp(`^${thoat(s.trim())}$`, "i");
/** Khop cau BAT DAU bang chuoi nay. */
const dau = (s: string) => new RegExp(`^${thoat(s.trim())}`, "i");
/** Khop cau CO chuoi nay. */
const co = (s: string) => new RegExp(thoat(s.trim()), "i");
/** Mau co cho trong `{ten}`: phan chu duoc thoat, cho trong thay bang regex cho truoc. */
function khuon(mau: string, cho: Record<string, string>, neo = true): RegExp {
  const src = mau
    .split(/(\{[a-z_]+\})/)
    .map((p) => {
      const m = /^\{([a-z_]+)\}$/.exec(p);
      return m ? (cho[m[1]] ?? ".+") : thoat(p);
    })
    .join("");
  return new RegExp(neo ? `^${src}$` : src, "i");
}

// --- Tai khoan tam --------------------------------------------------------------------

async function taoTaiKhoanTam(): Promise<string> {
  const { data, error } = await kho.auth.admin.createUser({ email: EMAIL, password: MAT_KHAU, email_confirm: true });
  if (error) throw error;
  // Lan chup truoc bi ngat giua chung co the de lai dong cu (cot email duy nhat).
  await sql`delete from users where email = ${EMAIL_HIEN}`;
  await sql`
    insert into users (id, email, full_name, role)
    values (${data.user.id}, ${EMAIL_HIEN}, ${TEN_HIEN}, 'admin')
  `;
  return data.user.id;
}

async function xoaTaiKhoanTam(id: string): Promise<void> {
  await sql`delete from catalogues where owner_id = ${id}`;
  await sql`delete from users where id = ${id}`;
  const { error } = await kho.auth.admin.deleteUser(id);
  if (error) console.error("[chup] khong xoa duoc tai khoan tam:", error.message);
}

// --- Chup va do mui ten -----------------------------------------------------------------

function diemTu(o: Khung, khung: Khung, huong: Huong): Diem {
  const pt = (v: number, goc: number, dai: number) => ((v - goc) / dai) * 100;
  const giua = { x: o.x + o.width / 2, y: o.y + o.height / 2 };
  const diem =
    huong === "trai" ? { x: o.x + o.width, y: giua.y }
    : huong === "phai" ? { x: o.x, y: giua.y }
    : huong === "tren" ? { x: giua.x, y: o.y + o.height }
    : { x: giua.x, y: o.y };
  return {
    x: Math.round(pt(diem.x, khung.x, khung.width) * 10) / 10,
    y: Math.round(pt(diem.y, khung.y, khung.height) * 10) / 10,
    huong,
  };
}

/** Noi ghi anh va vi tri mui ten cua luot chup dang chay. */
type Luot = { nn: NgonNgu; thuMuc: string; diem: Record<string, Diem[]> };

async function chup(luot: Luot, page: Page, ten: string, moc: Moc[], khungCat?: Khung): Promise<void> {
  const khungNhin = page.viewportSize();
  if (!khungNhin) throw new Error(`[chup ${luot.nn}] ${ten}: không đọc được kích thước khung nhìn`);
  const khung = khungCat ?? { x: 0, y: 0, ...khungNhin };

  const doHet = async () => {
    const hop: Khung[] = [];
    for (const [i, m] of moc.entries()) {
      const o = await m.o.first().boundingBox();
      if (!o) throw new Error(`[chup ${luot.nn}] ${ten}: không đo được vị trí của điểm ${i + 1} — phần tử chưa có trên trang.`);
      hop.push(o);
    }
    return hop;
  };

  // Do HAI LAN, truoc va sau khi chup: xe dich la trang chua dung yen.
  const truoc = await doHet();
  const anh = await page.screenshot({ type: "png", ...(khungCat ? { clip: khungCat } : {}) });
  await writeFile(join(luot.thuMuc, `${ten}.png`), anh);
  const sau = await doHet();
  for (let i = 0; i < truoc.length; i++) {
    if (Math.abs(truoc[i].x - sau[i].x) > 1 || Math.abs(truoc[i].y - sau[i].y) > 1) {
      throw new Error(`[chup ${luot.nn}] ${ten}: điểm ${i + 1} xê dịch giữa lúc đo và lúc chụp — trang chưa đứng yên.`);
    }
  }

  const diem: Diem[] = [];
  for (const [i, o] of sau.entries()) {
    const d = diemTu(o, khung, moc[i].huong);
    if (d.x < 0 || d.x > 100 || d.y < 0 || d.y > 100) {
      throw new Error(`[chup ${luot.nn}] ${ten}: điểm ${i + 1} rơi ngoài ảnh (x=${d.x}%, y=${d.y}%).`);
    }
    diem.push(d);
  }
  luot.diem[ten] = diem;
  console.log(`  [${luot.nn}] ${ten}.png  ${(anh.byteLength / 1024).toFixed(0)} KB  ${diem.length} điểm`);
}

async function cuonToi(page: Page, o: Locator, chua = 80): Promise<void> {
  await o.first().evaluate((el, c) => {
    const y = el.getBoundingClientRect().top + window.scrollY - c;
    window.scrollTo({ top: y, behavior: "instant" });
  }, chua);
  await page.waitForTimeout(400);
}

async function khungTu(page: Page, tren: Locator, duoi: Locator, demTren = 24, demDuoi = 80): Promise<Khung> {
  const a = await tren.first().boundingBox();
  const b = await duoi.first().boundingBox();
  if (!a || !b) throw new Error("[chup] không đo được vùng cắt");
  const kn = page.viewportSize()!;
  const y = Math.max(0, Math.floor(a.y - demTren));
  const day = Math.min(kn.height, Math.ceil(b.y + b.height + demDuoi));
  return { x: 0, y, width: kn.width, height: day - y };
}

// --- Che du lieu that --------------------------------------------------------------------
/*
 * Anh nam trong public/ va kho ma nguon cong khai. Khong duoc lot ra: email nhan vien,
 * duong dan catalogue dang song, ma kho noi bo (SKU, SO, MO, chi tiet ky thuat, o chu),
 * noi dung gop y that. Chi doi CHU TREN MAN HINH, khong dong toi co so du lieu.
 *
 * BAY: ham truyen vao evaluate() chay trong TRINH DUYET. tsx (esbuild) boc moi ham CO TEN
 * (`const f = () => …`, ham lam gia tri khoa object) bang __name(), ma trinh duyet khong
 * co __name: "ReferenceError: __name is not defined". Chi dung callback khong ten va du
 * lieu tran; nhan cot truyen vao qua doi so.
 */

/** Nhan cot noi bo (chu thuong) cua ngon ngu dang chup -> gia tri minh hoa dang tien to. */
function cotNoiBo(t: BoChu) {
  const c = t.catalogue_sheet;
  return {
    sku: c.cot_sku.toLowerCase(),
    so: c.cot_so.toLowerCase(),
    mo: c.cot_mo.toLowerCase(),
    chiTiet: c.cot_chi_tiet.toLowerCase(),
    oChu: c.cot_o_chu.toLowerCase(),
    chuChiTiet: t === boChu("en") ? "Illustrative details" : "Chi tiết minh hoạ",
    chuOChu: t === boChu("en") ? "Sample" : "Minh hoạ",
  };
}

async function cheBangMau(page: Page, t: BoChu): Promise<void> {
  const bang = page.locator("table").first();
  if ((await bang.count()) === 0) return;
  await bang.evaluate((b, k) => {
    const cot = [...b.querySelectorAll("thead th")].map((th) => (th.textContent ?? "").trim().toLowerCase());
    b.querySelectorAll("tbody tr").forEach((tr, i) => {
      const so = String(i + 1).padStart(5, "0");
      tr.querySelectorAll("td").forEach((td, j) => {
        const ten = cot[j];
        if (ten === k.sku) td.textContent = `10${so}`;
        else if (ten === k.so) td.textContent = `SO-${so}`;
        else if (ten === k.mo) td.textContent = `MO-${so}`;
        else if (ten === k.chiTiet) td.textContent = k.chuChiTiet;
        else if (ten === k.oChu) td.textContent = k.chuOChu;
      });
    });
  }, cotNoiBo(t));
}

async function cheNganChiTiet(ngan: Locator, t: BoChu): Promise<void> {
  const k = cotNoiBo(t);
  const mau: Record<string, string> = { [k.sku]: "100001", [k.so]: "SO-00001", [k.mo]: "MO-00001", [k.oChu]: k.chuOChu };
  await ngan.evaluate((el, a) => {
    el.querySelectorAll("dl > div").forEach((d) => {
      const dt = (d.querySelector("dt")?.textContent ?? "").trim().toLowerCase();
      const dd = d.querySelector("dd");
      if (dd && a.mau[dt]) dd.textContent = a.mau[dt];
    });
    const p = el.querySelector("h2 + p");
    if (p) p.textContent = a.chuChiTiet;
  }, { mau, chuChiTiet: k.chuChiTiet });
}

async function cheGopY(page: Page, noiDung: readonly string[]): Promise<void> {
  await page.locator("table").first().evaluate((b, a) => {
    b.querySelectorAll("tbody tr").forEach((tr, i) => {
      const o = tr.querySelectorAll("td");
      // Chi doi cac nut CHU truc tiep: giu nut "Xem anh" va the email.
      [[o[1], a.noiDung[i % a.noiDung.length]], [o[3], a.ho[i % a.ho.length]]].forEach(([td, chu]) => {
        if (!td || typeof td === "string") return;
        [...td.childNodes]
          .filter((n) => n.nodeType === Node.TEXT_NODE)
          .forEach((n, k) => { n.textContent = k === 0 ? String(chu) : ""; });
      });
      const email = o[3]?.querySelector("span");
      if (email) email.textContent = a.email[i % a.email.length];
    });
  }, { noiDung: [...noiDung], ho: HO_TEN_MINH_HOA, email: EMAIL_MINH_HOA });
}

/** Fieldset co legend dung chu nay (khung Kieu trinh bay). */
const khoi = (page: Page, legend: RegExp) =>
  page.locator("fieldset").filter({ has: page.locator("legend", { hasText: legend }) }).first();

// --- Mot luot chup -----------------------------------------------------------------------

async function chupMotNgonNgu(trinhDuyet: Browser, nn: NgonNgu): Promise<void> {
  const t = boChu(nn);
  const m = MAU[nn];
  const cs = t.catalogue_sheet;
  const ch = t.chia_se;
  const gd = t.mau_giao_dien;
  const luot: Luot = { nn, thuMuc: nn === "vi" ? THU_MUC_GOC : join(THU_MUC_GOC, nn), diem: {} };
  await mkdir(luot.thuMuc, { recursive: true });

  const ctx = await trinhDuyet.newContext({
    viewport: { width: RONG, height: CAO },
    deviceScaleFactor: 2,
    locale: nn === "vi" ? "vi-VN" : "en-US",
  });
  // Doi ngon ngu bang CHINH cookie cua nut VI/EN, truoc khi mo trang nao.
  await ctx.addCookies([{ name: COOKIE_NGON_NGU, value: nn, url: GOC }]);
  const page = await ctx.newPage();

  try {
    // --- 1. Dang nhap ---
    await page.goto(`${GOC}/login`, { waitUntil: "networkidle" });
    await page.getByRole("button", { name: co(t.dang_nhap.khong_vao_duoc) }).click();
    await page.fill("#email", m.emailDangNhap);
    await page.fill("#mat_khau", "••••••••••••");
    await chup(luot, page, "01-dang-nhap", [
      { o: page.getByRole("button", { name: co(t.dang_nhap.nut_google) }), huong: "phai" },
      { o: page.locator("#email"), huong: "phai" },
    ], { x: 470, y: 140, width: 500, height: 620 });
    await page.fill("#email", EMAIL);
    await page.fill("#mat_khau", MAT_KHAU);
    await Promise.all([
      page.waitForURL((u) => !u.pathname.startsWith("/login"), { timeout: 30_000 }),
      page.getByRole("button", { name: dung(t.dang_nhap.nut) }).click(),
    ]);

    // --- 2. Thanh dau trang + menu nguoi dung ---
    await page.goto(`${GOC}/admin/catalogue-sheet`, { waitUntil: "networkidle" });
    await cheBangMau(page, t);
    await page.getByRole("button", { name: co(TEN_HIEN) }).click();
    await page.getByRole("link", { name: co(t.gop_y.nut_menu) }).waitFor();
    await chup(luot, page, "02-thanh-dau-trang", [
      { o: page.getByRole("navigation", { name: t.dieu_huong.trang_chinh }), huong: "trai" },
      { o: page.getByRole("group", { name: t.dieu_huong.ngon_ngu }), huong: "phai" },
      { o: page.getByText(EMAIL_HIEN, { exact: true }), huong: "phai" },
      { o: page.getByRole("link", { name: co(t.gop_y.nut_menu) }), huong: "phai" },
      { o: page.getByRole("button", { name: dung(t.dang_nhap.dang_xuat) }), huong: "phai" },
      { o: page.getByRole("button", { name: dung(t.gop_y.nut) }), huong: "phai" },
    ], { x: 0, y: 0, width: RONG, height: 560 });
    await page.keyboard.press("Escape");

    // --- 3. Tim va loc --- (dong goi y truoc: no de len hang o loc)
    await page.setViewportSize({ width: RONG, height: 1250 });
    await page.goto(`${GOC}/admin/catalogue-sheet`, { waitUntil: "networkidle" });
    await page.fill("#q", "nhan");
    await page.waitForTimeout(1200);
    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);
    await cheBangMau(page, t);
    await chup(luot, page, "03-tim-mau", [
      { o: page.locator("#q"), huong: "trai" },
      { o: page.getByTitle(co(cs.dashboard_loc.replace("{nhan}", cs.dem_thieu_anh))), huong: "duoi" },
      { o: page.getByRole("button", { name: dau(cs.cot_mau) }), huong: "tren" },
      // O "Den", so ben PHAI: dat duoi o "Tu" thi o so de len nhan kieu xem (tieng Anh dai hon).
      { o: page.locator("#tl_den"), huong: "trai" },
      { o: page.getByRole("link", { name: dung(cs.xem_luoi) }), huong: "trai" },
      { o: page.locator("thead th").filter({ hasText: dung(cs.cot_ma_mau) }), huong: "duoi" },
    ]);

    // --- 4. Ngan chi tiet mau ---
    await page.fill("#q", "");
    await page.waitForTimeout(1200);
    await page.keyboard.press("Escape");
    await page.locator("#q").blur();
    await page.setViewportSize({ width: RONG, height: 1500 });
    await page.waitForTimeout(300);
    await page.locator("tbody tr").filter({ has: page.locator("img") }).first().locator("td").nth(1).click();
    const ngan = page.getByRole("dialog", { name: co(cs.chi_tiet_mau) });
    const nutPhongTo = khuon(cs.phong_to, { ten: ".+" });
    await ngan.getByRole("button", { name: nutPhongTo }).first().waitFor({ timeout: 30_000 });
    // Doi MOI anh thu vien tai xong: anh tai cham hien thanh o trong.
    await page.waitForFunction(
      () => [...document.querySelectorAll("aside[role=dialog] img")]
        .every((i) => (i as HTMLImageElement).complete && (i as HTMLImageElement).naturalWidth > 0),
      null,
      { timeout: 30_000 },
    );
    await cheBangMau(page, t);
    await cheNganChiTiet(ngan, t);
    await page.waitForTimeout(1000);
    await chup(luot, page, "04-chi-tiet-mau", [
      { o: ngan.getByRole("button", { name: dung(cs.dong_ngan) }), huong: "trai" },
      { o: ngan.locator("dt").filter({ hasText: dung(cs.cot_loai_sp) }), huong: "phai" },
      { o: ngan.getByRole("link").first(), huong: "trai" },
      { o: ngan.getByRole("button", { name: nutPhongTo }).first(), huong: "trai" },
    ]);
    await page.keyboard.press("Escape");

    // --- 5. Tich chon --- (CHI dong co anh: buoc 13 can mau dau co it nhat bon anh)
    await page.setViewportSize({ width: RONG, height: CAO });
    await page.goto(`${GOC}/admin/catalogue-sheet`, { waitUntil: "networkidle" });
    const oTich = page.locator("tbody tr").filter({ has: page.locator("img") }).locator('input[type="checkbox"]');
    const soO = Math.min(await oTich.count(), 3);
    for (let i = 0; i < soO; i++) await oTich.nth(i).check();
    await page.waitForTimeout(400);
    await cheBangMau(page, t);
    await chup(luot, page, "05-tich-chon", [
      { o: oTich.first(), huong: "trai" },
      { o: page.getByText(khuon(ch.da_chon, { n: "\\d+" }, false)), huong: "duoi" },
      { o: page.getByRole("button", { name: co(ch.bo_chon_het) }), huong: "duoi" },
      { o: page.getByRole("link", { name: dung(ch.tao_catalogue) }), huong: "duoi" },
    ]);

    // --- 6. Ten catalogue va ten link ---
    await page.goto(`${GOC}/catalogue/tao`, { waitUntil: "networkidle" });
    await page.locator("[data-anh]").first().waitFor({ timeout: 60_000 });
    await page.fill("#ten", m.tenCatalogue);
    await page.fill("#ten-link", m.tenLink);
    await page.waitForTimeout(300);
    await chup(luot, page, "06-ten-link", [
      { o: page.locator("#ten"), huong: "trai" },
      // Chi vao NHAN: o ten link va dong "Link se la" sat nhau, hai o so de len nhau.
      { o: page.locator('label[for="ten-link"]'), huong: "trai" },
      { o: page.getByText(dau(ch.ten_link_se_la)), huong: "trai" },
    ], await khungTu(page, page.locator("main").first(), page.getByText(co(ch.ten_link_ma)), 0, 40));

    // --- 7. Chu de --- (khung Kieu trinh bay cao ~1700px nen tach thanh hai anh)
    await page.setViewportSize({ width: RONG, height: 1600 });
    const kieu = page.locator("section").filter({ has: page.getByRole("heading", { name: dung(gd.tieu_de) }) }).first();
    const chuDe = khoi(page, dung(gd.chu_de_nhan));
    const boCucKhoi = khoi(page, dung(gd.bo_cuc_nhan));
    await cuonToi(page, kieu, 40);
    await chuDe.getByText(dung(gd.chu_de_valentine)).click();
    await page.waitForTimeout(300);
    await chup(luot, page, "07-chu-de", [
      // "phai" (ra le trai khung), khong phai "trai": dong mo ta cua fieldset chi cach
      // nhom dau tien 12px, khong du cho o so ma khong de len chu (soat 12/09/2026).
      { o: chuDe.getByText(dung(gd.chu_de_nhom_dip)), huong: "phai" },
      // O so ben TRAI o dang chon (ra le khung): ben phai la o chu de ke tiep.
      { o: chuDe.locator("label").filter({ has: page.locator("input:checked") }), huong: "phai" },
      { o: boCucKhoi.locator("legend"), huong: "trai" },
    ], await khungTu(page, kieu, boCucKhoi.locator("legend"), 24, 60));
    // Tra ve mac dinh: cac buoc sau (xem truoc, trang khach) chup bo cuc Danh sach doc,
    // tong Be co dien, mau nhan Hong thuong hieu.
    await kieu.getByText(dung(gd.bo_cuc_danh_sach)).click();
    await kieu.getByText(dung(gd.tone_beige)).click();
    await kieu.getByText(dung(gd.nhan_hong)).click();
    await page.waitForTimeout(300);
    // Dua chuot ra goc trang: sau khi cuon, chuot con nam tren mot o bo cuc va vien hover
    // lam anh trong nhu hai o cung duoc chon.
    await page.mouse.move(0, 0);

    // --- 7b. Bo cuc, tong mau, mau nhan ---
    await cuonToi(page, boCucKhoi, 40);
    await chup(luot, page, "07-bo-cuc-mau", [
      { o: kieu.getByText(dung(gd.bo_cuc_danh_sach)), huong: "duoi" },
      { o: khoi(page, dung(gd.tone_nhan)).locator("legend"), huong: "trai" },
      { o: kieu.getByText(dau(gd.tone_beige_mo_ta)), huong: "phai" },
      // O mau nhan CUOI: dat canh chu "Mau nhan" thi de len dong mo ta.
      { o: khoi(page, dung(gd.nhan_mau_nhan)).locator("label").last(), huong: "trai" },
    ], await khungTu(page, boCucKhoi, khoi(page, dung(gd.nhan_mau_nhan))));

    // --- 8. Thong so va ngon ngu ---
    const thongSo = khoi(page, dung(gd.hien_nhan));
    const ngonNgu = khoi(page, dung(gd.ngon_ngu_nhan));
    await cuonToi(page, thongSo, 40);
    await thongSo.getByText(dau(cs.cot_tl_vang)).click();
    // Luot tieng Anh: catalogue cung tieng Anh, de trang khach trong anh la tieng Anh.
    if (nn === "en") await ngonNgu.getByText(dung(NHAN_NGON_NGU.en)).click();
    await page.waitForTimeout(200);
    await chup(luot, page, "08-thong-so-ngon-ngu", [
      { o: thongSo.getByText(dau(cs.cot_tl_vang)), huong: "trai" },
      { o: ngonNgu.getByText(dung(NHAN_NGON_NGU.en)), huong: "trai" },
    ], await khungTu(page, thongSo, ngonNgu));
    // Tich lai: catalogue chup o buoc 16 giu du thong so.
    await thongSo.getByText(dau(cs.cot_tl_vang)).click();

    // Chu cua CATALOGUE (loi keu goi, trang khach) theo ngon ngu da chon o tren.
    const tK = boChu(nn).chia_se;
    const cauGoiNgay = tK.cta_goi_ngay.replace("{ten}", TEN_HIEN);

    // --- 9. Lien he dat hang va loi keu goi ---
    const lienHe = khoi(page, dung(gd.lien_he_nhan));
    await cuonToi(page, lienHe, 40);
    await lienHe.getByPlaceholder(gd.lien_he_ten_goi_y).fill(TEN_HIEN);
    await lienHe.getByPlaceholder(gd.lien_he_dien_thoai_goi_y).fill("0909 123 456");
    await lienHe.getByText(dung(cauGoiNgay)).click();
    await page.waitForTimeout(300);
    await chup(luot, page, "09-lien-he", [
      // Chi vao O NHAP, o so nam ngoai le khung: canh nhan thi o so de len dong mo ta phia tren.
      { o: lienHe.getByPlaceholder(gd.lien_he_ten_goi_y), huong: "phai" },
      { o: lienHe.getByPlaceholder(gd.lien_he_dien_thoai_goi_y), huong: "trai" },
      { o: lienHe.getByText(dung(gd.cach_nhan_khong)), huong: "trai" },
      { o: lienHe.getByText(dung(cauGoiNgay)), huong: "tren" },
      { o: lienHe.getByRole("textbox", { name: dung(gd.loi_keu_goi_tu_viet) }), huong: "tren" },
    ], await khungTu(page, lienHe, lienHe));

    // --- 10. Trang bia ---
    const bia = khoi(page, dung(gd.bia_nhan));
    await cuonToi(page, bia, 40);
    await bia.getByPlaceholder(gd.bia_ten_khach_goi_y).fill(m.tenKhach);
    await bia.getByPlaceholder(gd.bia_loi_chao_goi_y).fill(m.loiChao);
    await page.waitForTimeout(300);
    await chup(luot, page, "10-trang-bia", [
      // So ben PHAI o ten khach (nua phai con trong): dat phia tren thi de len dong mo ta.
      { o: bia.getByPlaceholder(gd.bia_ten_khach_goi_y), huong: "trai" },
      { o: bia.getByPlaceholder(gd.bia_loi_chao_goi_y), huong: "tren" },
    ], await khungTu(page, bia, bia));

    // --- 11. Thu tu trinh bay ---
    const thuTu = page.locator("section").filter({ has: page.getByRole("heading", { name: dung(ch.thu_tu_nhan) }) }).first();
    await cuonToi(page, thuTu, 40);
    const dong2 = thuTu.locator("li[data-thu-tu]").nth(1);
    await chup(luot, page, "11-thu-tu", [
      { o: thuTu.getByRole("button", { name: dung(ch.sap_loai_sp) }), huong: "tren" },
      { o: dong2.locator("span[title]").first(), huong: "phai" },
      { o: dong2.getByRole("button", { name: khuon(ch.dua_len, { ma: ".+" }) }), huong: "phai" },
    ], await khungTu(page, thuTu, thuTu));

    // --- 12. Gioi thieu tung mau ---
    const the1 = page.locator("ul.space-y-8 > li").first();
    await cuonToi(page, the1, 40);
    const oGioiThieu = the1.getByRole("textbox", { name: dau(ch.gioi_thieu_nhan) });
    await oGioiThieu.fill(m.gioiThieu);
    await page.waitForTimeout(300);
    await chup(luot, page, "12-gioi-thieu", [
      // Ben TRAI o nhap: dong dau gan kin be ngang, mui ten tren/duoi se de len chu.
      { o: oGioiThieu, huong: "phai" },
      { o: the1.getByText(/^\d+\/300$/), huong: "trai" },
      { o: the1.getByRole("button", { name: co(ch.go_mau) }), huong: "phai" },
    ], await khungTu(page, the1, the1.getByText(/^\d+\/300$/), 16, 40));

    // --- 13. Chon anh, sap xep anh, anh chinh ---
    const ids = await the1.locator("[data-anh]").evaluateAll((ds) => ds.map((d) => d.getAttribute("data-anh") ?? ""));
    if (ids.length < 4) throw new Error(`[chup ${nn}] 13-anh-mau: mẫu đầu cần ít nhất 4 ảnh, đang có ${ids.length}`);
    const oAnh = (fileId: string) => the1.locator(`[data-anh="${fileId}"]`);
    const nutDatChinh = khuon(ch.anh_dat_chinh, { ten: ".+" });
    // Minh hoa: dat anh thu ba lam anh chinh, bo tich anh thu hai.
    await oAnh(ids[2]).getByRole("button", { name: nutDatChinh }).click();
    await oAnh(ids[1]).locator('input[type="checkbox"]').uncheck();
    // Chua ~130px phia tren the cho o so 1 dat tren dong dem anh.
    await cuonToi(page, the1, 140);
    await page.waitForTimeout(800);
    await chup(luot, page, "13-anh-mau", [
      { o: the1.getByText(khuon(ch.dem_anh_chon, { n: "\\d+", t: "\\d+" })).first(), huong: "duoi" },
      { o: oAnh(ids[1]).locator('input[type="checkbox"]'), huong: "trai" },
      // So ben TRAI the anh dau (le khung): ben phai nhan thi o so de len dong mo ta phia tren.
      { o: the1.getByText(ch.anh_chinh, { exact: true }), huong: "phai" },
      { o: oAnh(ids[3]).getByRole("button", { name: nutDatChinh }), huong: "tren" },
      { o: oAnh(ids[3]).getByRole("button", { name: khuon(ch.anh_ra_sau, { ten: ".+" }) }), huong: "tren" },
    ], await khungTu(page, the1, the1.locator("[data-anh]").first(), 130, 90));

    // --- 14. Xem truoc ---
    await page.setViewportSize({ width: RONG, height: CAO });
    await page.getByRole("button", { name: dung(ch.xem_truoc) }).first().click();
    const hop = page.getByRole("dialog", { name: co(ch.xem_truoc) });
    await hop.getByRole("heading", { level: 1 }).waitFor({ timeout: 30_000 });
    // Phai CO it nhat mot anh trong khung va moi anh dang hien da tai xong.
    await page.waitForFunction(
      () => {
        const dangHien = [...document.querySelectorAll("[role=dialog] img")]
          .filter((i) => i.getBoundingClientRect().top < window.innerHeight);
        return dangHien.length > 0
          && dangHien.every((i) => (i as HTMLImageElement).complete && (i as HTMLImageElement).naturalWidth > 0);
      },
      null,
      { timeout: 30_000 },
    );
    await page.waitForTimeout(1500);
    await chup(luot, page, "14-xem-truoc", [
      { o: hop.getByText(dung(ch.xem_truoc_tieu_de)), huong: "trai" },
      { o: hop.getByRole("button", { name: dung(cs.dong_ngan) }), huong: "phai" },
      { o: hop.getByRole("heading", { level: 1 }), huong: "trai" },
    ]);
    await hop.getByRole("button", { name: dung(cs.dong_ngan) }).click();
    await hop.waitFor({ state: "hidden" });

    // --- 15. Tao link ---
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.getByRole("button", { name: co(ch.nut_tao) }).click();
    // Man hinh BAO LOI thi dung ngay kem dung cau loi, khong ngoi doi het gio.
    const loiTao = page.getByText(new RegExp(`${thoat(ch.loi_tao)}|${thoat(ch.loi_tao_rong)}`, "i"));
    const ketQuaTao = await Promise.race([
      page.getByRole("button", { name: co(ch.chep_link) })
        .waitFor({ state: "visible", timeout: 90_000 }).then(() => "xong"),
      loiTao.waitFor({ timeout: 90_000 }).then(() => "loi", () => "het-gio"),
    ]);
    if (ketQuaTao === "loi") throw new Error(`[chup ${nn}] 15-tao-link: ${await loiTao.first().innerText()}`);
    await page.waitForTimeout(600);
    const link = (await page.locator("p.break-all").first().textContent())?.trim() ?? "";
    await chup(luot, page, "15-tao-link", [
      { o: page.locator("p.break-all").first(), huong: "trai" },
      { o: page.getByRole("button", { name: co(ch.doi_ten_link) }), huong: "trai" },
      { o: page.getByRole("button", { name: co(ch.chep_link) }), huong: "phai" },
      { o: page.getByRole("link", { name: co(ch.mo_thu) }), huong: "tren" },
      { o: page.getByRole("link", { name: co(ch.tai_pdf_sale) }).first(), huong: "tren" },
    ], { x: 0, y: 0, width: RONG, height: 620 });

    // --- 16 + 17. Trang khach --- (catalogue TAM, xoa trong finally; anh khong in duong dan)
    const khach = await ctx.newPage();
    await khach.setViewportSize({ width: RONG, height: 1600 });
    await khach.goto(link, { waitUntil: "networkidle" });
    await khach.waitForTimeout(2000);
    const mucDau = khach.locator("main ul > li").first();
    await chup(luot, khach, "16-trang-khach", [
      { o: khach.getByRole("heading", { level: 1 }), huong: "trai" },
      { o: khach.getByText(dau(m.loiChao.slice(0, 24))), huong: "trai" },
      { o: mucDau.locator("span").first(), huong: "duoi" },
      { o: mucDau.locator("p").first(), huong: "phai" },
      { o: mucDau.locator("p").nth(1), huong: "trai" },
      { o: mucDau.locator("[data-anh]").first(), huong: "tren" },
    ]);

    await khach.setViewportSize({ width: RONG, height: CAO });
    const nutGoi = dau(tK.cta_goi);
    const khoiLienHe = khach.locator("section").filter({ has: khach.getByRole("link", { name: nutGoi }) }).first();
    await cuonToi(khach, khoiLienHe, 160);
    await chup(luot, khach, "17-lien-he-khach", [
      { o: khoiLienHe.getByRole("heading", { level: 2 }), huong: "duoi" },
      { o: khoiLienHe.getByText(co(tK.cta_nguoi_tu_van)), huong: "phai" },
      { o: khoiLienHe.getByRole("link", { name: nutGoi }), huong: "tren" },
      { o: khoiLienHe.getByRole("link", { name: co(tK.cta_zalo) }), huong: "trai" },
    ]);
    await khach.close();

    // --- 18. Catalogue da tao ---
    const ds = t.danh_sach_catalogue;
    await page.goto(`${GOC}/admin/catalogue`, { waitUntil: "networkidle" });
    await page.locator("tbody tr").first().waitFor();
    await page.locator("table").first().evaluate((bang, a) => {
      bang.querySelectorAll("tbody tr").forEach((tr, i) => {
        const o = tr.querySelectorAll("td");
        // Tim theo data-* chu KHONG theo thu tu the con; thieu thi dung han.
        const oTen = tr.querySelector("[data-ten-catalogue]");
        const oDuong = tr.querySelector("[data-duong-dan]");
        if (!oTen || !oDuong) throw new Error("Khong tim thay o ten / duong dan de che");
        oTen.textContent = a.ten[i % a.ten.length];
        oDuong.textContent = "/vi-du-" + String(i + 1).padStart(2, "0") + "-abcd1234";
        if (o[4]) o[4].textContent = a.email[i % a.email.length];
      });
    }, { ten: [...m.tenDanhSach], email: EMAIL_MINH_HOA });
    await page.waitForTimeout(200);
    const dongDau = page.locator("tbody tr").first();
    await chup(luot, page, "18-danh-sach", [
      // NHAN o tim: dat canh o nhap thi chong len o so 2 cua cot Hieu luc.
      { o: page.locator('label[for="q"]'), huong: "trai" },
      { o: page.locator("thead th").nth(3), huong: "duoi" },
      { o: dongDau.getByRole("button", { name: co(ch.doi_ten_link) }), huong: "trai" },
      { o: dongDau.getByRole("button", { name: co(ds.chep) }), huong: "duoi" },
      { o: dongDau.getByRole("button", { name: co(ds.khoa) }), huong: "duoi" },
      { o: dongDau.getByRole("link", { name: co(ds.in) }), huong: "duoi" },
    ]);

    // --- 19. Gop y (mo ra de chup, KHONG gui) ---
    await page.getByRole("button", { name: dung(t.gop_y.nut) }).click();
    const hopGopY = page.getByRole("dialog", { name: co(t.gop_y.tieu_de) });
    await hopGopY.waitFor({ timeout: 30_000 });
    await hopGopY.locator("img").first().waitFor({ timeout: 20_000 }).catch(() => {});
    await hopGopY.locator("#gop-y-noi-dung").fill(m.gopY[0]);
    await page.waitForTimeout(600);
    await chup(luot, page, "19-gop-y", [
      { o: hopGopY.getByText(co(t.gop_y.kem_anh)), huong: "trai" },
      { o: hopGopY.getByText(dung(t.gop_y.loai_y_kien)), huong: "trai" },
      { o: hopGopY.locator("#gop-y-noi-dung"), huong: "phai" },
      { o: hopGopY.getByRole("button", { name: dung(t.gop_y.nut_gui) }), huong: "tren" },
    ]);
    await page.keyboard.press("Escape");
    await hopGopY.waitFor({ state: "hidden" });

    // --- 20. Hop gop y (quan tri) ---
    await page.goto(`${GOC}/admin/gop-y`, { waitUntil: "networkidle" });
    await page.locator("tbody tr").first().waitFor();
    await cheGopY(page, m.gopY);
    await page.waitForTimeout(200);
    const gopYDau = page.locator("tbody tr").first();
    await chup(luot, page, "20-hop-gop-y", [
      // Chi vao TIEU DE cot: chi vao o thi mui ten de len chinh dong noi dung.
      { o: page.locator("thead th").nth(1), huong: "duoi" },
      { o: page.getByRole("link", { name: dung(t.gop_y.xem) }).first(), huong: "trai" },
      { o: page.locator("thead th").nth(3), huong: "duoi" },
      {
        o: gopYDau.getByRole("button", { name: new RegExp(`^(${thoat(t.gop_y.danh_dau_xong)}|${thoat(t.gop_y.mo_lai)})$`, "i") }),
        huong: "trai",
      },
    ]);

    // --- 21. Tai khoan va vai tro (quan tri) ---
    const nd = t.nguoi_dung;
    await page.setViewportSize({ width: RONG, height: 1700 });
    await page.goto(`${GOC}/admin/nguoi-dung`, { waitUntil: "networkidle" });
    await page.getByRole("heading", { name: t.vai_tro.tieu_de, exact: true }).waitFor();
    await page.getByRole("button", { name: dung(nd.them_tieu_de) }).click();
    const bangVaiTro = page.locator("table").first();
    const bangTaiKhoan = page.locator("table").nth(1);
    await bangTaiKhoan.locator("tbody tr").first().waitFor();
    await bangTaiKhoan.evaluate((bang, a) => {
      bang.querySelectorAll("tbody tr").forEach((tr, i) => {
        const o = tr.querySelectorAll("td");
        // O email co the kem the "(ban)"; chi doi doan chu dau, giu the do.
        const nutEmail = o[0]?.firstChild;
        if (nutEmail && nutEmail.nodeType === Node.TEXT_NODE) nutEmail.textContent = a.email[i % a.email.length];
        else if (o[0]) o[0].textContent = a.email[i % a.email.length];
        if (o[1]) o[1].textContent = a.ho[i % a.ho.length];
      });
    }, { email: EMAIL_MINH_HOA, ho: HO_TEN_MINH_HOA });
    await page.waitForTimeout(200);
    // Dong KHONG phai tai khoan dang chup: tu khoa chinh minh thi nut bi tat.
    const dongTk = bangTaiKhoan.locator("tbody tr").filter({ hasNotText: nd.la_ban }).first();
    await chup(luot, page, "21-tai-khoan", [
      { o: bangVaiTro.getByRole("columnheader", { name: co(t.vai_tro.cot_quyen) }), huong: "duoi" },
      // Nut MO form dung `them_tieu_de`; `nut_them` la nut gui trong form. Tieng Viet hai khoa
      // trung chu nen loi chi lo ra o luot tieng Anh ("Add a role" / "Add role").
      { o: page.getByRole("button", { name: dung(t.vai_tro.them_tieu_de) }).first(), huong: "trai" },
      // O so DUOI o email: tren o do la dong mo ta cua khung cap tai khoan.
      { o: page.locator("#email"), huong: "tren" },
      { o: dongTk.locator("select"), huong: "duoi" },
      { o: dongTk.getByRole("button", { name: co(nd.dat_mat_khau) }), huong: "duoi" },
      { o: dongTk.getByRole("button", { name: new RegExp(`^(${thoat(nd.khoa)}|${thoat(nd.mo_khoa)})$`, "i") }), huong: "duoi" },
    ]);

    await writeFile(join(luot.thuMuc, "diem.json"), JSON.stringify(luot.diem, null, 2) + "\n", "utf8");
    console.log(`  [${nn}] diem.json — vị trí mũi tên, đo từ chính trang\n`);
  } finally {
    await ctx.close();
  }
}

async function main(): Promise<void> {
  const chon = process.argv.slice(2).filter((x): x is NgonNgu => (NGON_NGU as readonly string[]).includes(x));
  const cacNgonNgu: NgonNgu[] = chon.length > 0 ? chon : [...NGON_NGU];
  console.log(`Chụp ảnh hướng dẫn từ ${GOC} — ${cacNgonNgu.join(", ")}\n`);

  const id = await taoTaiKhoanTam();
  const trinhDuyet = await chromium.launch();
  // Hen gio: treo ma khong timeout nao ban thi finally khong chay va tai khoan admin tam nam
  // lai trong co so du lieu. Qua 20 phut thi dong trinh duyet de loi ban ra va finally don dep.
  const henGio = setTimeout(() => {
    console.error("[chup] qua 20 phut — dong trinh duyet de don tai khoan tam");
    void trinhDuyet.close().catch(() => {});
  }, 20 * 60_000);
  henGio.unref();
  try {
    for (const nn of cacNgonNgu) await chupMotNgonNgu(trinhDuyet, nn);
  } finally {
    await trinhDuyet.close();
    await xoaTaiKhoanTam(id);
    await sql.end();
  }
  console.log(`Xong. Ảnh nằm trong public/huong-dan (tiếng Việt) và public/huong-dan/en (tiếng Anh).`);
}

await main();
