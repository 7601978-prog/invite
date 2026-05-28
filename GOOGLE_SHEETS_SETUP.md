# Google Sheets RSVP setup

1. Create a new Google Sheet.
2. Open `Extensions -> Apps Script`.
3. Paste the contents of `google-apps-script.js` into the Apps Script editor.
4. Click `Deploy -> New deployment`.
5. Select type `Web app`.
6. Set:
   - `Execute as`: Me
   - `Who has access`: Anyone
7. Deploy and copy the Web app URL.
8. Open `script.js` and replace:

```js
const googleScriptUrl = "PASTE_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE";
```

with your Web app URL.

The RSVP table will be created automatically with these columns:

`Saved at`, `Submitted at`, `Event`, `Guest name`, `Phone`, `Attendance`, `Guest count`, `Transfer`, `Comment`, `Source`.
