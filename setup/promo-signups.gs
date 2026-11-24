/**
 * YonoVIP promo sign-ups -> Google Sheet.
 * Paste this whole file into Extensions > Apps Script of your Google Sheet, then Deploy as a Web app.
 * Setup steps: see setup/GOOGLE-SHEET-SETUP.md
 *
 * The popup (promo.js) POSTs: {"phone":"+919876543210","channel":"whatsapp"|"sms","page":"...","ts":"..."}
 */
const SCRIPT_VERSION = 2; // shown when you open the web-app URL, so you can tell which code is live
const SHEET_NAME = 'Signups';
const HEADERS = ['Received (IST)', 'Phone', 'Channel', 'Page', 'Browser time'];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000); // two people signing up at the same moment won't overwrite each other
  try {
    const data = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const phone = String(data.phone || '');
    if (!/^\+91[6-9]\d{9}$/.test(phone)) return reply({ ok: false, error: 'invalid phone' });
    const channel = data.channel === 'sms' ? 'SMS' : 'WhatsApp';

    const sheet = getSheet();
    const last = sheet.getLastRow();
    if (last > 1) {
      // Compare digits only, so it still matches if Sheets turned "+91..." into a plain number.
      const digits = phone.replace(/\D/g, '');
      const existing = sheet.getRange(2, 2, last - 1, 1).getValues()
        .map(row => (typeof row[0] === 'number' ? row[0].toFixed(0) : String(row[0])).replace(/\D/g, ''));
      if (existing.indexOf(digits) !== -1) return reply({ ok: true, duplicate: true });
    }
    sheet.appendRow([
      Utilities.formatDate(new Date(), 'Asia/Kolkata', 'dd/MM/yyyy HH:mm:ss'),
      "'" + phone, // leading ' makes Sheets keep it as text: +919876543210, not 9.19E+11
      channel,
      safe(data.page, 300),
      safe(data.ts, 40)
    ]);
    return reply({ ok: true });
  } catch (err) {
    return reply({ ok: false, error: 'bad request' });
  } finally {
    lock.releaseLock();
  }
}

// Opening the web-app URL in a browser shows this, so you can check the deployment works.
function doGet() {
  return reply({ ok: true, version: SCRIPT_VERSION, message: 'YonoVIP promo sign-up endpoint is live.' });
}

function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    sheet.getRange('B:B').setNumberFormat('@'); // keep +91 numbers as text, not 9.19876E+11
  }
  return sheet;
}

// Stops spreadsheet formula injection (a value starting with = + - @ would run as a formula).
function safe(value, max) {
  const text = String(value || '').slice(0, max);
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function reply(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
