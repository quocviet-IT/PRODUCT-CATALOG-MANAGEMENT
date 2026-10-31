/**
 * Doc mot cu quet ngang tren man cam ung. Ham THUAN — test duoc.
 *
 * Tach khoi khung xem anh vi day la cho de hong AM THAM nhat cua ca tinh nang:
 * sai nguong thi moi lan cham tay anh nhay mot tam, sai phep so sanh doc/ngang
 * thi khach khong cuon trang duoc nua. Ca hai deu khong nem loi, khong hien ra
 * o bat ky man hinh nao, va chi phat hien duoc bang cach tu cam dien thoai quet
 * thu.
 */

/**
 * Quet ngan hon bay nhieu diem anh thi khong tinh la quet.
 *
 * 50 chu khong phai 20: ngon tay dat len man de CHAM cung xe ngang vai chuc
 * diem anh truoc khi nhac len. Lay nguong thap thi moi lan khach cham de dong
 * khung xem lai thanh doi anh.
 */
export const NGUONG_QUET_PX = 50;

export type Diem = { x: number; y: number };

/**
 * Buoc can di sau mot cu quet: 1 = anh sau, -1 = anh truoc, 0 = khong phai quet.
 *
 * Quet sang TRAI ra anh SAU, vi anh phai di theo ngon tay — keo tam dang xem ve
 * ben trai thi tam ke tiep lo ra tu ben phai. Lam nguoc lai thi dung ve co hoc
 * nhung nguoc voi moi ung dung anh khach da quen tay.
 */
export function huongQuet(batDau: Diem, ketThuc: Diem, nguong = NGUONG_QUET_PX): -1 | 0 | 1 {
  const dx = ketThuc.x - batDau.x;
  const dy = ketThuc.y - batDau.y;

  if (Math.abs(dx) < nguong) return 0;
  // Doc troi hon ngang thi nguoi dung dang CUON, khong phai doi anh. Cuop thao
  // tac nay thi ho vua khong cuon duoc vua khong hieu vi sao anh cu nhay.
  if (Math.abs(dx) <= Math.abs(dy)) return 0;

  return dx < 0 ? 1 : -1;
}

/**
 * Vi tri sau khi di `buoc` buoc, chay vong tron.
 *
 * Vong tron chu khong chan o hai dau: khach dang luot xem chu khong doc sach,
 * khong co ly do gi de bat ho dung lai o tam cuoi.
 */
/**
 * Mot "ban tay" dang quet: nho diem dat xuong, va nho rang vua quet xong.
 *
 * Phai co trang thai nen khong lam ham thuan duoc, nhung van tach khoi React de
 * test duoc — day la cho tinh nang quet de TU PHA CHINH NO: nhac tay xong,
 * trinh duyet con ban them mot cu click vao dung cho vua quet, ma click tren
 * nen la dong khung. Khong chan cu click do thi moi lan quet vua doi anh vua
 * tat khung, va nguoi dung khong bao gio quet duoc sang tam thu hai.
 */
export function taoTayQuet() {
  let batDau: Diem | null = null;
  let vuaQuet = false;

  return {
    chamXuong(diem: Diem): void {
      batDau = diem;
    },

    /** Buoc can di sau khi nhac tay. Nho luon rang day co phai mot cu quet khong. */
    nhacTay(diem: Diem): -1 | 0 | 1 {
      const dau = batDau;
      batDau = null;
      if (!dau) return 0;

      const buoc = huongQuet(dau, diem);
      if (buoc !== 0) vuaQuet = true;
      return buoc;
    },

    /**
     * Cu click vua toi co duoc phep dong khung khong.
     *
     * Chan DUNG MOT cu — cu ngay sau lan quet. Chan mai thi nguoi dung quet mot
     * cai roi khong con dong khung bang cach cham nen duoc nua.
     */
    nenDong(): boolean {
      if (!vuaQuet) return true;
      vuaQuet = false;
      return false;
    },
  };
}

export function viTriKeTiep(viTri: number, buoc: number, soAnh: number): number {
  // (0 + 1 + 0) % 0 ra NaN, va NaN lam chi so thi anh[NaN] la undefined — khung
  // xem trang tron, khong mot loi bao nao.
  if (soAnh <= 0) return 0;
  return (viTri + buoc + soAnh) % soAnh;
}
