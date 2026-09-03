import { describe, it, expect } from 'vitest';
import {
  PLANS,
  planById,
  monthlyRate,
  planCost,
  extraSeats,
  seatCost,
  addonCost,
  applyCoupon,
  orderSummary,
  yearlySaving,
  proration,
  money,
  YEARLY_DISCOUNT,
  HIDE_LABEL_MONTHLY,
  discountFraction,
} from './pricing';

const startup = planById('startup')!;
const growth = planById('growth')!;
const scale = planById('scale')!;

describe('the docs and the artboards, reconciled', () => {
  it('publishes the artboards’ yearly prices exactly', () => {
    expect(monthlyRate(startup, 'yearly')).toBe(99);
    expect(monthlyRate(growth, 'yearly')).toBe(239);
    expect(monthlyRate(scale, 'yearly')).toBe(389);
  });

  it('does NOT derive them from the docs’ 16%, which would overcharge', () => {
    // This is the trap the stored `yearly` field exists to avoid. Deriving
    // gives 99 / 240 / 391 — one to two dollars a month too much on two of the
    // three plans. The printed prices are marketing figures ending in 9.
    const derived = (p: typeof growth) => Math.round(p.monthly * (1 - YEARLY_DISCOUNT));
    expect(derived(startup)).toBe(99); // coincides
    expect(derived(growth)).toBe(240); // and 240 !== 239
    expect(derived(scale)).toBe(391); // and 391 !== 389
    expect(monthlyRate(growth, 'yearly')).not.toBe(derived(growth));
    expect(monthlyRate(scale, 'yearly')).not.toBe(derived(scale));
  });

  it('discounts AT LEAST the advertised 16% on every plan', () => {
    // Rounding down to a price ending in 9 always favours the customer, so the
    // "-16%" badge is a floor rather than an exact figure: the real discounts
    // are 16.1% / 16.4% / 16.5%. Asserting equality here would fail on Scale,
    // and asserting nothing would let a future price edit quietly undercut the
    // badge.
    for (const p of PLANS) {
      const pct = discountFraction(p) * 100;
      expect(pct).toBeGreaterThanOrEqual(YEARLY_DISCOUNT * 100);
      expect(pct).toBeLessThan(17);
    }
  });

  it('leaves monthly prices as the docs state them', () => {
    expect(monthlyRate(startup, 'monthly')).toBe(118);
    expect(monthlyRate(growth, 'monthly')).toBe(286);
    expect(monthlyRate(scale, 'monthly')).toBe(466);
  });

  it('bills a yearly period as twelve months of the published rate', () => {
    // The artboard's Order Summary line: "Growth Plan, billed yearly, $2,868 / year".
    expect(planCost(growth, 'yearly')).toBe(2868);
    expect(planCost(growth, 'monthly')).toBe(286);
  });

  it('reports the yearly saving the artboard celebrates', () => {
    // 13:8221 prints "You've just saved $704!" for Growth.
    expect(yearlySaving(growth)).toBe(286 * 12 - 2868);
    expect(yearlySaving(growth)).toBe(564);
    expect(yearlySaving(scale)).toBe(466 * 12 - 389 * 12);
  });

  it('keeps the discount at the documented 16%', () => {
    expect(YEARLY_DISCOUNT).toBe(0.16);
  });
});

describe('seats', () => {
  it('charges only for seats beyond the plan allowance', () => {
    expect(extraSeats(growth, 3)).toBe(0);
    expect(extraSeats(growth, 5)).toBe(0);
    expect(extraSeats(growth, 8)).toBe(3);
  });

  it('never returns a negative count for a shrunken team', () => {
    expect(extraSeats(scale, 2)).toBe(0);
    expect(seatCost(scale, 2, 'monthly')).toBe(0);
  });

  it('discounts extra seats yearly too', () => {
    expect(seatCost(growth, 6, 'monthly')).toBe(33);
    // 33 * 0.84 = 27.72 -> 28, twelve times.
    expect(seatCost(growth, 6, 'yearly')).toBe(28 * 12);
  });
});

describe('the Hide Jimo Label add-on', () => {
  it('costs the documented $50/month, not the artboard’s $100', () => {
    expect(HIDE_LABEL_MONTHLY).toBe(50);
    expect(addonCost(startup, true, 'monthly')).toBe(50);
  });

  it('is FREE on Scale, which includes it', () => {
    // The docs are explicit: "This feature is included in the Scale plan."
    expect(addonCost(scale, true, 'monthly')).toBe(0);
    expect(addonCost(scale, true, 'yearly')).toBe(0);
  });

  it('is zero when not bought', () => {
    expect(addonCost(growth, false, 'monthly')).toBe(0);
  });
});

