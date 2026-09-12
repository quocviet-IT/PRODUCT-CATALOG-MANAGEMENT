import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    /**
     * Than cua server action mac dinh chi 1 MB. Gop y co the kem mot anh chup
     * man hinh; anh chup o ti le 0,5 va nen JPEG thuong ra 80-250 KB, nhung
     * mot man hinh day anh mau co the vot len. 2 MB de con cho, va tang mot
     * lan thay vi lam nguoi bao loi phai thu lai ma khong hieu vi sao.
     *
     * Van duoi tran 4,5 MB cua Vercel. Tang nua thi phai xem lai ca duong nay:
     * mot gop y khong dang de mot ban ham om 4 MB trong bo nho.
     */
    serverActions: { bodySizeLimit: "2mb" },
  },
};

export default nextConfig;
