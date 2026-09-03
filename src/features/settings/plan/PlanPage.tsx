import * as React from 'react';
import { ExportSquare } from 'iconsax-react';
import { Button } from '@/components/ui/Button/Button';
import { Badge } from '@/components/ui/Chip/badge';
import { Alert } from '@/components/ui/Infobox/alert';
import { SecondaryHorizontalMenuGroup } from '@/components/ui/SecondaryHorizontalMenuGroup/SecondaryHorizontalMenuGroup';
import { useToast } from '@/components/app/toast';
import { useSettings, setSubscription, setProject } from '@/state/useSettings';
import { makeInvoiceId } from '@/data/settings';
import { SettingsShell } from '../SettingsShell';
import { PlanCard } from './PlanCard';
import { CheckoutModal } from './CheckoutModal';
import { PLANS, planCost, money, type Plan, type BillingPeriod } from './pricing';

const DAY = 86_400_000;

/**
 * `/settings/plan` — Figma 13:7852 and 13:6937.
 *
 * The Monthly|Yearly control is `SecondaryHorizontalMenuGroup`, the repo's
 * designated segmented control (see RetrainFrequencyCard) rather than a
 * hand-rolled pair of buttons.
 *
 * Trial eligibility drives the two artboard variants. Per the docs Jimo offers
 * "a 14-day free trial for the Growth plan", and once spent it is spent — which
 * is what `trialEndsAt != null` records.
 *
 * Completing checkout writes the subscription for real, so Billing reflects it.
 * That is the whole point of simulating end to end: every Billing state is
 * reachable by using the product rather than by editing a fixture.
 */
const PERIODS = [
  { id: 'monthly', tabName: 'Pay Monthly' },
  { id: 'yearly', tabName: 'Pay Yearly' },
];

export function PlanPage() {
  const { subscription } = useSettings();
  const toast = useToast();
  const [period, setPeriod] = React.useState<BillingPeriod>(subscription.period);
  const [checkout, setCheckout] = React.useState<Plan | null>(null);

  const trialEligible = subscription.trialEndsAt === null && subscription.status === 'none';

  const daysLeft =
    subscription.renewsAt != null ? Math.max(0, Math.ceil((subscription.renewsAt - Date.now()) / DAY)) : 0;
  const daysInPeriod = subscription.period === 'yearly' ? 365 : 30;

  return (
    <SettingsShell
      activeItem="Plan"
      title="Plan"
      actions={
        <Button
          variant="link"
          size="sm"
          rightIcon={<ExportSquare size={20} variant="Linear" color="currentColor" />}
          onClick={() => window.open('https://www.usejimo.com/pricing', '_blank', 'noopener,noreferrer')}
        >
          Compare plans
        </Button>
      }
    >
      {trialEligible && (
        <Alert
          type="neutral"
          title="Try Growth free for 14 days"
          body="Pick any plan and start your trial today. No credit card needed, cancel any time."
        />
      )}

      <div className="flex items-center justify-center gap-[var(--space-3)]">
        <SecondaryHorizontalMenuGroup
          tabs={PERIODS}
          activeItem={period}
          onTabClick={(id) => setPeriod(id as BillingPeriod)}
        />
        <Badge type="negative" size="x-small">
          Save 16%
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-[var(--space-5)] lg:grid-cols-3">
        {PLANS.map((p) => (
          <PlanCard
            key={p.id}
            plan={p}
            period={period}
            current={subscription.plan === p.id && subscription.status !== 'cancelled'}
            trialEligible={trialEligible}
            onChoose={() => setCheckout(p)}
          />
        ))}
      </div>

      {checkout && (
        <CheckoutModal
          plan={checkout}
          period={period}
          currentPlan={subscription.status === 'none' ? null : subscription.plan}
          daysLeft={daysLeft}
          daysInPeriod={daysInPeriod}
          onClose={() => setCheckout(null)}
          onComplete={({ seats, addon, coupon }) => {
            const now = Date.now();
            const trialing = trialEligible;
            setSubscription({
              status: trialing ? 'trialing' : 'active',
              plan: checkout.id,
              period,
              seats,
              hideJimoLabelAddon: addon || !!checkout.includesHideLabel,
              coupon,
              trialEndsAt: trialing ? now + 14 * DAY : null,
              renewsAt: trialing
                ? now + 14 * DAY
                : now + (period === 'yearly' ? 365 : 30) * DAY,
              card: { brand: 'Visa', last4: '4242', exp: '05/28' },
              invoices: [
                {
                  id: makeInvoiceId(),
                  date: new Date(now).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  }),
                  // A trial generates no invoice — the artboard says so verbatim
                  // ("Free trial doesn't generate invoice").
                  amount: trialing ? '$0 USD' : `${money(planCost(checkout, period))} USD`,
                  plan: trialing
                    ? `${checkout.name} Free Trial`
                    : `${checkout.name} ${period === 'yearly' ? 'Yearly' : 'Monthly'} Plan`,
                },
                ...subscription.invoices,
              ],
            });
            // The add-on is what actually hides the label, so keep the project
            // flag in step rather than letting two switches disagree.
            if (addon || checkout.includesHideLabel) setProject({ hideJimoLabel: true });
            toast({ type: 'positive', title: `Welcome to ${checkout.name}` });
          }}
        />
      )}
    </SettingsShell>
  );
}
