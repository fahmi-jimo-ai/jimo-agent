import * as React from 'react';
import { Add, Minus, TickCircle } from 'iconsax-react';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { Badge } from '@/components/ui/Chip/badge';
import { Switch } from '@/components/ui/Toggle/switch';
import { Alert } from '@/components/ui/Infobox/alert';
import { IconButton } from '@/components/ui/IconButton/IconButton';
import { SpinnerIcon } from '@/components/ui/Icon/Icon';
import { ModalCard } from '@/components/app/ModalCard';
import { armTraining } from '@/state/trainingTimers';
import { PAYMENT_MS } from '@/state/settingsStore';
import {
  orderSummary,
  proration,
  money,
  yearlySaving,
  planById,
  HIDE_LABEL_MONTHLY,
  EXTRA_SEAT_MONTHLY,
  type Plan,
  type BillingPeriod,
  type PlanId,
} from './pricing';

/**
 * Checkout — Figma 13:4206, 13:7852's nine checkout frames, 13:6937 (pro-rated)
 * and 13:13346 (the three success modals).
 *
 * ONE `ModalCard` with steps, never a dialog on a dialog. That is the rule this
 * flow exists to respect: the artboards draw fourteen separate frames because
 * Figma has no other way to show a sequence, and rendering a second card over
 * the first would darken the page twice and give Escape two targets.
 *
 *   seats -> addons -> payment -> processing -> success
 *   `cancel` is a CONFIRM-VARIANT STEP of the same card, reached from the back
 *   control — Figma 13:8815 draws it as "Cancel Upgrade?", and the card eases
 *   its width from 560 to 440 rather than opening anything new.
 *
 * The three per-plan success modals are this card's `success` step with the
 * plan's own copy, not three components.
 */
type Step = 'seats' | 'addons' | 'payment' | 'processing' | 'success' | 'cancel';

