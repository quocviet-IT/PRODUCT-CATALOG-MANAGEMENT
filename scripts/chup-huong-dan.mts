import { config } from "dotenv";
config({ path: ".env.local" });

import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { randomBytes } from "node:crypto";
import postgres from "postgres";
import { createClient } from "@supabase/supabase-js";
import { chromium, type Page } from "playwright";

/**
 * Chup anh minh hoa cho trang /admin/huong-dan.
 *
 * Chay: npm run huong-dan:anh   (may chu dev phai dang chay o CONG duoi day)
 *
 * Vi sao phai tao mot tai khoan tam: moi man hinh trong huong dan deu nam sau
 * cong dang nhap. Tai khoan nay bi XOA o cuoi ham, ke ca khi giua chung co loi
 * — xem khoi finally. Khong dung tai khoan that cua ai: mat khau se phai nam
 * trong tep nay hoac trong lich su lenh.
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
 * Ten va email HIEN TREN ANH.
 *
 * Email that cua tai khoan tam co mot day hex o giua; no xuat hien o thanh dau
 * trang va o cot "Nguoi tao", va nguoi doc huong dan se dung lai hoi day la cai
 * gi. Doi hai truong nay trong bang `users` ngay truoc khi chup: Auth van giu
 * email that de con dang nhap duoc, con man hinh thi doc tu bang.
 */
const TEN_HIEN = "Ngọc Anh";
const EMAIL_HIEN = "ngoc.anh@ctyhp.vn";

async function taoTaiKhoanTam(): Promise<string> {
  const { data, error } = await kho.auth.admin.createUser({
    email: EMAIL,
    password: MAT_KHAU,
    email_confirm: true,
  });
  if (error) throw error;
  // Mot lan chup truoc bi ngat giua chung co the de lai dong cu; cot email co
  // rang buoc duy nhat nen khong don thi lan nay khong chen duoc.
  await sql`delete from users where email = ${EMAIL_HIEN}`;
  await sql`
    insert into users (id, email, full_name, role)
    values (${data.user.id}, ${EMAIL_HIEN}, ${TEN_HIEN}, 'admin')
  `;
  return data.user.id;
}

async function xoaTaiKhoanTam(id: string): Promise<void> {
  // Xoa catalogue do chinh phien chup tao ra, roi moi xoa nguoi: de lai thi
  // danh sach that cua cong ty co them mot dong rac khong ai hieu tu dau ra.
  await sql`delete from catalogues where owner_id = ${id}`;
  await sql`delete from users where id = ${id}`;
  const { error } = await kho.auth.admin.deleteUser(id);
  if (error) console.error("[chup] khong xoa duoc tai khoan tam:", error.message);
}

/**
 * `cao` cat bot phan duoi cua khung nhin. Man hinh "da tao xong" chi cao chung
 * 600px, chup ca khung 900 se cho ra mot tam anh ma nua duoi trong tron.
 */
type Khung = { x: number; y: number; width: number; height: number };

async function chup(page: Page, ten: string, khung?: Khung): Promise<void> {
  const anh = await page.screenshot({ type: "png", ...(khung ? { clip: khung } : {}) });
  await writeFile(join(THU_MUC, `${ten}.png`), anh);
  console.log(`  ${ten}.png  ${(anh.byteLength / 1024).toFixed(0)} KB`);
}

async function dangNhap(page: Page): Promise<void> {
  await page.goto(`${GOC}/login`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /không đăng nhập được/i }).click();

  // Dien mot dia chi MINH HOA de chup, khong phai dia chi that cua tai khoan
  // tam: anh nay nam trong huong dan cho nhan vien doc, mot email rac kieu
  // "chup-huong-dan-2c823df3@" chi lam ho phan van.
  await page.fill("#email", "ten.ban@ctyhp.vn");
  await page.fill("#mat_khau", "••••••••••••");
  // Anh buoc 1 chup TRUOC khi bam: no phai cho thay man hinh dang nhap, khong
  // phai man hinh sau khi da vao. Cat sat the dang nhap — chup ca khung thi ba
  // phan tu anh la nen trong.
  await chup(page, "01-dang-nhap", { x: 470, y: 140, width: 500, height: 620 });

  await page.fill("#email", EMAIL);
  await page.fill("#mat_khau", MAT_KHAU);
  await Promise.all([
    page.waitForURL((u) => !u.pathname.startsWith("/login"), { timeout: 30_000 }),
    page.getByRole("button", { name: /^đăng nhập$/i }).click(),
  ]);
}

async function main(): Promise<void> {
  await mkdir(THU_MUC, { recursive: true });
  console.log(`Chup anh huong dan tu ${GOC}\n`);

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

    // --- 2. Tim mau ---
    await page.goto(`${GOC}/admin/catalogue-sheet`, { waitUntil: "networkidle" });
    await page.fill("#q", "nhan");
    await page.waitForTimeout(800);
    await chup(page, "02-tim-mau");

    // --- 3. Tich chon ---
    const oTich = page.locator('input[type="checkbox"]');
    const soO = Math.min(await oTich.count(), 3);
    for (let i = 0; i < soO; i++) await oTich.nth(i).check();
    await page.waitForTimeout(400);
    await chup(page, "03-tich-chon");

    // --- 4 + 5. Man hinh tao ---
    await page.goto(`${GOC}/catalogue/tao`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1500);
    await page.fill("#ten", "Chị Lan — nhẫn cưới 18K");
    // Bang chon kieu trinh bay cao hon mot man hinh: chup rieng buoc nay o
    // khung cao hon de ca bang lot vao mot anh, khong phai cat lam hai.
    await page.setViewportSize({ width: RONG, height: 1500 });
    await page.waitForTimeout(300);
    await chup(page, "04-dat-ten-va-kieu");
    await page.setViewportSize({ width: RONG, height: CAO });

    await page.evaluate(() => window.scrollBy(0, 1400));
    await page.waitForTimeout(400);
    await chup(page, "05-bo-anh");

    // --- 6. Tao link ---
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.getByRole("button", { name: /tạo link gửi khách/i }).click();
    await page.waitForTimeout(2500);
    await chup(page, "06-tao-link", { x: 0, y: 0, width: RONG, height: 620 });

    // --- 7. Danh sach ---
    await page.goto(`${GOC}/admin/catalogue`, { waitUntil: "networkidle" });
    await chup(page, "07-danh-sach");
  } finally {
    await trinhDuyet.close();
    await xoaTaiKhoanTam(id);
    await sql.end();
  }

  console.log(`\nXong. Anh nam trong public/huong-dan.`);
}

await main();
