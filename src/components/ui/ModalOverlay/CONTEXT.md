# ModalOverlay

**Atomic level:** Organism
**Source:** `ModalOverlay.tsx` (Tailwind + cn)

## What it does
Full-screen animated backdrop for modal dialogs. Uses phase-based animation (entering → visible → exiting) for smooth fade in/out. Exports a `useModalClose()` hook for triggering animated dismissal from inside the modal content.

## Exports

| Export | Type | Notes |
|--------|------|-------|
| `ModalOverlay` | component | The backdrop wrapper |
| `useModalClose` | hook | Returns `closeModal()` — triggers exit animation then calls `onClose` |

## Props — ModalOverlay

| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `onClose` | function | — | Called after the exit animation (~200ms) completes |
| `children` | node | — | Modal content rendered over the overlay |
| `className` | string | — | Extra classes merged onto the backdrop |

Clicking the backdrop triggers the animated close.

## Usage pattern
```jsx
import { ModalOverlay, useModalClose } from '../../../src/components/ui/ModalOverlay/ModalOverlay';

function MyModal({ onClose }) {
  const closeModal = useModalClose(); // must be inside ModalOverlay tree

  return (
    <ModalOverlay onClose={onClose}>
      <div className="modal-dialog">
        <h2>Title</h2>
        <Button onClick={closeModal}>Cancel</Button>
      </div>
    </ModalOverlay>
  );
}
```

## Dependencies
None — uses React Context internally.

## Import
```jsx
import { ModalOverlay, useModalClose } from '../../../src/components/ui/ModalOverlay/ModalOverlay';
```
