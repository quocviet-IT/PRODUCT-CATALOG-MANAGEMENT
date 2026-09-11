/**
 * DONG BO CATALOGUE  —  Google Sheets/Drive  ->  hpcatalogue.app
 * =============================================================
 *
 * VI SAO LAI LA APPS SCRIPT
 * Workspace cua cong ty cam chia se tep ra ngoai ten mien, nen khong moi duoc
 * tai khoan may (service account) vao cac Shared Drive. Cach con lai la bat uy
 * quyen toan mien, ma cai do phai vao Admin Console. Apps Script chay BEN
 * TRONG Google voi tu cach chinh nhan vien dang so huu script, va chi goi RA
 * ngoai — khong dinh chinh sach nao ca.
 *
 * He qua tot: Vercel khong giu mot thong tin dang nhap Google nao. Neu web co
 * bi lo thi ke tan cong van khong cham duoc vao Drive cong ty.
 *
 * CAI DAT (lam mot lan)
 *  1. script.google.com -> New project -> dan toan bo tep nay de len Code.gs
 *  2. Project Settings -> Script Properties -> Add script property, bon dong:
 *       URL_WEB    https://hpcatalogue.app
 *       KHOA       <chuoi bi mat, giong het bien DONG_BO_SECRET tren Vercel>
 *       SHEET_ID   <ID bang tinh, doan giua /d/ va /edit tren thanh dia chi>
 *       TAB        Catalogue-OL
 *  3. Cot trai, muc Services -> dau + -> them "Google Sheets API", roi them
 *     tiep "Drive API".
 *
 *     BAT BUOC, va day la cho de vap nhat. Script goi Sheets/Drive qua REST
 *     (xem chu thich o docBangTho_ va taiAnhBase64_), ma REST thi doi API phai
 *     duoc bat trong du an Cloud AN ma Apps Script tu tao. SpreadsheetApp va
 *     DriveApp van chay binh thuong nen rat de tuong la da du quyen — roi
 *     dung phat 403 "Google Sheets API has not been used in project ...".
 *     Them Service o day chinh la cai cong tac do.
 *  4. Chon ham chayThuMotLan roi bam Run. Google se hoi cap quyen — dong y.
 *  5. Chon ham datLichChay roi bam Run. Tu day no tu chay.
 *
 * BA LICH CHAY: dongBoBang moi phut (bang tinh), dongBoThuMuc moi 10 phut (liet
 * ke thu muc anh, chay dan cho toi khi het), dongBoAnh moi 5 phut (nap anh vao
 * bo dem). Lan dau day du mat khoang mot tieng.
 *
 * NOI BUOC (tu 11/09/2026): khi dongBoBang thay bang tinh THAT SU doi, no liet ke
 * luon thu muc cot Q MOI va day anh ngay trong luot do — dong moi hien du anh sau
 * khoang 1-2 phut thay vi 8-16 phut. Hai lich kia van giu de du phong. Bang khong
 * doi thi khong ton them loi goi nao. Xem noiBuoc_.
 *
 * CAP NHAT TU BAN CU: dan de toan bo tep nay len Code.gs roi bam Save. Ten ba ham
 * lich chay khong doi, nen KHONG can chay lai datLichChay.
 *
 * KHOA BI MAT nam trong Script Properties chu khong trong ma nguon: ma nguon
 * co the bi chia se, sao chep, dan vao chat.
 */

// ---------------------------------------------------------------------------
// Cau hinh
// ---------------------------------------------------------------------------

/** Ngan sach thoi gian moi luot. Apps Script cat ngang o khoang 6 phut. */
var NGAN_SACH_MS = 4.5 * 60 * 1000;

/**
 * Ngan sach RIENG cho buoc nap anh, ngan hon phan con lai. CO LY DO.
 *
 * Buoc nay chay moi 5 phut (xem datLichChay). Neu van dung 4,5 phut nhu cu thi
 * mot luot cong voi do tre khoi dong se lan sang luot ke tiep, va hai luot chay
 * chong nhau se cung hoi mot danh sach anh thieu roi tai VE CUNG NHUNG ANH DO —
 * dot hai lan han muc de duoc dung mot lan viec.
 *
 * 4 phut de lai mot phut cach ly, du cho mot luot ket thuc truoc khi luot sau
 * bat dau.
 */
