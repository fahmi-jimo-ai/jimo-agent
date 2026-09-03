/**
 * Every number on the Plan, Checkout and Billing screens.
 *
 * A PURE module with no React, unit-tested beside it, for the same reason
 * `classifyChip` and `normalisePreviewUrl` are: money arithmetic that only
 * exists inside a component is money arithmetic nobody can check.
 *
 * Figures come from help.usejimo.com/docs/settings/plan-and-billing:
 * Startup $118 / 2 seats, Growth $286 / 5, Scale $466 / 10, "-16% on pricing
 * on yearly subscriptions", and "Jimo Branding Removal: available for $50/month
 * in Startup" — included in Scale.
 *
 * The yearly figure is STORED, not derived, and that is a correction: the
 * artboards' $99 / $239 / $389 are NOT `monthly * 0.84`, which gives
 * 99 / 240 / 391. They are marketing prices rounded to end in 9, so the real
 * discount is 16.1% / 16.4% / 16.5%. Deriving them would overcharge every
 * yearly customer by a dollar or two a month. `YEARLY_DISCOUNT` is therefore
 * only ever used for the "Save 16%" badge, never for arithmetic — and
 * pricing.test.ts asserts exactly that.
 */
import { PLANS, planById, type Plan, type PlanId, type BillingPeriod } from '@/data/settings';

export { PLANS, planById };
export type { Plan, PlanId, BillingPeriod };

/**
 * Docs: "-16% on pricing on yearly subscriptions". Display only — the actual
 * yearly prices are stored per plan, because this figure is rounded. See above.
 */
export const YEARLY_DISCOUNT = 0.16;

/** Docs: "Jimo Branding Removal: Available for $50/month in Startup". */
export const HIDE_LABEL_MONTHLY = 50;

/**
 * INVENTED. Neither source states a per-extra-seat price; the artboard's
 * checkout prints "$33/month" beside "Additional Seats", so that is the number,
 * quarantined here rather than inlined in the component.
 */
export const EXTRA_SEAT_MONTHLY = 33;

/**
 * INVENTED. The artboard prints "VAT 20%" and "-$140.00" against the coupon
 * code JIMO50OFF. Neither is documented anywhere, so both live here.
 */
export const VAT_RATE = 0.2;
export const COUPONS: Record<string, { percent: number; label: string }> = {
  JIMO50OFF: { percent: 0.5, label: '50% off the first period' },
};

/** Rounded to cents so a chain of percentages cannot accumulate float dust. */
export const round2 = (n: number) => Math.round(n * 100) / 100;

/** The per-month rate at the chosen period, as published. */
export function monthlyRate(plan: Plan, period: BillingPeriod): number {
  return period === 'yearly' ? plan.yearly : plan.monthly;
}

/** The real saving as a fraction, for the badge. Rounds to the docs' 16%. */
export function discountFraction(plan: Plan): number {
  return 1 - plan.yearly / plan.monthly;
}

/** What a period actually bills: 12x the monthly rate for yearly, 1x for monthly. */
export function periodMultiplier(period: BillingPeriod): number {
  return period === 'yearly' ? 12 : 1;
}

export function planCost(plan: Plan, period: BillingPeriod): number {
  return monthlyRate(plan, period) * periodMultiplier(period);
}

/** Seats beyond the plan's own allowance. Never negative. */
export function extraSeats(plan: Plan, seats: number): number {
  return Math.max(0, seats - plan.seats);
}

/**
 * Extra seats and the add-on have no published yearly price, so unlike the
 * plans they DO apply the 16% — there is no marketing figure to defer to.
 */
export function seatCost(plan: Plan, seats: number, period: BillingPeriod): number {
  const rate =
    period === 'yearly'
      ? Math.round(EXTRA_SEAT_MONTHLY * (1 - YEARLY_DISCOUNT))
      : EXTRA_SEAT_MONTHLY;
  return extraSeats(plan, seats) * rate * periodMultiplier(period);
}

/** Zero on Scale, which INCLUDES the add-on, and zero when it is not bought. */
export function addonCost(plan: Plan, on: boolean, period: BillingPeriod): number {
  if (!on || plan.includesHideLabel) return 0;
  const rate =
    period === 'yearly'
      ? Math.round(HIDE_LABEL_MONTHLY * (1 - YEARLY_DISCOUNT))
      : HIDE_LABEL_MONTHLY;
  return rate * periodMultiplier(period);
}

export function applyCoupon(
  subtotal: number,
  code: string | null,
): { discount: number; label: string | null } {
  if (!code) return { discount: 0, label: null };
  const c = COUPONS[code.trim().toUpperCase()];
  if (!c) return { discount: 0, label: null };
  return { discount: round2(subtotal * c.percent), label: c.label };
}

export type CheckoutInput = {
  plan: Plan;
  period: BillingPeriod;
  seats: number;
  addon: boolean;
  coupon: string | null;
  /** Pass 0 to render the artboard's "Tax —" state. */
  taxRate?: number;
};

export type OrderSummary = {
  planCost: number;
  seatCost: number;
  addonCost: number;
  subtotal: number;
  discount: number;
  couponLabel: string | null;
  tax: number;
  total: number;
};

/**
 * Coupon FIRST, then tax on what remains. Taxing before the discount would
 * charge VAT on money nobody paid.
 */
export function orderSummary(input: CheckoutInput): OrderSummary {
  const { plan, period, seats, addon, coupon, taxRate = VAT_RATE } = input;

  const p = planCost(plan, period);
  const s = seatCost(plan, seats, period);
  const a = addonCost(plan, addon, period);
  const subtotal = p + s + a;

  const { discount, label } = applyCoupon(subtotal, coupon);
  const taxable = subtotal - discount;
  const tax = round2(taxable * taxRate);

  return {
    planCost: p,
    seatCost: s,
    addonCost: a,
    subtotal,
    discount,
    couponLabel: label,
    tax,
    total: round2(taxable + tax),
  };
}

/** What switching to yearly saves over a year, for the "You've just saved" line. */
export function yearlySaving(plan: Plan): number {
  return plan.monthly * 12 - planCost(plan, 'yearly');
}

/**
 * The Plan: Pro-rated section (Figma 13:6937). Upgrading mid-period credits the
 * unused remainder of what you already paid against the new plan's cost.
 *
 * `daysLeft / daysInPeriod` is the unused fraction; both are clamped so a stale
 * renewal date cannot produce a credit larger than the charge.
 */
export function proration(
  from: Plan | null,
  to: Plan,
  period: BillingPeriod,
  daysLeft: number,
  daysInPeriod: number,
): { credit: number; charge: number; dueToday: number } {
  const charge = planCost(to, period);
  if (from === null || daysInPeriod <= 0) {
    return { credit: 0, charge, dueToday: charge };
  }
  const unused = Math.min(1, Math.max(0, daysLeft / daysInPeriod));
  const credit = round2(planCost(from, period) * unused);
  return { credit, charge, dueToday: round2(Math.max(0, charge - credit)) };
}

/** `$2,868` — the artboards' format throughout. */
export function money(n: number): string {
  return `$${n.toLocaleString('en-US', {
    minimumFractionDigits: Number.isInteger(n) ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}
