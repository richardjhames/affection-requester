/**
 * app.js — the whole UI.
 *
 * Deliberately plain: no framework, no build step. Open index.html on a
 * static host and it works. The three screens are sections in index.html
 * that get shown/hidden; the menus and the basket are rendered from
 * js/menu-data.js and js/basket.js respectively.
 */

import { CONFIG } from './config.js';
import { MENUS, WHEN_TAGS } from './menu-data.js';
import * as basket from './basket.js';
import { sendBasket, isPreviewMode } from './email.js';
import { requireAccess } from './gate.js';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

/** Escape anything that came from a text field before it goes into HTML. */
function esc(value) {
  return String(value).replace(/[&<>"']/g, (char) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]
  ));
}

/* ───────────────────────────  screens  ─────────────────────────── */

const SCREENS = { landing: '#screen-landing', menus: '#screen-menus', sent: '#screen-sent' };
const SCREEN_HEADINGS = {
  landing: '#landing-title',
  menus: '#menus-title',
  sent: '#sent-title',
};
let currentScreen = 'landing';

/**
 * Show one screen and hide the others. `focusHeading` moves focus to the new
 * screen's heading so a screen reader announces where she's landed — skipped
 * on the very first render, where focus belongs at the top of the document.
 */
function showScreen(name, { focusHeading = false } = {}) {
  currentScreen = name;
  for (const [key, selector] of Object.entries(SCREENS)) {
    const section = $(selector);
    section.hidden = key !== name;
    if (key === name) {
      section.classList.remove('is-entering');
      // Restart the fade-in.
      void section.offsetWidth;
      section.classList.add('is-entering');
    }
  }
  document.body.dataset.screen = name;
  window.scrollTo(0, 0);
  updateBasketBar();

  if (focusHeading) {
    const heading = $(SCREEN_HEADINGS[name]);
    heading.setAttribute('tabindex', '-1');
    heading.focus({ preventScroll: true });
  }
}

/* ───────────────────────────  menus  ─────────────────────────── */

/** Build the whole menu list once, at startup. */
function renderMenus() {
  const mount = $('#menus');
  mount.innerHTML = MENUS.map((menu) => `
    <details class="menu" data-menu="${menu.id}">
      <summary class="menu__summary bubble bubble--menu">
        <span class="menu__title">${esc(menu.title)}</span>
        <span class="menu__blurb">${esc(menu.blurb)}</span>
        <span class="menu__chevron" aria-hidden="true">▾</span>
      </summary>
      <div class="menu__body">
        ${menu.hugs ? hugBuilderMarkup(menu) : ''}
        ${menu.hugs ? '<h3 class="submenu-title">…and the rest</h3>' : ''}
        <ul class="items">
          ${menu.items.map((label) => `
            <li>
              <button class="bubble bubble--item" type="button"
                      data-add-preset="${esc(label)}" data-menu-id="${menu.id}"
                      aria-pressed="false">
                <span class="bubble__label">${esc(label)}</span>
                <span class="bubble__tick" aria-hidden="true">✓</span>
              </button>
            </li>`).join('')}
        </ul>
        ${customFieldMarkup(menu)}
      </div>
    </details>`).join('');

  wireMenuInteractions(mount);
}

/** The hug builder: pick one location + one-or-more types, then compose. */
function hugBuilderMarkup(menu) {
  const { locations, types } = menu.hugs;
  return `
    <section class="hugs" aria-labelledby="hugs-title-${menu.id}">
      <h3 class="submenu-title" id="hugs-title-${menu.id}">Hugs</h3>
      <p class="submenu-blurb">Build one: where, and what kind.</p>

      <fieldset class="chips">
        <legend class="chips__legend">Where?</legend>
        ${locations.map((location, index) => `
          <label class="chip">
            <input type="radio" name="hug-location" value="${esc(location)}" ${index === 0 ? 'checked' : ''} />
            <span>${esc(location)}</span>
          </label>`).join('')}
      </fieldset>

      <fieldset class="chips">
        <legend class="chips__legend">What kind? <span class="chips__hint">(pick as many as you like)</span></legend>
        ${types.map((type) => `
          <label class="chip">
            <input type="checkbox" name="hug-type" value="${esc(type)}" />
            <span>${esc(type)}</span>
          </label>`).join('')}
      </fieldset>

      <button class="bubble bubble--primary" type="button" id="add-hug">Add this hug</button>
      <p class="hug-hint" id="hug-hint" role="alert" hidden>Pick at least one kind of hug first 🙂</p>
    </section>`;
}

