import { describe, it, expect } from 'vitest';
import { normaliseWebhookUrl, webhookComplete, EMPTY_WEBHOOK } from './WebhookConnectFields';

/**
 * The value this returns is the endpoint a hand-off would be POSTed to, with a
 * transcript and the end user's identity in the body. `new URL()` accepts
 * `javascript:` and `mailto:` as happily as it accepts `https:`, so the
 * interesting cases are the ones it accepts and an endpoint must not.
 */
describe('normaliseWebhookUrl', () => {
  it('accepts a full https URL', () => {
    expect(normaliseWebhookUrl('https://hooks.acme.com/jimo')).toBe('https://hooks.acme.com/jimo');
  });

  it('adds https:// to a bare host', () => {
    expect(normaliseWebhookUrl('hooks.acme.com/jimo')).toBe('https://hooks.acme.com/jimo');
  });

  it('trims surrounding whitespace', () => {
    expect(normaliseWebhookUrl('  hooks.acme.com  ')).toBe('https://hooks.acme.com/');
  });

  // The one rule this does NOT share with normalisePreviewUrl: that one opens a
  // tab, this one ships a transcript and a signature.
  it('rejects http, which the preview field allows', () => {
    expect(normaliseWebhookUrl('http://hooks.acme.com')).toBeNull();
  });

  it('rejects an empty value', () => {
    expect(normaliseWebhookUrl('')).toBeNull();
    expect(normaliseWebhookUrl('   ')).toBeNull();
  });

  it('rejects non-http(s) schemes', () => {
    expect(normaliseWebhookUrl('javascript:alert(1)')).toBeNull();
    expect(normaliseWebhookUrl('mailto:someone@acme.com')).toBeNull();
    expect(normaliseWebhookUrl('file:///etc/passwd')).toBeNull();
    expect(normaliseWebhookUrl('data:text/html,<h1>hi</h1>')).toBeNull();
  });

  // "mailto:you@acme.com" gets the https:// prefix and then parses as user
  // `mailto`, password `you`, host `acme.com`.
  it('rejects credentials in the URL', () => {
    expect(normaliseWebhookUrl('https://user:pass@hooks.acme.com')).toBeNull();
  });

  it('rejects a host with no dot', () => {
    expect(normaliseWebhookUrl('hooks')).toBeNull();
    expect(normaliseWebhookUrl('https://hooks')).toBeNull();
  });
});

describe('webhookComplete', () => {
  it('needs a valid endpoint', () => {
    expect(webhookComplete({ ...EMPTY_WEBHOOK, url: 'not a url' })).toBe(false);
    expect(webhookComplete({ ...EMPTY_WEBHOOK, url: 'https://hooks.acme.com' })).toBe(true);
  });

  // A connected integration that fires on nothing is worse than an unconnected
  // one: it reads as working.
  it('needs at least one event', () => {
    expect(webhookComplete({ url: 'https://hooks.acme.com', secret: '', events: [] })).toBe(false);
  });

  it('does not require a secret', () => {
    expect(
      webhookComplete({ url: 'https://hooks.acme.com', secret: '', events: ['escalation'] }),
    ).toBe(true);
  });

  it('ships with the escalation event already on', () => {
    expect(EMPTY_WEBHOOK.events).toEqual(['escalation']);
  });
});
