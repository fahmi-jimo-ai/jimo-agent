import * as React from "react"

import { cn } from "@/lib/utils"

// Moji Design System — ModalOverlay.
// Foundation: .tsx + cn + data-slot. Visuals: verbatim port of ModalOverlay.css.
// Full-page backdrop that fades in on mount and fades out before calling onClose.
// Exposes the animated close fn via useModalClose() to all descendants.
//
// Motion: CSS @keyframes (modal-backdrop-* / modal-content-* in globals.css), the same
// approach as Toast — animations start the instant the element mounts / its class changes,
// so the enter never collapses to a single frame the way an rAF-triggered transition can.
// Timing comes from tokens.css: backdrop fades over --transition-base (200ms); content scales
// 0.9→1 on enter, 1→0.9 on exit over --transition-slow (300ms).

const EXIT_DURATION = 300

const ModalOverlayContext = React.createContext<(() => void) | null>(null)

export const useModalClose = () => React.useContext(ModalOverlayContext)

type ModalOverlayProps = {
  onClose?: () => void
  children?: React.ReactNode
  className?: string
}

export function ModalOverlay({ onClose, children, className }: ModalOverlayProps) {
  const [exiting, setExiting] = React.useState(false)

  const handleClose = React.useCallback(() => {
    setExiting((prev) => {
      if (prev) return prev
      setTimeout(() => onClose?.(), EXIT_DURATION)
      return true
    })
  }, [onClose])

  return (
    <ModalOverlayContext.Provider value={handleClose}>
      <div
        data-slot="modal-overlay"
        data-phase={exiting ? "exiting" : "visible"}
        onClick={handleClose}
        className={cn(
          "fixed inset-0 z-[var(--z-modal)] flex items-center justify-center bg-[rgba(0,0,0,0.5)]",
          exiting
            ? "[animation:modal-backdrop-out_var(--transition-base)_both]"
            : "[animation:modal-backdrop-in_var(--transition-base)_both]",
          className
        )}
      >
        <div
          data-slot="modal-content"
          // will-change promotes the scale to a compositor layer for smooth motion.
          className={cn(
            "will-change-transform",
            exiting
              ? "[animation:modal-content-out_var(--transition-slow)_both]"
              : "[animation:modal-content-in_var(--transition-slow)_both]"
          )}
        >
          {children}
        </div>
      </div>
    </ModalOverlayContext.Provider>
  )
}

ModalOverlay.displayName = "ModalOverlay"
