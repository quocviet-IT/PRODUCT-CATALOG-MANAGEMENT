import { config } from "dotenv";
config({ path: ".env.local" });

import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { randomBytes } from "node:crypto";
import postgres from "postgres";
import { createClient } from "@supabase/supabase-js";
import { chromium, type Locator, type Page } from "playwright";

/**
 * Chup anh minh hoa cho trang /admin/huong-dan (21 anh, 12/09/2026).
 *
 * Chay: npm run huong-dan:anh   (may chu phai dang chay o CONG duoi day)
 *
 * Script tu DO vi tri cac diem chu thich tu chinh phan tu tren trang roi ghi ra
 * public/huong-dan/diem.json. So moc cua moi anh phai bang so chu thich (`chu`) cua
 * buoc do trong src/messages/huong-dan.vi.ts; ten anh phai trung page.tsx.
 *
 * Chon `huong` sao cho O SO roi vao cho trong: o so to 28px, dat de len chu hay len
 * mot o so khac la nguoi doc mat cho. Soat bang mat sau moi lan doi (xem tung hinh
 * tren trang huong dan, khong xem anh tran — anh tran khong co mui ten).
 *
 * Vi sao phai tao mot tai khoan tam: moi man hinh trong huong dan deu nam sau
 * cong dang nhap. Tai khoan nay bi XOA o cuoi ham, ke ca khi giua chung co loi —
 * xem khoi finally — cung voi catalogue do phien chup tao ra. Script KHONG gui gop
 * y nao: hop gop y chi mo ra de chup roi dong.
 */

const CONG = Number(process.env.CONG_CHUP ?? 3100);
const GOC = `http://localhost:${CONG}`;
const THU_MUC = join(process.cwd(), "public", "huong-dan");

const RONG = 1440;
const CAO = 900;

const sql = postgres(process.env.DATABASE_URL!, { max: 1, prepare: false });
const kho = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const EMAIL = `chup-huong-dan-${randomBytes(4).toString("hex")}@ctyhp.vn`;
const MAT_KHAU = randomBytes(18).toString("base64url");

/**
 * Ten va email HIEN TREN ANH. Auth giu email that de dang nhap duoc, con man hinh
 * doc tu bang `users` — nen hang users mang ten minh hoa, khong mang day hex.
 */
const TEN_HIEN = "Ngọc Anh";
const EMAIL_HIEN = "ngoc.anh@ctyhp.vn";

type Huong = "trai" | "phai" | "tren" | "duoi";
type Khung = { x: number; y: number; width: number; height: number };
/** Mot diem chu thich: chi vao dau, va o so nam ve phia nao. */
type Diem = { x: number; y: number; huong: Huong };
type Moc = { o: Locator; huong: Huong };

