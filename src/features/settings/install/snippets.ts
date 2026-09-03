/**
 * Installation snippets.
 *
 * TRANSCRIBED, not invented: every one of these is from the Jimo Help Center or
 * from the artboard's own code block, with only the project id substituted.
 *
 *   hook / class          Figma 13:9732 (the artboard prints both)
 *   CSP allow-list        /docs/for-developers/for-developers/install-our-sdk
 *   identify / verify     /docs/settings/installation → Identification
 *   set user attributes   /docs/settings/installation + the artboard
 *
 * Do not "tidy" these. The whole point of the page is that a developer can copy
 * one and have it work, so they must match what Jimo actually documents.
 */

export const hookSnippet = (projectId: string) => `// For a project using hooks
useEffect(() => {
  if (window.jimo != null) return;
  window.jimo = [];
  const s = document.createElement('script');
  s.type = 'text/javascript';
  s.async = true;
  s.src = 'https://undercity.usejimo.com/jimo-invader.js';
  window['JIMO_PROJECT_ID'] = '${projectId}';
  document.getElementsByTagName('head')[0].appendChild(s);
}, []);`;

export const classSnippet = (projectId: string) => `// For a project using class components
async componentDidMount() {
  if (window.jimo != null) return;
  window.jimo = [];
  const s = document.createElement('script');
  s.type = 'text/javascript';
  s.async = true;
  s.src = 'https://undercity.usejimo.com/jimo-invader.js';
  window['JIMO_PROJECT_ID'] = '${projectId}';
  document.getElementsByTagName('head')[0].appendChild(s);
}`;

export const htmlSnippet = (projectId: string) => `<!-- Paste in the <head> of your site -->
<script>
  window.jimo = [];
  (function (j) {
    var s = document.createElement('script');
    s.type = 'text/javascript';
    s.async = true;
    s.src = 'https://undercity.usejimo.com/jimo-invader.js';
    j['JIMO_PROJECT_ID'] = '${projectId}';
    document.getElementsByTagName('head')[0].appendChild(s);
  })(window);
</script>`;

export const identifySnippet = `window['jimo'].push(['do', 'identify', [userId]]);`;

export const verifySnippet = `// Pass the signed identifier alongside the user id.
// The second argument is the legacy callback slot — leave it null.
window['jimo'].push(['do', 'identify', [identifier, null, signedIdentifier]]);`;

export const attributeSnippets = [
  {
    label: 'Change user email',
    code: `window.jimo.push(['set', 'user:email', ['john.doe@company.com']]);`,
  },
  {
    label: 'Change user name',
    code: `window.jimo.push(['set', 'user:name', ['John']]);`,
  },
  {
    label: 'Change user attributes',
    code: `window.jimo.push(['set', 'user:attributes', [{ plan: 'pro', region: 'eu' }]]);`,
  },
];

/** /docs/for-developers/for-developers/install-our-sdk — the CSP section. */
export const CSP_DOMAINS = [
  'i.usejimo.com',
  'res.usejimo.com',
  'stormwind.usejimo.com',
  'undercity.usejimo.com',
  'assets.usejimo.com',
  'karabor.usejimo.com',
  'karabor-undercity.usejimo.com',
  'karabor-undercity-cf.usejimo.com',
  '*.usejimo.com',
];

export const cspSnippet = `script-src 'self' 'unsafe-inline' https://undercity.usejimo.com;
style-src 'self' 'unsafe-inline' https://undercity.usejimo.com;
connect-src 'self' https://karabor.usejimo.com https://karabor-undercity.usejimo.com https://karabor-undercity-cf.usejimo.com;
frame-src 'self' https://i.usejimo.com https://stormwind.usejimo.com https://*.usejimo.com;
img-src 'self' data: https://res.usejimo.com https://assets.usejimo.com;
font-src 'self' data: https://res.usejimo.com https://assets.usejimo.com;
media-src 'self' https://res.usejimo.com https://assets.usejimo.com;`;
