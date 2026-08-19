/**
 * config.js — the bits Richard needs to fill in.
 *
 * Nothing here is a secret in the cryptographic sense: this file ships to the
 * browser. The Web3Forms access key is designed to be public — it only ever
 * delivers mail to the address you registered with it, which is why the
 * recipient address is NOT stored in this repo.
 */

export const CONFIG = {
  /**
   * TODO (Richard): paste your Web3Forms access key here.
   *
   * 1. Go to https://web3forms.com, enter the recipient address (the one in
   *    spec.md), and they email you an access key.
   * 2. Paste it below, replacing the placeholder.
   *
   * The recipient address is bound to the key at Web3Forms' end, so it never
   * appears in this codebase.
   *
   * While the placeholder is still here the site runs in "preview mode": the
   * Send button works and shows the confirmation screen, but no email goes
   * out and the composed message is logged to the browser console instead.
   */
  web3formsAccessKey: 'TODO-WEB3FORMS-ACCESS-KEY',

  /** Subject line of the email that lands in Richard's inbox. */
  emailSubject: 'A request from the affection menu 💛',

  /** Shown as the sender name in the email. */
  fromName: 'The Affection Menu',

  /**
   * TODO (Richard): names, or wordless-and-cute?
   *
   * Leave both empty for the wordless version (the copy just says "you" and
   * "me"). Fill them in to have the site greet her by name and sign off with
   * yours.
   */
  herName: '',
  hisName: '',

  /**
   * Optional shared-password gate. Off by default — access is by secret link.
   *
   * To switch it on later: set `enabled: true` and put a password in
   * `password`. See js/gate.js — no other file needs to change. This is a
   * soft gate (the password is in client-side JS), in the same
   * security-by-obscurity spirit as the secret link.
   */
  gate: {
    enabled: false,
    password: '',
    prompt: 'Say the magic word',
  },
};
