import { config } from "dotenv";
config({ path: ".env.local" });

import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { randomBytes } from "node:crypto";
import postgres from "postgres";
import { createClient } from "@supabase/supabase-js";
import { chromium } from "playwright";

/**
 * Chụp lại các trạng thái CHỜ để mắt người nhìn được.
 *
 * Chạy: npm run soat:cho   (máy chủ phải đang chạy ở CỔNG dưới đây)
 *
 * VÌ SAO CẦN MỘT SCRIPT RIÊNG: trạng thái chờ chỉ tồn tại vài trăm mili giây
 * trên máy chạy tốt, nên mở trình duyệt bấm tay thì không bao giờ thấy. Ở đây
 * ta chặn đúng những yêu cầu dựng lại trang rồi giữ chúng vài giây — khung chờ
 * đứng yên đủ lâu để chụp. Không có bước này thì "đã thêm trạng thái chờ" là
 * một lời khẳng định không ai kiểm được.
 *
 * Tài khoản tạm bị XOÁ ở cuối, kể cả khi giữa chừng có lỗi — xem khối finally.
 * Cùng cách làm với scripts/chup-huong-dan.mts.
 */

const CONG = Number(process.env.CONG_CHUP ?? 3100);
const GOC = `http://localhost:${CONG}`;
const THU_MUC = join(process.cwd(), "anh-soat");

const sql = postgres(process.env.DATABASE_URL!, { max: 1, prepare: false });
const kho = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const EMAIL = `soat-cho-${randomBytes(4).toString("hex")}@ctyhp.vn`;
const MAT_KHAU = randomBytes(18).toString("base64url");

async function taoTaiKhoanTam(): Promise<string> {
  const { data, error } = await kho.auth.admin.createUser({
    email: EMAIL,
    password: MAT_KHAU,
    email_confirm: true,
  });
  if (error) throw error;
  await sql`
    insert into users (id, email, full_name, role)
    values (${data.user.id}, ${EMAIL}, 'Soát chờ', 'admin')
  `;
  return data.user.id;
}

async function xoaTaiKhoanTam(id: string): Promise<void> {
  await sql`delete from catalogues where owner_id = ${id}`;
  await sql`delete from users where id = ${id}`;
  const { error } = await kho.auth.admin.deleteUser(id);
  if (error) console.error("[soát] không xoá được tài khoản tạm:", error.message);
}

