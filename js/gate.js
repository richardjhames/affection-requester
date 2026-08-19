/**
 * gate.js — optional shared-password gate.
 *
 * Off by default: access to the site is by unguessable link only. This exists
 * so a password can be switched on later (CONFIG.gate.enabled = true) without
 * restructuring anything — app.js calls `requireAccess()` before it renders,
 * and that's the whole integration.
 *
 * It's a soft gate: the password lives in client-side JS, so it stops a
 * shoulder-surfer or someone who finds the link, not a determined attacker.
 * That's the same threat model as the secret link itself.
 */

import { CONFIG } from './config.js';

const UNLOCKED_KEY = 'affection-menu.unlocked.v1';

/**
 * Resolves once the visitor may see the site. When the gate is disabled this
 * returns immediately; when enabled it renders a small password prompt into
 * `mount` and waits.
 */
export function requireAccess(mount) {
  const gate = CONFIG.gate || {};
  if (!gate.enabled || !gate.password) return Promise.resolve();

  try {
    if (sessionStorage.getItem(UNLOCKED_KEY) === 'yes') return Promise.resolve();
  } catch {
    // sessionStorage unavailable — just ask again.
  }

  return new Promise((resolve) => {
    mount.innerHTML = `
      <section class="screen screen--gate is-active" aria-label="Password">
        <div class="card card--centred">
          <img class="illustration illustration--sm" src="img/cat-peeking.svg" alt="A cartoon cat peeking over a ledge" />
          <h1 class="display">${gate.prompt}</h1>
          <form class="gate-form" novalidate>
            <label class="visually-hidden" for="gate-input">Password</label>
            <input class="text-input" id="gate-input" type="password" autocomplete="current-password" />
            <button class="bubble bubble--primary" type="submit">Let me in</button>
            <p class="gate-error" role="alert" hidden>Not quite — try again?</p>
          </form>
        </div>
      </section>`;

    const form = mount.querySelector('.gate-form');
    const input = mount.querySelector('#gate-input');
    const error = mount.querySelector('.gate-error');

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      if (input.value === gate.password) {
        try {
          sessionStorage.setItem(UNLOCKED_KEY, 'yes');
        } catch {
          /* not fatal */
        }
        mount.innerHTML = '';
        resolve();
      } else {
        error.hidden = false;
        input.value = '';
        input.focus();
      }
    });

    input.focus();
  });
}
