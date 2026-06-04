const SPREADSHEET_ID = "1sp-nhX6OyN9KTP2DE81cQA1F3WF3wQXdNHT1SpNxFgM";
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
    data.comment || "",
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
      "Комментарий",
      "Источник",
    ]);
  }

  return sheet;
}
