import * as React from 'react';
import { Add, Trash } from 'iconsax-react';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { Badge } from '@/components/ui/Chip/badge';
import { Switch } from '@/components/ui/Toggle/switch';
import { Section } from '@/components/ui/Section/Section';
import { DropdownSelector } from '@/components/ui/DropdownSelector/DropdownSelector';
import { IconButton } from '@/components/ui/IconButton/IconButton';
import { ModalCard } from '@/components/app/ModalCard';
import { Menu, MenuItem } from '@/components/app/Menu';
import { SettingCard, SettingRow } from '@/components/app/SettingRow';
import { useToast } from '@/components/app/toast';
import {
  useSettings,
  setRateLimit,
  withExclusionAdded,
  withExclusionRemoved,
} from '@/state/useSettings';
import { DEMO_EXPERIENCES, RATE_UNITS, type RateUnit } from '@/data/settings';
import { SettingsShell } from '../SettingsShell';
import { ExcludeExperienceDialog } from './ExcludeExperienceDialog';

/**
 * `/settings/rate-limit` — Figma 13:11148 (four frames), reconciled against
 * help.usejimo.com/docs/publish/.../rate-limiting-prevent-overwhelming-users.
 *
 * The docs supply three things the artboards do not:
 *   - The DEFAULT is "1 Experience every 4 hours".
 *   - The reset rule: "After the 4 hours, their experience view count will be
 *     reset", and anything blocked meanwhile becomes eligible again. That is
 *     what the supportive line under the controls says.
 *   - Exclusions can also be set per-experience, by unchecking Rate limiting in
 *     its audience settings — which is why the list may already have entries a
 *     reader did not add here.
 *
 * Vocabulary is the docs': **experience**, not "Poke". Three of the four
 * artboard frames say Poke and one says experience; Poke is the retired name.
 */
const UNIT_LABEL: Record<RateUnit, string> = {
  minute: 'minute',
  hour: 'hour',
  day: 'day',
  week: 'week',
};

