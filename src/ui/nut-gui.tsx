"use client";

import { useFormStatus } from "react-dom";

/**
 * Nút gửi form, tự đổi nhãn trong lúc chờ máy chủ trả lời.
 *
 * Đổi NHÃN chứ không thêm vòng xoay: hệ thống này viết bằng chữ chân phương và
 * khoảng trắng, một cái vòng quay tít trong nút là thứ duy nhất trên màn hình
 * chuyển động — nó kéo mắt về phía mình đúng lúc người dùng không cần nhìn nó.
 * Nhãn đổi từ "TẠO CATALOGUE" thành "ĐANG TẠO" thì vừa đủ để biết máy đã nhận,
 * mà vẫn im lặng.
 *
 * Nhãn chờ nên DÀI XẤP XỈ nhãn thường: nút co lại giữa lúc bấm thì mọi thứ bên
 * cạnh nó xê dịch theo.
 *
 * `dangChay` để cho những nơi đã có sẵn trạng thái chờ từ useActionState hoặc
 * useTransition. Không truyền thì nút tự đọc trạng thái của form nó nằm trong.
 */
export function NutGui({
  nhanCho,
  dangChay,
  tat,
  lop,
  children,
  ...conLai
}: {
  /** Nhãn hiện trong lúc chờ. */
  nhanCho: React.ReactNode;
  /** Trạng thái chờ lấy từ bên ngoài, gộp với trạng thái của form. */
  dangChay?: boolean;
  /** Tắt nút vì lý do khác (chưa chọn gì, không đủ quyền…). */
  tat?: boolean;
  lop?: string;
  children: React.ReactNode;
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "disabled" | "className">) {
  const { pending } = useFormStatus();
  const cho = pending || dangChay === true;

  return (
    <button
      type="submit"
      disabled={cho || tat === true}
      aria-busy={cho}
      className={lop}
      {...conLai}
    >
      {cho ? nhanCho : children}
    </button>
  );
}
