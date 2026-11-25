import type { ComputeResult, DiagnosticFinding } from './types';
import { fmt, fmtK } from './calc';

const pct = (n: number, d = 0) => (n * 100).toFixed(d) + '%';

export function diagnose(r: ComputeResult): DiagnosticFinding[] {
  const findings: DiagnosticFinding[] = [];
  const isSaas = r.isSaas;

  const BM = isSaas ? {
    churnMNorm: 0.07, churnMBad: 0.12,
    renewalNorm: 0.80, renewalBad: 0.65,
    ltvCacNorm: 3, ltvCacBad: 2,
    roasD0Norm: 0.25,
    yearlyShareNorm: 0.30,
    d0UpsellShareGood: 0.10
  } : {
    churnMNorm: 0.25, churnMBad: 0.40,
    renewalNorm: 0.50, renewalBad: 0.30,
    ltvCacNorm: 1.5, ltvCacBad: 1.0,
    roasD0Norm: 0.55,
    yearlyShareNorm: 0.50,
    d0UpsellShareGood: 0.15
  };

  const paybackGood = isSaas ? 12 : 6;
  const ltvCac = r.ltv13 / Math.max(r.eCPA, 0.01);
  const churnM = r.inputs.churnM / 100;
  const renewal = r.inputs.renewal / 100;

  // Headline
  if (r.paybackMonth === null) {
    findings.push({
      priority: 'high',
      msg: `**This doesn't recoup — even over 60 months.** LTV horizon (${fmt(r.ltv13, 0)}) is below eCPA (${fmt(r.eCPA, 0)}). Gap to close: **${fmt(r.eCPA - r.ltv13, 0)}** per user. Something needs to change — price, channel or product.`,
      where: ''
    });
  } else if (r.paybackMonth > r.monthsOfBudget) {
    const deficit = r.paybackMonth - r.monthsOfBudget;
    findings.push({
      priority: 'high',
      msg: `**Budget runs out before Payback.** You recoup at M${r.paybackMonth}, but spend ends at M${r.monthsOfBudget}. ${deficit > 12 ? "That's a whole year of empty tank." : `Short by ${deficit} month${deficit > 1 ? 's' : ''}.`}`,
      where: ''
    });
  } else if (r.paybackMonth <= paybackGood) {
    const nice = ltvCac >= 3 ? ' Comfortably.' : '';
    findings.push({
      priority: 'low',
      msg: `**Unit economics works.** Payback ${r.paybackMonth === 0 ? 'D0' : 'M' + r.paybackMonth}, LTV/CAC ${ltvCac.toFixed(2)}×.${nice}`,
      where: ''
    });
  } else {
    findings.push({
      priority: 'mid',
      msg: `**Works, but Payback is long.** M${r.paybackMonth}, LTV/CAC ${ltvCac.toFixed(2)}×. Fine if you have the cashflow. Tight if you don't.`,
      where: ''
    });
  }

  // Edge case: suspiciously perfect
  if (r.paybackMonth !== null && r.paybackMonth <= 1 && ltvCac >= 5) {
    findings.push({
      priority: 'info',
      msg: `**Payback D0-M1 with LTV/CAC ${ltvCac.toFixed(1)}×.** Either you nailed it, or your numbers are too optimistic. Double-check CPA and churn against your real cohorts.`,
      where: ''
    });
  }
  // Edge case: churn so high it's not a subscription
  if (churnM >= 0.7) {
    findings.push({
      priority: 'high',
      msg: `**Monthly Churn ${pct(churnM)}.** At this rate you're not running a subscription, you're running a casino. Users don't come back — check whether this is really a subscription business.`,
      where: 'Dig: is pricing wrong? Is this a one-time-purchase product in disguise?'
    });
  }

  // Churn
  if (churnM >= BM.churnMBad) {
    findings.push({
      priority: 'high',
      msg: `**Monthly Churn ${pct(churnM)}** is high for ${isSaas ? 'SaaS' : 'mobile subscriptions'} (norm ≤${pct(BM.churnMNorm)}).`,
      where: isSaas
        ? 'Dig: onboarding, aha-moment in week 1, activation, win-back emails.'
        : 'Dig: onboarding first 3 days, activation, push notifications, re-engagement.'
    });
  } else if (churnM >= BM.churnMNorm) {
    findings.push({
      priority: 'mid',
      msg: `**Monthly Churn ${pct(churnM)}** is on the edge (norm ≤${pct(BM.churnMNorm)}).`,
      where: 'Dig: onboarding, first-week activation, exit survey.'
    });
  }

  if (renewal < BM.renewalBad) {
    findings.push({
      priority: 'high',
      msg: `**Yearly Renewal ${pct(renewal)}** is low (norm ${pct(BM.renewalNorm)}+).`,
      where: 'Dig: 30/7-day reminders, win-back with discount, annual anchor features, grace period.'
    });
  }

  // LTV/CAC
  if (ltvCac < BM.ltvCacBad && r.paybackMonth !== null) {
    findings.push({
      priority: 'high',
      msg: `**LTV/CAC ${ltvCac.toFixed(2)}×** is critically thin (norm ${BM.ltvCacNorm}×+). One bad week of churn and you're underwater.`,
      where: 'Dig: CPA (quality traffic, best creative), pricing, retention.'
    });
  } else if (ltvCac < BM.ltvCacNorm && r.paybackMonth !== null) {
    findings.push({
      priority: 'mid',
      msg: `**LTV/CAC ${ltvCac.toFixed(2)}×** is below target ${BM.ltvCacNorm}×. Works, but no cushion.`,
      where: 'Dig: cut CPA 15–20% or lift LTV via retention/upsells.'
    });
  }

  // ROAS D0
  if (r.roasD0 < 0.3) {
    findings.push({
      priority: isSaas ? 'mid' : 'high',
      msg: `**ROAS D0 ${(r.roasD0 * 100).toFixed(0)}%** recovers very little up front (norm ${(BM.roasD0Norm * 100).toFixed(0)}%+).`,
      where: 'Dig: intro pricing (discount too deep?), D0 upsell flow, paywall cases.'
    });
  }

  // Pricing mix
  if (!isSaas && r.shareY < BM.yearlyShareNorm) {
    findings.push({
      priority: 'mid',
      msg: `**Yearly share ${pct(r.shareY)}** is low. Yearly pays upfront with near-zero first-year churn — best cashflow plan.`,
      where: 'Dig: paywall (yearly as default), "best value" badge, "save $X/year" framing, trial on yearly only.'
    });
  }

  // D0 upsells
  const d0Share = r.arppuWithD0 > 0 ? r.d0UpsellRev / r.arppuWithD0 : 0;
  if (!r.inputs.upsells.d0.enabled || r.d0UpsellRev < 0.01) {
    findings.push({
      priority: 'mid',
      msg: `**D0 upsells off or empty.** With good take rates D0 upsells add +10–25% to ARPPU immediately.`,
      where: 'Dig: one or two upsell steps after purchase (lifetime add-on, premium feature pack).'
    });
  } else if (d0Share < BM.d0UpsellShareGood) {
    findings.push({
      priority: 'low',
      msg: `**D0 upsells add ${(d0Share * 100).toFixed(0)}% to ARPPU.** Can squeeze more (norm ${(BM.d0UpsellShareGood * 100).toFixed(0)}%+).`,
      where: 'Dig: offer, price point, framing ("+$X for lifetime access").'
    });
  }

  // Organic / Email dilution
  const organic = r.inputs.organic / 100;
  const email = r.inputs.email / 100;
  if (organic < 0.05 && email < 0.05) {
    findings.push({
      priority: 'low',
      msg: `**Organic + Email = ${((organic + email) * 100).toFixed(0)}%** — almost all revenue from paid, inflates eCPA.`,
      where: 'Dig: ASO/SEO, referral, email lifecycle, community.'
    });
  }

  // Paywall conv
  const webEnabled = r.inputs.channels.web;
  const appEnabled = r.inputs.channels.app;
  const webConv = r.inputs.webConv / 100;
  const appConv = r.inputs.appConv / 100;
  if (webEnabled && webConv < 0.015) {
    findings.push({
      priority: 'mid',
      msg: `**Web paywall conv ${(webConv * 100).toFixed(1)}%** is low (norm 2–4% for subscription web).`,
      where: 'Dig: paywall design, price/offer, page speed, trial, soft vs hard paywall.'
    });
  }
  if (appEnabled && !isSaas && appConv < 0.04) {
    findings.push({
      priority: 'mid',
      msg: `**App paywall conv ${(appConv * 100).toFixed(1)}%** is low (norm 5–10% for mobile).`,
      where: 'Dig: onboarding-paywall flow, trial offer, paywall A/B test.'
    });
  }

  // Budget sizing
  if (!r.budgetSufficient && r.paybackMonth !== null) {
    findings.push({
      priority: 'high',
      msg: `**Cash Required: ${fmtK(r.cashRequired)}** vs budget ${fmtK(r.inputs.totalBudget)}. Cashflow gap risk.`,
      where: `Dig: raise budget to ${fmtK(r.cashRequired)}, lower spend/mo, or speed Payback via retention/pricing.`
    });
  }

  return findings;
}
