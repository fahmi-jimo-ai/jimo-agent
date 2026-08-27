import { describe, it, expect } from 'vitest';
import { normalisePreviewUrl } from './PreviewInAppModal';

/**
 * The value this returns goes straight into `window.open`, so the interesting
 * cases are the ones `new URL()` accepts and a preview must not.
 */
describe('normalisePreviewUrl', () => {
  it('accepts a full https URL unchanged', () => {
    expect(normalisePreviewUrl('https://app.acme.com')).toBe('https://app.acme.com/');
  });

  it('accepts http', () => {
    expect(normalisePreviewUrl('http://localhost.acme.com/x')).toBe('http://localhost.acme.com/x');
  });

  it('adds https:// to a bare host', () => {
    expect(normalisePreviewUrl('app.acme.com/settings')).toBe('https://app.acme.com/settings');
  });

  it('trims surrounding whitespace', () => {
    expect(normalisePreviewUrl('  app.acme.com  ')).toBe('https://app.acme.com/');
  });

  it('rejects an empty value', () => {
    expect(normalisePreviewUrl('')).toBeNull();
    expect(normalisePreviewUrl('   ')).toBeNull();
  });

  // `new URL('javascript:alert(1)')` parses happily. Checking the protocol is
  // the whole reason this function exists rather than a try/catch at the call
  // site.
  it('rejects non-http(s) schemes', () => {
    expect(normalisePreviewUrl('javascript:alert(1)')).toBeNull();
    expect(normalisePreviewUrl('mailto:someone@acme.com')).toBeNull();
    expect(normalisePreviewUrl('file:///etc/passwd')).toBeNull();
    expect(normalisePreviewUrl('data:text/html,<h1>hi</h1>')).toBeNull();
  });

  // A single word would otherwise become https://localhost-ish and open a page
  // on the dashboard's own host.
  it('rejects a host with no dot', () => {
    expect(normalisePreviewUrl('acme')).toBeNull();
    expect(normalisePreviewUrl('https://acme')).toBeNull();
  });
});
