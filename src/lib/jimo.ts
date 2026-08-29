/**
 * The real Jimo snippet, installed into this prototype's dashboard.
 *
 * Verbatim behaviour from the install docs (Jimo Help Center → For developers
 * → Install our SDK): buffer `window.jimo` as an array, set the project id on
 * `window`, then append the invader script to <head>. Anything pushed onto the
 * array before the script loads is replayed once it does — that buffering is
 * the whole point of the array, so `set` / `do` calls are safe at any time:
 *
 *   window.jimo.push(['set', 'user:email', ['fahmi@usejimo.com']]);
 *   window.jimo.push(['do', 'identify', ['user_123']]);   // identify goes LAST
 *
 * Two deliberate departures from the generic docs snippet, both from the
 * project's own install page:
 *
 * - The host is `testing.undercity.usejimo.com`, not the docs' plain
 *   `undercity.usejimo.com` — this is the testing project, and `JIMO_DEBUG`
 *   is on to match it.
 * - Dashboard only. `widget.html` is OUR simulated agent widget in its own
 *   tab; loading the real launcher alongside it would put two agents on one
 *   screen, and the simulator is the thing being demoed there.
 *
 * The docs write this as a `useEffect` / `componentDidMount`. There is no
 * component that wraps the whole SPA — `main.tsx` mounts the router directly —
 * so it is called there instead. The `window.jimo != null` guard is what the
 * docs' own snippet uses, and it is also what makes StrictMode's double
 * invocation and any repeat call a no-op.
 */

const JIMO_SRC = 'https://testing.undercity.usejimo.com/jimo-invader.js';
const JIMO_PROJECT_ID = '69331a7f-e875-4ee2-9ac7-823f84eb62aa';

declare global {
  interface Window {
    jimo?: unknown[];
    JIMO_PROJECT_ID?: string;
    JIMO_DEBUG?: boolean;
  }
}

export function installJimo(): void {
  if (typeof window === 'undefined' || window.jimo != null) {
    return;
  }
  window.jimo = [];

  const s = document.createElement('script');

  s.type = 'text/javascript';
  s.async = true;
  s.src = JIMO_SRC;
  window['JIMO_PROJECT_ID'] = JIMO_PROJECT_ID;
  window['JIMO_DEBUG'] = true;
  document.getElementsByTagName('head')[0].appendChild(s);
}
