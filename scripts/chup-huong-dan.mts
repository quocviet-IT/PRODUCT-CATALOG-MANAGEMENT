import { config } from "dotenv";
config({ path: ".env.local" });

import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { randomBytes } from "node:crypto";
import postgres from "postgres";
import { createClient } from "@supabase/supabase-js";
import { chromium, type Locator, type Page } from "playwright";

/**
 * Chup anh minh hoa cho trang /admin/huong-dan.
 *
 * Chay: npm run huong-dan:anh   (may chu phai dang chay o CONG duoi day)
 *
 * Script tu DO vi tri cac diem chu thich tu chinh phan tu tren trang roi ghi ra
 * public/huong-dan/diem.json. Truoc day toa do do bang mat roi go tay vao ma
 * nguon; moi lan bo cuc xe dich mot chut la mui ten tro vao cho trong ma khong
 * ai biet. Do tu DOM thi anh va mui ten khong bao gio lech nhau nua.
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

type Huong = "trai" | "phai" | "tren" | "duoi";
type Khung = { x: number; y: number; width: number; height: number };
/** Mot diem chu thich: chi vao dau, va o so nam ve phia nao. */
type Diem = { x: number; y: number; huong: Huong };

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
 * Doi o chu nhat cua mot phan tu thanh diem mui ten cham vao, tinh theo phan
 * tram cua vung anh.
 *
 * Mui ten cham vao MEP phia o so di toi, khong phai tam phan tu: cham vao tam
 * thi mui ten nam de len chinh cai no dang chi.
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

