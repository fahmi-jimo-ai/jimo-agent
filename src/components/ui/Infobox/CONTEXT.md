# Infobox

**Atomic level:** Molecule
**Source:** `alert.tsx` (exported as `Alert` / `alertVariants`)

## What it does
Inline alert/information box. Shows a colored icon, title, optional body text, and an optional CTA link. The icon auto-selects from iconsax-react based on `type`, but can be overridden.

## Props

| Prop | Type | Options | Default | Notes |
|------|------|---------|---------|-------|
| `type` | string | `'neutral'` `'positive'` `'warning'` `'danger'` `'brand'` | `'neutral'` | Color + default icon |
| `title` | ReactNode | — | — | Bold heading |
| `body` | ReactNode | — | — | Body text below title |
| `showIcon` | boolean | — | `true` | Show/hide icon |
| `icon` | ReactNode | — | — | Custom icon (overrides type default) |
| `ctaLabel` | ReactNode | — | — | CTA link text (only rendered when `onCta` is also set) |
| `onCta` | function | — | — | CTA click handler |

Also spreads native `<div>` props (`className`, etc.).

The alert is `shrink-0`, so it keeps its full height inside a flex column and never collapses/clips
its title or CTA when vertical space is tight.

## Type → default icon mapping
- `positive` → `TickCircle`
- `warning` → `Warning2`
- `danger` → `CloseCircle`
- `brand` → `InfoCircle`
- `neutral` → `InfoCircle`

## Dependencies
None — uses iconsax-react icons inline.

## Import
```jsx
import { Alert } from '../../../src/components/ui/Infobox/alert';
```

## Quick example
```jsx
<Alert type="warning" title="Plan limit reached" body="Upgrade to publish more experiences." ctaLabel="Upgrade" onCta={handleUpgrade} />
<Alert type="positive" title="Changes saved" />
<Alert type="danger" title="Action failed" body="Please try again." />
```