/** Every menu ends with an "add your own…" free-text field. */
function customFieldMarkup(menu) {
  return `
    <form class="custom" data-menu-id="${menu.id}">
      <label class="visually-hidden" for="custom-${menu.id}">Add your own to ${esc(menu.title)}</label>
      <input class="text-input" id="custom-${menu.id}" type="text"
             placeholder="add your own…" autocomplete="off" maxlength="140" />
      <button class="bubble bubble--add" type="submit">add</button>
    </form>`;
}

function wireMenuInteractions(mount) {
  // Preset items toggle in and out of the basket.
  $$('[data-add-preset]', mount).forEach((button) => {
    button.addEventListener('click', () => {
      const label = button.dataset.addPreset;
      const menuId = button.dataset.menuId;
      const result = basket.toggle({ menuId, label, kind: 'preset' });
      if (result === 'added') {
        bounce(button);
        toast(`Added: ${label}`);
      } else if (result === 'removed') {
        toast(`Taken out: ${label}`);
      }
    });
  });

  // "Add your own…" on every menu.
  $$('.custom', mount).forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const input = $('.text-input', form);
      const label = input.value.trim();
      if (!label) return;
      basket.toggle({ menuId: form.dataset.menuId, label, kind: 'custom' });
      input.value = '';
      bounce($('.bubble--add', form));
      toast(`Added: ${label}`);
    });
  });

  // The hug builder.
  const addHug = $('#add-hug', mount);
  if (addHug) {
    addHug.addEventListener('click', () => {
      const location = $('input[name="hug-location"]:checked', mount);
      const types = $$('input[name="hug-type"]:checked', mount).map((input) => input.value);
      const hint = $('#hug-hint', mount);

      if (types.length === 0) {
        hint.hidden = false;
        return;
      }
      hint.hidden = true;

      // Formatted exactly as the spec asks: "Hug — squish me + squeeze, on the sofa"
      const label = `Hug — ${types.join(' + ')}${location ? `, ${location.value}` : ''}`;
      basket.toggle({ menuId: 'touch', label, kind: 'hug' });

      // Reset the types so the next hug starts clean; keep the location, which
      // is usually the same twice running.
      $$('input[name="hug-type"]', mount).forEach((input) => (input.checked = false));
      bounce(addHug);
      toast('Hug added 🤗');
    });
  }
}

/** Reflect basket membership back onto the menu buttons. */
function refreshMenuState() {
  const items = basket.getItems();
  $$('[data-add-preset]').forEach((button) => {
    const inBasket = items.some(
      (item) => item.key === basket.presetKey(button.dataset.menuId, button.dataset.addPreset),
    );
    button.classList.toggle('is-in-basket', inBasket);
    button.setAttribute('aria-pressed', inBasket ? 'true' : 'false');
  });
}

/* ───────────────────────────  basket  ─────────────────────────── */

function openBasket() {
  const sheet = $('#basket-sheet');
  sheet.hidden = false;
  document.body.classList.add('is-locked');
  renderBasket();
  // Focus the close button so keyboard users land inside the dialog.
  $('.icon-button', sheet).focus();
  document.addEventListener('keydown', onSheetKeydown);
}

function closeBasket() {
  $('#basket-sheet').hidden = true;
  document.body.classList.remove('is-locked');
  document.removeEventListener('keydown', onSheetKeydown);
  updateBasketBar();
  // Hand focus back to the button she came from, if it's still on screen.
  const opener = $('#open-basket');
  if (!$('#basket-bar').hidden) opener.focus({ preventScroll: true });
}

function onSheetKeydown(event) {
  if (event.key === 'Escape') closeBasket();
}