var NGAN_SACH_ANH_MS = 4 * 60 * 1000;

/**
 * Ngan sach cua duong NOI BUOC, chay ben trong dongBoBang.
 *
 * Nho hon hai lich du phong: noi buoc chi can lo cho DONG MOI — thuong mot vai
 * thu muc va vai chuc anh. Phan ton dong (bang tinh vua dan them hang tram dong)
 * de lich 10 phut va 5 phut lo theo nhip cua chung. Cong lai duoi 4,5 phut, xa
 * tran 6 phut cua mot luot.
 */
var NGAN_SACH_NOI_THU_MUC_MS = 60 * 1000;
var NGAN_SACH_NOI_ANH_MS = 3 * 60 * 1000;

/**
 * Mot "cho" (xem giuCho_) giu lau nhat bang mot luot Apps Script dai nhat (6
 * phut). Apps Script giet luot qua han ma KHONG chay finally, nen cho khong co
 * han se khoa viec do mai mai sau mot lan bi giet.
 */
var HAN_GIU_CHO_MS = 6 * 60 * 1000;

/** Script Property danh dau "bang vua doi, can noi buoc". Gia tri la moc ms. */
var KHOA_CAN_NOI = 'CAN_NOI';

/**
 * Bao nhieu anh mot goi tin. Vercel chan than yeu cau o 4,5 MB va base64 lam
 * phinh anh them mot phan ba. Doi so nay thi phai doi ca trong
 * src/app/api/dong-bo/anh/route.ts.
 */
var SO_ANH_MOI_LAN = 6;
/**
 * Tran base64 cho MOT goi tin. Phai kiem TRUOC khi them anh vao lo, khong phai
 * sau: kiem sau thi mot lo dang o 2,99 MB nhan them mot tam 2 MB la thanh gan
 * 5 MB, va Vercel tra 413 FUNCTION_PAYLOAD_TOO_LARGE. Da xay ra that
 * (10/09/2026) khi bang tinh lon ra va keo theo nhung thu muc co anh nang hon.
 */
var BYTE_MOI_GOI = 3 * 1024 * 1024;
/**
 * Mot tam anh ma rieng no da vuot tran thi khong goi tin nao chua noi. Bo qua
 * va bao ro ten tep, con hon de no chan ca hang doi mai mai.
 */
var BYTE_MOI_ANH = BYTE_MOI_GOI;

/**
 * Bao nhieu thu muc gui mot goi. Doi so nay thi phai doi ca SO_THU_MUC_MOI_LAN
 * trong src/app/api/dong-bo/anh-thu-muc/route.ts.
 */
/**
 * So thu muc moi lan day len — CO Y de nho.
 *
 * Do that tren ban chay that (log 11:14–11:18 ngay 10/09/2026): liet ke mot thu
 * muc Drive mat khoang 1,2 giay, khong phai 0,55 giay nhu uoc tinh cu. Voi lo
 * 200 cai thi phai 4 PHUT 6 GIAY moi luu duoc lan dau — gan het ca ngan sach
 * 4,5 phut cua mot luot. Nghia la mot luot chet o thu muc thu 199 luu duoc so
 * KHONG.
 *
 * Do dung la dieu da xay ra: trong luc trang web treo, moi luot deu chet truoc
 * khi kip day, nen job nay dung im 40 phut trong khi job anh — day moi 6 anh
 * mot lan — van chay binh thuong.
 *
 * 50 cai thi cu khoang mot phut luu mot lan. Ton them vai loi goi mang (khong
 * dang ke, moi loi goi duoi mot giay), doi lai mot truc trac chi lam mat mot
 * phut cong thay vi ca luot.
 */
var SO_THU_MUC_MOI_GOI = 50;

/**
 * May chu tu choi mot thu muc mang qua 500 anh, va tu choi CA LO.
 *
 * Cat o day chu khong de may chu tu choi: mot lo bi tu choi la ca luot chay
 * chet, va luot sau lai hoi dung nhung thu muc do — ket vinh vien. Thu muc lon
 * nhat hien nay moi 166 anh, nhung cai chan nay phai co truoc khi co cai thu
 * 501, chu khong phai sau.
 */