export function CheckoutModal({
  plan,
  period,
  currentPlan,
  daysLeft,
  daysInPeriod,
  onClose,
  onComplete,
}: {
  plan: Plan;
  period: BillingPeriod;
  /** null when there is no subscription — then there is nothing to prorate. */
  currentPlan: PlanId | null;
  daysLeft: number;
  daysInPeriod: number;
  onClose: () => void;
  onComplete: (input: { seats: number; addon: boolean; coupon: string | null }) => void;
}) {
  const [step, setStep] = React.useState<Step>('seats');
  const [back, setBack] = React.useState(false);
  const [seats, setSeats] = React.useState(plan.seats);
  const [addon, setAddon] = React.useState(false);
  const [coupon, setCoupon] = React.useState('');
  const [card, setCard] = React.useState('');

  const summary = orderSummary({ plan, period, seats, addon, coupon: coupon || null });
  const from = currentPlan && currentPlan !== 'free' ? planById(currentPlan) : null;
  const pro = proration(from, plan, period, daysLeft, daysInPeriod);
  const saving = period === 'yearly' ? yearlySaving(plan) : 0;

  const go = (next: Step, isBack = false) => {
    setBack(isBack);
    setStep(next);
  };

  const pay = () => {
    go('processing');
    // Faked, and quarantined in the same registry as training and scanning.
    // Not resumed on mount: a checkout is not persisted until it completes, so
    // there is no half-finished state a reload could strand.
    armTraining('checkout', () => go('success'), PAYMENT_MS);
  };

  const title =
    step === 'cancel'
      ? 'Cancel upgrade?'
      : step === 'success'
        ? `Welcome to ${plan.name} Plan`
        : `Upgrade to ${plan.name}`;

  return (
    <ModalCard
      title={title}
      variant={step === 'cancel' || step === 'success' ? 'confirm' : 'card'}
      step={step}
      direction={back ? 'back' : 'forward'}
      onClose={step === 'processing' ? () => {} : () => go('cancel')}
      footer={footer()}
    >
      {body()}
    </ModalCard>
  );

  function footer() {
    switch (step) {
      case 'seats':
        return (
          <>
            <Button variant="outline" onClick={() => go('cancel')}>
              Cancel
            </Button>
            <Button onClick={() => go('addons')}>Continue</Button>
          </>
        );
      case 'addons':
        return (
          <>
            <Button variant="outline" onClick={() => go('seats', true)}>
              Back
            </Button>
            <Button onClick={() => go('payment')}>Continue</Button>
          </>
        );
      case 'payment':
        return (
          <>
            <Button variant="outline" onClick={() => go('addons', true)}>
              Back
            </Button>
            <Button disabled={card.trim().length < 12} onClick={pay}>
              Pay {money(pro.dueToday === 0 ? summary.total : pro.dueToday)}
            </Button>
          </>
        );
      case 'processing':
        return undefined;
      case 'success':
        return (
          <Button
            onClick={() => {
              onComplete({ seats, addon, coupon: coupon || null });
              onClose();
            }}
          >
            Let&rsquo;s go!
          </Button>
        );
      case 'cancel':
        return (
          <>
            <Button variant="outline" onClick={() => go('seats', true)}>
              Keep going
            </Button>
            <Button danger onClick={onClose}>
              Cancel upgrade
            </Button>
          </>
        );
    }
  }

  function body() {
    switch (step) {
      case 'seats':
        return (
          <div className="flex flex-col gap-[var(--space-5)]">
            {saving > 0 && (
              <Alert
                type="positive"
                title={`You've just saved ${money(saving)}! 🎉`}
                body={`Billed yearly at ${money(summary.planCost)} instead of ${money(plan.monthly * 12)}.`}
              />
            )}
            <div className="flex items-center justify-between gap-[var(--space-4)]">
              <div className="flex flex-col gap-[var(--space-1)]">
                <span className="[font:var(--text-subtitle-3)] text-[var(--color-text-primary)]">
                  Seats in the plan
                </span>
                <span className="[font:var(--text-body-3)] text-[var(--color-text-secondary)]">
                  {plan.seats} included, then {money(EXTRA_SEAT_MONTHLY)}/month each
                </span>
              </div>
              <div className="flex items-center gap-[var(--space-3)]">
                <IconButton
                  aria-label="Remove a seat"
                  tip="Remove a seat"
                  disabled={seats <= plan.seats}
                  icon={<Minus size={20} variant="Linear" color="currentColor" />}
                  onClick={() => setSeats((n) => Math.max(plan.seats, n - 1))}
                />
                <span className="w-8 text-center [font:var(--text-subtitle-2)] text-[var(--color-text-primary)]">
                  {seats}
                </span>
                <IconButton
                  aria-label="Add a seat"
                  tip="Add a seat"
                  icon={<Add size={20} variant="Linear" color="currentColor" />}
                  onClick={() => setSeats((n) => n + 1)}
                />
              </div>
            </div>
            <Summary summary={summary} plan={plan} period={period} seats={seats} />
          </div>
        );

      case 'addons':
        return (
          <div className="flex flex-col gap-[var(--space-5)]">
            <span className="[font:var(--text-subtitle-3)] text-[var(--color-text-primary)]">
              Recommended add-ons
            </span>
            <div className="flex items-center justify-between gap-[var(--space-4)] rounded-[var(--radius-lg)] border border-[var(--color-border-default)] p-[var(--space-4)]">
              <div className="flex min-w-0 flex-col gap-[var(--space-1)]">
                <span className="[font:var(--text-subtitle-4)] text-[var(--color-text-primary)]">
                  Hide Jimo Label for + {money(HIDE_LABEL_MONTHLY)} / month
                </span>
                <span className="[font:var(--text-body-3)] text-[var(--color-text-secondary)]">
                  Hide Jimo Label to make sure your brand won&rsquo;t be associated with Jimo
                </span>
              </div>
              {plan.includesHideLabel ? (
                <Badge type="positive" size="x-small">
                  Included
                </Badge>
              ) : (
                <Switch
                  checked={addon}
                  aria-label="Hide Jimo Label add-on"
                  onCheckedChange={(v) => setAddon(v === true)}
                />
              )}
            </div>
            <Input
              label="Coupon code"
              placeholder="JIMO50OFF"
              value={coupon}
              status={coupon !== '' && summary.discount === 0 ? 'negative' : 'none'}
              supportiveText={
                coupon !== ''
                  ? summary.couponLabel ?? 'That code is not recognised.'
                  : undefined
              }
              onChange={(e) => setCoupon(e.target.value)}
            />
            <Summary summary={summary} plan={plan} period={period} seats={seats} />
          </div>
        );

      case 'payment':
        return (
          <div className="flex flex-col gap-[var(--space-5)]">
            <Input
              label="Card number"
              placeholder="4242 4242 4242 4242"
              value={card}
              supportiveText="Nothing is charged — this prototype has no payment backend."
              onChange={(e) => setCard(e.target.value)}
            />
            {from && (
              <Alert
                type="neutral"
                title="Pro-rated"
                body={`We credit ${money(pro.credit)} of unused ${from.name} time against ${money(pro.charge)}, so ${money(pro.dueToday)} is due today.`}
              />
            )}
            <Summary summary={summary} plan={plan} period={period} seats={seats} due={from ? pro.dueToday : undefined} />
          </div>
        );

      case 'processing':
        return (
          <div className="flex flex-col items-center gap-[var(--space-4)] py-[var(--space-8)]">
            <SpinnerIcon size={32} />
            <span className="[font:var(--text-body-3)] text-[var(--color-text-secondary)]">
              Confirming your subscription…
            </span>
          </div>
        );

      case 'success':
        return (
          <div className="flex flex-col items-center gap-[var(--space-3)]">
            <span className="text-[var(--color-success-default)]">
              <TickCircle size={40} variant="Bold" color="currentColor" />
            </span>
            <span>{successCopy(plan)}</span>
          </div>
        );

      case 'cancel':
        return <>Returning now will cancel your current plan upgrade. Are you sure you want to go back?</>;
    }
  }
}

