# affection-requester

A mini-app for Vicky to request what kind of affection she needs from me.

A small, private, mobile-first website: browse five love-language menus, tap
what you want into a basket, add a note, hit send — and it arrives as an email.
Built to [`spec.md`](spec.md).

## Running it

It's a plain static site: no build step, no dependencies, no backend. Because
it uses ES modules, open it through a server rather than double-clicking the
file:

```sh
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Turning email delivery on

Out of the box the site runs in **preview mode**: Send works and shows the
confirmation screen, but nothing is emailed — the message that *would* have
gone out is logged to the browser console instead.

To switch on real delivery:

1. Go to [web3forms.com](https://web3forms.com) and enter the recipient address
   (the one in `spec.md`). They email you an access key.
2. Paste that key into `web3formsAccessKey` in [`js/config.js`](js/config.js).

The recipient address is bound to the key at Web3Forms' end, so it is not
stored anywhere in this repo. The access key itself ships to the browser, which
is how Web3Forms is designed to work — a key only ever delivers to the address
it was registered with.

Prefer Netlify Forms? [`js/email.js`](js/email.js) has the swap documented at
the bottom of the file; nothing else needs to change.

## Deploying

**This site is deployed at `richardham.es/ineedlove`.** It's served from the
[richardham.es](https://github.com/richardjhames/richardham.es) repo, which
keeps a copy of these files in its `ineedlove/` folder. After changing anything
here, refresh that copy from a checkout of this repo:

```sh
cd ../richardham.es && npm run build:ineedlove
```

That script also injects a `<base href="/ineedlove/">` into its copy, because
the site is served without a trailing slash. Nothing in this repo is
path-specific, so it still works served from anywhere else.

To host it somewhere else instead, drop the folder on any static host —
Netlify, Vercel, Cloudflare Pages. `netlify.toml` and `vercel.json` are
included and set `X-Robots-Tag: noindex` plus a no-referrer policy;
`robots.txt` disallows crawlers, and `index.html` carries a `noindex, nofollow`
meta tag. There is no sitemap.

### Privacy

There's no login: access is by URL. `richardham.es/ineedlove` is guessable by
anyone who thinks to try it, so the obscurity is thinner than a random
subdomain would give — the `noindex` meta tag and the `X-Robots-Tag` header
keep it out of search results, but they don't stop someone typing the path.

For a real lock, switch on the shared password: set `gate.enabled` and
`gate.password` in [`js/config.js`](js/config.js).
[`js/gate.js`](js/gate.js) already implements the prompt, and remembers the
answer for the rest of the browser session.

## What's where

| File | What it's for |
| --- | --- |
| `index.html` | Page shell: landing, menus and confirmation screens, basket sheet |
| `css/styles.css` | All the styling — palette and fonts are variables at the top |
| `js/menu-data.js` | **The content.** Edit this to change what's on the menus |
| `js/config.js` | Access key, subject line, optional names, optional password gate |
| `js/basket.js` | Basket state, persisted to `localStorage` |
| `js/email.js` | Formats the email and posts it to Web3Forms |
| `js/gate.js` | Optional shared-password gate (off by default) |
| `js/app.js` | The UI — rendering, screens, interactions |
| `img/` | Placeholder cat illustrations and painterly backgrounds (SVG) |

## Tweaking it

- **Menu items:** `js/menu-data.js`. Add a string to any `items` array, or add a
  whole new menu object — the UI and the email both pick it up automatically.
- **Hug options:** the `hugs` block in the same file (`locations` and `types`).
- **Colours and fonts:** the CSS custom properties at the top of
  `css/styles.css`.
- **Names:** `herName` / `hisName` in `js/config.js`. Left empty (the default)
  the copy stays wordless-and-cute.

## Still to do (Richard)

- [ ] Paste a Web3Forms access key into `js/config.js` to turn on delivery.
- [ ] Decide on names vs. wordless (`herName` / `hisName` in `js/config.js`).
- [ ] Replace the placeholder art in `img/` with the real cat drawings and
      painterly backgrounds. The filenames are what the code expects:
      `cats-hugging.svg`, `cat-happy.svg`, `cat-peeking.svg`, `cat-yellow.svg`,
      `cat-blue.svg`, `bg-leaves.svg`, `bg-lamplit.svg`, `bg-brick.svg`.
