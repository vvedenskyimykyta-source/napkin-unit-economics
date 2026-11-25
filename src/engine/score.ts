import type { ComputeResult } from './types';

/**
 * Health score 0-100, weighted by key unit-economics metrics.
 * - Payback within 13 mo (weight 40)
 * - LTV/CAC vs 3× target (weight 30)
 * - ROAS D0 (weight 15)
 * - Budget sufficiency (weight 15)
 */
export function healthScore(r: ComputeResult): number {
  let s = 0;

  // Payback (40 pts): 0 if none, 40 if D0-M1, scaled to M13
  if (r.paybackMonth === null) s += 0;
  else {
    const pb = r.paybackMonth;
    s += Math.max(0, 40 - (pb / 13) * 40);
  }

  // LTV/CAC (30 pts): 3x = full marks
  const ratio = r.ltv13 / Math.max(r.eCPA, 0.01);
  s += Math.min(30, (ratio / 3) * 30);

  // ROAS D0 (15 pts): 1.0 = full marks
  s += Math.min(15, r.roasD0 * 15);

  // Budget (15 pts)
  if (r.budgetSufficient) s += 15;
  else {
    const coverage = r.inputs.totalBudget / Math.max(r.cashRequired, 1);
    s += Math.max(0, coverage * 15);
  }

  return Math.round(Math.max(0, Math.min(100, s)));
}
