import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Lam moi phien Supabase tren moi yeu cau.
 *
 * Vi sao can: access token cua Supabase song mot gio. Server Component KHONG
 * ghi duoc cookie (xem chu thich trong supabase-server.ts), nen neu khong co
 * cho nay thi khong ai gia han duoc phien — sale dang lam viec bi day ra man
 * hinh dang nhap sau dung mot gio, khong ro ly do.
 *
 * Tep nay ten "proxy" theo quy uoc Next.js 16 (truoc day la "middleware").
 *
 * Tuyen nay KHONG gac ai ca, chi gia han. Viec gac nam o requireUser() —
 * de o hai noi thi mot ngay nao do chung noi hai dieu khac nhau. Nho vay
 * /catalogue/<slug> va /api/anh-drive van cong khai binh thuong.
 */
/**
 * Cookie phien cua Supabase luon bat dau bang "sb-". Khong co cai nao nghia la
 * KHONG CO PHIEN de gia han.
 */
function coPhien(req: NextRequest): boolean {
  return req.cookies.getAll().some((c) => c.name.startsWith("sb-"));
}

export async function proxy(req: NextRequest) {
  // Khong co cookie phien thi ve thang. getUser() la mot luot goi MANG sang
  // Supabase Auth; chay no cho mot nguoi khong dang nhap la tra tien cho cau
  // tra loi da biet truoc. Ma phan lon luot truy cap he thong nay lai chinh la
  // khach mo /catalogue/<slug> — ho khong bao gio co phien.
  if (!coPhien(req)) return NextResponse.next({ request: req });

  const res = NextResponse.next({ request: req });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (ds) => {
          for (const { name, value, options } of ds) res.cookies.set(name, value, options);
        },
      },
    },
  );

  // Goi getUser() moi that su lam moi token. getSession() doc tu cookie va
  // KHONG lam gi ca — dung nham no thi middleware nay thanh vo dung.
  await supabase.auth.getUser();
  return res;
}

export const config = {
  matcher: [
    /*
     * Chay cho moi duong dan TRU tep tinh, anh, va tuyen phuc vu anh: chung
     * khong mang cookie phien, cho chung di qua day chi ton mot lan goi mang
     * moi tep. Mot trang khach goi api/anh-drive vai chuc lan — tuyen do cong
     * khai theo thiet ke va khong bao gio doc phien.
     */
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|api/anh-drive|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico)$).*)",
  ],
};
