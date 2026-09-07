import { permanentRedirect } from "next/navigation";

/**
 * Duong dan CU cua trang khach xem.
 *
 * Nhung link dang o day da nam trong tin nhan Zalo cua khach hang, nen tuyen
 * nay khong bao gio duoc phep bien mat. No chi chuyen huong sang duong dan moi
 * /catalogue/<slug>; slug khong doi nen catalogue cu van mo dung.
 *
 * permanentRedirect (308) chu khong phai 302: day la doi cho o han, va 308 giu
 * nguyen phuong thuc HTTP.
 */
export default async function ChuyenHuongLinkCu(
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  permanentRedirect(`/catalogue/${slug}`);
}
