const SHEET_NAME = "RSVP";

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
    .createTextOutput(JSON.stringify({ ok: true, service: "Roman & Liza RSVP" }))
    .setMimeType(ContentService.MimeType.JSON);
}

function getSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      "Saved at",
      "Submitted at",
      "Event",
      "Guest name",
      "Phone",
      "Attendance",
      "Guest count",
      "Transfer",
      "Comment",
      "Source",
    ]);
  }

  return sheet;
}
