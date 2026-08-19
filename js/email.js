/**
 * email.js — turns the basket into an email and posts it to Web3Forms.
 *
 * Web3Forms is a no-backend form-to-email relay: we POST JSON containing a
 * public access key, and it emails the address that key was registered to.
 * Nothing else is needed — no server, no database, and the site stays
 * host-agnostic (Netlify, Vercel, GitHub Pages, anywhere).
 *
 * If you'd rather use Netlify Forms, see the note at the bottom of this file
 * and README.md; only this module would need to change.
 */

import { CONFIG } from './config.js';
import { MENUS, WHEN_TAGS, menuById } from './menu-data.js';

const ENDPOINT = 'https://api.web3forms.com/submit';
const PLACEHOLDER_KEY = 'TODO-WEB3FORMS-ACCESS-KEY';

/** True while Richard hasn't pasted a real access key into config.js. */
export function isPreviewMode() {
  const key = (CONFIG.web3formsAccessKey || '').trim();
  return !key || key === PLACEHOLDER_KEY;
}

function whenLabel(when) {
  const tag = WHEN_TAGS.find((candidate) => candidate.id === when);
  return tag ? tag.label : null;
}

/**
 * Build the plain-text body of the email: items grouped by love-language
 * menu, each with its "when?" tag, then the overall note.
 */
export function composeMessage(items, note, now = new Date()) {
  const lines = [];
  const timestamp = now.toLocaleString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  lines.push(`Sent ${timestamp}`, '');

  // Group in menu order, so the email reads like the site.
  for (const menu of MENUS) {
    const inMenu = items.filter((item) => item.menuId === menu.id);
    if (inMenu.length === 0) continue;

    lines.push(`${menu.title.toUpperCase()}`);
    for (const item of inMenu) {
      const when = whenLabel(item.when);
      lines.push(`  • ${item.label}${when ? ` (${when})` : ''}`);
    }
    lines.push('');
  }

  // Anything whose menu has since been renamed or removed still gets through.
  const orphans = items.filter((item) => !menuById(item.menuId));
  if (orphans.length > 0) {
    lines.push('OTHER');
    for (const item of orphans) {
      const when = whenLabel(item.when);
      lines.push(`  • ${item.label}${when ? ` (${when})` : ''}`);
    }
    lines.push('');
  }

  if (note && note.trim()) {
    lines.push('A NOTE', `  ${note.trim()}`, '');
  }

  return lines.join('\n').trimEnd();
}

/**
 * Send the basket. Resolves to { sent: true } on a real send, or
 * { sent: false, preview: true } when no access key is configured yet.
 * Throws on a genuine network/API failure so the UI can offer a retry.
 */
export async function sendBasket(items, note) {
  const message = composeMessage(items, note);

  if (isPreviewMode()) {
    // No key yet: don't pretend. Show her the confirmation, but log what
    // would have been sent so Richard can check the formatting.
    console.info('[affection menu] Preview mode — no email sent.\n\n' + message);
    return { sent: false, preview: true, message };
  }

  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      access_key: CONFIG.web3formsAccessKey,
      subject: CONFIG.emailSubject,
      from_name: CONFIG.fromName,
      message,
      // Web3Forms echoes unknown fields into the email, which is handy if you
      // ever want the raw basket as well as the pretty version.
      item_count: items.length,
      // Ask Web3Forms not to append its own branding footer (ignored on the
      // free tier, harmless if so).
      botcheck: '',
    }),
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok || result.success === false) {
    throw new Error(result.message || `Web3Forms responded ${response.status}`);
  }

  return { sent: true, preview: false, message };
}

/*
 * Netlify Forms alternative (only if hosting on Netlify):
 *
 *   1. Add a hidden static form to index.html so Netlify's build-time parser
 *      finds it:
 *        <form name="affection" netlify hidden>
 *          <input name="message" /><input name="item_count" />
 *        </form>
 *   2. Replace the fetch above with:
 *        await fetch('/', {
 *          method: 'POST',
 *          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
 *          body: new URLSearchParams({ 'form-name': 'affection', message }),
 *        });
 *   3. Turn on email notifications in the Netlify dashboard (Forms →
 *      Notifications) pointed at the recipient address.
 */