async function chup(
  page: Page,
  ten: string,
  moc: { o: Locator; huong: Huong }[],
  khungCat?: Khung,
): Promise<void> {
  // Doc khung nhin THAT thay vi dung hang so CAO: buoc 4 phong khung len 1900px
  // de chup ca bang chon kieu. Lay 900 lam mau so o do thi moi phan tram deu
  // bi thoi len gap doi — mui ten van ve ra, chi la ve nham cho, va khong co gi
  // bao loi. Loi nay da song trong tep nay tu dau.
  const khungNhin = page.viewportSize();
  if (!khungNhin) throw new Error(`[chup] ${ten}: không đọc được kích thước khung nhìn`);
  const khung = khungCat ?? { x: 0, y: 0, ...khungNhin };

  /** Do vi tri tat ca cac moc mot luot. */
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

  // Do HAI LAN, truoc va sau khi chup. Neu giua hai lan ma vi tri xe dich thi
  // trang van con dang doi luc bam nut chup — anh se la mot man hinh, con mui
  // ten la toa do cua mot man hinh khac. Loi do da xay ra that o buoc 6: script
  // doi cung 2,5 giay sau khi bam "Tao link", lan nay man hinh ket qua ve cham
  // hon mot chut, va anh chup lai la trang chon anh trong khi mui ten van tro
  // dung cho cua trang ket qua.
  const truoc = await doHet();
  const anh = await page.screenshot({ type: "png", ...(khungCat ? { clip: khungCat } : {}) });
  await writeFile(join(THU_MUC, `${ten}.png`), anh);
  const sau = await doHet();
  for (let i = 0; i < truoc.length; i++) {
    if (Math.abs(truoc[i].x - sau[i].x) > 1 || Math.abs(truoc[i].y - sau[i].y) > 1) {
      throw new Error(
        `[chup] ${ten}: điểm ${i + 1} xê dịch giữa lúc đo và lúc chụp — ` +
        `trang chưa đứng yên. Đợi phần tử cần chụp hiện ra rồi hãy gọi chup().`,
      );
    }
  }

  const diem: Diem[] = [];
  for (const [i, o] of sau.entries()) {
    const m = moc[i];
    const d = diemTu(o, khung, m.huong);
    // Diem nam ngoai anh thi mui ten se ve ra ngoai khung, de len tieu de hoac
    // dong chu thich cua muc ben canh. Truoc day script ghi ra 117,5% khong noi
    // gi ca, va cai sai chi lo ra khi co nguoi mo trang huong dan len doc.
    if (d.x < 0 || d.x > 100 || d.y < 0 || d.y > 100) {
      throw new Error(
        `[chup] ${ten}: điểm ${i + 1} rơi ngoài ảnh (x=${d.x}%, y=${d.y}%). ` +
        `Cuộn cho phần tử vào trong khung nhìn trước khi chụp.`,
      );
    }
    diem.push(d);
  }
  diemTheoAnh[ten] = diem;
  console.log(`  ${ten}.png  ${(anh.byteLength / 1024).toFixed(0)} KB  ${diem.length} điểm`);
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

    // --- 2. Tim mau ---
    await page.goto(`${GOC}/admin/catalogue-sheet`, { waitUntil: "networkidle" });
    await page.fill("#q", "nhan");
    await page.waitForTimeout(800);
    await chup(page, "02-tim-mau", [
      { o: page.locator("#q"), huong: "trai" },
      { o: page.getByRole("button", { name: /^màu/i }), huong: "tren" },
      { o: page.getByRole("link", { name: /^lưới ảnh$/i }), huong: "trai" },
      { o: page.getByTitle(/lọc theo thiếu sku/i), huong: "duoi" },
    ]);

    // --- 3. Tich chon ---
    const oTich = page.locator('input[type="checkbox"]');
    const soO = Math.min(await oTich.count(), 3);
    for (let i = 0; i < soO; i++) await oTich.nth(i).check();
    await page.waitForTimeout(400);
    await chup(page, "03-tich-chon", [
      { o: oTich.first(), huong: "trai" },
      { o: page.getByText(/đã chọn \d+ mẫu/i), huong: "duoi" },
      { o: page.getByRole("link", { name: /^tạo catalogue$/i }), huong: "duoi" },
    ]);

    // --- 4. Dat ten va chon kieu ---
    await page.goto(`${GOC}/catalogue/tao`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1500);
    await page.fill("#ten", "Chị Lan — nhẫn cưới 18K");
    // Bang chon kieu trinh bay cao hon mot man hinh: chup rieng buoc nay o
    // khung cao hon de ca bang lot vao mot anh, khong phai cat lam hai.
    await page.setViewportSize({ width: RONG, height: 1900 });
    await page.waitForTimeout(300);
    await chup(page, "04-dat-ten-va-kieu", [
      { o: page.locator("#ten"), huong: "trai" },
      { o: page.getByText(/^danh sách dọc$/i), huong: "phai" },
      { o: page.getByText(/^be cổ điển$/i), huong: "phai" },
    ]);
    await page.setViewportSize({ width: RONG, height: CAO });

    // --- 5. Bo bot anh ---
    const the = page.locator("li").filter({ hasText: /gỡ mẫu này/i }).nth(1);
    // Cuon theo CHINH the can chup, khong theo mot con so do dem. scrollBy(0, 1400)
    // dung duoc dung mot lan: them mot mau vao gio hay doi chieu cao mot hang la
    // muc tieu tut xuong duoi day khung nhin, va mui ten ve ra ngoai anh.
    await the.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    await chup(page, "05-bo-anh", [
      { o: the.locator("li").first(), huong: "phai" },
      { o: the.getByText(/\d+\/\d+ ảnh/).first(), huong: "trai" },
      { o: the.getByRole("button", { name: /gỡ mẫu này/i }), huong: "phai" },
    ]);

    // --- 6. Tao link ---
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.getByRole("button", { name: /tạo link gửi khách/i }).click();
    // Doi man hinh ket qua hien ra THAT, khong doi cung mot con so giay: tao
    // catalogue phai ghi xuong co so du lieu va Storage, thoi gian do khong
    // doan truoc duoc.
    await page.getByRole("button", { name: /chép link/i })
      .waitFor({ state: "visible", timeout: 30_000 });
    await page.waitForTimeout(500);
    await chup(
      page,
      "06-tao-link",
      [
        { o: page.getByRole("button", { name: /chép link/i }), huong: "duoi" },
        { o: page.getByRole("link", { name: /mở thử/i }), huong: "tren" },
        { o: page.getByRole("link", { name: /tải pdf/i }).first(), huong: "duoi" },
      ],
      { x: 0, y: 0, width: RONG, height: 620 },
    );

    // --- 7. Danh sach ---
    await page.goto(`${GOC}/admin/catalogue`, { waitUntil: "networkidle" });
    const dongDau = page.locator("tbody tr").first();
    await chup(page, "07-danh-sach", [
      { o: page.getByRole("link", { name: /catalogue đã tạo/i }).first(), huong: "tren" },
      { o: dongDau.getByRole("button", { name: /chép link/i }), huong: "tren" },
      { o: dongDau.getByRole("link", { name: /tải pdf/i }), huong: "duoi" },
    ]);

    await writeFile(
      join(THU_MUC, "diem.json"),
      JSON.stringify(diemTheoAnh, null, 2) + "\n",
      "utf8",
    );
    console.log("\n  diem.json — vị trí mũi tên, đo từ chính trang");
  } finally {
    await trinhDuyet.close();
    await xoaTaiKhoanTam(id);
    await sql.end();
  }

  console.log(`\nXong. Ảnh nằm trong public/huong-dan.`);
}

await main();
