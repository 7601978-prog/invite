const SPREADSHEET_ID = "1Gk-PdYB7NugNmW5gtR-CdcUxPPi6uT_ALeZqXDUMakk";
const SHEET_NAME = "Ответы гостей";

function doPost(e) {
  const sheet = getSheet();
  const data = JSON.parse(e.postData.contents || "{}");

  sheet.appendRow([
    new Date(),
    data.submittedAt || "",
    data.event || "",
    data.guestName || "",
    data.phone || "",
    data.attendance || "",
    data.guestCount || "",
    data.transfer || "",
    e.parameter.source || "website",
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, service: "Роман & Елизавета RSVP", sheet: SPREADSHEET_ID }))
    .setMimeType(ContentService.MimeType.JSON);
}

function getSheet() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      "Сохранено",
      "Отправлено с сайта",
      "Событие",
      "Имя гостя",
      "Телефон",
      "Присутствие",
      "Количество гостей",
      "Трансфер",
      "Источник",
    ]);
  }

  return sheet;
}