/**
 * The three success blurbs are the artboards' own, verbatim from 13:13347 /
 * 13:13618 / 13:13890.
 */
function successCopy(plan: Plan): string {
  switch (plan.id) {
    case 'startup':
      return 'Enjoy multiple languages in your experiences, in-app Changelog, 2,500 MAU, 2 seats and more!';
    case 'growth':
      return 'Publish unlimited experiences, multiple languages, in-app Changelog, 10,000 MAU, 5 seats, and more!';
    default:
      return 'Publish unlimited experiences with no Jimo branding, dedicated customer support, multiple languages, in-app Changelog and more!';
  }
}

/** The artboards' Order Summary block, shown on every step that has numbers. */
function Summary({
  summary,
  plan,
  period,
  seats,
  due,
}: {
  summary: ReturnType<typeof orderSummary>;
  plan: Plan;
  period: BillingPeriod;
  seats: number;
  due?: number;
}) {
  const per = period === 'yearly' ? '/ year' : '/ month';
  const extra = seats - plan.seats;

  return (
    <div className="flex flex-col gap-[var(--space-2)] rounded-[var(--radius-lg)] bg-[var(--color-bg-muted)] p-[var(--space-4)]">
      <span className="[font:var(--text-subtitle-4)] text-[var(--color-text-primary)]">
        Order Summary
      </span>
      <Line label={`${plan.name} Plan · billed ${period}`} value={`${money(summary.planCost)} ${per}`} />
      {extra > 0 && (
        <Line label={`${extra} additional seat${extra === 1 ? '' : 's'}`} value={`${money(summary.seatCost)} ${per}`} />
      )}
      {summary.addonCost > 0 && (
        <Line label="+ Hide Jimo Label" value={`${money(summary.addonCost)} ${per}`} />
      )}
      {summary.discount > 0 && (
        <Line label={summary.couponLabel ?? 'Coupon'} value={`-${money(summary.discount)}`} />
      )}
      <Line label="Tax" value={summary.tax === 0 ? '—' : money(summary.tax)} />
      <div className="mt-[var(--space-2)] border-t border-[var(--color-border-default)] pt-[var(--space-2)]">
        <Line
          strong
          label="Total for today"
          value={money(due ?? summary.total)}
        />
      </div>
    </div>
  );
}

function Line({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <span className="flex items-center justify-between gap-[var(--space-4)]">
      <span
        className={
          strong
            ? '[font:var(--text-subtitle-4)] text-[var(--color-text-primary)]'
            : '[font:var(--text-body-3)] text-[var(--color-text-secondary)]'
        }
      >
        {label}
      </span>
      <span
        className={
          strong
            ? '[font:var(--text-subtitle-4)] text-[var(--color-text-primary)]'
            : '[font:var(--text-body-3)] text-[var(--color-text-primary)]'
        }
      >
        {value}
      </span>
    </span>
  );
}
