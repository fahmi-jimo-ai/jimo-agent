import * as React from "react"
import { TickCircle, Warning2, CloseCircle, InfoCircle } from "iconsax-react"

import { cn } from "@/lib/utils"
import { CloseIcon } from "@/components/ui/Icon"
import { Button } from "@/components/ui/Button/Button"

// Moji Design System — Toast + ToastContainer.
// Foundation: .tsx + cn + data-slot. Visuals: verbatim port of Toast.css (incl. the
// hardcoded icon colors). Motion: subtle slide-up + fade-in on enter (ease-out), slide-down
// + fade-out on exit (ease-in). A double rAF guarantees the enter transition actually fires.

type ToastType = "neutral" | "positive" | "warning" | "negative"

const TypeIcon = ({ type }: { type: ToastType }) => {
  switch (type) {
    case "positive":
      return <TickCircle size={24} variant="Bold" color="#159201" />
    case "warning":
      return <Warning2 size={24} variant="Bold" color="#E07900" />
    case "negative":
      return <CloseCircle size={24} variant="Bold" color="#FF4646" />
    case "neutral":
    default:
      return <InfoCircle size={24} variant="Bold" color="#071331" />
  }
}

// .toast--{type} → background + border color
const TYPE_CLASS: Record<ToastType, string> = {
  neutral: "bg-[var(--color-neutral-white)] border-[var(--color-neutral-300)]",
  positive: "bg-[var(--color-green-100)] border-[var(--color-green-300)]",
  warning: "bg-[var(--color-orange-100)] border-[var(--color-orange-300)]",
  negative: "bg-[var(--color-red-100)] border-[var(--color-red-200)]",
}

type ToastProps = {
  type?: ToastType
  title?: React.ReactNode
  body?: React.ReactNode
  dismissable?: boolean
  onDismiss?: () => void
  primaryAction?: React.ReactNode
  onPrimaryAction?: () => void
  secondaryAction?: React.ReactNode
  onSecondaryAction?: () => void
  duration?: number
  className?: string
}

export function Toast({
  type = "neutral",
  title,
  body,
  dismissable = true,
  onDismiss,
  primaryAction,
  onPrimaryAction,
  secondaryAction,
  onSecondaryAction,
  duration = 4000,
  className,
}: ToastProps) {
  const [phase, setPhase] = React.useState<"in" | "exiting">("in")
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const hasActions = primaryAction || secondaryAction

  const triggerDismiss = React.useCallback(() => {
    setPhase((p) => {
      if (p === "exiting") return p
      if (timerRef.current) clearTimeout(timerRef.current)
      // unmount after the exit animation (250ms) finishes
      timerRef.current = setTimeout(() => onDismiss?.(), 250)
      return "exiting"
    })
  }, [onDismiss])

  React.useEffect(() => {
    if (!duration || duration === Infinity) return
    timerRef.current = setTimeout(triggerDismiss, duration)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
    // mount only — matches the original
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const alignClass = !body ? "items-center" : "items-start"

  return (
    <div
      data-slot="toast"
      data-type={type}
      role="alert"
      aria-live="assertive"
      className={cn(
        "flex w-[400px] min-w-[360px] flex-col gap-4 rounded-[var(--radius-lg)] border-2 p-4 shadow-[0px_12px_38px_0px_rgba(0,0,0,0.15)]",
        TYPE_CLASS[type],
        // Keyframe-driven motion (see globals.css). `both` fill holds the start frame before
        // play and the end frame after, so there's no flash and the toast rests in place.
        phase === "in" && "[animation:toast-enter_300ms_ease-out_both]",
        phase === "exiting" && "[animation:toast-exit_250ms_ease-in_both]",
        className
      )}
    >
      <div className={cn("flex w-full gap-4", alignClass)}>
        <div className={cn("flex min-w-0 flex-1 gap-4", alignClass)}>
          <span className="inline-flex h-6 w-6 shrink-0" aria-hidden="true">
            <TypeIcon type={type} />
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <p className="[font:var(--text-subtitle-3)] text-[var(--color-neutral-800)]">{title}</p>
            {body && <p className="[font:var(--text-body-3)] text-[var(--color-neutral-700)]">{body}</p>}
          </div>
        </div>
        {dismissable && (
          <button
            type="button"
            onClick={triggerDismiss}
            aria-label="Dismiss"
            className="inline-flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center border-none bg-none p-0 text-[var(--color-neutral-500)] [transition:color_var(--transition-fast)] hover:text-[var(--color-neutral-800)]"
          >
            <CloseIcon size={20} color="currentColor" />
          </button>
        )}
      </div>
      {hasActions && (
        <div className="flex w-full items-center gap-3">
          {secondaryAction && (
            <Button variant="outline" size="sm" className="flex-1" onClick={onSecondaryAction}>
              {secondaryAction}
            </Button>
          )}
          {primaryAction && (
            <Button variant="default" size="sm" className="flex-1" onClick={onPrimaryAction}>
              {primaryAction}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

Toast.displayName = "Toast"

export function ToastContainer({ children }: { children?: React.ReactNode }) {
  return (
    <div
      data-slot="toast-container"
      aria-label="Notifications"
      className="pointer-events-none fixed bottom-6 left-1/2 z-[9999] flex -translate-x-1/2 flex-col items-center gap-2 [&>*]:pointer-events-auto"
    >
      {children}
    </div>
  )
}

ToastContainer.displayName = "ToastContainer"
