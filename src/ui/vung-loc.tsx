"use client";

import { createContext, useContext, useTransition, type ReactNode } from "react";

/**
 * Nối thanh bộ lọc với vùng kết quả, để lúc lọc thì kết quả tự mờ đi.
 *
 * VÌ SAO PHẢI CÓ NGƯỜI TRUNG GIAN: thanh bộ lọc là client component, còn bảng
 * kết quả do máy chủ dựng. Hai bên là anh em, không ai nhìn thấy trạng thái của
 * ai. Mà đổi bộ lọc lại là đổi tham số của CÙNG một trang, nên Next không hiện
 * khung loading — nó dựng lại tại chỗ và giữ nguyên màn hình cũ. Kết quả là gõ
 * vào ô tìm kiếm xong, danh sách cũ nằm im vài trăm mili giây trông y như thể
 * không có gì khớp.
 *
 * Làm mờ chứ không thay bằng khối xám: danh sách cũ vẫn còn đọc được, và số
 * dòng không đổi nên trang không giật. Người dùng thấy "cái này sắp được thay"
 * chứ không phải "cái này biến mất rồi".
 */

type Loc = {
  dangLoc: boolean;
  /** Chạy một lần điều hướng và tính nó là "đang lọc" cho tới khi xong. */
  chay: (viec: () => void) => void;
};

const O = createContext<Loc>({ dangLoc: false, chay: (viec) => viec() });

export function NguonLoc({ children }: { children: ReactNode }) {
  const [dangLoc, khoiDong] = useTransition();
  return (
    <O.Provider value={{ dangLoc, chay: khoiDong }}>{children}</O.Provider>
  );
}

export function useDangLoc(): Loc {
  return useContext(O);
}

/**
 * Bọc vùng kết quả. Không có NguonLoc bọc ngoài thì đây chỉ là một thẻ div
 * bình thường — nên đặt nhầm chỗ cũng không hỏng gì.
 */
export function KetQuaLoc({ children }: { children: ReactNode }) {
  const { dangLoc } = useDangLoc();
  return (
    <div
      aria-busy={dangLoc || undefined}
      className={`transition-opacity duration-200 ${
        // pointer-events-none: bảng đang mờ là bảng sắp bị thay. Cho bấm vào một
        // dòng sắp biến mất là mở ngăn chi tiết của thứ người dùng không chọn.
        dangLoc ? "pointer-events-none opacity-40" : ""
      }`}
    >
      {children}
    </div>
  );
}
