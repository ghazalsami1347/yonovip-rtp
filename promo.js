/* Optional promo-alerts popup. Closable, never blocks the page, shown at most once per visit. */
(() => {
  // Where sign-ups are sent: your Google Apps Script web-app URL (see setup/GOOGLE-SHEET-SETUP.md).
  // The body is JSON: {phone:"+919876543210", channel:"whatsapp"|"sms", page, ts}.
  const PROMO_ENDPOINT = 'https://script.google.com/macros/s/AKfycbyFVBJvALXoYNetcBHOCxUC4_ln23B2psxVaUj7Ve6KZ7OfsO85xjoekmpNdy_W79dn/exec';

  const SHOW_AFTER_MS = 15000;      // or when the visitor scrolls 40% of the page, whichever first
  const SNOOZE_DAYS = 3;            // after "close", stay quiet this long
  const KEY = 'yonovip-promo';

  // GA4: count clicks on the Promo Codes quick link (works even when the popup is snoozed).
  document.querySelector('.promo-nav')?.addEventListener('click', () => {
    try { window.gtag?.('event', 'promo_codes_click', { link_location: 'quick_nav' }); } catch {}
  });

  const dialog = document.querySelector('#promoModal');
  if (!dialog || typeof dialog.showModal !== 'function') return;
  const form = dialog.querySelector('#promoForm');
  const input = dialog.querySelector('#promoPhone');
  const field = input.closest('.promo-field');
  const error = dialog.querySelector('#promoError');
  const submit = form.querySelector('.promo-submit');
  const otherModal = document.querySelector('#modal');

  const read = () => { try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { return {}; } };
  const write = value => { try { localStorage.setItem(KEY, JSON.stringify(value)); } catch {} };
  const track = (name, params) => { try { window.gtag?.('event', name, params); } catch {} };

  // Add #promo to the URL to force it open (handy for testing).
  const forced = location.hash === '#promo';
  const state = read();
  if (!forced && (state.subscribed || (state.snoozedUntil && Date.now() < state.snoozedUntil))) return;
  try { if (!forced && sessionStorage.getItem(KEY)) return; } catch {}

  // Accepts "98765 43210", "+91-98765-43210", "09876543210"; returns 10 digits or null.
  function normalise(raw) {
    let digits = String(raw).replace(/\D/g, '');
    if (digits.length === 12 && digits.startsWith('91')) digits = digits.slice(2);
    else if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1);
    return /^[6-9]\d{9}$/.test(digits) ? digits : null;
  }
  function showError(message) {
    error.textContent = message;
    if (message) field.dataset.invalid = ''; else delete field.dataset.invalid;
  }

  let timer;
  function open() {
    clearTimeout(timer);
    removeEventListener('scroll', onScroll);
    if (dialog.open) return;
    // Don't interrupt someone reading a game card; try again a bit later.
    if (otherModal?.open || document.hidden) { timer = setTimeout(open, 8000); return; }
    try { sessionStorage.setItem(KEY, '1'); } catch {}
    dialog.showModal();
    window.yonoMotion?.dialog(dialog);
    track('promo_popup_view');
  }
  function onScroll() {
    const max = document.documentElement.scrollHeight - innerHeight;
    if (max > 0 && scrollY / max > 0.4) open();
  }

  function close() { dialog.close(); }
  dialog.addEventListener('close', () => {
    if (!read().subscribed) {
      write({ snoozedUntil: Date.now() + SNOOZE_DAYS * 86400000 });
      track('promo_popup_dismiss');
    }
  });
  dialog.querySelectorAll('[data-promo-close]').forEach(button => button.addEventListener('click', close));
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const r = dialog.getBoundingClientRect();
    if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) close();
  });

  input.addEventListener('input', () => {
    input.value = input.value.replace(/[^\d+\s-]/g, '');
    if (error.textContent) showError('');
  });

  form.addEventListener('submit', async event => {
    event.preventDefault();
    const phone = normalise(input.value);
    if (!phone) {
      showError('Please enter a valid 10-digit mobile number (starting with 6, 7, 8 or 9).');
      input.focus();
      return;
    }
    showError('');
    submit.disabled = true;
    submit.textContent = 'Saving…';
    const channel = form.elements.channel.value;
    try {
      if (PROMO_ENDPOINT) {
        // text/plain + no-cors keeps this working with Google Apps Script and most webhooks.
        await fetch(PROMO_ENDPOINT, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ phone: '+91' + phone, channel, page: location.href, ts: new Date().toISOString() })
        });
      } else {
        console.warn('[promo] PROMO_ENDPOINT is empty in promo.js, so this number was not sent anywhere.');
      }
      write({ subscribed: true });
      track('promo_signup', { channel }); // never send the number itself to analytics
      dialog.querySelector('[data-promo-step="form"]').hidden = true;
      dialog.querySelector('[data-promo-step="done"]').hidden = false;
      dialog.setAttribute('aria-labelledby', 'promoDoneTitle');
      dialog.querySelector('[data-promo-step="done"] .promo-submit').focus();
    } catch {
      showError('Network issue. Please check your internet and try again.');
    } finally {
      submit.disabled = false;
      submit.textContent = 'Haan, mujhe notify karo';
    }
  });

  timer = setTimeout(open, SHOW_AFTER_MS);
  addEventListener('scroll', onScroll, { passive: true });
  if (forced) open();
})();
