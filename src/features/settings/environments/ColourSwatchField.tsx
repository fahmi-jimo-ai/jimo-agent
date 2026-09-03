import * as React from 'react';
import { Global, Code1, Layer, Health, Flash } from 'iconsax-react';
import { cn } from '@/lib/utils';
import {
  ENVIRONMENT_COLOURS,
  ENVIRONMENT_ICONS,
  type EnvironmentColour,
  type EnvironmentIcon,
} from '@/data/settings';

/**
 * Icon and colour pickers for an environment.
 *
 * A SWATCH GRID over a fixed token palette, deliberately not a free colour
 * picker. An environment's colour is user data, which is exactly the pressure
 * that would otherwise put the first raw hex into this codebase: a picker
 * yields `#3f7d2a`, and the ONE rule says every colour binds to a token. So the
 * stored value is a token NAME (`'blue'`) resolved at render, the same thing
 * `Avatar` does with its seeded tint.
 *
 * The five colours and five icons are invented — the docs say "choose an icon
 * and color" and name neither.
 */
const SWATCH: Record<EnvironmentColour, string> = {
  blue: 'bg-[var(--color-blue-400)]',
  green: 'bg-[var(--color-green-400)]',
  purple: 'bg-[var(--color-purple-400)]',
  orange: 'bg-[var(--color-orange-500)]',
  red: 'bg-[var(--color-red-400)]',
};

/** The same palette at tint strength, for the environment tile. */
export const TILE_TINT: Record<string, string> = {
  blue: 'bg-[var(--color-blue-100)] text-[var(--color-blue-500)]',
  green: 'bg-[var(--color-green-100)] text-[var(--color-green-500)]',
  purple: 'bg-[var(--color-purple-100)] text-[var(--color-purple-500)]',
  orange: 'bg-[var(--color-orange-100)] text-[var(--color-orange-500)]',
  red: 'bg-[var(--color-red-100)] text-[var(--color-red-500)]',
};

const ICONS: Record<EnvironmentIcon, React.ElementType> = {
  global: Global,
  code: Code1,
  layer: Layer,
  health: Health,
  flash: Flash,
};

export function EnvIcon({ icon, size = 20 }: { icon: string; size?: number }) {
  const Ico = ICONS[(icon as EnvironmentIcon) in ICONS ? (icon as EnvironmentIcon) : 'global'];
  return <Ico size={size} variant="Linear" color="currentColor" />;
}

export function ColourSwatchField({
  value,
  onChange,
}: {
  value: string;
  onChange: (colour: EnvironmentColour) => void;
}) {
  return (
    <div className="flex flex-col gap-[var(--space-2)]">
      <span className="[font:var(--text-subtitle-4)] text-[var(--color-text-primary)]">Colour</span>
      <div className="flex gap-[var(--space-2)]" role="radiogroup" aria-label="Environment colour">
        {ENVIRONMENT_COLOURS.map((c) => (
          <button
            key={c}
            type="button"
            role="radio"
            aria-checked={c === value}
            aria-label={c}
            className={cn(
              'size-8 rounded-[var(--radius-full)] border-2 [transition:border-color_var(--transition-fast)]',
              SWATCH[c],
              c === value ? 'border-[var(--color-text-primary)]' : 'border-transparent',
            )}
            onClick={() => onChange(c)}
          />
        ))}
      </div>
    </div>
  );
}

export function IconPickerField({
  value,
  onChange,
}: {
  value: string;
  onChange: (icon: EnvironmentIcon) => void;
}) {
  return (
    <div className="flex flex-col gap-[var(--space-2)]">
      <span className="[font:var(--text-subtitle-4)] text-[var(--color-text-primary)]">Icon</span>
      <div className="flex gap-[var(--space-2)]" role="radiogroup" aria-label="Environment icon">
        {ENVIRONMENT_ICONS.map((i) => (
          <button
            key={i}
            type="button"
            role="radio"
            aria-checked={i === value}
            aria-label={i}
            className={cn(
              'inline-flex size-9 items-center justify-center rounded-[var(--radius-lg)] border [transition:border-color_var(--transition-fast),background-color_var(--transition-fast)]',
              i === value
                ? 'border-[var(--color-border-focus)] bg-[var(--color-brand-subtle)] text-[var(--color-brand-default)]'
                : 'border-[var(--color-border-default)] text-[var(--color-text-secondary)]',
            )}
            onClick={() => onChange(i)}
          >
            <EnvIcon icon={i} />
          </button>
        ))}
      </div>
    </div>
  );
}
