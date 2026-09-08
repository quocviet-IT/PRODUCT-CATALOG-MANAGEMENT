/**
 * Logo Hung Phat.
 *
 * Tep anh do `npm run logo` dung ra tu logo goc tren hungphatusa.com — xem
 * scripts/dung-logo.mts. Dung anh that chu khong go lai bang font khac: chu
 * "HUNG PHAT" tren web chinh co kieu chu rieng, ve lai bang Cormorant se ra
 * mot chu gan giong nhung khong phai no.
 *
 * Chu trong logo la mau hong thuong hieu (#E31C79) va nen trong suot, nen no
 * doc duoc tren ca ba tong cua trang khach: be, trang, va nen toi.
 *
 * KHONG dung next/image: anh nay nho (18 KB), kich thuoc co dinh, va nam tren
 * hau het cac trang — them mot vong toi ung dung toi uu anh khong duoc gi.
 */

/** Ty le that cua tep: 600x84. */
const RONG_GOC = 600;
const CAO_GOC = 84;

const CAO: Record<"nho" | "vua" | "lon", number> = {
  nho: 16,
  vua: 22,
  lon: 30,
};

export function Logo({
  co = "vua",
  alt,
  lop,
  theoMau = false,
}: {
  co?: keyof typeof CAO;
  /** Ten thuong hieu dang chu — cho trinh doc man hinh va khi anh khong tai duoc. */
  alt: string;
  lop?: string;
  /**
   * To chu theo mau chu hien hanh thay vi giu hong co dinh.
   *
   * Trang khach cho sale chon mau nhan; mot chu "HUNG PHAT" hong cung tren
   * catalogue tong xanh reu nhin nhu dan nham tu cho khac sang. Dung anh lam
   * MAT NA: kenh trong suot cua tep chinh la net chu, nen to lai bang
   * currentColor ra dung chu do — khong phai mot ban ve lai bang font khac.
   */
  theoMau?: boolean;
}) {
  const cao = CAO[co];
  const rong = Math.round((cao * RONG_GOC) / CAO_GOC);

  if (theoMau) {
    return (
      <span
        role="img"
        aria-label={alt}
        style={{
          width: rong,
          height: cao,
          backgroundColor: "currentColor",
          WebkitMaskImage: "url(/logo-hung-phat.png)",
          maskImage: "url(/logo-hung-phat.png)",
          WebkitMaskSize: "contain",
          maskSize: "contain",
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
        }}
        className={`block ${lop ?? ""}`}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo-hung-phat.png"
      alt={alt}
      width={rong}
      height={cao}
      // Khai ca width/height VA style: thuoc tinh de trinh duyet giu san cho
      // truoc khi anh ve toi, con style de lop tien ich khong keo no bien dang.
      style={{ width: rong, height: cao }}
      className={`block w-auto ${lop ?? ""}`}
    />
  );
}