describe('coupons', () => {
  it('ignores an absent or unknown code', () => {
    expect(applyCoupon(100, null)).toEqual({ discount: 0, label: null });
    expect(applyCoupon(100, 'NOPE')).toEqual({ discount: 0, label: null });
  });

  it('accepts the artboard’s code case-insensitively', () => {
    expect(applyCoupon(280, 'JIMO50OFF').discount).toBe(140);
    expect(applyCoupon(280, ' jimo50off ').discount).toBe(140);
  });
});

describe('orderSummary', () => {
  it('applies the coupon BEFORE tax', () => {
    // Taxing first would charge VAT on money nobody paid.
    const s = orderSummary({
      plan: growth,
      period: 'monthly',
      seats: 5,
      addon: false,
      coupon: 'JIMO50OFF',
      taxRate: 0.2,
    });
    expect(s.subtotal).toBe(286);
    expect(s.discount).toBe(143);
    expect(s.tax).toBe(28.6); // 20% of 143, not of 286
    expect(s.total).toBe(171.6);
  });

  it('renders the artboard’s "Tax —" state when the rate is zero', () => {
    const s = orderSummary({
      plan: growth,
      period: 'yearly',
      seats: 5,
      addon: false,
      coupon: null,
      taxRate: 0,
    });
    expect(s.tax).toBe(0);
    expect(s.total).toBe(2868);
  });

  it('sums plan, seats and add-on into the subtotal', () => {
    const s = orderSummary({
      plan: startup,
      period: 'monthly',
      seats: 4,
      addon: true,
      coupon: null,
      taxRate: 0,
    });
    expect(s.planCost).toBe(118);
    expect(s.seatCost).toBe(66); // two extra seats at $33
    expect(s.addonCost).toBe(50);
    expect(s.subtotal).toBe(234);
    expect(s.total).toBe(234);
  });

  it('never charges for an add-on Scale already includes', () => {
    const s = orderSummary({
      plan: scale,
      period: 'monthly',
      seats: 10,
      addon: true,
      coupon: null,
      taxRate: 0,
    });
    expect(s.addonCost).toBe(0);
    expect(s.total).toBe(466);
  });
});

describe('proration', () => {
  it('charges the full price with no previous plan', () => {
    const p = proration(null, growth, 'monthly', 15, 30);
    expect(p.credit).toBe(0);
    expect(p.dueToday).toBe(286);
  });

  it('credits the unused remainder of the old plan', () => {
    // Half a month left on Startup, upgrading to Growth.
    const p = proration(startup, growth, 'monthly', 15, 30);
    expect(p.credit).toBe(59); // half of 118
    expect(p.charge).toBe(286);
    expect(p.dueToday).toBe(227);
  });

  it('clamps a stale renewal date rather than crediting more than a period', () => {
    const p = proration(startup, growth, 'monthly', 999, 30);
    expect(p.credit).toBe(118); // one full period, no more
    expect(p.dueToday).toBe(168);
  });

  it('never returns a negative amount due', () => {
    // Downgrading mid-period: the credit exceeds the new charge.
    const p = proration(scale, startup, 'monthly', 30, 30);
    expect(p.dueToday).toBe(0);
  });

  it('survives a zero-length period without dividing by zero', () => {
    const p = proration(startup, growth, 'monthly', 5, 0);
    expect(Number.isFinite(p.dueToday)).toBe(true);
    expect(p.dueToday).toBe(286);
  });
});

describe('money', () => {
  it('formats the way the artboards print', () => {
    expect(money(2868)).toBe('$2,868');
    expect(money(3072.2)).toBe('$3,072.20');
    expect(money(0)).toBe('$0');
  });
});

describe('the catalogue itself', () => {
  it('has no Free entry — free is the no-subscription state, not a plan', () => {
    expect(PLANS.map((p) => p.id)).toEqual(['startup', 'growth', 'scale']);
    expect(planById('free')).toBeNull();
  });

  it('marks exactly one plan as most popular', () => {
    expect(PLANS.filter((p) => p.popular)).toHaveLength(1);
  });
});
