/**
 * Crisp Chat, installed into this prototype's dashboard.
 *
 * Third sibling of `installJimo()` and `installIntercom()` — same shape, same
 * placement, same reasons. Read `src/lib/jimo.ts`'s header first; only the
 * departures are noted here.
 *
 * The body is the pasted Crisp snippet verbatim in behaviour: buffer
 * `window.$crisp` as an array, set the website id on `window`, then append
 * `client.crisp.chat/l.js` to <head>. Anything pushed onto the array before
 * the script loads is replayed once it does, so `$crisp.push([...])` calls are
 * safe at any time.
 *
 * Three things about this install:
 *
 * 1. No npm package. Crisp ships `crisp-sdk-web`, but `npm install` cannot
 *    reach the registry from this machine (see intercom.ts's header for the
 *    resolver problem and the tarball workaround it needed). The raw snippet
 *    has no dependency to add, so it stays a raw snippet.
 *
 * 2. Dashboard only, never `widget.html` — same line the other two draw. That
 *    entry is OUR simulated agent widget; a real vendor launcher beside it
 *    would put two agents on one screen.
 *
 * 3. Module scope, not a `useEffect`. No component wraps the SPA, so the
 *    install is called from `main.tsx` and guards on `window.$crisp != null`
 *    instead — which is also what makes StrictMode's double invoke a no-op.
 *
 * NOT the same Crisp as the one in `/escalation`. That page's Crisp is a
 * SIMULATED support vendor — `CrispConnectFields`, the `crisp` key in
 * `EscalationState`, a workspace token pair that is never sent anywhere. This
 * is the real chat widget, loading the real Crisp client. They share a name
 * and nothing else; changing one says nothing about the other.
 *
 * KNOWN COLLISION, now three-way and deliberately left alone: Jimo, Intercom
 * and Crisp all drop a launcher bottom-right, so on `/escalation` they stack.
 * All three were asked for; suppressing any of them is a design call, not an
 * install detail.
 */

const CRISP_WEBSITE_ID = '4154b989-3149-425c-b6f5-076a2551d318';

declare global {
  interface Window {
    $crisp?: unknown[];
    CRISP_WEBSITE_ID?: string;
  }
}

export function installCrisp(): void {
  if (typeof window === 'undefined' || window.$crisp != null) {
    return;
  }
  window.$crisp = [];
  window.CRISP_WEBSITE_ID = CRISP_WEBSITE_ID;

  const s = document.createElement('script');

  s.type = 'text/javascript';
  s.src = 'https://client.crisp.chat/l.js';
  s.async = true;
  document.getElementsByTagName('head')[0].appendChild(s);
}
