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
   * Web3Forms access key. THIS is the only place a key goes — nowhere else in
   * the code needs editing to turn on email.
   *
   * To get one: go to https://web3forms.com, enter the recipient address, and
   * they email you a key. That address is bound to the key at Web3Forms' end,
   * so the recipient's email never appears in this codebase — there is nothing
   * else to fill in for delivery.
   *
   * While this is left as the "TODO-" default the site runs in "preview mode":
   * Send works and shows the confirmation screen, but no email goes out and the
   * composed message is logged to the browser console instead. Any real key
   * (a UUID) switches delivery on.
   */
  web3formsAccessKey: '0dd2d992-f11d-4ae6-85a8-4f284f07e0f3',

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
  herName: 'Vicky',
  hisName: 'Richard',

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
