const SPREADSHEET_ID = "1ie0dF4v1zQSQuja8fZHkz1RSEBZwKfESNNx8t-bMWbA";
const SHEET_NAME = "Приглашенные";

function doPost(e) {
  const sheet = getSheet();
  const payload = e && e.postData ? e.postData.contents : "{}";
  const data = JSON.parse(payload || "{}");
  const source = e && e.parameter ? e.parameter.source : "manual-test";

  sheet.appendRow([
    new Date(),
    data.submittedAt || "",
    data.event || "",
    data.guestName || "",
    data.phone || "",
    data.attendance || "",
    data.guestCount || "",
    data.transfer || "",
    source || "website",
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

function testDoPost() {
  return doPost({
    parameter: { source: "manual-test" },
    postData: {
      contents: JSON.stringify({
        submittedAt: new Date().toISOString(),
        event: "Тест подключения",
        guestName: "Тест Google Script",
        phone: "+7 000 000 00 00",
        attendance: "Да, буду",
        guestCount: "1",
        transfer: "Нет",
      }),
    },
  });
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
