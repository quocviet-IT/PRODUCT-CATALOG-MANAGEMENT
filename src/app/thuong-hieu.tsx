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
}: {
  co?: keyof typeof CAO;
  /** Ten thuong hieu dang chu — cho trinh doc man hinh va khi anh khong tai duoc. */
  alt: string;
  lop?: string;
}) {
  const cao = CAO[co];
  const rong = Math.round((cao * RONG_GOC) / CAO_GOC);
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
