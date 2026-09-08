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
 *  3. Chon ham chayThuMotLan roi bam Run. Google se hoi cap quyen — dong y.
 *  4. Chon ham datLichChay roi bam Run. Tu day no tu chay.
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
/** Ngat goi tin som neu no da nang, ke ca khi chua du SO_ANH_MOI_LAN tam. */
var BYTE_MOI_GOI = 3 * 1024 * 1024;

/**
 * Ban thumbnail xin cua Drive. 1600px du de web thu nho xuong 1400 (co lon
 * nhat man hinh dung) ma khong bi mem.
 */
var RONG_THUMBNAIL = 1600;

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
    }
  }
  return ds;
}

// ---------------------------------------------------------------------------
// Buoc 1: day bang tinh + danh sach anh
// ---------------------------------------------------------------------------

function dongBoDuLieu() {
  var c = cauHinh_();
  var hang = docBangTho_(c);
  Logger.log('Doc duoc ' + hang.length + ' dong tho.');

  // Hoi web xem nhung thu muc nao can liet ke. KHONG tu tim cot o day: ten cot
  // cua bang tinh doi luon, va chi ben web moi biet nhung ten nao con duoc
  // chap nhan. Hai ben doan rieng la co ngay ngay lech nhau trong im lang.
  var thuMuc = goiWeb_(c, '/api/dong-bo/thu-muc', { hang: hang }).thuMuc;
  Logger.log('Can liet ke ' + thuMuc.length + ' thu muc anh.');

  var anhThuMuc = {};
  var hongThuMuc = 0;
  for (var i = 0; i < thuMuc.length; i++) {
    try {
      anhThuMuc[thuMuc[i]] = lietKeAnh_(thuMuc[i]);
    } catch (e) {
      // Mot thu muc bi xoa hay doi quyen khong duoc lam hong ca lan dong bo:
      // 64 thu muc con lai van phai len duoc.
      hongThuMuc++;
      Logger.log('Khong liet ke duoc thu muc ' + thuMuc[i] + ': ' + e);
    }
  }

  var kq = goiWeb_(c, '/api/dong-bo/du-lieu', { hang: hang, anhThuMuc: anhThuMuc });
  Logger.log(
    'DA DAY: ' + kq.soDong + ' dong, ' + kq.soThuMuc + ' thu muc, ' + kq.soAnh + ' anh' +
    (hongThuMuc ? ' (' + hongThuMuc + ' thu muc doc khong duoc)' : ''));
  return kq;
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
function taiAnhBase64_(fileId) {
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
  var anh = UrlFetchApp.fetch(link.replace(/=[^=]*$/, '=w' + RONG_THUMBNAIL), {
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
      b64 = taiAnhBase64_(id);
    } catch (e) {
      Logger.log('Loi tai anh ' + id + ': ' + e);
    }
    if (!b64) { hong++; continue; }

    lo.push({ fileId: id, duLieu: b64 });
    byteLo += b64.length;

    if (lo.length >= SO_ANH_MOI_LAN || byteLo >= BYTE_MOI_GOI) {
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

  // Bang tinh do nguoi sua tay, moi gio mot lan la du kip.
  ScriptApp.newTrigger('dongBoDuLieu').timeBased().everyHours(1).create();
  // Anh thi con phai bu dan cho het lan dau, nen chay day hon.
  ScriptApp.newTrigger('dongBoAnh').timeBased().everyMinutes(10).create();

  Logger.log('Da dat lich: du lieu moi gio, anh moi 10 phut.');
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
  dongBoDuLieu();
  dongBoAnh();
}
