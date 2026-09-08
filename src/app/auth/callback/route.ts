import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { layCauHinhQuyen } from "@/auth/cau-hinh";
import { duocPhepDangNhap, tenTuEmail } from "@/auth/quyen-dang-nhap";
import { taoSupabaseServer } from "@/auth/supabase-server";

/**
 * Google tra nguoi dung ve day sau khi ho dong y.
 *
 * Day la CANH CUA duy nhat cua he thong: ai cung co tai khoan Google, nen moi
 * quyet dinh "nguoi nay co duoc vao khong" nam o tuyen nay. Ba viec, dung thu
 * tu:
 *   1. doi ma lay phien
 *   2. kiem email co thuoc cong ty khong — khong thi DANG XUAT ngay
 *   3. chua co ho so thi tao, vai tro sale
 */
export async function GET(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const ma = url.searchParams.get("code");

  // Nguoi dung bam Huy o man hinh Google, hoac Google bao loi.
  if (!ma) redirect("/login?loi=loi_google");

  const supabase = await taoSupabaseServer();
  const { data, error } = await supabase.auth.exchangeCodeForSession(ma);
  if (error || !data.user) redirect("/login?loi=loi_google");

  const email = data.user.email ?? null;
  if (!duocPhepDangNhap(email, layCauHinhQuyen())) {
    // Xoa phien ngay. Khong xoa thi nguoi ngoai van giu mot phien Supabase hop
    // le trong trinh duyet — ho khong qua duoc getSessionUser (vi khong co ho
    // so) nhung de mot phien song lang thang la thua va kho lan.
    await supabase.auth.signOut();
    redirect("/login?loi=sai_ten_mien");
  }

  // Tao ho so lan dau. Khoa chinh trung id cua Supabase Auth nen chay lai
  // khong sinh ban ghi thua; dung onConflictDoNothing thay vi doc-roi-ghi de
  // hai tab dang nhap cung luc khong dam nhau.
  await db
    .insert(users)
    .values({
      id: data.user.id,
      email: email!,
      fullName: (data.user.user_metadata?.full_name as string | undefined) ?? tenTuEmail(email!),
      role: "sale",
    })
    .onConflictDoNothing({ target: users.id });

  // Tai khoan bi vo hieu hoa van vao duoc toi day; guard se chan va noi ro ly
  // do. Kiem o day nua chi de khoi bat ho di mot vong thua.
  const [hoSo] = await db.select().from(users).where(eq(users.id, data.user.id)).limit(1);
  if (hoSo && !hoSo.isActive) {
    await supabase.auth.signOut();
    redirect("/login?loi=bi_vo_hieu_hoa");
  }

  redirect("/admin");
}
