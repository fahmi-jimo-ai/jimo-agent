import * as React from 'react';
import { ModalOverlay, useModalClose } from '@/components/ui/ModalOverlay/ModalOverlay';
import { CloseIcon } from '@/components/ui/Icon/Icon';
import { cn } from '@/lib/utils';

/**
 * Dialog card for Moji's ModalOverlay.
 *
 * The stopPropagation is REQUIRED, not defensive: ModalOverlay puts its close
 * handler on the backdrop with no guard on the content wrapper, so without
 * this every click inside the dialog dismisses it.
 */
export function ModalCard({
  title,
  onClose,
  children,
  footer,
  width = 560,
  allowOverflow = false,
}: {
  title: React.ReactNode;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: number;
  /**
   * Let children paint outside the card. Required by any dialog holding a
   * dropdown: the default `overflow-hidden` (which clips children to the
   * rounded corners) also clips a menu that opens past the card's bottom edge.
   */
  allowOverflow?: boolean;
}) {
  return (
    <ModalOverlay onClose={onClose}>
      <Body title={title} footer={footer} width={width} allowOverflow={allowOverflow}>
        {children}
      </Body>
    </ModalOverlay>
  );
}

function Body({
  title,
  children,
  footer,
  width,
  allowOverflow,
}: {
  title: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width: number;
  allowOverflow: boolean;
}) {
  const close = useModalClose();

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={(e) => e.stopPropagation()}
      style={{ width }}
      className={cn(
        'flex max-w-[calc(100vw-var(--space-8))] flex-col rounded-[var(--radius-lg)]',
        allowOverflow ? 'overflow-visible' : 'overflow-hidden',
        'bg-[var(--color-neutral-white)] shadow-[var(--shadow-elevation-04)]'
      )}
    >
      <div className="flex items-center justify-between gap-[var(--space-4)] border-b border-[var(--color-border-default)] px-[var(--space-6)] py-[var(--space-5)]">
        <h2 className="m-0 [font:var(--text-subtitle-2)] text-[var(--color-text-primary)]">{title}</h2>
        <button
          type="button"
          onClick={() => close?.()}
          aria-label="Close"
          className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-[var(--radius-full)] border-0 bg-transparent text-[var(--color-text-primary)] [transition:background-color_var(--transition-fast)] hover:bg-[var(--color-bg-muted)]"
        >
          <CloseIcon size={22} color="currentColor" />
        </button>
      </div>

      <div className="flex flex-col gap-[var(--space-4)] px-[var(--space-6)] py-[var(--space-5)]">{children}</div>

      {footer && (
        <div className="flex items-center justify-end gap-[var(--space-3)] border-t border-[var(--color-border-default)] px-[var(--space-6)] py-[var(--space-4)]">
          {footer}
        </div>
      )}
    </div>
  );
}
