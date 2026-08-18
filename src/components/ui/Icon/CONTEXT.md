# Icon

**Atomic level:** Atom
**Source:** `Icon.tsx`

## What it does
Thin passthrough wrapper for `iconsax-react` icons. Also exports four custom Moji SVG icons that have no iconsax equivalent:
- `CloseIcon` — X close button (used in Toast, Chip remove)
- `SpinnerIcon` — animated loading spinner (used in Input loading state)
- `BannerIcon` — Jimo Banners product brand icon (Linear/Bold variants)
- `AgentIcon` — Jimo Agent product brand icon (Linear/Bold variants)

## Props (`Icon` wrapper)

| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `icon` | ComponentType | — | The iconsax (or iconsax-shaped) component to render |
| `size` | number \| string | `24` | Pixel size |
| `color` | string | `'currentColor'` | Keep `"currentColor"` so the Moji color token drives it |
| `variant` | `'Linear'` \| `'Bold'` | `'Linear'` | Forwarded to the icon |
| `className` | string | — | |
| `style` | CSSProperties | — | |

## Custom icon exports

```jsx
import { CloseIcon, SpinnerIcon, BannerIcon, AgentIcon } from '../Icon/Icon';
// All accept: size, color, className, style.
// BannerIcon and AgentIcon also accept variant ('Linear' | 'Bold').
```

## Iconsax icons — always use `currentColor`
```jsx
import { Add, Trash } from 'iconsax-react';
<Add size={20} variant="Linear" color="currentColor" />
```

## Jimo product brand icons (mandatory table)

| Product | Export | Source |
|---------|--------|--------|
| Tours | `Routing2` | `iconsax-react` |
| Surveys | `Notepad2` | `iconsax-react` |
| Banners | `BannerIcon` | `Icon.tsx` |
| Hints | `Notification1` | `iconsax-react` |
| Checklists | `TaskSquare` | `iconsax-react` |
| Resource Centers | `DirectboxNotif` | `iconsax-react` |
| Agent | `AgentIcon` | `Icon.tsx` |
| Spaces | `Element3` | `iconsax-react` |
| Success Tracker | `Chart2` | `iconsax-react` |
| Actions | `Flash1` | `iconsax-react` |
| Users & Segments | `Profile2User` | `iconsax-react` |
| Settings | `Setting2` | `iconsax-react` |

## Import
```jsx
import { Icon, CloseIcon, SpinnerIcon, BannerIcon, AgentIcon } from '../../../src/components/ui/Icon/Icon';
```