var SO_ANH_MOI_THU_MUC = 500;

/**
 * Tran than yeu cau cua Vercel la 4,5 MB. Giu duoi 3 MB cho chac.
 *
 * Lo 200 thu muc lon nhat hien nay chi 0,45 MB, nhung so thu muc moi lo la mot
 * con so DEM chu khong phai con so BYTE — gap mot cum thu muc nhieu anh la
 * vuot, va 413 thi ca lo mat trang. Da dinh dung lo nay o duong anh hom truoc.
 */
var BYTE_MOI_GOI_THU_MUC = 3 * 1024 * 1024;

/**
 * Ban thumbnail xin cua Drive. Web chi hien toi 1400px, nen xin dung 1400 —
 * xin 1600 nhu truoc la moi tam nang them khoang mot phan tu ma khong them mot
 * diem net nao, va chinh cho do day goi tin vuot tran.
 */
var RONG_THUMBNAIL = 1400;
/** Co lui khi mot tam o 1400px van qua nang cho mot goi tin. */
var RONG_THUMBNAIL_NHO = 900;

/**
 * Nhung tang du lieu can lay trong MOT lan goi.
 *
 * chipRuns la bat buoc: lien ket cua "chip" Drive (thu chen bang @ hoac keo tep
 * tu Drive vao o) KHONG nam trong hyperlink. Cot thu muc anh dung ca hai kieu,
 * bo chipRuns ra thi nhung dong dung chip mat thu vien anh ma khong bao loi gi.
 */
var FIELD_MASK =
  'sheets.data.rowData.values(formattedValue,userEnteredValue,hyperlink,chipRuns)';

function cauHinh_() {
  var p = PropertiesService.getScriptProperties();
  var c = {
    urlWeb: String(p.getProperty('URL_WEB') || '').replace(/\/+$/, ''),
    khoa: String(p.getProperty('KHOA') || ''),
    sheetId: String(p.getProperty('SHEET_ID') || ''),
    tab: String(p.getProperty('TAB') || ''),
  };
  var thieu = [];
  if (!c.urlWeb) thieu.push('URL_WEB');
  if (!c.khoa) thieu.push('KHOA');
  if (!c.sheetId) thieu.push('SHEET_ID');
  if (!c.tab) thieu.push('TAB');
  if (thieu.length) {
    throw new Error(
      'Thieu Script Property: ' + thieu.join(', ') +
      '. Vao Project Settings > Script Properties de them.');
  }
  return c;
}

// ---------------------------------------------------------------------------
// Goi sang web
// ---------------------------------------------------------------------------

function goiWeb_(c, duong, than) {
  var res = UrlFetchApp.fetch(c.urlWeb + duong, {
    method: 'post',
    contentType: 'application/json',
    headers: { Authorization: 'Bearer ' + c.khoa },
    payload: JSON.stringify(than),
    muteHttpExceptions: true,
  });
  var ma = res.getResponseCode();
  var chu = res.getContentText();
  if (ma !== 200) {
    // Cat bot phan hoi: mot trang loi HTML dai hang chuc nghin ky tu lam ngap
    // nhat ky va che mat cac dong khac.
    throw new Error(duong + ' tra ve ' + ma + ': ' + chu.substring(0, 300));
  }
  return JSON.parse(chu);
}

// ---------------------------------------------------------------------------
// Chong chay chong
// ---------------------------------------------------------------------------

/**
 * Giu "cho" cho mot viec nang ('THU_MUC' hoac 'ANH'). Tra false khi dang co
 * mot luot khac giu cho do — nguoi goi phai bo qua luot nay.
 *
 * VI SAO CAN: tu khi co noi buoc, dongBoBang moi phut co the tu lam hai viec
 * nay, trong luc lich 10 phut va 5 phut van chay du phong. Khong giu cho thi hai
 * luot cung hoi mot danh sach anh thieu roi tai VE CUNG NHUNG ANH DO — dot hai
 * lan han muc de duoc dung mot lan viec.
 *
 * Moi viec MOT cho rieng, khong khoa chung ca luot bang LockService: liet ke thu
 * muc va day anh la hai viec khac nhau, van chay song song duoc nhu truoc. Khoa
 * chung thi luot anh phai dung cho luot thu muc 4,5 phut.
 *
 * LockService chi dung de doc-roi-ghi Script Property cho nguyen tu, giu trong
 * vai mili giay. Cho co han — xem HAN_GIU_CHO_MS.
 */
