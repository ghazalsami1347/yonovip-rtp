# Promo sign-ups → Google Sheet (about 5 minutes)

1. Go to <https://sheets.new> (signed in to the Google account that should own the numbers). Name it e.g. **YonoVIP Promo Sign-ups**.
2. In the sheet: **Extensions → Apps Script**.
3. Delete everything in `Code.gs`, paste in the whole of `setup/promo-signups.gs`, and press **Save** (💾).
4. Click **Deploy → New deployment**.
   - Click the ⚙️ next to "Select type" → **Web app**.
   - Description: `promo signups`
   - Execute as: **Me**
   - Who has access: **Anyone** (needed so visitors' browsers can send to it; they can only add rows, never read the sheet)
   - Click **Deploy**.
5. Google asks you to **Authorize access** → pick your account → if you see "Google hasn't verified this app", click **Advanced → Go to (project name) (unsafe)** → **Allow**. This is normal for your own script.
6. Copy the **Web app URL** (looks like `https://script.google.com/macros/s/AKfy.../exec`).
7. Check it: open that URL in a browser. You should see `{"ok":true,"message":"YonoVIP promo sign-up endpoint is live."}`.
8. Paste it into `promo.js`:
   ```js
   const PROMO_ENDPOINT = 'https://script.google.com/macros/s/AKfy.../exec';
   ```
   then upload the site as usual.

A **Signups** tab appears in the sheet on the first sign-up, with columns: Received (IST) · Phone · Channel · Page · Browser time. Repeat numbers are skipped.

## If you change the script later
**Deploy → Manage deployments → ✏️ Edit → Version: New version → Deploy.** This keeps the same URL. (Making a *New deployment* instead gives a new URL, which you'd have to paste into `promo.js` again.)

## Privacy
The sheet holds people's phone numbers: keep it shared only with people who need it, and delete numbers when someone replies STOP.
