"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { COOKIE_NGON_NGU, HAN_COOKIE_NGON_NGU, docNgonNgu } from "./ngon-ngu";

/**
 * Doi ngon ngu giao dien.
 *
 * Ghi cookie o MAY CHU chu khong bang document.cookie: server component doc
 * ngon ngu tu cookie cua yeu cau, nen phai la cookie may chu da biet truoc khi
 * no dung lai trang. Ghi o trinh duyet roi goi refresh() cung ra ket qua dung
 * nhung di qua hai buoc va phu thuoc thu tu giua chung.
 *
 * revalidatePath("/", "layout") vi ngon ngu doi TOAN BO cay trang, khong rieng
 * trang dang mo.
 */
export async function datNgonNgu(form: FormData): Promise<void> {
  const n = docNgonNgu(form.get("ngon_ngu"));
  const kho = await cookies();
  kho.set(COOKIE_NGON_NGU, n, {
    path: "/",
    maxAge: HAN_COOKIE_NGON_NGU,
    sameSite: "lax",
  });
  revalidatePath("/", "layout");
}