function giuCho_(ten) {
  var khoa = LockService.getScriptLock();
  if (!khoa.tryLock(10 * 1000)) return false;
  try {
    var p = PropertiesService.getScriptProperties();
    var het = Number(p.getProperty('CHO_' + ten) || 0);
    if (het > Date.now()) return false;
    p.setProperty('CHO_' + ten, String(Date.now() + HAN_GIU_CHO_MS));
    return true;
  } finally {
    khoa.releaseLock();
  }
}

function traCho_(ten) {
  PropertiesService.getScriptProperties().deleteProperty('CHO_' + ten);
}

function danhDauCanNoi_() {
  PropertiesService.getScriptProperties().setProperty(KHOA_CAN_NOI, String(Date.now()));
}

/**
 * Xoa dau "can noi buoc" CHI KHI no van la cai minh da doc luc bat dau. Neu trong
 * luc dang noi, bang tinh lai doi va mot luot dongBoBang khac da dat dau moi, thi
 * lan sua do can mot luot noi rieng — xoa di la bo quen no.
 */
function xoaDauNeuChuaDoi_(dau) {
  var khoa = LockService.getScriptLock();
  // Khong lay duoc khoa thi de nguyen dau: phut sau noi them mot luot, ton vai
  // loi goi, con hon lam mat mot lan sua bang.
  if (!khoa.tryLock(10 * 1000)) return;
  try {
    var p = PropertiesService.getScriptProperties();
    if (p.getProperty(KHOA_CAN_NOI) === dau) p.deleteProperty(KHOA_CAN_NOI);
  } finally {
    khoa.releaseLock();
  }
}

// ---------------------------------------------------------------------------
// Doc bang tinh
// ---------------------------------------------------------------------------

/**
 * Boc ten tab theo cu phap pham vi A1: dat trong dau nhay don, moi dau nhay
 * don co san trong ten phai nhan doi.
 */
function boPhamViA1_(tab) {
  return "'" + String(tab).replace(/'/g, "''") + "'";
}

function docBangTho_(c) {
  // Mo bang bang SpreadsheetApp truoc, vi hai le do:
  //  1. Bao loi ro rang ngay khi SHEET_ID sai hoac quyen bi thu hoi, thay vi
  //     mot ma 404 tho tu REST API.
  //  2. Apps Script quyet dinh xin quyen gi bang cach DOC MA NGUON. Chi goi
  //     UrlFetchApp thi no khong biet script can quyen bang tinh, va token
  //     ScriptApp.getOAuthToken() se thieu pham vi do.
  var ten = SpreadsheetApp.openById(c.sheetId).getName();
  Logger.log('Bang tinh: ' + ten);

  var url =
    'https://sheets.googleapis.com/v4/spreadsheets/' + encodeURIComponent(c.sheetId) +
    '?ranges=' + encodeURIComponent(boPhamViA1_(c.tab)) +
    '&includeGridData=true&fields=' + encodeURIComponent(FIELD_MASK);

  var res = UrlFetchApp.fetch(url, {
    headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() },
    muteHttpExceptions: true,
  });
  if (res.getResponseCode() !== 200) {
    throw new Error(
      'Khong doc duoc bang tinh (' + res.getResponseCode() + '): ' +
      res.getContentText().substring(0, 300));
  }

  var body = JSON.parse(res.getContentText());
  var sheets = body.sheets || [];
  var data = (sheets[0] || {}).data || [];
  var rowData = (data[0] || {}).rowData || [];
  var hang = [];
  for (var i = 0; i < rowData.length; i++) hang.push(rowData[i].values || []);
  return hang;
}

// ---------------------------------------------------------------------------
// Liet ke anh trong thu muc Drive
// ---------------------------------------------------------------------------

/**
 * Dung DriveApp chu khong phai Drive REST: DriveApp vao duoc Shared Drive,
 * ngan gon hon, va — nhu tren — no la thu khien Apps Script xin quyen Drive
 * cho token ma ham tai anh ben duoi can toi.
 */
