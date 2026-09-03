import { describe, expect, it } from 'vitest';
import { isWebhookUrl, webhookComplete } from './WebhookConnectFields';

/**
 * Tested for the reason `normalisePreviewUrl` is: the value reaches a network
 * destination, and `new URL()` accepts a great deal that is not a webhook.
 */
describe('isWebhookUrl', () => {
  it('accepts http and https endpoints', () => {
    expect(isWebhookUrl('https://api.acme.com/hooks/jimo')).toBe(true);
    expect(isWebhookUrl('http://localhost:3000/hook')).toBe(true);
    expect(isWebhookUrl('https://acme.com')).toBe(true);
  });

  it('ignores surrounding whitespace', () => {
    expect(isWebhookUrl('  https://api.acme.com/hooks/jimo  ')).toBe(true);
  });

  it('rejects empty and malformed values', () => {
    expect(isWebhookUrl('')).toBe(false);
    expect(isWebhookUrl('   ')).toBe(false);
    expect(isWebhookUrl('api.acme.com/hooks')).toBe(false);
    expect(isWebhookUrl('not a url')).toBe(false);
  });

  it('rejects every scheme that is not http(s) — the whole reason this exists', () => {
    expect(isWebhookUrl('javascript:alert(1)')).toBe(false);
    expect(isWebhookUrl('mailto:support@acme.com')).toBe(false);
    expect(isWebhookUrl('file:///etc/passwd')).toBe(false);
    expect(isWebhookUrl('data:text/html,<script>')).toBe(false);
    expect(isWebhookUrl('ftp://acme.com/hook')).toBe(false);
  });
});

describe('webhookComplete', () => {
  it('needs an endpoint', () => {
    expect(webhookComplete({ url: '', secret: '' })).toBe(false);
    expect(webhookComplete({ url: 'nope', secret: 'shh' })).toBe(false);
  });

  it('does NOT need a secret — signing is optional, the endpoint is not', () => {
    expect(webhookComplete({ url: 'https://api.acme.com/hook', secret: '' })).toBe(true);
    expect(webhookComplete({ url: 'https://api.acme.com/hook', secret: 'shh' })).toBe(true);
  });
});