function renderBasket() {
  const items = basket.getItems();
  const list = $('#basket-list');
  const empty = $('#basket-empty');

  empty.hidden = items.length > 0;
  $('#note-field').hidden = items.length === 0;
  $('#send-button').disabled = items.length === 0;

  list.innerHTML = items.map((item) => `
    <li class="basket-item" data-key="${esc(item.key)}">
      <div class="basket-item__row">
        <span class="basket-item__label">${esc(item.label)}</span>
        <button class="icon-button icon-button--sm" type="button"
                data-remove="${esc(item.key)}"
                aria-label="Remove ${esc(item.label)}">✕</button>
      </div>
      <div class="whens" role="group" aria-label="When would you like ${esc(item.label)}?">
        ${WHEN_TAGS.map((tag) => `
          <button class="chip chip--when ${item.when === tag.id ? 'is-on' : ''}" type="button"
                  data-when="${tag.id}" data-key="${esc(item.key)}"
                  aria-pressed="${item.when === tag.id}">${esc(tag.label)}</button>`).join('')}
      </div>
    </li>`).join('');

  $$('[data-remove]', list).forEach((button) => {
    button.addEventListener('click', () => basket.remove(button.dataset.remove));
  });
  $$('[data-when]', list).forEach((button) => {
    button.addEventListener('click', () => basket.setWhen(button.dataset.key, button.dataset.when));
  });

  const note = $('#basket-note');
  if (note.value !== basket.getNote()) note.value = basket.getNote();
}

function updateBasketBar() {
  const bar = $('#basket-bar');
  const count = basket.count();
  const sheetOpen = !$('#basket-sheet').hidden;
  bar.hidden = count === 0 || currentScreen !== 'menus' || sheetOpen;
  $('#basket-bar-count').textContent = count === 1 ? '1 thing' : `${count} things`;
}

/* ───────────────────────────  sending  ─────────────────────────── */

async function send() {
  const button = $('#send-button');
  const error = $('#send-error');
  const items = basket.getItems();
  if (items.length === 0) return;

  button.disabled = true;
  button.classList.add('is-sending');
  button.textContent = 'Sending…';
  error.hidden = true;

  try {
    const result = await sendBasket(items, basket.getNote());
    $('#preview-note').hidden = !result.preview;
    basket.clear();
    closeBasket();
    showScreen('sent', { focusHeading: true });
  } catch (failure) {
    console.error('[affection menu] send failed', failure);
    error.textContent = "That didn't send — check the connection and try again?";
    error.hidden = false;
  } finally {
    button.disabled = basket.count() === 0;
    button.classList.remove('is-sending');
    button.textContent = 'Send it 💌';
  }
}

/* ───────────────────────────  little touches  ─────────────────────────── */

let toastTimer;
function toast(message) {
  const node = $('#toast');
  node.textContent = message;
  node.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => node.classList.remove('is-visible'), 1600);
}

function bounce(element) {
  element.classList.remove('is-bouncing');
  void element.offsetWidth;
  element.classList.add('is-bouncing');
}

/**
 * Optional personalisation. Both names empty (the default) leaves the copy
 * wordless-and-cute; filling them in in config.js greets her by name.
 */
function applyNames() {
  const { herName, hisName } = CONFIG;
  if (herName) {
    $('#landing-title').textContent = `What do you need today, ${herName}?`;
  }
  if (hisName) {
    $('#landing-lede').textContent =
      `Pick whatever you fancy from the menus. Add it to the basket, send it over, and it lands in ${hisName}'s inbox. No wrong answers.`;
    $('#sent-lede').textContent = `It's on its way to ${hisName}. Consider it noticed.`;
  }
}

/* ───────────────────────────  startup  ─────────────────────────── */

async function start() {
  // Password gate: a no-op unless CONFIG.gate.enabled is true.
  await requireAccess($('#gate-mount'));
  $('#app').hidden = false;

  applyNames();
  basket.load();
  renderMenus();
  refreshMenuState();
  renderBasket();
  updateBasketBar();
  showScreen('landing');

  if (isPreviewMode()) {
    console.info(
      '[affection menu] Preview mode: no Web3Forms access key set in js/config.js, so Send will not email anything yet.',
    );
  }

  // Re-render everything that depends on the basket whenever it changes.
  basket.onChange((_items, _note, reason) => {
    if (reason === 'note') return; // typing in the note changes nothing else
    refreshMenuState();
    if (!$('#basket-sheet').hidden) renderBasket();
    updateBasketBar();
  });

  $$('[data-goto]').forEach((button) => {
    button.addEventListener('click', () => showScreen(button.dataset.goto, { focusHeading: true }));
  });
  $('#open-basket').addEventListener('click', openBasket);
  $$('[data-close-basket]').forEach((button) => button.addEventListener('click', closeBasket));
  $('#send-button').addEventListener('click', send);
  $('#basket-note').addEventListener('input', (event) => basket.setNote(event.target.value));
}

start();