function lietKeAnh_(idThuMuc) {
  var ds = [];
  var it = DriveApp.getFolderById(idThuMuc).getFiles();
  while (it.hasNext()) {
    var f = it.next();
    if (String(f.getMimeType()).indexOf('image/') === 0) {
      ds.push({ fileId: f.getId(), ten: f.getName() });
      // Dung han o nguong may chu chap nhan. Doc them roi de may chu tu choi
      // ca lo thi vua ton thoi gian vua lam ket hang doi.
      if (ds.length >= SO_ANH_MOI_THU_MUC) {
        Logger.log('  thu muc ' + idThuMuc + ' co hon ' + SO_ANH_MOI_THU_MUC + ' anh, cat bot.');
        break;
      }
    }
  }
  return ds;
}

// ---------------------------------------------------------------------------
// Buoc 1: day bang tinh + danh sach anh
// ---------------------------------------------------------------------------

/**
 * Bang tinh moi phut, ~2 giay — va NOI BUOC khi bang vua doi.
 *
 * Day la ham chay moi phut, va la ham DUY NHAT dung toi bang tinh. Viec liet ke
 * thu muc anh va day anh nam o dongBoThuMuc / dongBoAnh: chung ton hang phut, con
 * doc bang tinh chi ton vai giay. Ham nay chi GOI toi chung qua noiBuoc_, va chi
 * khi bang that su doi.
 */
function dongBoBang() {
  var c = cauHinh_();
  var hang = docBangTho_(c);
  var kq = goiWeb_(c, '/api/dong-bo/du-lieu', { hang: hang });
  Logger.log(
    kq.doiBang
      ? 'BANG TINH DA DOI -> da day ' + kq.soDong + ' dong.'
      : 'Bang tinh khong doi (' + kq.soDong + ' dong).');

  if (kq.doiBang) danhDauCanNoi_();
  // Loi o duong noi KHONG duoc lam hong luot bang tinh: bang da day xong roi, va
  // hai lich du phong van chay — loi that se hien ra o luot cua chung.
  try {
    noiBuoc_(c);
  } catch (e) {
    Logger.log('NOI BUOC loi, de lich du phong lam: ' + e);
  }
  return kq;
}

/**
 * NOI BUOC — dong moi hien du anh sau khoang 1-2 phut thay vi 8-16 phut.
 *
 * Truoc day mot dong moi phai CHO lan luot qua ba lich rieng: bang (<=1 phut) ->
 * liet ke thu muc (<=10 phut) -> day anh (<=5 phut). Gan nhu toan bo thoi gian la
 * ngoi cho toi luot, khong phai lam viec.
 *
 * Nay khi dongBoBang thay bang doi, no dat dau CAN_NOI roi lam luon: liet ke CHI
 * thu muc MOI, roi day anh. Dau chi duoc xoa khi buoc day anh da chay — neu mot
 * lich du phong dang giu cho thi de nguyen dau, phut sau thu lai.
 *
 * Bang KHONG doi va khong con dau: ham nay chi doc mot Script Property roi thoi,
 * khong mot loi goi mang nao.
 */
function noiBuoc_(c) {
  var dau = PropertiesService.getScriptProperties().getProperty(KHOA_CAN_NOI);
  if (!dau) return null;

  if (!giuCho_('THU_MUC')) {
    Logger.log('NOI BUOC: dang co luot liet ke thu muc khac, phut sau thu lai.');
    return null;
  }
  try {
    lietKeThuMuc_(c, NGAN_SACH_NOI_THU_MUC_MS, true);
  } finally {
    traCho_('THU_MUC');
  }

  if (!giuCho_('ANH')) {
    // Luot day anh dang chay da hoi danh sach anh thieu TRUOC khi thu muc moi
    // duoc liet ke, nen no khong lo anh cua dong moi. Giu dau de phut sau lam.
    Logger.log('NOI BUOC: dang co luot day anh khac, phut sau thu lai.');
    return null;
  }
  var kq;
  try {
    kq = dayAnh_(c, NGAN_SACH_NOI_ANH_MS);
  } finally {
    traCho_('ANH');
  }

  xoaDauNeuChuaDoi_(dau);
  return kq;
}

