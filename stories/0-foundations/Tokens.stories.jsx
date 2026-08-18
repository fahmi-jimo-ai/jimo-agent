import React from 'react';

const meta = { title: 'Foundations/Tokens', parameters: { layout: 'padded' } };
export default meta;

const Row = ({ name }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
    <span style={{ width: 32, height: 32, borderRadius: 'var(--radius-md)', background: `var(${name})`, border: '1px solid var(--color-border-default)' }} />
    <code style={{ font: 'var(--text-body-4)', color: 'var(--color-text-secondary)' }}>{name}</code>
  </div>
);

/** The Moji palette this app actually uses, straight from the vendored tokens.css. */
export const Colors = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-4)' }}>
      {[
        '--color-neutral-800', '--color-neutral-700', '--color-neutral-500', '--color-border-default',
        '--color-blue-400', '--color-blue-300', '--color-blue-200', '--color-blue-100',
        '--color-green-400', '--color-green-300', '--color-purple-500', '--color-purple-300',
        '--color-red-400', '--color-red-300', '--color-orange-400', '--color-blue-50',
      ].map((n) => <Row key={n} name={n} />)}
    </div>
  ),
};

export const Typography = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      {['--text-heading-3', '--text-subtitle-2', '--text-subtitle-3', '--text-subtitle-4', '--text-body-2', '--text-body-3', '--text-body-4'].map((t) => (
        <div key={t} style={{ font: `var(${t})`, color: 'var(--color-text-primary)' }}>
          {t} — Route agent requests to support teams directly
        </div>
      ))}
    </div>
  ),
};
