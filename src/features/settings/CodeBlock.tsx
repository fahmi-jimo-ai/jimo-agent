import * as React from 'react';
import { Copy, TickCircle } from 'iconsax-react';
import { Button } from '@/components/ui/Button/Button';
import { useToast } from '@/components/app/toast';
import { cn } from '@/lib/utils';

/**
 * A copyable code block — the Installation snippet, the SDK commands, the CSP
 * example, the webhook payload.
 *
 * Deliberately NOT syntax-highlighted. The artboards colour their snippets, but
 * doing that for real means a tokenizer and a second colour system that is not
 * in `tokens.css`; a monospace block on the muted ground reads correctly, and
 * inventing a highlight palette would be the first set of raw colours in the
 * codebase. Said here so the omission is a decision rather than an oversight.
 *
 * `overflow-x-auto` on the <pre> is load-bearing: a long snippet must scroll
 * inside its own box rather than widening the settings column.
 */
export function CodeBlock({
  code,
  label,
  className,
}: {
  code: string;
  /** Optional caption above the block. */
  label?: React.ReactNode;
  className?: string;
}) {
  const [copied, setCopied] = React.useState(false);
  const toast = useToast();

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      toast({ type: 'negative', title: 'Could not copy' });
    }
  };

  return (
    <div className={cn('flex flex-col gap-[var(--space-2)]', className)}>
      {label != null && (
        <span className="[font:var(--text-subtitle-4)] text-[var(--color-text-secondary)]">
          {label}
        </span>
      )}
      <div className="relative">
        <pre className="overflow-x-auto rounded-[var(--radius-lg)] bg-[var(--color-bg-muted)] p-[var(--space-4)] pr-[var(--space-10)] [font:var(--text-body-4)] font-mono text-[var(--color-text-secondary)]">
          <code>{code}</code>
        </pre>
        <Button
          variant="outline"
          size="sm"
          className="absolute right-[var(--space-2)] top-[var(--space-2)]"
          leftIcon={
            copied ? (
              <TickCircle size={16} variant="Linear" color="currentColor" />
            ) : (
              <Copy size={16} variant="Linear" color="currentColor" />
            )
          }
          onClick={copy}
        >
          {copied ? 'Copied' : 'Copy'}
        </Button>
      </div>
    </div>
  );
}
