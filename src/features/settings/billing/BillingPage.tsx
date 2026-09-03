import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, ExportSquare } from 'iconsax-react';
import { Button } from '@/components/ui/Button/Button';
import { Badge } from '@/components/ui/Chip/badge';
import { Section } from '@/components/ui/Section/Section';
import { Alert } from '@/components/ui/Infobox/alert';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/Table/Table';
import { Meter } from '@/components/app/Meter';
import { SettingCard, SettingRow } from '@/components/app/SettingRow';
import { useToast } from '@/components/app/toast';
import { useSettings, setSubscription } from '@/state/useSettings';
import { seatsFor } from '@/data/settings';
import { SettingsShell } from '../SettingsShell';
import { CancelPlanModal } from './CancelPlanModal';
import { planById, planCost, addonCost, money, HIDE_LABEL_MONTHLY } from '../plan/pricing';

const DAY = 86_400_000;

/**
 * `/settings/billing` — Figma 13:11570 and 13:4459 (twelve frames plus two).
 *
 * Those frames are four STATES crossed with card / trial / add-on
 * permutations, and every one of them is driven by real store data here rather
 * than by a prop:
 *
 *   none       Free, no history — where a fresh workspace lands (13:13269)
 *   trialing   "Your free trial ends in N days" + no invoice (13:12540/12764)
 *   active     plan details, MAU meter, payment method, invoices
 *   cancelled  back to Free, history retained (13:12409/12479)
 *
 * The MAU copy is the docs': beyond the cap "new users will not be counted, and
 * Jimo will not load for them" — they see nothing and are absent from analytics.
 *
 * The payment method row shows only brand and last four, because that is
 * genuinely all Jimo stores (docs, Data & Legal: Stripe holds the rest).
 */