/**
 * Liet ke thu muc anh — lich 10 phut, CHAY DAN qua nhieu luot.
 *
 * VI SAO PHAI CHIA LO: bang tinh lon tu 71 len 1.854 mau, tro toi 1.476 thu muc
 * Drive. DriveApp liet ke mat khoang nua giay mot thu muc — hon 13 phut cho ca
 * luot, ma Apps Script cat ngang o 6 phut. Ban cu lam het trong MOT ham nen no
 * chet giua chung va khong bao gio toi buoc gui ket qua: ban do thu muc dong
 * bang o 65 cai tu hoi bang con nho, va 1.625 mau mat sach thu vien anh.
 *
 * Gio moi luot hoi "con thieu cai nao", lam duoc bao nhieu thi gui bay nhieu,
 * va cong GOP THEM chu khong ghi de. Vai luot la day.
 */
function dongBoThuMuc() {
  if (!giuCho_('THU_MUC')) {
    Logger.log('Dang co mot luot liet ke thu muc khac chay, bo qua luot nay.');
    return { xong: 0, hong: 0, boQua: true };
  }
  try {
    return lietKeThuMuc_(cauHinh_(), NGAN_SACH_MS, false);
  } finally {
    traCho_('THU_MUC');
  }
}

/**
 * chiMoi = true: CHI nhung thu muc chua liet ke lan nao — thu muc cua dong moi.
 * Duong noi buoc dung che do nay. May chu xep them toi 30 thu muc QUA HAN phia
 * sau thu muc moi (liet ke lai moi 30 phut); lam ca phan do moi lan bang doi la
 * dot han muc vao viec lich 10 phut da lo. Doc so thu muc moi tu soMoi; may chu
 * cu chua tra soMoi thi coi nhu 0 — khong liet ke gi, van an toan.
 */
function lietKeThuMuc_(c, nganSachMs, chiMoi) {
  var het = Date.now() + nganSachMs;

  var hoi = goiWeb_(c, '/api/dong-bo/thieu-thu-muc', {});
  var soMoi = hoi.soMoi || 0;
  var thieu = chiMoi ? hoi.thieu.slice(0, soMoi) : hoi.thieu;
  var tongCanLam = chiMoi ? soMoi : hoi.tongThieu;
  Logger.log(
    (chiMoi ? 'NOI BUOC: ' + soMoi + ' thu muc moi' : 'Thieu ' + hoi.tongThieu + '/' + hoi.tong + ' thu muc') +
    '; luot nay lam toi ' + thieu.length + ' cai.');
  if (!thieu.length) return { xong: 0, hong: 0, conLai: 0 };

  var lo = {};
  var soTrongLo = 0;
  var byteLo = 0;
  var xong = 0;
  var hong = 0;

  function guiLo_() {
    if (soTrongLo === 0) return;
    var kq = goiWeb_(c, '/api/dong-bo/anh-thu-muc', { anhThuMuc: lo });
    xong += soTrongLo;
    Logger.log('  da gui ' + soTrongLo + ' thu muc; ban do co ' + kq.tong + ' cai.');
    lo = {};
    soTrongLo = 0;
    byteLo = 0;
  }

  for (var i = 0; i < thieu.length; i++) {
    if (Date.now() > het) break;
    var id = thieu[i];
    try {
      // Thu muc RONG van phai gui len (mang rong). Co mat trong ban do nghia la
      // "da liet ke roi" — thieu buoc do thi luot sau lai hoi dung nhung thu muc
      // rong nay, mai mai.
      lo[id] = lietKeAnh_(id);
    } catch (e) {
      // Thu muc bi xoa hay doi quyen: van danh dau la da xet, khong thi no chan
      // ca hang doi o moi luot chay.
      lo[id] = [];
      hong++;
      Logger.log('  khong liet ke duoc ' + id + ': ' + e);
    }
    // Do TRUOC khi them, giong duong anh: do sau khi them thi lo da qua tran
    // roi moi phat hien, va lan gui do nhan 413.
    var themByte = JSON.stringify(lo[id]).length + id.length + 8;
    if (soTrongLo > 0 && byteLo + themByte > BYTE_MOI_GOI_THU_MUC) {
      var giu = lo[id];
      delete lo[id];
      guiLo_();
      lo[id] = giu;
    }
    byteLo += themByte;
    soTrongLo++;
    if (soTrongLo >= SO_THU_MUC_MOI_GOI) guiLo_();
  }
  guiLo_();

  Logger.log(
    'DA LIET KE: ' + xong + ' thu muc' + (hong ? ' (' + hong + ' cai loi)' : '') +
    ', con lai ~' + (tongCanLam - xong) + '.');
  return { xong: xong, hong: hong, conLai: tongCanLam - xong };
}

