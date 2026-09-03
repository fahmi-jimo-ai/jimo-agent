import * as React from 'react';
import { TickCircle } from 'iconsax-react';
import { Button } from '@/components/ui/Button/Button';
import { Badge } from '@/components/ui/Chip/badge';
import { cn } from '@/lib/utils';
import { monthlyRate, money, type Plan, type BillingPeriod } from './pricing';

/**
 * One plan column — Figma 13:7853 / 13:8060 / 13:9031.
 *
 * When the period is yearly the artboard strikes through the monthly price
 * beside the new one, which is the only place either figure appears twice.
 */
export function PlanCard({
  plan,
  period,
  current,
  trialEligible,
  onChoose,
}: {
  plan: Plan;
  period: BillingPeriod;
  current: boolean;
  trialEligible: boolean;
  onChoose: () => void;
}) {
  const rate = monthlyRate(plan, period);

  return (
    <div
      className={cn(
        'relative flex flex-col gap-[var(--space-5)] rounded-[var(--radius-xl)] border p-[var(--space-5)]',
        plan.popular
          ? 'border-[var(--color-border-focus)] bg-[var(--color-brand-subtle)]'
          : 'border-[var(--color-border-default)] bg-[var(--color-bg-default)]',
      )}
    >
      {plan.popular && (
        <span className="absolute right-[var(--space-5)] top-[var(--space-5)]">
          <Badge type="brand" size="x-small">
            Most Popular
          </Badge>
        </span>
      )}

      <div className="flex flex-col gap-[var(--space-1)]">
        <span className="[font:var(--text-heading-5)] text-[var(--color-text-primary)]">
          {plan.name}
        </span>
        <span className="[font:var(--text-body-3)] text-[var(--color-text-secondary)]">
          {plan.tagline}
        </span>
      </div>

      <div className="flex flex-col gap-[var(--space-1)]">
        <span className="flex items-baseline gap-[var(--space-2)]">
          <span className="[font:var(--text-heading-2)] text-[var(--color-text-primary)]">
            {money(rate)}
          </span>
          {period === 'yearly' && (
            <span className="[font:var(--text-body-2)] text-[var(--color-text-tertiary)] line-through">
              {money(plan.monthly)}
            </span>
          )}
        </span>
        <span className="[font:var(--text-body-4)] text-[var(--color-text-tertiary)]">
          /month, billed {period}
        </span>
      </div>

      <Button
        variant={plan.popular ? 'default' : 'outline'}
        disabled={current}
        onClick={onChoose}
      >
        {current ? 'Current plan' : trialEligible ? 'Start 14 days free trial' : `Choose ${plan.name}`}
      </Button>

      <ul className="flex flex-col gap-[var(--space-3)]">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-[var(--space-2)]">
            <span className="mt-[2px] shrink-0 text-[var(--color-success-default)]">
              <TickCircle size={16} variant="Linear" color="currentColor" />
            </span>
            <span className="[font:var(--text-body-3)] text-[var(--color-text-secondary)]">{f}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