async function chay() {
  await mkdir(THU_MUC, { recursive: true });
  const idNguoi = await taoTaiKhoanTam();
  const trinhDuyet = await chromium.launch();

  try {
    const trang = await trinhDuyet.newPage({ viewport: { width: 1440, height: 900 } });

    // Đăng nhập bằng đường mật khẩu.
    await trang.goto(`${GOC}/login`, { waitUntil: "networkidle" });
    await trang.getByRole("button", { name: /không đăng nhập được/i }).click();
    await trang.getByLabel("Email").fill(EMAIL);
    await trang.getByLabel("Mật khẩu").fill(MAT_KHAU);
    await Promise.all([
      trang.waitForURL((u) => !u.pathname.startsWith("/login"), { timeout: 30_000 }),
      trang.getByRole("button", { name: "Đăng nhập", exact: true }).click(),
    ]);

    await trang.goto(`${GOC}/admin/catalogue-sheet`, { waitUntil: "networkidle" });

    /**
     * Giữ lại các yêu cầu dựng lại trang.
     *
     * Đăng ký MỘT lần rồi chỉnh độ trễ bằng biến, thay vì route/unroute mỗi
     * lần: gỡ tuyến trong lúc còn một yêu cầu đang bị giữ thì Playwright ném
     * "Route is already handled" từ ngoài chuỗi await — script chết mà khối
     * finally không chạy, và bỏ lại một tài khoản tạm trong hệ thống thật.
     */
    let chamMs = 0;
    await trang.route("**/*", async (tuyen) => {
      const laDungLai =
        tuyen.request().url().includes("_rsc=") || tuyen.request().headers()["rsc"] === "1";
      if (laDungLai && chamMs > 0) await new Promise((r) => setTimeout(r, chamMs));
      await tuyen.continue();
    });
    const lamCham = (giay: number) => { chamMs = giay * 1000; };
    const thoiCham = () => { chamMs = 0; };

    // --- 1. Bộ lọc: kết quả phải mờ đi và hiện dòng "Đang cập nhật…" ---
    lamCham(4);
    await trang.getByLabel(/tìm mã mẫu/i).fill("nhan");
    await trang.waitForTimeout(1500);
    await trang.screenshot({ path: join(THU_MUC, "1-dang-loc.png") });
    console.log("  1-dang-loc.png       — bảng mờ đi + dòng “Đang cập nhật…”");
    thoiCham();
    await trang.waitForTimeout(1200);

    // --- 2. Khung chờ khi đổi trang ---
    lamCham(6);
    await trang.getByRole("link", { name: /catalogue đã tạo/i }).click();
    await trang.waitForTimeout(1500);
    await trang.screenshot({ path: join(THU_MUC, "2-khung-cho-trang.png") });
    console.log("  2-khung-cho-trang.png — khung xám của /admin/catalogue");
    thoiCham();
    await trang.waitForURL(/\/admin\/catalogue$/, { timeout: 30_000 });

    // --- 3. Ngăn chi tiết: khung chờ dựng lại đúng bố cục ---
    await trang.goto(`${GOC}/admin/catalogue-sheet`, { waitUntil: "networkidle" });
    await trang.route("**/api/catalogue-sheet/**", async (tuyen) => {
      await new Promise((r) => setTimeout(r, 6000));
      await tuyen.continue();
    });
    await trang.locator("[data-dong]").first().click();
    await trang.waitForTimeout(1500);
    await trang.screenshot({ path: join(THU_MUC, "3-ngan-chi-tiet.png") });
    console.log("  3-ngan-chi-tiet.png   — khung chờ trong ngăn trượt");
    // --- 4. Phan trang: doi tham so cua CUNG mot trang nen KHONG co khung
    //        cho nao hien ra — dau hieu duy nhat la o so trang mo di. ---
    await trang.unroute("**/api/catalogue-sheet/**");
    await trang.goto(`${GOC}/admin/catalogue-sheet`, { waitUntil: "networkidle" });
    const oTrang2 = trang.getByRole("link", { name: "2", exact: true });
    if (await oTrang2.count()) {
      lamCham(6);
      await oTrang2.click();
      await trang.waitForTimeout(1200);
      await trang.locator("nav").last().screenshot({ path: join(THU_MUC, "4-phan-trang.png") });
      console.log("  4-phan-trang.png      — o so trang dang cho mo di");
      thoiCham();
    } else {
      console.log("  (bo qua phan trang: chi co mot trang)");
    }

    // --- 5. Trang KHACH XEM: o giu cho anh.
    //        Day la be mat quan trong nhat — khach mo bang dien thoai, mang
    //        cham, va lan dau moi anh phai goi sang Drive. Truoc day mot luoi
    //        40 mau la mot trang trang lo cho trong vai giay. ---
    const [moiNhat] = await sql`
      select slug from catalogues where khoa_luc is null order by created_at desc limit 1
    `;
    if (moiNhat) {
      await trang.route("**/api/anh-drive/**", async (tuyen) => {
        await new Promise((r) => setTimeout(r, 8000));
        await tuyen.continue();
      });
      await trang.goto(`${GOC}/catalogue/${moiNhat.slug}`, { waitUntil: "domcontentloaded" });
      await trang.waitForTimeout(2000);
      await trang.screenshot({ path: join(THU_MUC, "5-anh-khach-xem.png") });
      console.log("  5-anh-khach-xem.png   — o giu cho anh tren trang khach");
      await trang.unroute("**/api/anh-drive/**");
    } else {
      console.log("  (bo qua trang khach: khong co catalogue nao dang mo)");
    }


    console.log(`\nXong. Ảnh nằm trong ${THU_MUC}`);
  } finally {
    await trinhDuyet.close();
    await xoaTaiKhoanTam(idNguoi);
    await sql.end();
  }
}

await chay();