async function taoTaiKhoanTam(): Promise<string> {
  const { data, error } = await kho.auth.admin.createUser({
    email: EMAIL,
    password: MAT_KHAU,
    email_confirm: true,
  });
  if (error) throw error;
  // Lan chup truoc bi ngat giua chung co the de lai dong cu; cot email co rang
  // buoc duy nhat nen khong don thi lan nay khong chen duoc.
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

/**
 * Doi o chu nhat cua mot phan tu thanh diem mui ten cham vao, tinh theo phan tram
 * cua vung anh. Mui ten cham vao MEP phia o so di toi, khong phai tam phan tu.
 */
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

const diemTheoAnh: Record<string, Diem[]> = {};

async function chup(page: Page, ten: string, moc: Moc[], khungCat?: Khung): Promise<void> {
  // Doc khung nhin THAT: nhieu buoc phong khung cao hon 900px.
  const khungNhin = page.viewportSize();
  if (!khungNhin) throw new Error(`[chup] ${ten}: không đọc được kích thước khung nhìn`);
  const khung = khungCat ?? { x: 0, y: 0, ...khungNhin };

  const doHet = async () => {
    const hop: Khung[] = [];
    for (const [i, m] of moc.entries()) {
      const o = await m.o.first().boundingBox();
      if (!o) {
        throw new Error(
          `[chup] ${ten}: không đo được vị trí của điểm ${i + 1}. ` +
          `Phần tử chưa có trên trang — đợi cho nó hiện ra rồi mới chụp.`,
        );
      }
      hop.push(o);
    }
    return hop;
  };

  // Do HAI LAN, truoc va sau khi chup: xe dich giua hai lan la trang chua dung yen,
  // anh la mot man hinh con mui ten la toa do cua man hinh khac.
  const truoc = await doHet();
  const anh = await page.screenshot({ type: "png", ...(khungCat ? { clip: khungCat } : {}) });
  await writeFile(join(THU_MUC, `${ten}.png`), anh);
  const sau = await doHet();
  for (let i = 0; i < truoc.length; i++) {
    if (Math.abs(truoc[i].x - sau[i].x) > 1 || Math.abs(truoc[i].y - sau[i].y) > 1) {
      throw new Error(`[chup] ${ten}: điểm ${i + 1} xê dịch giữa lúc đo và lúc chụp — trang chưa đứng yên.`);
    }
  }

  const diem: Diem[] = [];
  for (const [i, o] of sau.entries()) {
    const d = diemTu(o, khung, moc[i].huong);
    if (d.x < 0 || d.x > 100 || d.y < 0 || d.y > 100) {
      throw new Error(
        `[chup] ${ten}: điểm ${i + 1} rơi ngoài ảnh (x=${d.x}%, y=${d.y}%). ` +
        `Cuộn cho phần tử vào trong khung trước khi chụp.`,
      );
    }
    diem.push(d);
  }
  diemTheoAnh[ten] = diem;
  console.log(`  ${ten}.png  ${(anh.byteLength / 1024).toFixed(0)} KB  ${diem.length} điểm`);
}

/** Cuon cho dinh phan tu nam cach dinh khung `chua` px. scrollIntoView khong du voi khoi cao. */
async function cuonToi(page: Page, o: Locator, chua = 80): Promise<void> {
  await o.first().evaluate((el, c) => {
    const y = el.getBoundingClientRect().top + window.scrollY - c;
    window.scrollTo({ top: y, behavior: "instant" });
  }, chua);
  await page.waitForTimeout(400);
}

/** Vung cat theo chieu doc: tu tren phan tu `tren` toi duoi phan tu `duoi`, het be ngang. */
async function khungTu(page: Page, tren: Locator, duoi: Locator, demTren = 24, demDuoi = 80): Promise<Khung> {
  const a = await tren.first().boundingBox();
  const b = await duoi.first().boundingBox();
  if (!a || !b) throw new Error("[chup] không đo được vùng cắt");
  const kn = page.viewportSize()!;
  const y = Math.max(0, Math.floor(a.y - demTren));
  const day = Math.min(kn.height, Math.ceil(b.y + b.height + demDuoi));
  return { x: 0, y, width: kn.width, height: day - y };
}

/**
 * CHE DU LIEU THAT NGAY TREN MAN HINH, truoc khi chup.
 *
 * Anh nam trong public/ va kho ma nguon cong khai. Khong duoc lot ra: email nhan
 * vien, duong dan catalogue dang song, ma kho noi bo (SKU, SO, MO, chi tiet ky
 * thuat, o chu), va noi dung gop y that. Chi doi CHU TREN MAN HINH, khong dong toi
 * co so du lieu; dieu huong sang trang khac la moi thu tro lai nhu cu.
 */
const EMAIL_MINH_HOA = [
  "ngoc.anh@ctyhp.vn", "minh.thu@ctyhp.vn", "gia.bao@ctyhp.vn",
  "thuy.linh@ctyhp.vn", "quang.huy@ctyhp.vn", "kim.ngan@ctyhp.vn",
];

/*
 * BAY: ham truyen vao evaluate() chay trong TRINH DUYET. tsx (esbuild) boc moi ham CO
 * TEN — `const f = () => …`, hay ham lam gia tri cua mot khoa trong object — bang
 * __name(), ma trinh duyet khong co __name: "ReferenceError: __name is not defined"
 * (12/09/2026). Trong cac ham che duoi day chi dung callback khong ten va du lieu tran.
 */

/** Bang mau: cot SKU / SO / MO / Chi tiet SP / O chu doi sang gia tri minh hoa. */
async function cheBangMau(page: Page): Promise<void> {
  const bang = page.locator("table").first();
  if ((await bang.count()) === 0) return;
  await bang.evaluate((b) => {
    const cot = [...b.querySelectorAll("thead th")].map((th) => (th.textContent ?? "").trim().toLowerCase());
    b.querySelectorAll("tbody tr").forEach((tr, i) => {
      const so = String(i + 1).padStart(5, "0");
      tr.querySelectorAll("td").forEach((td, j) => {
        const k = cot[j];
        if (k === "sku") td.textContent = `10${so}`;
        else if (k === "so") td.textContent = `SO-${so}`;
        else if (k === "mo") td.textContent = `MO-${so}`;
        else if (k === "chi tiết sp") td.textContent = "Chi tiết minh hoạ";
        else if (k === "ổ chủ") td.textContent = "Minh hoạ";
      });
    });
  });
}

/** Ngan chi tiet mau: cung cac truong noi bo, cong dong chi tiet ky thuat duoi ten mau. */
async function cheNganChiTiet(ngan: Locator): Promise<void> {
  await ngan.evaluate((el) => {
    const mau: Record<string, string> = { "sku": "100001", "so": "SO-00001", "mo": "MO-00001", "ổ chủ": "Minh hoạ" };
    el.querySelectorAll("dl > div").forEach((d) => {
      const dt = (d.querySelector("dt")?.textContent ?? "").trim().toLowerCase();
      const dd = d.querySelector("dd");
      if (dd && mau[dt]) dd.textContent = mau[dt];
    });
    const p = el.querySelector("h2 + p");
    if (p) p.textContent = "Chi tiết minh hoạ";
  });
}

/** Hop gop y: noi dung va nguoi gui that doi sang cau minh hoa. Giu nguyen nut Xem anh. */
async function cheGopY(page: Page): Promise<void> {
  await page.locator("table").first().evaluate((b, dsEmail) => {
    const noiDung = [
      "Bấm Tạo link thì không thấy gì xảy ra, thử lại ba lần vẫn vậy.",
      "Cho thêm tông màu cho catalogue gửi khách bên Mỹ.",
      "Ảnh mẫu này bị mờ khi phóng to trên điện thoại.",
      "Muốn sắp xếp ảnh theo thứ tự tuỳ ý.",
    ];
    const ho = ["Ngọc Anh", "Minh Thư", "Gia Bảo", "Thuỳ Linh", "Quang Huy", "Kim Ngân"];
    b.querySelectorAll("tbody tr").forEach((tr, i) => {
      const o = tr.querySelectorAll("td");
      // Chi doi cac nut CHU truc tiep cua o: giu nguyen nut "Xem anh" (o noi dung) va
      // the email (o nguoi gui). Callback khong ten — xem BAY o tren.
      [[o[1], noiDung[i % noiDung.length]], [o[3], ho[i % ho.length]]].forEach(([td, chu]) => {
        if (!td || typeof td === "string") return;
        [...td.childNodes]
          .filter((n) => n.nodeType === Node.TEXT_NODE)
          .forEach((n, k) => { n.textContent = k === 0 ? String(chu) : ""; });
      });
      const email = o[3]?.querySelector("span");
      if (email) email.textContent = dsEmail[i % dsEmail.length];
    });
  }, EMAIL_MINH_HOA);
}

async function dangNhap(page: Page): Promise<void> {
  await page.goto(`${GOC}/login`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /không đăng nhập được/i }).click();
  // Dia chi MINH HOA de chup, khong phai dia chi that cua tai khoan tam.
  await page.fill("#email", "ten.ban@ctyhp.vn");
  await page.fill("#mat_khau", "••••••••••••");
  await chup(
    page,
    "01-dang-nhap",
    [
      { o: page.getByRole("button", { name: /đăng nhập bằng google/i }), huong: "phai" },
      { o: page.locator("#email"), huong: "phai" },
    ],
    { x: 470, y: 140, width: 500, height: 620 },
  );

  await page.fill("#email", EMAIL);
  await page.fill("#mat_khau", MAT_KHAU);
  await Promise.all([
    page.waitForURL((u) => !u.pathname.startsWith("/login"), { timeout: 30_000 }),
    page.getByRole("button", { name: /^đăng nhập$/i }).click(),
  ]);
}

