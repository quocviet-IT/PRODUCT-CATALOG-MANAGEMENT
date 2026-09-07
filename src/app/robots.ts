import type { MetadataRoute } from "next";

/**
 * Chan moi bot tren toan bo site. Catalogue dang mo cong khai vi chua lam
 * cong dang nhap, nhung du lieu ben trong la ma hang va trong luong vang cua
 * cong ty — khong duoc ra ket qua tim kiem.
 *
 * Tep nay mot minh KHONG du: robots.txt chi xin bot dung thu thap, con trang
 * da bi ai do dan link toi thi van co the vao chi muc. Cai thuc su chan la
 * the <meta name="robots" content="noindex"> khai o src/app/layout.tsx.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", disallow: "/" },
  };
}
