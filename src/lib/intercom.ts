/**
 * Intercom Messenger, installed into this prototype's dashboard.
 *
 * Sibling of `installJimo()` — same shape, same placement, same reason for
 * both. Read that file's header first; only the departures are noted here.
 *
 * This is now the real `@intercom/messenger-js-sdk` (0.0.20). It used to be a
 * hand-written copy of that package, because `npm install` could not reach
 * registry.npmjs.org from this machine; the package is vendored into
 * node_modules from a checksum-verified tarball instead, and package.json and
 * package-lock.json carry the ordinary registry entry, so CI and Vercel
 * install it normally. The body collapsed to the two lines the old header
 * predicted, and nothing else in the app changed, because the export was
 * already `installIntercom()`.
 *
 * TWO things about this install are still not what Intercom's pasted snippet
 * says, and each one is a decision rather than a shortcut:
 *
 * 1. Booted ANONYMOUS — no `user_id` / `name` / `email` / `created_at`. The
 *    snippet's four fields all read off a `user` object; this app has no auth
 *    and no current user to read (there is no session, no profile, nothing in
 *    the stores). Intercom treats a boot with only `app_id` as a logged-out
 *    visitor, which is the true statement here. Inventing a demo identity is
 *    the one option that would be actively wrong: `user_id` creates a real
 *    contact in the real l8fng6ag workspace, and a fake one cannot be undone
 *    from this side. Wire the four fields the moment a user exists — and note
 *    that a `user_id` boot should also carry an Identity Verification HMAC,
 *    which needs a server this prototype does not have.
 *
 * 2. Not called during render. The snippet puts `Intercom({...})` in a
 *    component body, where React is free to run it twice, or not at all. It is
 *    a side effect, so it goes where the Jimo one goes — module scope in
 *    main.tsx. The double-call guard that used to live here is now the SDK's:
 *    its loader keys off a `_intercom_npm_loader` script id and re-`update`s a
 *    booted messenger rather than appending a second script, so StrictMode's
 *    double invoke is a no-op either way.
 *
 * KNOWN COLLISION, deliberately left alone: Jimo and Intercom both drop a
 * launcher bubble bottom-right, so on `/escalation` they overlap. Both were
 * asked for; suppressing either is a design call, not an install detail.
 */

import Intercom from '@intercom/messenger-js-sdk';

const INTERCOM_APP_ID = 'l8fng6ag';

export function installIntercom(): void {
  Intercom({ app_id: INTERCOM_APP_ID });
}
