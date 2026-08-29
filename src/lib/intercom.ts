/**
 * Intercom Messenger, installed into this prototype's dashboard.
 *
 * Sibling of `installJimo()` — same shape, same placement, same reason for
 * both. Read that file's header first; only the departures are noted here.
 *
 * THREE things about this install are not what the pasted snippet says, and
 * each one is a decision rather than a shortcut:
 *
 * 1. No `@intercom/messenger-js-sdk` import. The package could not be
 *    installed — `npm install` fails with ENOTFOUND on registry.npmjs.org,
 *    which is this machine's DNS resolver, not npm. What is written out below
 *    IS that package: it sets `window.intercomSettings` and appends the same
 *    `widget.intercom.io/widget/<app_id>` script, with the same call-buffering
 *    queue. Once DNS is fixed the whole body of `installIntercom` collapses to
 *
 *        import Intercom from '@intercom/messenger-js-sdk';
 *        Intercom({ app_id: INTERCOM_APP_ID });
 *
 *    and nothing else in the app has to change, because the export signature
 *    here is already `installIntercom()`.
 *
 * 2. Booted ANONYMOUS — no `user_id` / `name` / `email` / `created_at`. The
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
 * 3. Not called during render. The snippet puts `Intercom({...})` in a
 *    component body, where React is free to run it twice, or not at all. It is
 *    a side effect, so it goes where the Jimo one goes.
 *
 * KNOWN COLLISION, deliberately left alone: Jimo and Intercom both drop a
 * launcher bubble bottom-right, so on `/escalation` they overlap. Both were
 * asked for; suppressing either is a design call, not an install detail.
 */

const INTERCOM_APP_ID = 'l8fng6ag';
const INTERCOM_SRC = `https://widget.intercom.io/widget/${INTERCOM_APP_ID}`;

type IntercomFn = ((...args: unknown[]) => void) & {
  q?: unknown[][];
  c?: (args: unknown) => void;
};

declare global {
  interface Window {
    Intercom?: IntercomFn;
    intercomSettings?: Record<string, unknown>;
  }
}

export function installIntercom(): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.intercomSettings = { app_id: INTERCOM_APP_ID };

  // Already booted (a second call, or StrictMode's double invoke): hand the
  // live messenger the settings again rather than loading the script twice.
  if (typeof window.Intercom === 'function' && window.Intercom.q === undefined) {
    window.Intercom('reattach_activator');
    window.Intercom('update', window.intercomSettings);
    return;
  }

  // The stub queues every call made before the script lands, and the real
  // messenger drains `q` on load. Without it, an `Intercom('show')` fired
  // during the first second is simply lost.
  const stub: IntercomFn = function (...args: unknown[]) {
    stub.c!(args);
  };
  stub.q = [];
  stub.c = function (args: unknown) {
    stub.q!.push(args as unknown[]);
  };
  window.Intercom = stub;

  const load = () => {
    const s = document.createElement('script');
    s.type = 'text/javascript';
    s.async = true;
    s.src = INTERCOM_SRC;
    document.getElementsByTagName('head')[0].appendChild(s);
  };

  if (document.readyState === 'complete') {
    load();
  } else {
    window.addEventListener('load', load, false);
  }
}
