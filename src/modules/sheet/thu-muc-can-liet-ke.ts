/**
 * Thu muc nao can Apps Script liet ke (lai), va gop ket qua vao ban do.
 * Ham THUAN — test duoc.
 *
 * Truoc 11/09/2026 moi thu muc chi duoc liet ke MOT lan: co mat trong ban do la
 * "da xong" vinh vien. He qua: them hay bot anh BEN TRONG mot thu muc "Hinh da
 * xu ly" da co thi web khong bao gio thay — trong khi doi anh dang xu ly anh va
 * bo sung vao thu muc cu la chuyen hang ngay, va khong ai biet la thieu.
 *
 * Nay thu muc da liet ke qua HAN_LIET_KE_LAI_MS thi duoc liet ke lai. Moc thoi
 * gian nam o tep rieng (dong-bo/thu-muc-luc.json) de ban do anh giu nguyen hinh
 * dang — moi cho dang doc ban do khong phai sua.
 */

/** 30 phut. Voi 12 thu muc, moi vong liet ke lai mat khoang 15 giay. */
export const HAN_LIET_KE_LAI_MS = 30 * 60_000;

/**
 * Thu muc can liet ke: MOI (chua co trong ban do) truoc, roi CU (liet ke qua han)
 * — cu nhat truoc.
 *
 * Chi xet thu muc bang DANG tro toi (canCo). Thu muc con sot trong ban do ma
 * bang khong con dung toi thi khong bao gio liet ke lai — do la cong viec vut di.
 */
export function thuMucCanLietKe(
  canCo: readonly string[],
  daCo: Readonly<Record<string, unknown>>,
  lucLietKe: Readonly<Record<string, string>>,
  bayGio: number,
  hanMs: number = HAN_LIET_KE_LAI_MS,
): { moi: string[]; cu: string[] } {
  const moi: string[] = [];
  const cu: { id: string; luc: number }[] = [];
  const daXet = new Set<string>();

  for (const id of canCo) {
    if (daXet.has(id)) continue;
    daXet.add(id);
    if (!Object.prototype.hasOwnProperty.call(daCo, id)) {
      moi.push(id);
      continue;
    }
    // Khong co moc (liet ke tu truoc khi co tep moc) hay moc hong: coi nhu cu
    // nhat. Ban do vua chuyen sang co moc thi moi thu muc duoc lam moi mot luot.
    const doc = Date.parse(lucLietKe[id] ?? "");
    const luc = Number.isFinite(doc) ? doc : Number.NEGATIVE_INFINITY;
    if (bayGio - luc >= hanMs) cu.push({ id, luc });
  }

  cu.sort((a, b) => (a.luc === b.luc ? 0 : a.luc < b.luc ? -1 : 1));
  return { moi, cu: cu.map((x) => x.id) };
}

/**
 * Toi da bao nhieu thu muc CU (qua han) dua cho MOT luot Apps Script — 10 phut
 * mot luot.
 *
 * Liet ke lai ton gio chay Apps Script, ma han muc trigger 6 GIO/NGAY DUNG CHUNG
 * cho ca ba job: can no thi dongBoBang (moi phut) cung dung theo, het ngay.
 * DriveApp mat ~0,55 giay mot thu muc; bang tung tro toi 1.476 thu muc, liet ke
 * lai het moi 30 phut la ~10,8 gio chay moi ngay.
 *
 * Chan 30: toi da ~17 giay moi luot, ~40 phut moi ngay, bang lon co nao cung
 * vay. Doi lai, bang lon thi vong lam moi dai ra (300 thu muc: ~100 phut) thay
 * vi lam sap dong bo. Thu muc MOI khong bi chan: moi cai chi liet ke mot lan, va
 * la thu nguoi dung dang cho thay.
 */
export const SO_LIET_KE_LAI_MOI_LUOT = 30;

/** Danh sach cho mot luot: het thu muc MOI, roi toi da `toiDaCu` thu muc CU (cu nhat truoc). */
export function luotLietKe(
  { moi, cu }: { moi: readonly string[]; cu: readonly string[] },
  toiDaCu: number = SO_LIET_KE_LAI_MOI_LUOT,
): string[] {
  return [...moi, ...cu.slice(0, toiDaCu)];
}

/**
 * Gop mot lo vua liet ke vao ban do.
 *
 * MANG RONG KHONG DUOC XOA DANH SACH DANG CO. Apps Script gui [] ca khi thu muc
 * rong THAT lan khi no KHONG MO DUOC thu muc (loi Drive tam thoi, mat quyen) —
 * tu phia may chu khong phan biet duoc hai truong hop. Khi moi thu muc chi liet
 * ke mot lan thi khong sao; khi liet ke LAI moi 30 phut, mot lan Drive truc trac
 * se xoa sach thu vien anh cua mau dang nam tren catalogue.
 *
 * Nen: thu muc dang co anh ma nhan [] thi GIU NGUYEN (giuLai), va noi goi KHONG
 * duoc cap moc thoi gian cho no — luot sau se thu lai. Thu muc chua co, hoac dang
 * rong, thi nhan [] binh thuong: co mat trong ban do la thu ngan hoi lai mai.
 *
 * Khong sua dau vao.
 */
export function tronBanDo(
  cu: Readonly<Record<string, readonly unknown[]>>,
  them: Readonly<Record<string, readonly unknown[]>>,
): { banDo: Record<string, unknown[]>; daGhi: string[]; giuLai: string[] } {
  const banDo = { ...cu } as Record<string, unknown[]>;
  const daGhi: string[] = [];
  const giuLai: string[] = [];

  for (const [id, ds] of Object.entries(them)) {
    if (ds.length === 0 && (cu[id]?.length ?? 0) > 0) {
      giuLai.push(id);
      continue;
    }
    banDo[id] = [...ds];
    daGhi.push(id);
  }
  return { banDo, daGhi, giuLai };
}
