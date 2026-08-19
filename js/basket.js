/**
 * basket.js — basket state.
 *
 * Plain module holding the list of requested items, persisted to
 * localStorage so a refresh (or an accidental back-swipe) doesn't lose
 * anything. No database, no accounts — this is all client-side.
 *
 * An entry looks like:
 *   { key, menuId, label, kind: 'preset' | 'custom' | 'hug', when: null | 'tonight' }
 *
 * `key` is stable for preset items ("touch::Hold hands") so tapping the same
 * menu item twice toggles it off. Custom items and composed hugs get a unique
 * key each time, so she can add two different ones.
 */

const STORAGE_KEY = 'affection-menu.basket.v1';
const NOTE_KEY = 'affection-menu.note.v1';

let items = [];
let note = '';
const listeners = new Set();

/**
 * Subscribe to basket changes; returns an unsubscribe function. Listeners get
 * (items, note, reason) — `reason` is 'items' or 'note', so the UI can skip
 * re-rendering the list while she's typing in the note field.
 */
export function onChange(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function emit(reason = 'items') {
  save();
  listeners.forEach((listener) => listener(items, note, reason));
}

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    localStorage.setItem(NOTE_KEY, note);
  } catch {
    // Private browsing or a full quota — the basket just won't survive a
    // refresh, which is not worth bothering her about.
  }
}

/** Restore a previous basket, if there is one. Call once at startup. */
export function load() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    if (Array.isArray(stored)) items = stored.filter((item) => item && item.label);
    note = localStorage.getItem(NOTE_KEY) || '';
  } catch {
    items = [];
    note = '';
  }
}

export function getItems() {
  return items.slice();
}

export function getNote() {
  return note;
}

export function setNote(value) {
  note = value;
  emit('note');
}

export function count() {
  return items.length;
}

export function has(key) {
  return items.some((item) => item.key === key);
}

/** Stable key for a preset menu item, so taps toggle rather than duplicate. */
export function presetKey(menuId, label) {
  return `${menuId}::${label}`;
}

function uniqueKey(menuId, kind) {
  return `${menuId}::${kind}::${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Add an item. Returns 'added' or 'removed' so the UI can play the right
 * little animation.
 */
export function toggle({ menuId, label, kind = 'preset' }) {
  const trimmed = label.trim();
  if (!trimmed) return 'ignored';

  if (kind === 'preset') {
    const key = presetKey(menuId, trimmed);
    if (has(key)) {
      remove(key);
      return 'removed';
    }
    items.push({ key, menuId, label: trimmed, kind, when: null });
    emit();
    return 'added';
  }

  // Custom items and composed hugs are always additive.
  items.push({ key: uniqueKey(menuId, kind), menuId, label: trimmed, kind, when: null });
  emit();
  return 'added';
}

export function remove(key) {
  items = items.filter((item) => item.key !== key);
  emit();
}

/** Set (or clear, by passing the same value again) an item's "when?" tag. */
export function setWhen(key, when) {
  items = items.map((item) =>
    item.key === key ? { ...item, when: item.when === when ? null : when } : item,
  );
  emit();
}

export function clear() {
  items = [];
  note = '';
  emit();
}
