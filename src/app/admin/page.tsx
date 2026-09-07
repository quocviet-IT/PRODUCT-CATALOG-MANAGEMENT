import { redirect } from "next/navigation";

/**
 * Ung dung chi con mot man hinh lam viec, nen /admin khong con la trang chao
 * ma di thang toi catalogue.
 */
export default function TrangChuQuanTri() {
  redirect("/admin/catalogue-sheet");
}
