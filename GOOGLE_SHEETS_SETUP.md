# Google Sheets RSVP setup

Target Google Sheet:

`https://docs.google.com/spreadsheets/d/1sp-nhX6OyN9KTP2DE81cQA1F3WF3wQXdNHT1SpNxFgM/edit?usp=sharing`

1. Open the target Google Sheet.
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

After that, each RSVP submit will append the guest response to the `Ответы гостей` sheet.

The RSVP table will be created automatically with these columns:

`Сохранено`, `Отправлено с сайта`, `Событие`, `Имя гостя`, `Телефон`, `Присутствие`, `Количество гостей`, `Трансфер`, `Источник`.
