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
 * BA LICH CHAY: dongBoBang moi phut (chi bang tinh), dongBoThuMuc moi 10 phut
 * (liet ke thu muc anh, chay dan cho toi khi het), dongBoAnh moi 10 phut (nap
 * anh vao bo dem). Lan dau day du mat khoang mot tieng.
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
 * Chi bang tinh, KHONG liet ke thu muc Drive. ~2 giay.
 *
 * Day la ham chay moi phut, va la ham DUY NHAT dung toi bang tinh. Viec liet ke
 * thu muc anh nam han o dongBoThuMuc: no ton hang chuc phut, con doc bang tinh
 * chi ton vai giay. Gop chung lai thi khong the chay moi phut duoc.
 */
function dongBoBang() {
  var c = cauHinh_();
  var hang = docBangTho_(c);
  var kq = goiWeb_(c, '/api/dong-bo/du-lieu', { hang: hang });
  Logger.log(
    kq.doiBang
      ? 'BANG TINH DA DOI -> da day ' + kq.soDong + ' dong.'
      : 'Bang tinh khong doi (' + kq.soDong + ' dong).');
  return kq;
}

/**
 * Liet ke thu muc anh — CHAY DAN qua nhieu luot.
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
  var c = cauHinh_();
  var het = Date.now() + NGAN_SACH_MS;

  var hoi = goiWeb_(c, '/api/dong-bo/thieu-thu-muc', {});
  Logger.log(
    'Thieu ' + hoi.tongThieu + '/' + hoi.tong + ' thu muc; luot nay lam toi ' +
    hoi.thieu.length + ' cai.');
  if (!hoi.thieu.length) return { xong: 0, hong: 0 };

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

  for (var i = 0; i < hoi.thieu.length; i++) {
    if (Date.now() > het) break;
    var id = hoi.thieu[i];
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
    ', con lai ~' + (hoi.tongThieu - xong) + '.');
  return { xong: xong, hong: hong, conLai: hoi.tongThieu - xong };
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

function dongBoAnh() {
  var c = cauHinh_();
  var het = Date.now() + NGAN_SACH_MS;

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

  // Bang tinh: moi phut. Day la thu nguoi dung sua va cho thay ket qua.
  ScriptApp.newTrigger('dongBoBang').timeBased().everyMinutes(1).create();
  // Liet ke thu muc anh, chay dan. Cung nhip voi phan nap anh.
  ScriptApp.newTrigger('dongBoThuMuc').timeBased().everyMinutes(10).create();
  // Anh thi con phai bu dan cho het lan dau, nen chay day hon.
  ScriptApp.newTrigger('dongBoAnh').timeBased().everyMinutes(10).create();

  Logger.log('Da dat lich: bang tinh moi phut, thu muc va anh moi 10 phut.');
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

/** Chay ca hai buoc mot lan, de xem thu truoc khi dat lich. */
function chayThuMotLan() {
  dongBoBang();
  dongBoThuMuc();
  dongBoAnh();
}
