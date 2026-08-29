import { describe, it, expect } from 'vitest';
import { toUrlRule, toPageName } from './ScanPageModal';
import { normalisePreviewUrl } from '../PreviewInAppModal';

/**
 * These two decide what a scanned card SAYS — its title and its `URL equals:`
 * chip — from the one thing the user typed. Both run on the output of
 * `normalisePreviewUrl`, never on raw input, so every case here is piped
 * through it the way `ScanPageModal.onScan` does.
 */
const scanned = (typed: string) => {
  const url = normalisePreviewUrl(typed);
  if (!url) throw new Error(`expected ${typed} to normalise`);
  return { rule: toUrlRule(url), name: toPageName(url) };
};

describe('toUrlRule', () => {
  it('drops the scheme, because the chip prints the bare rule', () => {
    expect(scanned('https://app.acme.com/dashboard').rule).toBe('app.acme.com/dashboard');
  });

  it('drops the trailing slash a bare host normalises to', () => {
    // normalisePreviewUrl turns "app.acme.com" into "https://app.acme.com/",
    // and "app.acme.com/" is not a rule anybody wrote.
    expect(scanned('app.acme.com').rule).toBe('app.acme.com');
  });

  it('keeps a nested path whole', () => {
    expect(scanned('app.acme.com/settings/billing').rule).toBe('app.acme.com/settings/billing');
  });
});

describe('toPageName', () => {
  it('names the page after its last path segment, not its host', () => {
    expect(scanned('app.acme.com/settings/billing').name).toBe('Billing');
  });

  it('turns a slug into words', () => {
    expect(scanned('app.acme.com/billing-and-plan').name).toBe('Billing And Plan');
    expect(scanned('app.acme.com/product_tours').name).toBe('Product Tours');
  });

  it('falls back to the host when there is no path', () => {
    expect(scanned('https://dashboard.acme.com').name).toBe('Dashboard');
  });

  it('strips a file extension so a card is not named "Index.html"', () => {
    expect(scanned('app.acme.com/reports/index.html').name).toBe('Index');
  });

  it('ignores a trailing slash rather than naming the page after the host', () => {
    expect(scanned('app.acme.com/experiences/').name).toBe('Experiences');
  });
});
