import { config } from "dotenv";

// PHAI nap bien moi truong TRUOC khi import bat cu module nao doc chung.
// Trong ESM moi lenh `import` tinh deu duoc NANG LEN va chay truoc cac cau lenh
// thuong, nen `import { db } from "../src/db/client"` se goi getEnv() truoc khi
// dong config() nay kip chay. Vi vay cac module do phai nap bang import() dong
// o duoi, khong duoc dat o dau file.
config({ path: ".env.local" });

const [email, matKhau, hoTen] = process.argv.slice(2);
if (!email || !matKhau || !hoTen) {
  console.error('Dung: npx tsx scripts/tao-admin.mts <email> <mat-khau> "<ho ten>"');
  process.exit(1);
}

const { createClient } = await import("@supabase/supabase-js");
const { getEnv } = await import("../src/lib/env");
const { db } = await import("../src/db/client");
const { users } = await import("../src/db/schema");

const env = getEnv();
const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SECRET_KEY);

const { data, error } = await admin.auth.admin.createUser({
  email, password: matKhau, email_confirm: true,
});
if (error) { console.error("Loi tao tai khoan:", error.message); process.exit(1); }

await db.insert(users).values({
  id: data.user.id, email, fullName: hoTen, role: "admin", isActive: true,
});
console.log("Da tao admin:", email);
process.exit(0);