// ---------------------------------------------------------------------------
// Buoc 2: day anh, theo lo
// ---------------------------------------------------------------------------

/**
 * Bytes cua mot anh, ma hoa base64. Tra null neu khong lay duoc.
 *
 * Luon lay thumbnailLink chu khong lay ban goc, vi hai le:
 *  - Hai Shared Drive chua anh san pham dat downloadRestriction, co do chan
 *    tai ban goc doi voi mot so vai tro nhung KHONG chan thumbnail.
 *  - Ban goc nang vai MB toi hon chuc MB. Web chi hien toi 1400px, nen gui ban
 *    goc la ton bang thong ma khong them mot diem net nao.
 */
function taiAnhBase64_(fileId, rong) {
  var url =
    'https://www.googleapis.com/drive/v3/files/' + encodeURIComponent(fileId) +
    '?supportsAllDrives=true&fields=thumbnailLink';
  var res = UrlFetchApp.fetch(url, {
    headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() },
    muteHttpExceptions: true,
  });
  if (res.getResponseCode() !== 200) return null;

  var link = JSON.parse(res.getContentText()).thumbnailLink;
  if (!link) return null;

  // thumbnailLink co san hau to kich thuoc (vi du "=s220") — thay bang co minh
  // can. Link nay tai duoc ma khong can gui token.
  var anh = UrlFetchApp.fetch(link.replace(/=[^=]*$/, '=w' + (rong || RONG_THUMBNAIL)), {
    muteHttpExceptions: true,
  });
  if (anh.getResponseCode() !== 200) return null;
  return Utilities.base64Encode(anh.getBlob().getBytes());
}

/** Nap anh vao bo dem — lich 5 phut. */
function dongBoAnh() {
  if (!giuCho_('ANH')) {
    Logger.log('Dang co mot luot day anh khac chay, bo qua luot nay.');
    return { xong: 0, hong: 0, conLai: 0, boQua: true };
  }
  try {
    return dayAnh_(cauHinh_(), NGAN_SACH_ANH_MS);
  } finally {
    traCho_('ANH');
  }
}

function dayAnh_(c, nganSachMs) {
  var het = Date.now() + nganSachMs;

  var hoi = goiWeb_(c, '/api/dong-bo/thieu-anh', {});
  Logger.log(
    'Thieu ' + hoi.tongThieu + '/' + hoi.tongAnh + ' anh; luot nay lam toi ' +
    hoi.thieu.length + ' tam.');
  if (!hoi.thieu.length) return { xong: 0, hong: 0, conLai: 0 };

  var xong = 0;
  var hong = 0;
  var lo = [];
  var byteLo = 0;
  var i = 0;

  for (; i < hoi.thieu.length; i++) {
    if (Date.now() > het) break;

    var id = hoi.thieu[i];
    var b64 = null;
    try {
      b64 = taiAnhBase64_(id, RONG_THUMBNAIL);
      // Rieng mot tam ma da vuot tran goi tin thi khong lo nao chua noi. Thu
      // lai o co nho hon thay vi bo han: bo han la lan sau /thieu-anh van tra
      // no ve, va no chiem mot cho trong moi luot chay, mai mai.
      if (b64 && b64.length > BYTE_MOI_ANH) {
        Logger.log('  ' + id + ' nang ' + Math.round(b64.length / 1024) +
                   ' KB, thu lai o ' + RONG_THUMBNAIL_NHO + 'px.');
        b64 = taiAnhBase64_(id, RONG_THUMBNAIL_NHO);
      }
    } catch (e) {
      Logger.log('Loi tai anh ' + id + ': ' + e);
    }
    if (!b64) { hong++; continue; }

    if (b64.length > BYTE_MOI_ANH) {
      hong++;
      Logger.log('Bo qua ' + id + ': van ' + Math.round(b64.length / 1024) +
                 ' KB sau khi thu nho, khong goi tin nao chua noi.');
      continue;
    }

    // Gui lo dang co TRUOC khi them tam nay, neu them vao la vuot tran.
    if (lo.length > 0 && byteLo + b64.length > BYTE_MOI_GOI) {
      var truoc = goiWeb_(c, '/api/dong-bo/anh', { anh: lo });
      xong += truoc.xong;
      hong += truoc.hong.length;
      lo = [];
      byteLo = 0;
    }

    lo.push({ fileId: id, duLieu: b64 });
    byteLo += b64.length;

    if (lo.length >= SO_ANH_MOI_LAN) {
      var kq = goiWeb_(c, '/api/dong-bo/anh', { anh: lo });
      xong += kq.xong;
      hong += kq.hong.length;
      lo = [];
      byteLo = 0;
    }
  }
  if (lo.length) {
    var cuoi = goiWeb_(c, '/api/dong-bo/anh', { anh: lo });
    xong += cuoi.xong;
    hong += cuoi.hong.length;
  }

  var conLai = hoi.tongThieu - xong;
  Logger.log('DA DAY ANH: ' + xong + ' tam, ' + hong + ' tam hong, con lai ~' + conLai + '.');
  return { xong: xong, hong: hong, conLai: conLai };
}