export function RateLimitPage() {
  const { rateLimit } = useSettings();
  const toast = useToast();
  const [picking, setPicking] = React.useState(false);
  const [unitOpen, setUnitOpen] = React.useState(false);
  const [removing, setRemoving] = React.useState<string | null>(null);

  const catalogue = React.useMemo(() => DEMO_EXPERIENCES(), []);
  const excluded = rateLimit.excluded
    .map((id) => catalogue.find((e) => e.id === id))
    .filter((e): e is (typeof catalogue)[number] => e != null);

  const removingExp = catalogue.find((e) => e.id === removing) ?? null;

  const plural = (n: number, word: string) => `${word}${n === 1 ? '' : 's'}`;

  return (
    <SettingsShell activeItem="Rate limit" title="Rate limit">
      <SettingCard>
        <SettingRow
          title="Rate limiting"
          description="Limit display frequency to prevent users overwhelmed"
          control={
            <Switch
              checked={rateLimit.enabled}
              aria-label="Rate limiting"
              onCheckedChange={(v) => setRateLimit({ enabled: v === true })}
            />
          }
        />
        <div className="flex flex-col gap-[var(--space-3)] border-t border-[var(--color-border-default)] p-[var(--space-4)]">
          <div className="flex flex-wrap items-center gap-[var(--space-3)]">
            <span className="[font:var(--text-body-3)] text-[var(--color-text-secondary)]">
              Display
            </span>
            <Input
              size="small"
              className="w-[72px]"
              type="number"
              min={1}
              aria-label="Experiences per period"
              disabled={!rateLimit.enabled}
              value={String(rateLimit.count)}
              onChange={(e) =>
                setRateLimit({ count: Math.max(1, Number(e.target.value) || 1) })
              }
            />
            <span className="[font:var(--text-body-3)] text-[var(--color-text-secondary)]">
              {plural(rateLimit.count, 'experience')} every
            </span>
            <Input
              size="small"
              className="w-[72px]"
              type="number"
              min={1}
              aria-label="Period length"
              disabled={!rateLimit.enabled}
              value={String(rateLimit.every)}
              onChange={(e) =>
                setRateLimit({ every: Math.max(1, Number(e.target.value) || 1) })
              }
            />
            <Menu
              open={unitOpen}
              onClose={() => setUnitOpen(false)}
              trigger={
                <DropdownSelector
                  size="small"
                  text={plural(rateLimit.every, UNIT_LABEL[rateLimit.unit])}
                  isOpen={unitOpen}
                  onClick={rateLimit.enabled ? () => setUnitOpen((o) => !o) : undefined}
                />
              }
            >
              {RATE_UNITS.map((u) => (
                <MenuItem
                  key={u}
                  label={plural(rateLimit.every, UNIT_LABEL[u])}
                  selected={u === rateLimit.unit}
                  onClick={() => {
                    setRateLimit({ unit: u });
                    setUnitOpen(false);
                  }}
                />
              ))}
            </Menu>
          </div>
          <span className="[font:var(--text-body-4)] text-[var(--color-text-tertiary)]">
            After the period, each user&rsquo;s view count resets and anything that was blocked
            becomes eligible again.
          </span>
        </div>
      </SettingCard>

      <Section
        title="Excluded experiences"
        description="List of excluded experiences from rate-limiting setting"
        controls={
          <Button
            size="sm"
            variant="outline"
            leftIcon={<Add size={20} variant="Linear" color="currentColor" />}
            onClick={() => setPicking(true)}
          >
            Exclude experience
          </Button>
        }
      >
        {excluded.length === 0 ? (
          <div className="flex flex-col gap-[var(--space-1)] rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border-default)] p-[var(--space-6)] text-center">
            <span className="[font:var(--text-subtitle-3)] text-[var(--color-text-primary)]">
              Nothing is excluded
            </span>
            <span className="[font:var(--text-body-3)] text-[var(--color-text-secondary)]">
              Every live experience obeys the limit above. You can also exclude one from its own
              audience settings.
            </span>
          </div>
        ) : (
          <div className="flex flex-col gap-[var(--space-2)]">
            {excluded.map((e) => (
              <div
                key={e.id}
                className="flex items-center justify-between gap-[var(--space-4)] rounded-[var(--radius-lg)] border border-[var(--color-border-default)] p-[var(--space-3)]"
              >
                <span className="flex min-w-0 items-center gap-[var(--space-3)]">
                  <span className="truncate [font:var(--text-subtitle-4)] text-[var(--color-text-primary)]">
                    {e.name}
                  </span>
                  <Badge type="neutral" size="x-small">
                    {e.type}
                  </Badge>
                </span>
                <IconButton
                  aria-label={`Remove ${e.name} from exclusions`}
                  tip="Remove"
                  icon={<Trash size={20} variant="Linear" color="currentColor" />}
                  onClick={() => setRemoving(e.id)}
                />
              </div>
            ))}
          </div>
        )}
      </Section>

      {picking && (
        <ExcludeExperienceDialog
          excluded={rateLimit.excluded}
          onClose={() => setPicking(false)}
          onConfirm={(ids) => {
            setRateLimit({
              excluded: ids.reduce(withExclusionAdded, rateLimit.excluded),
            });
            toast({
              type: 'positive',
              title: `${ids.length} ${plural(ids.length, 'experience')} excluded`,
            });
          }}
        />
      )}

      {removingExp && (
        // Figma 13:11546 annotates this confirmation verbatim.
        <ModalCard
          variant="confirm"
          title="Remove from excluded rate limiting?"
          onClose={() => setRemoving(null)}
          footer={
            <>
              <Button variant="outline" onClick={() => setRemoving(null)}>
                Cancel
              </Button>
              <Button
                danger
                onClick={() => {
                  setRateLimit({ excluded: withExclusionRemoved(rateLimit.excluded, removingExp.id) });
                  setRemoving(null);
                  toast({ type: 'neutral', title: `${removingExp.name} now obeys the limit` });
                }}
              >
                Remove
              </Button>
            </>
          }
        >
          This will impact the experience with the rate limit you&rsquo;ve set.
        </ModalCard>
      )}
    </SettingsShell>
  );
}
