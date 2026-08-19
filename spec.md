# Affection Menu — build spec

A small, private, mobile-first website where my partner can browse menus of
affection, add the ones she wants to a basket, and send them to me. When she
sends, I get an email listing what she requested.

This document is the spec. Build the site to match it. Where you see `TODO`,
leave a clearly-marked placeholder — I'll fill those in.

---

## 1. Core flow

1. She opens the site (secret link) on her phone.
2. A warm landing screen greets her.
3. She browses five love-language menus. Each menu expands to show individual
   requestable items. **Physical touch** contains a dedicated **Hugs** sub-menu.
4. Tapping an item adds it to a **basket** (with a little "added" confirmation).
   Items can be tapped again / removed.
5. Every menu also has an **"add your own"** free-text field that adds a custom
   item to the basket.
6. Optional: each item can carry a "when?" tag — *tonight / this week / no rush*.
7. She opens the **basket**, reviews/edits it, can add one overall note, and
   taps **Send**.
8. On send: the basket is emailed to me; she sees a cute confirmation screen.

Basket state can live in memory or `localStorage` (fine on the real deployed
site). No database or user accounts needed.

---

## 2. Aesthetic

Model the look on the reference screenshots (hand-drawn cartoon cats over
impressionist oil-painting backgrounds). Target feeling: cosy, warm, tender,
a little playful.

- **Cats:** simple cartoon cats with thick, slightly wobbly black outlines and
  flat fills — one warm yellow/tan, one soft sky-blue. Use them as a recurring
  motif (hugging on the landing screen, a happy cat on the confirmation screen,
  a peeking cat in empty states).
- **Backgrounds:** loose, painterly / impressionist textures (leafy greens,
  warm lamplit interiors, brick-and-window). Soft film-grain / paper texture
  overlaid on the whole page.
- **Text:** hand-lettered marker-style display font for headings and buttons;
  clean rounded sans for body. Buttons/menu items styled as rounded
  **speech bubbles** where it fits.
- **Suggested fonts (Google Fonts):** headings — *Gochi Hand* or *Patrick Hand*;
  body — *Nunito* or *Quicksand*.
- **Suggested palette:** warm cream base (`#f6efe2`), tan (`#e8c07d`),
  sky blue (`#8fc7e8`), soft leaf green (`#8fae6a`), ink outline (`#2b2320`).
  Tune to match the screenshots.
- **Motion:** gentle — soft fades, a little bounce when an item is added.

**Cat mapping: yellow cat = her, blue cat = me (Richard).** Use accordingly —
the blue cat is the one receiving/waiting for the request, the yellow cat sends it.
`TODO (Richard):` whether names appear anywhere, or it stays wordless-and-cute.
`TODO (Richard):` illustration assets — cat drawings + painterly backgrounds.
Until supplied, use tasteful placeholders in the right shapes/colours.

---

## 3. Menu content

Sensible default below — edit freely, and especially swap in her *real*
favourite hugs.

**Words of affirmation**
- Tell me something you love about me
- Send me a voice note
- Leave me a little written note
- Hype me up — I've got something scary today

**Quality time**
- Come over
- Phone-free evening
- Cook together
- Go for a walk
- Watch our show
- Just sit with me

**Physical touch → Hugs** *(sub-menu — a hug is composed from two axes)*

A hug request is built by picking a **location** and one or more **types**, so
she can ask for e.g. "squish me, on the sofa" or "gentle side hug, on the bed".
Present as two rows of speech-bubble chips: choose one location + one-or-more
types, then an **"add this hug"** button drops the composed hug into the basket
(formatted like `Hug — squish me + squeeze, on the sofa`).

- **Location:** on the bed · on the sofa · standing up
- **Type:** full frontal · side · squish me · pretzel · squeeze · gentle · stroke

Keep an **"add your own…"** field here too for anything off-menu.

**Physical touch → other**
- Cuddle on the sofa
- Play with my hair
- Hold hands
- Shoulder rub

**Acts of service**
- Make me a tea
- Take something off my plate today
- Run me a bath
- Handle dinner
- Deal with the thing I'm dreading

**Receiving gifts**
- Bring me a little treat
- Surprise me
- Flowers
- That thing I mentioned

Every menu ends with an **"add your own…"** free-text input.

---

## 4. Email delivery

**Default: Web3Forms** (no backend, host-agnostic, free).

- Register the recipient email at web3forms.com to get an **access key**.
- On **Send**, POST the basket to `https://api.web3forms.com/submit` as form
  data or JSON, including the access key, a subject line, and the basket
  contents (see format below).
- The access key lives in client-side JS — acceptable for Web3Forms by design.

**Alternative: Netlify Forms** (use only if hosting on Netlify; nothing
third-party). Requires a hidden static HTML form for build-time detection plus
a JS `fetch` POST of URL-encoded form data to `/`. Enable email notifications
in the Netlify dashboard.

**Email contents** should include:
- A timestamp.
- The requested items, grouped by love-language menu, each with its "when?" tag
  if set.
- The overall note, if she added one.
- Subject line, e.g. `A request from the affection menu` (keep it sweet; emoji
  optional).

Recipient email: **richardjhames@gmail.com** — set it via the form service's
config / an environment variable, **not** hardcoded in the committed repo.

---

## 5. Privacy — secret link

- No login. Access is by unguessable URL only.
- Add `<meta name="robots" content="noindex, nofollow">` and ship no sitemap so
  it won't be indexed.
- Deploy at a random subdomain (or a custom domain I'll provide).
- Note: this is security-by-obscurity — fine for this. Structure the code so a
  simple shared-password gate could be added later without a rewrite.

---

## 6. Technical

- **Stack:** static site. Vite + React (single page) or plain HTML/CSS/JS —
  builder's choice; keep it lightweight. No backend, no database.
- **Mobile-first**, responsive; large comfortable tap targets.
- **Accessibility:** alt text on illustrations, sufficient contrast, keyboard
  focusable controls.
- **Deploy target:** Netlify, Vercel, or GitHub Pages (any static host).
- Keep everything in one small, well-commented codebase that's easy to tweak.

---

## 7. Still to fill in (Richard)

- [x] Recipient email — richardjhames@gmail.com
- [x] Cat mapping — yellow = her, blue = me
- [x] Hug taxonomy — location + type picker
- [ ] Whether names appear anywhere (else stays wordless)
- [ ] Any further content tweaks
- [ ] Illustration + background assets
