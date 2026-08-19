/**
 * menu-data.js — all the content of the affection menu.
 *
 * This is the file to edit when you want to change what's on offer.
 * Everything else in the app is driven from here, so adding a menu or an
 * item is a one-line change and needs no other edits.
 */

/** The five love-language menus, in the order they appear on screen. */
export const MENUS = [
  {
    id: 'words',
    title: 'Words of affirmation',
    blurb: 'Say the thing out loud.',
    items: [
      'Tell me something you love about me',
      'Send me a voice note',
      'Leave me a little written note',
      "Hype me up — I've got something scary today",
    ],
  },
  {
    id: 'time',
    title: 'Quality time',
    blurb: 'Just you, just me.',
    items: [
      'Come over',
      'Phone-free evening',
      'Cook together',
      'Go for a walk',
      'Watch our show',
      'Just sit with me',
    ],
  },
  {
    id: 'touch',
    title: 'Physical touch',
    blurb: 'Come here.',
    // The hug builder is rendered above this menu's plain items.
    hugs: {
      locations: ['on the bed', 'on the sofa', 'standing up'],
      types: ['full frontal', 'side', 'squish me', 'pretzel', 'squeeze', 'gentle', 'stroke'],
    },
    items: [
      'Cuddle on the sofa',
      'Play with my hair',
      'Hold hands',
      'Shoulder rub',
    ],
  },
  {
    id: 'service',
    title: 'Acts of service',
    blurb: 'Take it off my hands.',
    items: [
      'Make me a tea',
      'Take something off my plate today',
      'Run me a bath',
      'Handle dinner',
      "Deal with the thing I'm dreading",
    ],
  },
  {
    id: 'gifts',
    title: 'Receiving gifts',
    blurb: 'A little something.',
    items: [
      'Bring me a little treat',
      'Surprise me',
      'Flowers',
      'That thing I mentioned',
    ],
  },
];

/** Optional "when?" tags an item in the basket can carry. */
export const WHEN_TAGS = [
  { id: 'tonight', label: 'tonight' },
  { id: 'this-week', label: 'this week' },
  { id: 'no-rush', label: 'no rush' },
];

/** Look up a menu by id (used when grouping the basket for the email). */
export function menuById(id) {
  return MENUS.find((menu) => menu.id === id);
}
