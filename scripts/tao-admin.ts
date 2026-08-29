import { config } from "dotenv";
config({ path: ".env.local" });
import { createClient } from "@supabase/supabase-js";
import { db } from "../src/db/client";
import { users } from "../src/db/schema";
import { getEnv } from "../src/lib/env";

const [email, matKhau, hoTen] = process.argv.slice(2);
if (!email || !matKhau || !hoTen) {
  console.error("Dung: npx tsx scripts/tao-admin.ts <email> <mat-khau> <ho-ten>");
  process.exit(1);
}

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
