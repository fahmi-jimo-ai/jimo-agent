import * as React from 'react';
import { ImportCurve, Copy, TickCircle } from 'iconsax-react';
import { Button } from '@/components/ui/Button/Button';
import { IconButton } from '@/components/ui/IconButton/IconButton';
import { SettingRow } from '@/components/app/SettingRow';
import { useToast } from '@/components/app/toast';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/app/Avatar';

/**
 * The four field shapes `/settings` repeats, each a composition over a Moji
 * component rather than a re-draw of one.
 */

/**
 * Project logo (General) and Avatar (My Account). One component, not two: both
 * artboards draw the identical Upload/Remove pair with the identical helper
 * line, differing only in whether the preview is a square or a disc.
 *
 * The file is read as a data: URI so it round-trips through localStorage with
 * the rest of the record — there is no upload endpoint to point at.
 */
export function ImageUploadField({
  label,
  value,
  onChange,
  shape = 'square',
  fallbackName,
  removeLabel = 'Remove image',
}: {
  label: string;
  value: string | null;
  onChange: (next: string | null) => void;
  shape?: 'square' | 'circle';
  /** Initials shown when there is no image. */
  fallbackName: string;
  removeLabel?: string;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const toast = useToast();

  const pick = (file: File | undefined) => {
    if (!file) return;
    // Docs and artboard both say "under 10mb".
    if (file.size > 10 * 1024 * 1024) {
      toast({ type: 'negative', title: 'That image is over 10mb' });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => onChange(typeof reader.result === 'string' ? reader.result : null);
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex items-center justify-between gap-[var(--space-6)] p-[var(--space-4)]">
      <div className="flex min-w-0 items-center gap-[var(--space-4)]">
        {value ? (
          <img
            src={value}
            alt=""
            className={cn(
              'size-14 shrink-0 object-cover',
              shape === 'circle' ? 'rounded-[var(--radius-full)]' : 'rounded-[var(--radius-lg)]',
            )}
          />
        ) : (
          <Avatar
            name={fallbackName}
            size="large"
            className={cn(
              'size-14 shrink-0',
              shape === 'square' && 'rounded-[var(--radius-lg)]',
            )}
          />
        )}
        <div className="flex min-w-0 flex-col gap-[var(--space-1)]">
          <span className="[font:var(--text-subtitle-3)] text-[var(--color-text-primary)]">
            {label}
          </span>
          <span className="[font:var(--text-body-3)] text-[var(--color-text-secondary)]">
            PNG or JPEG format under 10mb (56×56px)
          </span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-[var(--space-3)]">
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg"
          className="sr-only"
          onChange={(e) => {
            pick(e.target.files?.[0]);
            // Let the same file be picked twice in a row.
            e.target.value = '';
          }}
        />
        <Button
          variant="outline"
          leftIcon={<ImportCurve size={20} variant="Linear" color="currentColor" />}
          onClick={() => inputRef.current?.click()}
        >
          Upload image
        </Button>
        <Button variant="link" danger disabled={value === null} onClick={() => onChange(null)}>
          {removeLabel}
        </Button>
      </div>
    </div>
  );
}

/**
 * A value you can read and copy but not edit — the Project ID the docs require
 * on General ("a unique, uneditable identifier... used mainly for API
 * interactions and support references"), which no artboard draws.
 */
export function ReadOnlyRow({
  title,
  description,
  value,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  value: string;
}) {
  const [copied, setCopied] = React.useState(false);
  const toast = useToast();

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      toast({ type: 'negative', title: 'Could not copy' });
    }
  };

  return (
    <SettingRow
      title={title}
      description={description}
      control={
        <div className="flex items-center gap-[var(--space-3)]">
          <code className="rounded-[var(--radius-md)] bg-[var(--color-bg-muted)] px-[var(--space-3)] py-[var(--space-2)] [font:var(--text-body-4)] text-[var(--color-text-secondary)]">
            {value}
          </code>
          <IconButton
            aria-label={`Copy ${String(title)}`}
            tip={copied ? 'Copied' : 'Copy'}
            onClick={copy}
            icon={
              copied ? (
                <TickCircle size={20} variant="Linear" color="currentColor" />
              ) : (
                <Copy size={20} variant="Linear" color="currentColor" />
              )
            }
          />
        </div>
      }
    />
  );
}

/**
 * The destructive row. Its own card everywhere it appears, with the title in
 * danger red — which is what both the General and My Account artboards draw.
 */
export function DangerRow({
  title,
  description,
  action,
  onAction,
}: {
  title: string;
  description: string;
  action: string;
  onAction: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-[var(--space-6)] rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-bg-default)] p-[var(--space-4)]">
      <div className="flex min-w-0 flex-col gap-[var(--space-1)]">
        <span className="[font:var(--text-subtitle-3)] text-[var(--color-danger-default)]">
          {title}
        </span>
        <span className="[font:var(--text-body-3)] text-[var(--color-text-secondary)]">
          {description}
        </span>
      </div>
      <Button danger className="shrink-0" onClick={onAction}>
        {action}
      </Button>
    </div>
  );
}
