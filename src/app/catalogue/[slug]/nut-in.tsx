"use client";

import { useEffect } from "react";

/**
 * Mo san hop thoai in khi duong dan co "?in=1".
 *
 * KHACH KHONG THAY NUT NAO. Link gui khach la de xem, khong phai de tai tep —
 * mot nut "Tai PDF" tren do vua thua vua de khien khach tuong minh phai tai gi
 * do moi xem duoc. Chi sale, tu man hinh cua ho, moi mo duong dan kem ?in=1;
 * khach nhan link tran nen khong bao gio gap hop thoai nay.
 *
 * Vi sao khong sinh PDF o may chu: sinh PDF that can headless Chrome ~50MB tren
 * Vercel, hoac phai tu dat tung dong chu kem nhung font tieng Viet. Duong nay
 * khong them thu vien nao, va ban in luon khop voi trang that.
 */
export function MoHopThoaiIn() {
  useEffect(() => {
    // Doi mot nhip cho anh kip ve; in ngay se ra ban thieu anh.
    const h = setTimeout(() => window.print(), 800);
    return () => clearTimeout(h);
  }, []);
  return null;
}