// ---------------------------------------------------------------------------
// Lich chay
// ---------------------------------------------------------------------------

/**
 * Xoa het lich cu roi dat lai. Chay lai ham nay bao nhieu lan cung duoc — no
 * khong bao gio de lai hai lich chong nhau, va lich chong nhau tren Apps Script
 * la cach de nhat de dot het han muc goi ra ngoai trong mot buoi sang.
 */
function datLichChay() {
  var cu = ScriptApp.getProjectTriggers();
  for (var i = 0; i < cu.length; i++) ScriptApp.deleteTrigger(cu[i]);

  // Cho giu va dau noi buoc con sot tu mot luot bi giet: dat lai lich la bat dau
  // sach, khong de mot cho cu chan viec toi 6 phut.
  var p = PropertiesService.getScriptProperties();
  p.deleteProperty('CHO_THU_MUC');
  p.deleteProperty('CHO_ANH');
  p.deleteProperty(KHOA_CAN_NOI);

  // Bang tinh: moi phut. Day la thu nguoi dung sua va cho thay ket qua.
  ScriptApp.newTrigger('dongBoBang').timeBased().everyMinutes(1).create();
  // Liet ke thu muc anh, chay dan. Cung nhip voi phan nap anh.
  ScriptApp.newTrigger('dongBoThuMuc').timeBased().everyMinutes(10).create();
  /**
   * Anh: MOI 5 PHUT, gap doi phan con lai.
   *
   * Con khoang 30.000 anh phai nap lan dau. O nhip 10 phut, do that duoc 957
   * anh moi gio — het khoang 32 gio. Nhip 5 phut rut xuong con khoang 16 gio.
   *
   * Han muc UrlFetch cua tai khoan Workspace la 100.000 luot mot ngay. O nhip
   * nay: bang tinh 1.440, thu muc ~900, anh 288 luot chay x ~167 loi goi
   * (1 hoi danh sach + ~142 anh + ~24 lan day) = ~48.000. Tong ~50.000 — nua
   * han muc, con cho cho nhung viec khac trong ngay.
   */
  ScriptApp.newTrigger('dongBoAnh').timeBased().everyMinutes(5).create();

  Logger.log('Da dat lich: bang tinh moi phut, thu muc moi 10 phut, anh moi 5 phut.');
}

/** Go het lich, dung dong bo hoan toan. */
function ngungLichChay() {
  var cu = ScriptApp.getProjectTriggers();
  for (var i = 0; i < cu.length; i++) ScriptApp.deleteTrigger(cu[i]);
  Logger.log('Da go ' + cu.length + ' lich chay.');
}

// ---------------------------------------------------------------------------
// Chay tay
// ---------------------------------------------------------------------------

/** Chay ca ba buoc mot lan, de xem thu truoc khi dat lich. */
function chayThuMotLan() {
  dongBoBang();
  dongBoThuMuc();
  dongBoAnh();
}