/** Fieldset co legend dung chu nay (khung Kieu trinh bay). */
const khoi = (page: Page, legend: RegExp) =>
  page.locator("fieldset").filter({ has: page.locator("legend", { hasText: legend }) }).first();

async function main(): Promise<void> {
  await mkdir(THU_MUC, { recursive: true });
  console.log(`Chụp ảnh hướng dẫn từ ${GOC}\n`);

  const id = await taoTaiKhoanTam();
  const trinhDuyet = await chromium.launch();
  try {
    const ctx = await trinhDuyet.newContext({
      viewport: { width: RONG, height: CAO },
      deviceScaleFactor: 2,
      locale: "vi-VN",
    });
    const page = await ctx.newPage();

    await dangNhap(page);

    // --- 2. Thanh dau trang + menu nguoi dung ---
    await page.goto(`${GOC}/admin/catalogue-sheet`, { waitUntil: "networkidle" });
    await cheBangMau(page);
    await page.getByRole("button", { name: new RegExp(TEN_HIEN, "i") }).click();
    await page.getByRole("link", { name: /hộp góp ý/i }).waitFor();
    await chup(page, "02-thanh-dau-trang", [
      // O so nam ben PHAI thanh ba muc, tren thanh dau trang: dat duoi thi de len tieu de trang.
      { o: page.getByRole("navigation", { name: "Điều hướng chính" }), huong: "trai" },
      { o: page.getByRole("group", { name: "Ngôn ngữ" }), huong: "phai" },
      { o: page.getByText(EMAIL_HIEN, { exact: true }), huong: "phai" },
      { o: page.getByRole("link", { name: /hộp góp ý/i }), huong: "phai" },
      { o: page.getByRole("button", { name: /^đăng xuất$/i }), huong: "phai" },
      { o: page.getByRole("button", { name: /^góp ý$/i }), huong: "phai" },
    ], { x: 0, y: 0, width: RONG, height: 560 });
    await page.keyboard.press("Escape");

    // --- 3. Tim va loc ---
    // Khung cao hon de lot ca hang tieu de bang. Dong goi y truoc khi chup: no de
    // len hang o loc ben duoi, mui ten se tro vao mot o bi che.
    await page.setViewportSize({ width: RONG, height: 1250 });
    await page.goto(`${GOC}/admin/catalogue-sheet`, { waitUntil: "networkidle" });
    await page.fill("#q", "nhan");
    await page.waitForTimeout(1200);
    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);
    await cheBangMau(page);
    await chup(page, "03-tim-mau", [
      { o: page.locator("#q"), huong: "trai" },
      { o: page.getByTitle(/lọc theo thiếu ảnh/i), huong: "duoi" },
      { o: page.getByRole("button", { name: /^màu/i }), huong: "tren" },
      { o: page.locator("#tl_tu"), huong: "tren" },
      { o: page.getByRole("link", { name: /^lưới ảnh$/i }), huong: "trai" },
      { o: page.locator("thead th").filter({ hasText: /^mã mẫu$/i }), huong: "duoi" },
    ]);

    // --- 4. Ngan chi tiet mau ---
    await page.fill("#q", "");
    await page.waitForTimeout(1200);
    await page.keyboard.press("Escape");
    await page.locator("#q").blur();
    await page.setViewportSize({ width: RONG, height: 1500 });
    await page.waitForTimeout(300);
    // Bam o ANH (khong phai o tich) cua dong co anh: dong co anh chac chan co thu vien.
    await page.locator("tbody tr").filter({ has: page.locator("img") }).first().locator("td").nth(1).click();
    const ngan = page.getByRole("dialog", { name: /chi tiết mẫu/i });
    await ngan.getByRole("button", { name: /phóng to/i }).first().waitFor({ timeout: 30_000 });
    // Doi MOI anh trong thu vien tai xong: anh tai cham hien thanh o trong tren anh chup.
    await page.waitForFunction(
      () => [...document.querySelectorAll("aside[role=dialog] img")]
        .every((i) => (i as HTMLImageElement).complete && (i as HTMLImageElement).naturalWidth > 0),
      null,
      { timeout: 30_000 },
    );
    await cheBangMau(page);
    await cheNganChiTiet(ngan);
    await page.waitForTimeout(1000);
    await chup(page, "04-chi-tiet-mau", [
      { o: ngan.getByRole("button", { name: /^đóng$/i }), huong: "trai" },
      { o: ngan.locator("dt").filter({ hasText: /^loại sp$/i }), huong: "phai" },
      { o: ngan.getByRole("link").first(), huong: "trai" },
      { o: ngan.getByRole("button", { name: /phóng to/i }).first(), huong: "trai" },
    ]);
    await page.keyboard.press("Escape");

    // --- 5. Tich chon ---
    await page.setViewportSize({ width: RONG, height: CAO });
    await page.goto(`${GOC}/admin/catalogue-sheet`, { waitUntil: "networkidle" });
    // CHI tich dong CO ANH: buoc 13 can mau dau co it nhat bon anh de minh hoa.
    const oTich = page.locator("tbody tr").filter({ has: page.locator("img") }).locator('input[type="checkbox"]');
    const soO = Math.min(await oTich.count(), 3);
    for (let i = 0; i < soO; i++) await oTich.nth(i).check();
    await page.waitForTimeout(400);
    await cheBangMau(page);
    await chup(page, "05-tich-chon", [
      { o: oTich.first(), huong: "trai" },
      { o: page.getByText(/đã chọn \d+ mẫu/i), huong: "duoi" },
      { o: page.getByRole("button", { name: /bỏ chọn hết/i }), huong: "duoi" },
      { o: page.getByRole("link", { name: /^tạo catalogue$/i }), huong: "duoi" },
    ]);

    // --- 6. Ten catalogue va ten link ---
    await page.goto(`${GOC}/catalogue/tao`, { waitUntil: "networkidle" });
    await page.locator("[data-anh]").first().waitFor({ timeout: 60_000 });
    await page.fill("#ten", "Chị Lan — nhẫn cưới 18K");
    await page.fill("#ten-link", "Nhẫn cưới 18K");
    await page.waitForTimeout(300);
    await chup(
      page,
      "06-ten-link",
      [
        { o: page.locator("#ten"), huong: "trai" },
        // Chi vao NHAN chu khong vao o: o ten link va dong "Link se la" sat nhau, hai o
        // so se de len nhau.
        { o: page.locator('label[for="ten-link"]'), huong: "trai" },
        { o: page.getByText(/^link sẽ là/i), huong: "trai" },
      ],
      await khungTu(page, page.locator("main").first(), page.getByText(/đoạn mã cuối/i), 0, 40),
    );

    // --- 7. Bo cuc, tong mau, mau nhan ---
    await page.setViewportSize({ width: RONG, height: 1400 });
    const kieu = page.locator("section").filter({ has: page.getByRole("heading", { name: /^kiểu trình bày$/i }) }).first();
    await cuonToi(page, kieu, 40);
    await chup(
      page,
      "07-bo-cuc-mau",
      [
        { o: kieu.getByText(/^danh sách dọc$/i), huong: "duoi" },
        { o: khoi(page, /^tông màu$/i).locator("legend"), huong: "trai" },
        { o: kieu.getByText(/^nền kem giống website/i), huong: "phai" },
        // O mau nhan CUOI, o so ben phai no: dat canh chu "MAU NHAN" thi de len dong mo ta.
        { o: khoi(page, /^màu nhấn$/i).locator("label").last(), huong: "trai" },
      ],
      await khungTu(page, kieu, khoi(page, /^màu nhấn$/i)),
    );

    // --- 8. Thong so va ngon ngu ---
    const thongSo = khoi(page, /^thông số cho khách xem$/i);
    const ngonNgu = khoi(page, /^ngôn ngữ catalogue$/i);
    await cuonToi(page, thongSo, 40);
    await thongSo.getByText(/^tl vàng/i).click();
    await page.waitForTimeout(200);
    await chup(
      page,
      "08-thong-so-ngon-ngu",
      [
        { o: thongSo.getByText(/^tl vàng/i), huong: "trai" },
        { o: ngonNgu.getByText(/^english$/i), huong: "trai" },
      ],
      await khungTu(page, thongSo, ngonNgu),
    );
    // Tich lai: catalogue chup o buoc 16 giu du thong so.
    await thongSo.getByText(/^tl vàng/i).click();

    // --- 9. Lien he dat hang va loi keu goi ---
    const lienHe = khoi(page, /^liên hệ đặt hàng$/i);
    await cuonToi(page, lienHe, 40);
    await lienHe.getByPlaceholder("Ngọc Anh").fill(TEN_HIEN);
    await lienHe.getByPlaceholder(/0909 123 456/).fill("0909 123 456");
    await lienHe.getByText(/^hãy gọi ngay cho ngọc anh/i).click();
    await page.waitForTimeout(300);
    await chup(
      page,
      "09-lien-he",
      [
        { o: lienHe.getByText(/^người tư vấn$/i), huong: "trai" },
        { o: lienHe.getByText(/^điện thoại$/i), huong: "trai" },
        { o: lienHe.getByText(/^chỉ gọi điện$/i), huong: "trai" },
        { o: lienHe.getByText(/^hãy gọi ngay cho ngọc anh/i), huong: "tren" },
        { o: lienHe.getByRole("textbox", { name: /^tự viết$/i }), huong: "tren" },
      ],
      await khungTu(page, lienHe, lienHe),
    );

    // --- 10. Trang bia ---
    const bia = khoi(page, /^trang bìa$/i);
    await cuonToi(page, bia, 40);
    await bia.getByPlaceholder("Chị Lan").fill("Chị Lan");
    await bia.getByPlaceholder(/kính gửi chị/i).fill(
      "Kính gửi chị Lan bộ sưu tập nhẫn cưới 18K em chọn riêng theo sở thích của chị.",
    );
    await page.waitForTimeout(300);
    await chup(
      page,
      "10-trang-bia",
      [
        { o: bia.getByPlaceholder("Chị Lan"), huong: "duoi" },
        { o: bia.getByPlaceholder(/kính gửi chị/i), huong: "tren" },
      ],
      await khungTu(page, bia, bia),
    );

    // --- 11. Thu tu trinh bay ---
    const thuTu = page.locator("section").filter({ has: page.getByRole("heading", { name: /^thứ tự trình bày$/i }) }).first();
    await cuonToi(page, thuTu, 40);
    const dong2 = thuTu.locator("li[data-thu-tu]").nth(1);
    await chup(
      page,
      "11-thu-tu",
      [
        { o: thuTu.getByRole("button", { name: /^loại sản phẩm$/i }), huong: "tren" },
        { o: dong2.locator("span[title]").first(), huong: "phai" },
        { o: dong2.getByRole("button", { name: /lên$/i }), huong: "phai" },
      ],
      await khungTu(page, thuTu, thuTu),
    );

    // --- 12. Gioi thieu tung mau ---
    const the1 = page.locator("ul.space-y-8 > li").first();
    await cuonToi(page, the1, 40);
    const oGioiThieu = the1.getByRole("textbox", { name: /giới thiệu mẫu này/i });
    // Dong dau DAI gan kin be ngang: o buoc 16 mui ten chi vao mep phai cua doan
    // gioi thieu, dong ngan thi mui ten chi vao cho trong.
    await oGioiThieu.fill(
      "Dây mặt thánh giá bạc đan tay, đeo lâu không xoắn, sáng bóng như mới sau nhiều năm đeo hằng ngày.\nHợp làm quà tặng dịp lễ.",
    );
    await page.waitForTimeout(300);
    await chup(
      page,
      "12-gioi-thieu",
      [
        // Ben TRAI o nhap: dong dau gan kin be ngang, mui ten tren/duoi se de len chu.
        { o: oGioiThieu, huong: "phai" },
        { o: the1.getByText(/^\d+\/300$/), huong: "trai" },
        { o: the1.getByRole("button", { name: /gỡ mẫu này/i }), huong: "phai" },
      ],
      await khungTu(page, the1, the1.getByText(/^\d+\/300$/), 16, 40),
    );

    // --- 13. Chon anh, sap xep anh, anh chinh ---
    const ids = await the1.locator("[data-anh]").evaluateAll((ds) => ds.map((d) => d.getAttribute("data-anh") ?? ""));
    if (ids.length < 4) throw new Error(`[chup] 13-anh-mau: mẫu đầu cần ít nhất 4 ảnh, đang có ${ids.length}`);
    const oAnh = (fileId: string) => the1.locator(`[data-anh="${fileId}"]`);
    // Minh hoa: dat anh thu ba lam anh chinh, bo tich anh thu hai.
    await oAnh(ids[2]).getByRole("button", { name: /làm ảnh chính$/ }).click();
    await oAnh(ids[1]).locator('input[type="checkbox"]').uncheck();
    // Chua ~130px phia tren the: o so 1 dat TREN dong dem anh. O so ve bang px cua KHUNG
    // HUONG DAN (rong 768) nen tren anh 1440px no to gap doi — de sat mep la bi cat.
    await cuonToi(page, the1, 140);
    await page.waitForTimeout(800);
    await chup(
      page,
      "13-anh-mau",
      [
        { o: the1.getByText(/^\d+\/\d+ ảnh$/).first(), huong: "duoi" },
        { o: oAnh(ids[1]).locator('input[type="checkbox"]'), huong: "trai" },
        { o: the1.getByText("Ảnh chính", { exact: true }), huong: "trai" },
        { o: oAnh(ids[3]).getByRole("button", { name: /làm ảnh chính$/ }), huong: "tren" },
        { o: oAnh(ids[3]).getByRole("button", { name: /ra sau$/ }), huong: "tren" },
      ],
      await khungTu(page, the1, the1.locator("[data-anh]").first(), 130, 90),
    );

    // --- 14. Xem truoc ---
    await page.setViewportSize({ width: RONG, height: CAO });
    await page.getByRole("button", { name: /^xem trước$/i }).first().click();
    const hop = page.getByRole("dialog", { name: /xem trước/i });
    await hop.getByRole("heading", { level: 1 }).waitFor({ timeout: 30_000 });
    // Doi anh DANG HIEN trong khung tai xong (hang anh dau lo o day khung): chup som la
    // ra mot hang o xam.
    // Phai CO it nhat mot anh trong khung: luc bo cuc chua dung yen, loc ra rong thi
    // every() tra true ngay va anh chup van la mot hang o xam (12/09/2026).
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
    await chup(page, "14-xem-truoc", [
      { o: hop.getByText(/^đúng thứ khách sẽ thấy$/i), huong: "trai" },
      { o: hop.getByRole("button", { name: /^đóng$/i }), huong: "phai" },
      { o: hop.getByRole("heading", { level: 1 }), huong: "trai" },
    ]);
    await hop.getByRole("button", { name: /^đóng$/i }).click();
    await hop.waitFor({ state: "hidden" });

    // --- 15. Tao link ---
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.getByRole("button", { name: /tạo link gửi khách/i }).click();
    // Doi man hinh ket qua hien ra THAT, khong doi mot con so giay. Tao catalogue doc
    // bang tinh va Drive nen co luc cham; man hinh BAO LOI thi dung ngay kem dung cau loi,
    // khong ngoi doi het gio roi nem mot TimeoutError khong noi gi (12/09/2026).
    const loiTao = page.getByText(/không tạo được catalogue|không còn trên bảng tính/i);
    const ketQuaTao = await Promise.race([
      page.getByRole("button", { name: /chép link/i })
        .waitFor({ state: "visible", timeout: 90_000 }).then(() => "xong"),
      loiTao.waitFor({ timeout: 90_000 }).then(() => "loi", () => "het-gio"),
    ]);
    if (ketQuaTao === "loi") throw new Error(`[chup] 15-tao-link: ${await loiTao.first().innerText()}`);
    await page.waitForTimeout(600);
    const link = (await page.locator("p.break-all").first().textContent())?.trim() ?? "";
    await chup(
      page,
      "15-tao-link",
      [
        { o: page.locator("p.break-all").first(), huong: "trai" },
        { o: page.getByRole("button", { name: /đổi tên link/i }), huong: "trai" },
        { o: page.getByRole("button", { name: /chép link/i }), huong: "phai" },
        { o: page.getByRole("link", { name: /mở thử/i }), huong: "tren" },
        { o: page.getByRole("link", { name: /tải pdf/i }).first(), huong: "tren" },
      ],
      { x: 0, y: 0, width: RONG, height: 620 },
    );

    // --- 16 + 17. Trang khach ---
    // Link nay la catalogue TAM cua phien chup, bi xoa trong finally; anh khong in duong dan.
    const khach = await ctx.newPage();
    await khach.setViewportSize({ width: RONG, height: 1600 });
    await khach.goto(link, { waitUntil: "networkidle" });
    await khach.waitForTimeout(2000);
    const mucDau = khach.locator("main ul > li").first();
    await chup(khach, "16-trang-khach", [
      { o: khach.getByRole("heading", { level: 1 }), huong: "trai" },
      { o: khach.getByText(/^kính gửi chị lan/i), huong: "trai" },
      { o: mucDau.locator("span").first(), huong: "duoi" },
      { o: mucDau.locator("p").first(), huong: "phai" },
      { o: mucDau.locator("p").nth(1), huong: "trai" },
      { o: mucDau.locator("[data-anh]").first(), huong: "tren" },
    ]);

    await khach.setViewportSize({ width: RONG, height: CAO });
    const khoiLienHe = khach.locator("section").filter({ has: khach.getByRole("link", { name: /^gọi/i }) }).first();
    await cuonToi(khach, khoiLienHe, 160);
    await chup(khach, "17-lien-he-khach", [
      { o: khoiLienHe.getByRole("heading", { level: 2 }), huong: "duoi" },
      { o: khoiLienHe.getByText(/người tư vấn/i), huong: "phai" },
      { o: khoiLienHe.getByRole("link", { name: /^gọi/i }), huong: "tren" },
      { o: khoiLienHe.getByRole("link", { name: /nhắn zalo/i }), huong: "trai" },
    ]);
    await khach.close();

    // --- 18. Catalogue da tao ---
    await page.goto(`${GOC}/admin/catalogue`, { waitUntil: "networkidle" });
    await page.locator("tbody tr").first().waitFor();
    await page.locator("table").first().evaluate((bang, email) => {
      const ten = ["Chị Lan — nhẫn cưới 18K", "Anh Tuấn — bộ cưới", "Chị Mai — nhẫn kim cương",
                   "Khách Hà Nội — dây chuyền", "Chị Hương — bông tai", "Anh Nam — nhẫn nam",
                   "Chị Thảo — lắc tay", "Khách quen — vòng cổ"];
      bang.querySelectorAll("tbody tr").forEach((tr, i) => {
        const o = tr.querySelectorAll("td");
        // Tim theo data-* chu KHONG theo thu tu the con: o nay con co nut "Doi ten link".
        // Thieu mot trong hai thi dung han — anh chup ma lo link that thi thoi.
        const oTen = tr.querySelector("[data-ten-catalogue]");
        const oDuong = tr.querySelector("[data-duong-dan]");
        if (!oTen || !oDuong) throw new Error("Khong tim thay o ten / duong dan de che");
        oTen.textContent = ten[i % ten.length];
        oDuong.textContent = "/vi-du-" + String(i + 1).padStart(2, "0") + "-abcd1234";
        // Cot "Nguoi tao" — email that cua dong nghiep.
        if (o[4]) o[4].textContent = email[i % email.length];
      });
    }, EMAIL_MINH_HOA);
    await page.waitForTimeout(200);
    const dongDau = page.locator("tbody tr").first();
    await chup(page, "18-danh-sach", [
      // NHAN o tim (cao hon o nhap): o so 1 dat canh o nhap thi chong len o so 2 cua cot Hieu luc.
      { o: page.locator('label[for="q"]'), huong: "trai" },
      // Tieu de cot Hieu luc: chi vao o thi o so de len ngay tao hoac dong ben duoi.
      { o: page.locator("thead th").nth(3), huong: "duoi" },
      { o: dongDau.getByRole("button", { name: /đổi tên link/i }), huong: "trai" },
      { o: dongDau.getByRole("button", { name: /chép link/i }), huong: "duoi" },
      { o: dongDau.getByRole("button", { name: /khoá link/i }), huong: "duoi" },
      { o: dongDau.getByRole("link", { name: /tải pdf/i }), huong: "duoi" },
    ]);

    // --- 19. Gop y (mo ra de chup, KHONG gui) ---
    await page.getByRole("button", { name: /^góp ý$/i }).click();
    const hopGopY = page.getByRole("dialog", { name: /góp ý cho hệ thống/i });
    await hopGopY.waitFor({ timeout: 30_000 });
    await hopGopY.locator("img").first().waitFor({ timeout: 20_000 }).catch(() => {});
    await hopGopY.locator("#gop-y-noi-dung").fill("Bấm Tạo link thì không thấy gì xảy ra, thử lại ba lần vẫn vậy.");
    await page.waitForTimeout(600);
    await chup(page, "19-gop-y", [
      { o: hopGopY.getByText(/gửi kèm ảnh màn hình/i), huong: "trai" },
      { o: hopGopY.getByText(/^góp ý cải tiến$/i), huong: "trai" },
      { o: hopGopY.locator("#gop-y-noi-dung"), huong: "phai" },
      { o: hopGopY.getByRole("button", { name: /^gửi góp ý$/i }), huong: "tren" },
    ]);
    await page.keyboard.press("Escape");
    await hopGopY.waitFor({ state: "hidden" });

    // --- 20. Hop gop y (quan tri) ---
    await page.goto(`${GOC}/admin/gop-y`, { waitUntil: "networkidle" });
    await page.locator("tbody tr").first().waitFor();
    await cheGopY(page);
    await page.waitForTimeout(200);
    const gopYDau = page.locator("tbody tr").first();
    await chup(page, "20-hop-gop-y", [
      // Chi vao TIEU DE cot: chi vao o thi mui ten de len chinh dong noi dung.
      { o: page.locator("thead th").nth(1), huong: "duoi" },
      { o: page.getByRole("link", { name: /xem ảnh/i }).first(), huong: "trai" },
      { o: page.locator("thead th").nth(3), huong: "duoi" },
      { o: gopYDau.getByRole("button", { name: /đánh dấu đã xử lý|mở lại/i }), huong: "trai" },
    ]);

    // --- 21. Tai khoan va vai tro (quan tri) ---
    await page.setViewportSize({ width: RONG, height: 1700 });
    await page.goto(`${GOC}/admin/nguoi-dung`, { waitUntil: "networkidle" });
    await page.getByRole("heading", { name: "Vai trò", exact: true }).waitFor();
    await page.getByRole("button", { name: /^cấp tài khoản mới$/i }).click();
    const bangVaiTro = page.locator("table").first();
    const bangTaiKhoan = page.locator("table").nth(1);
    await bangTaiKhoan.locator("tbody tr").first().waitFor();
    // Email va ten THAT cua nhan vien doi sang ten minh hoa, chi tren man hinh.
    await bangTaiKhoan.evaluate((bang, dsEmail) => {
      const ho = ["Ngọc Anh", "Minh Thư", "Gia Bảo", "Thuỳ Linh", "Quang Huy", "Kim Ngân"];
      bang.querySelectorAll("tbody tr").forEach((tr, i) => {
        const o = tr.querySelectorAll("td");
        // O email co the kem the "(bạn)"; chi doi doan chu dau, giu the do.
        const nutEmail = o[0]?.firstChild;
        if (nutEmail && nutEmail.nodeType === Node.TEXT_NODE) nutEmail.textContent = dsEmail[i % dsEmail.length];
        else if (o[0]) o[0].textContent = dsEmail[i % dsEmail.length];
        if (o[1]) o[1].textContent = ho[i % ho.length];
      });
    }, EMAIL_MINH_HOA);
    await page.waitForTimeout(200);
    // Dong KHONG phai tai khoan dang chup: tu khoa chinh minh thi nut bi tat.
    const dongTk = bangTaiKhoan.locator("tbody tr").filter({ hasNotText: "(bạn)" }).first();
    await chup(page, "21-tai-khoan", [
      { o: bangVaiTro.getByRole("columnheader", { name: /quyền/i }), huong: "duoi" },
      { o: page.getByRole("button", { name: /thêm vai trò/i }).first(), huong: "trai" },
      // O so DUOI o email: tren o do la dong mo ta cua khung cap tai khoan.
      { o: page.locator("#email"), huong: "tren" },
      { o: dongTk.locator("select"), huong: "duoi" },
      { o: dongTk.getByRole("button", { name: /đặt mật khẩu/i }), huong: "duoi" },
      { o: dongTk.getByRole("button", { name: /^(khoá|mở khoá)$/i }), huong: "duoi" },
    ]);

    await writeFile(join(THU_MUC, "diem.json"), JSON.stringify(diemTheoAnh, null, 2) + "\n", "utf8");
    console.log("\n  diem.json — vị trí mũi tên, đo từ chính trang");
  } finally {
    await trinhDuyet.close();
    await xoaTaiKhoanTam(id);
    await sql.end();
  }

  console.log(`\nXong. Ảnh nằm trong public/huong-dan.`);
}

await main();
