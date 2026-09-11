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

/**
 * Thay du lieu THAT bang du lieu minh hoa NGAY TREN MAN HINH, truoc khi chup.
 *
 * Anh huong dan nam trong public/ — bat ky ai biet duong dan deu tai duoc — va
 * kho ma nguon thi cong khai. Hai thu tuyet doi khong duoc lot ra:
 *
 *   1. Email nhan vien. Mot anh chup bang tai khoan la mot danh ba noi bo.
 *   2. Duong dan /c/<slug> cua catalogue. Slug co that la mot link DANG SONG
 *      gui cho khach; no duoc thiet ke de khong doan ra, nen in no len mot anh
 *      cong khai la mo cua catalogue cua khach cho ca Internet.
 *
 * Chi doi CHU TREN MAN HINH, khong dong toi co so du lieu: sua hang that cua
 * dong nghiep chi de chup mot tam anh la cai gia qua dat. Dieu huong sang trang
 * khac la moi thu tro lai nhu cu.
 */
const EMAIL_MINH_HOA = [
  "ngoc.anh@ctyhp.vn", "minh.thu@ctyhp.vn", "gia.bao@ctyhp.vn",
  "thuy.linh@ctyhp.vn", "quang.huy@ctyhp.vn", "kim.ngan@ctyhp.vn",
];

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
    // Xoa o tim kiem truoc khi tich. Tu 11/09/2026 tab Catalogue-OL chi con 12
    // dong, va loc "nhan" chi con MOT mau — ma buoc 5 can it nhat hai mau trong
    // gio (the thu hai co nut "Go mau nay"): lan chup do dung o buoc 5 vi het 30
    // giay doi. Tich tren ca danh sach thi khong phu thuoc bang tinh co bao nhieu
    // nhan.
    await page.fill("#q", "");
    await page.waitForTimeout(800);
    // Dong danh sach GOI Y truoc da. O tim kiem con giu tieu diem tu buoc 2 nen
    // danh sach goi y van mo, va no nam de len hang dau cua bang — Playwright
    // bao "subtree intercepts pointer events" roi doi het 30 giay. Nguoi that
    // cung gap dung canh do: bam vao mau dau tien thi trung phai goi y.
    await page.keyboard.press("Escape");
    await page.locator("#q").blur();
    await page.waitForTimeout(300);

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
    // scrollIntoViewIfNeeded() KHONG du: the nay cao hon ca khung nhin, nen
    // Playwright canh no sao cho vua "nhin thay duoc" — va dinh the, noi co
    // dong dem anh, nam nhinh tren mep tren. Do ra y = -2%, mui ten ve ra ngoai
    // anh. Tu cuon lay, chua 80px cho dinh the.
    await the.evaluate((el) => {
      const y = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: y, behavior: "instant" });
    });
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
    await page.locator("tbody tr").first().waitFor();
    await page.locator("table").first().evaluate((bang, email) => {
      const ten = ["Chị Lan — nhẫn cưới 18K", "Anh Tuấn — bộ cưới", "Chị Mai — nhẫn kim cương",
                   "Khách Hà Nội — dây chuyền", "Chị Hương — bông tai", "Anh Nam — nhẫn nam",
                   "Chị Thảo — lắc tay", "Khách quen — vòng cổ"];
      bang.querySelectorAll("tbody tr").forEach((tr, i) => {
        const o = tr.querySelectorAll("td");
        // O dau: dong ten roi dong duong dan. Doi ca hai; duong dan that la
        // link dang song cua khach.
        const trong = o[0]?.querySelectorAll("*");
        if (trong && trong.length >= 2) {
          trong[0].textContent = ten[i % ten.length];
          trong[1].textContent = "/vi-du-" + String(i + 1).padStart(2, "0") + "-abcd1234";
        }
        // Cot "Nguoi tao" — email that cua dong nghiep.
        if (o[4]) o[4].textContent = email[i % email.length];
      });
    }, EMAIL_MINH_HOA);
    await page.waitForTimeout(200);

    const dongDau = page.locator("tbody tr").first();
    await chup(page, "07-danh-sach", [
      { o: page.getByRole("link", { name: /catalogue đã tạo/i }).first(), huong: "tren" },
      { o: dongDau.getByRole("button", { name: /chép link/i }), huong: "tren" },
      { o: dongDau.getByRole("link", { name: /tải pdf/i }), huong: "duoi" },
    ]);

    // --- 8. Tai khoan va vai tro (chi quan tri) ---
    await page.goto(`${GOC}/admin/nguoi-dung`, { waitUntil: "networkidle" });
    // Doi bang vai tro hien han roi moi do: hai bang tren trang nay deu co
    // <select>, va do luc trang con dang dung thi nth(1) co the chua phai bang
    // tai khoan.
    await page.getByRole("heading", { name: "Vai trò", exact: true }).waitFor();
    const bangVaiTro = page.locator("table").first();
    const bangTaiKhoan = page.locator("table").nth(1);
    await bangTaiKhoan.locator("tbody tr").first().waitFor();

    /**
     * Thay email va ten THAT cua nhan vien bang ten minh hoa, TRUOC khi chup.
     *
     * Anh nay di vao public/ — bat ky ai biet duong dan deu tai duoc — va kho
     * ma nguon thi cong khai. Mot anh chup bang tai khoan la mot danh ba noi bo
     * dang len mang, va khong ai nhan ra dieu do cho toi luc da muon.
     *
     * Chi doi CHU TREN MAN HINH, khong dong toi co so du lieu: sua hang that
     * cua dong nghiep chi de chup mot tam anh la cai gia qua dat. Dieu huong
     * sang trang khac la moi thu tro lai nhu cu.
     */
    await bangTaiKhoan.evaluate((bang, dsEmail) => {
      const ho = ["Ngọc Anh", "Minh Thư", "Gia Bảo", "Thuỳ Linh", "Quang Huy", "Kim Ngân"];
      const hang = bang.querySelectorAll("tbody tr");
      hang.forEach((tr, i) => {
        const o = tr.querySelectorAll("td");
        const email = dsEmail[i % dsEmail.length];
        const ten = ho[i % ho.length];
        // O email co the kem the "(bạn)"; chi doi doan chu dau, giu the do.
        const nutEmail = o[0]?.firstChild;
        if (nutEmail && nutEmail.nodeType === Node.TEXT_NODE) nutEmail.textContent = email;
        else if (o[0]) o[0].textContent = email;
        if (o[1]) o[1].textContent = ten;
      });
    }, EMAIL_MINH_HOA);
    await page.waitForTimeout(200);

    await chup(
      page,
      "08-tai-khoan-vai-tro",
      [
        // Cot "Quyen" — thu that su quyet dinh nguoi do lam duoc gi. Chi vao
        // TIEU DE cot chu khong vao mot o chon cu the: hai vai tro goc co o
        // chon bi tat, con vai tro tu dat thi khong chac da ton tai luc chup.
        { o: bangVaiTro.getByRole("columnheader", { name: /quyền/i }), huong: "tren" },
        { o: page.getByRole("button", { name: /thêm vai trò/i }).first(), huong: "duoi" },
        { o: bangTaiKhoan.locator("tbody tr").first().locator("select"), huong: "trai" },
      ],
      { x: 0, y: 0, width: RONG, height: CAO },
    );

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