export function BillingPage() {
  const { subscription, project } = useSettings();
  const toast = useToast();
  const navigate = useNavigate();
  const [cancelling, setCancelling] = React.useState(false);

  const plan = planById(subscription.plan);
  const status = subscription.status;
  const mauCap = plan?.mau ?? 2500;

  const fmt = (ms: number | null) =>
    ms == null
      ? null
      : new Date(ms).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const trialDaysLeft =
    subscription.trialEndsAt != null
      ? Math.max(0, Math.ceil((subscription.trialEndsAt - Date.now()) / DAY))
      : 0;

  const addon = plan ? addonCost(plan, subscription.hideJimoLabelAddon, subscription.period) : 0;
  const per = subscription.period === 'yearly' ? '/year' : '/month';

  return (
    <SettingsShell
      activeItem="Billing"
      title="Billing"
      actions={
        <Button variant="outline" size="sm" onClick={() => navigate('/settings/plan')}>
          {status === 'none' || status === 'cancelled' ? 'Explore plans' : 'Change plan'}
        </Button>
      }
    >
      {status === 'trialing' && (
        <Alert
          type="neutral"
          title={`Your free trial ends in ${trialDaysLeft} day${trialDaysLeft === 1 ? '' : 's'}`}
          body={
            subscription.card
              ? `Your subscription will automatically renew on ${fmt(subscription.renewsAt)}.`
              : 'Add a card to continue after the trial.'
          }
        />
      )}

      {status === 'cancelled' && (
        <Alert
          type="neutral"
          title="Plan successfully cancelled"
          body="Thank you for your feedback. We're really sad to see you go. Let us know if there's anything we can help with: support@usejimo.com"
        />
      )}

      <Section
        title="Plan details"
        controls={
          status === 'active' || status === 'trialing' ? (
            <Button variant="link" danger size="sm" onClick={() => setCancelling(true)}>
              Cancel plan
            </Button>
          ) : undefined
        }
      >
        {plan == null || status === 'none' || status === 'cancelled' ? (
          <div className="flex flex-col gap-[var(--space-2)]">
            <span className="[font:var(--text-heading-5)] text-[var(--color-text-primary)]">Free</span>
            <span className="[font:var(--text-body-3)] text-[var(--color-text-secondary)]">
              $0 /month · up to {seatsFor('free')} seats
            </span>
          </div>
        ) : (
          <div className="flex flex-col gap-[var(--space-3)]">
            <span className="flex items-center justify-between gap-[var(--space-4)]">
              <span className="flex items-center gap-[var(--space-2)]">
                <span className="[font:var(--text-heading-5)] text-[var(--color-text-primary)]">
                  {plan.name} Plan
                </span>
                {status === 'trialing' && (
                  <Badge type="brand" size="x-small">
                    Free for 14 days
                  </Badge>
                )}
              </span>
              <span className="[font:var(--text-subtitle-3)] text-[var(--color-text-primary)]">
                {money(planCost(plan, subscription.period))} {per}
              </span>
            </span>

            {addon > 0 && (
              <span className="flex items-center justify-between gap-[var(--space-4)] [font:var(--text-body-3)] text-[var(--color-text-secondary)]">
                <span>+ Hide Jimo Label</span>
                <span>
                  {money(addon)} {per}
                </span>
              </span>
            )}

            <div className="flex flex-col gap-[var(--space-2)] border-t border-[var(--color-border-default)] pt-[var(--space-3)]">
              <Row label="Billing period" value={subscription.period === 'yearly' ? 'Yearly' : 'Monthly'} />
              <Row label="Seats" value={`${subscription.seats}`} />
              <Row
                label={status === 'trialing' ? 'First payment' : 'Next payment'}
                value={fmt(subscription.renewsAt) ?? '—'}
              />
              <Row
                label="Upcoming amount"
                value={
                  status === 'trialing' && !subscription.card
                    ? '—'
                    : money(planCost(plan, subscription.period) + addon)
                }
              />
            </div>
          </div>
        )}
      </Section>

      {(status === 'active' || status === 'trialing') && (
        <Section
          title="Remaining MAU usage for the current period"
          description={`You have a maximum of ${mauCap.toLocaleString('en-US')} Monthly Active Users based on your current plan. Beyond the cap, new users are not counted and Jimo does not load for them — they see no experiences and are absent from analytics.`}
        >
          <div className="flex flex-col gap-[var(--space-2)]">
            <Meter value={subscription.mauUsed} max={mauCap} />
            <span className="[font:var(--text-body-4)] text-[var(--color-text-secondary)]">
              {subscription.mauUsed.toLocaleString('en-US')} / {mauCap.toLocaleString('en-US')} MAU
            </span>
          </div>
        </Section>
      )}

      <SettingCard>
        <SettingRow
          title="Payment method"
          description={
            subscription.card
              ? `${subscription.card.brand} ending in ${subscription.card.last4} · exp. ${subscription.card.exp}`
              : 'Add a card to proceed your subscription'
          }
          control={
            <Button
              variant="outline"
              leftIcon={<Card size={20} variant="Linear" color="currentColor" />}
              onClick={() =>
                toast({ type: 'neutral', title: 'Card management needs a payment backend' })
              }
            >
              {subscription.card ? 'Update card' : 'Add a card'}
            </Button>
          }
        />
      </SettingCard>

      <Section flushBody title="Billing history">
        {subscription.invoices.length === 0 ? (
          <span className="block p-[var(--space-4)] [font:var(--text-body-3)] text-[var(--color-text-tertiary)]">
            {status === 'trialing'
              ? "No history yet — a free trial doesn't generate an invoice."
              : 'No history yet'}
          </span>
        ) : (
          <Table scroll={false}>
            <TableHeader>
              <TableRow>
                <TableHead>Bill date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Invoice</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscription.invoices.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell>{inv.date}</TableCell>
                  <TableCell>{inv.amount}</TableCell>
                  <TableCell>{inv.plan}</TableCell>
                  <TableCell>
                    <Button
                      variant="link"
                      size="sm"
                      rightIcon={<ExportSquare size={16} variant="Linear" color="currentColor" />}
                      onClick={() =>
                        toast({ type: 'neutral', title: 'Invoice PDFs need a billing backend' })
                      }
                    >
                      Download
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Section>

      {!project.hideJimoLabel && plan && !plan.includesHideLabel && (
        <Alert
          type="neutral"
          title="Hide the Jimo label"
          body={`Remove the "Powered by Jimo" footnote for ${money(HIDE_LABEL_MONTHLY)}/month, or upgrade to Scale where it is included.`}
        />
      )}

      {cancelling && plan && (
        <CancelPlanModal
          planName={`${plan.name} Plan`}
          renewsAt={fmt(subscription.renewsAt)}
          onClose={() => setCancelling(false)}
          onConfirm={() => {
            setSubscription({ status: 'cancelled', renewsAt: null, trialEndsAt: subscription.trialEndsAt });
            setCancelling(false);
            toast({ type: 'neutral', title: 'Plan cancelled' });
          }}
        />
      )}
    </SettingsShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <span className="flex items-center justify-between gap-[var(--space-4)]">
      <span className="[font:var(--text-body-3)] text-[var(--color-text-secondary)]">{label}</span>
      <span className="[font:var(--text-body-3)] text-[var(--color-text-primary)]">{value}</span>
    </span>
  );
}
