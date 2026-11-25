import type { Inputs, ComputeResult, Plan } from './types';

/* ============================================
   Napkin Unit Economics — Engine (v2, plan-based)
   Pure functions. No DOM.
   ============================================ */

export function compute(raw: Inputs): ComputeResult {
  const inputs = normalize(raw);
  const isSaas = inputs.mode === 'saas';

  const totalBudget = inputs.totalBudget;

  const renewal = inputs.renewal / 100;
  const churnM = inputs.churnM / 100;
  const churnW = inputs.churnW / 100;

  const storeFee = inputs.storeFee / 100;
  const refundRate = inputs.refundRate / 100;
  const cogs = inputs.cogs;

  const netMult = (1 - storeFee) * (1 - refundRate);

  // Normalize plan shares (treat as weights if they don't sum to 100)
  const plans = inputs.plans.filter((p) => p.share > 0 && p.periodMonths > 0);
  const totalShare = plans.reduce((s, p) => s + p.share, 0);
  const planShare = (p: Plan) => (totalShare > 0 ? p.share / totalShare : 0);

  // Share of plans with period >= 12mo (yearly or longer) for diagnostics
  const shareY = plans
    .filter((p) => p.periodMonths >= 12)
    .reduce((s, p) => s + planShare(p), 0);

  // Retention per period for a given plan
  const retentionPerPeriod = (p: Plan): number => {
    const Pm = p.periodMonths;
    if (Pm >= 12) return Math.pow(renewal, Pm / 12);
    if (Pm >= 1) return Math.pow(1 - churnM, Pm);
    const weeks = Pm * (30.44 / 7);
    return Math.pow(1 - churnW, weeks);
  };

  // D0 ARPPU (first payment weighted by share)
  const introPrice = (p: Plan) => (inputs.introPricing ? p.introPrice : p.fullPrice);

  const arppuGrossD0 = plans.reduce((s, p) => s + planShare(p) * introPrice(p), 0);
  const arppuGrossFull = plans.reduce((s, p) => s + planShare(p) * p.fullPrice, 0);
  const arppuNetD0 = arppuGrossD0 * netMult;

  // D0 upsells
  let d0UpsellRev = 0;
  if (inputs.upsells.d0.enabled) {
    for (const item of inputs.upsells.d0.items) {
      d0UpsellRev += item.price * (item.conv / 100) * netMult;
    }
  }
  const arppuWithD0 = arppuNetD0 + d0UpsellRev;

  // Traffic channels — blended paid CPA with organic/email dilution
  const webOn = inputs.channels.web;
  const appOn = inputs.channels.app;
  const webShare = webOn ? inputs.webShare / 100 : 0;
  const appShare = appOn ? inputs.appShare / 100 : 0;
  const webCPA = inputs.webCPA;
  const appCPA = inputs.appCPA;
  const webConv = inputs.webConv / 100;
  const appConv = inputs.appConv / 100;

  const totalCh = webShare + appShare;
  const nWeb = totalCh > 0 ? webShare / totalCh : 0;
  const nApp = totalCh > 0 ? appShare / totalCh : 0;
  const blendedPaidCPA = (!webOn && !appOn) ? webCPA : nWeb * webCPA + nApp * appCPA;

  const organicPct = inputs.organic / 100;
  const emailPct = inputs.email / 100;
  const directShare = Math.max(0.1, 1 - organicPct - emailPct);
  const eCPA = Math.max(0.5, blendedPaidCPA * directShare);

  const blendedConv = totalCh > 0 ? nWeb * webConv + nApp * appConv : webConv;

  // --- Plan-based LTV ---
  // gross: total revenue per user over `months`, weighted across plans
  function planGrossLTV(p: Plan, months: number): number {
    const R = retentionPerPeriod(p);
    let rev = introPrice(p);  // paid at t=0
    // Renewal payments at k=1,2,... while k*periodMonths <= months
    for (let k = 1; k * p.periodMonths <= months; k++) {
      rev += p.fullPrice * Math.pow(R, k);
    }
    return rev;
  }

  function planActiveMonths(p: Plan, months: number): number {
    const R = retentionPerPeriod(p);
    let active = 0;
    for (let k = 0; k * p.periodMonths < months; k++) {
      const periodLen = Math.min(p.periodMonths, months - k * p.periodMonths);
      active += periodLen * Math.pow(R, k);
    }
    return active;
  }

  function grossLTV(months: number): number {
    if (months <= 0) return arppuGrossD0;
    return plans.reduce((s, p) => s + planShare(p) * planGrossLTV(p, months), 0);
  }

  function activeMonths(months: number): number {
    return plans.reduce((s, p) => s + planShare(p) * planActiveMonths(p, months), 0);
  }

  function netLTV(months: number): number {
    const gltv = grossLTV(months);
    const cogsCost = activeMonths(months) * cogs;
    return gltv * netMult - cogsCost;
  }

  function upsellLTV(months: number): number {
    let pack = 0;
    if (inputs.upsells.packs.enabled) {
      for (const item of inputs.upsells.packs.items) {
        pack += item.price * (item.conv / 100) * netMult * activeMonths(months);
      }
    }
    return d0UpsellRev + pack;
  }

  function totalLTV(months: number): number {
    return netLTV(months) + upsellLTV(months);
  }

  // --- Scenario LTV at month 13 with alternate churn (for max churn target) ---
  function scenarioLTV13(testChurnM: number): number {
    const months = 13;
    // Temporarily substitute churn
    const alt = (p: Plan): number => {
      const Pm = p.periodMonths;
      if (Pm >= 12) return Math.pow(renewal, Pm / 12);
      if (Pm >= 1) return Math.pow(1 - testChurnM, Pm);
      // For weekly plans, scale weekly churn proportional to churn change
      const scale = testChurnM / Math.max(0.001, churnM);
      const scaledChurnW = Math.min(0.95, churnW * scale);
      const weeks = Pm * (30.44 / 7);
      return Math.pow(1 - scaledChurnW, weeks);
    };
    const gLtvAlt = (): number =>
      plans.reduce((s, p) => {
        const R = alt(p);
        let rev = introPrice(p);
        for (let k = 1; k * p.periodMonths <= months; k++) {
          rev += p.fullPrice * Math.pow(R, k);
        }
        return s + planShare(p) * rev;
      }, 0);
    const amActive = (): number =>
      plans.reduce((s, p) => {
        const R = alt(p);
        let a = 0;
        for (let k = 0; k * p.periodMonths < months; k++) {
          const periodLen = Math.min(p.periodMonths, months - k * p.periodMonths);
          a += periodLen * Math.pow(R, k);
        }
        return s + planShare(p) * a;
      }, 0);
    const nltv = gLtvAlt() * netMult - amActive() * cogs;
    let pack = 0;
    if (inputs.upsells.packs.enabled) {
      for (const item of inputs.upsells.packs.items) {
        pack += item.price * (item.conv / 100) * netMult * amActive();
      }
    }
    return nltv + d0UpsellRev + pack;
  }

  // --- Key LTV points (LTV13 stays the universal KPI) ---
  const ltv1 = totalLTV(1);
  const ltv3 = totalLTV(3);
  const ltv6 = totalLTV(6);
  const ltv12 = totalLTV(12);
  const ltv13 = totalLTV(13);

  // ROAS at day 0 = immediate recoup of eCPA by first-payment ARPPU
  const roasD0 = arppuWithD0 / eCPA;

  // --- Payback: first month where cumulative LTV >= eCPA ---
  // v2.1 change: search up to 60mo instead of 13mo. Keeps paybackMonth null only
  // when the economics literally never pay back.
  const PAYBACK_SEARCH_MAX = 60;
  let paybackMonth: number | null = null;
  for (let m = 0; m <= PAYBACK_SEARCH_MAX; m++) {
    const v = m === 0 ? arppuWithD0 : totalLTV(m);
    if (v >= eCPA) { paybackMonth = m; break; }
  }

  // --- Budget / spend ---
  // v2.1: spend/day is derived from the USER-PICKED test length, not a hidden
  // max(payback+1, 6) heuristic. Formula is now a clear quotient:
  //    spendPerMonth = totalBudget / testLengthMonths
  const testLen = Math.max(1, inputs.testLengthMonths || 6);
  const spendPerMonth = totalBudget / testLen;
  const budgetPerDay = spendPerMonth / 30;
  const monthsOfBudget = testLen;
  const purchPerDay = budgetPerDay / eCPA;
  const purchPerMonth = purchPerDay * 30;
  const totalPurchases = totalBudget / eCPA;
  const paybackBeforeBudgetEnds = paybackMonth !== null && paybackMonth <= monthsOfBudget;

  // LTV at the Payback mark (for P&L). When Payback never lands, we fall back
  // to LTV at test end so the P&L shows something meaningful.
  const ltvAtPayback = paybackMonth !== null ? totalLTV(paybackMonth) : totalLTV(Math.max(testLen, 13));
  const revenueAtPayback = totalPurchases * ltvAtPayback;
  const profitAtPayback = revenueAtPayback - totalBudget;

  // Targets
  const maxCPA = ltv13;
  const cpaOk = eCPA <= maxCPA;
  const cpaMargin = ((maxCPA / eCPA) - 1) * 100;

  const minARPPU = eCPA * 0.7;
  const arppuOk = arppuWithD0 >= minARPPU;
  const arppuMargin = ((arppuWithD0 / minARPPU) - 1) * 100;

  // Max monthly churn where LTV13 >= eCPA
  let maxChurnM = churnM;
  for (let c = 0.95; c >= 0.01; c -= 0.01) {
    if (scenarioLTV13(c) >= eCPA) { maxChurnM = c; break; }
  }
  if (maxChurnM < 0.01) maxChurnM = 0.01;
  const churnOk = churnM <= maxChurnM;
  const churnMargin = ((maxChurnM / Math.max(churnM, 0.001)) - 1) * 100;

  const ltvFromRebills = ltv13 - arppuWithD0;
  const minArppuForPayback = Math.max(0, eCPA - ltvFromRebills);
  const arppuForPaybackOk = arppuWithD0 >= minArppuForPayback;
  const arppuForPaybackMargin = minArppuForPayback > 0
    ? ((arppuWithD0 / minArppuForPayback) - 1) * 100
    : 100;

  // --- Cohort break-even (v2.1: horizon extended to 60mo for consistency with Payback) ---
  const COHORT_HORIZON = 60;
  const deltaLTV: number[] = [];
  for (let m = 1; m <= COHORT_HORIZON; m++) {
    const curr = totalLTV(m);
    const prev = m === 1 ? arppuWithD0 : totalLTV(m - 1);
    deltaLTV.push(curr - prev);
  }

  // Spend lasts only while the test budget is running (testLen months).
  // After that, spend stops but cohorts keep paying.
  let cumulRev = 0;
  let cumulSpend = 0;
  let monthlyBE: number | null = null;
  let cumulBE: number | null = null;
  let maxDeficit = 0;
  for (let T = 1; T <= COHORT_HORIZON; T++) {
    let monthlyRev = 0;
    // Only cohorts acquired during the spending window contribute to new acquisition
    const cohortsActive = Math.min(T, testLen);
    for (let cohort = 1; cohort <= cohortsActive; cohort++) {
      const age = T - cohort;
      if (age === 0) monthlyRev += purchPerMonth * arppuWithD0;
      else if (age < deltaLTV.length) monthlyRev += purchPerMonth * deltaLTV[age];
    }
    // Pre-testLen cohorts keep paying after spend stops
    if (T > testLen) {
      for (let cohort = 1; cohort <= testLen; cohort++) {
        const age = T - cohort;
        if (age === 0) continue;
        if (age < deltaLTV.length) {
          // already counted above when cohortsActive == testLen; skip duplication
        }
      }
    }
    cumulRev += monthlyRev;
    cumulSpend += T <= testLen ? spendPerMonth : 0;
    const monthlyPL = monthlyRev - (T <= testLen ? spendPerMonth : 0);
    const cumulPL = cumulRev - cumulSpend;
    if (cumulPL < maxDeficit) maxDeficit = cumulPL;
    if (monthlyBE === null && monthlyPL >= 0 && T > testLen * 0.5) monthlyBE = T;
    if (cumulBE === null && cumulPL >= 0) cumulBE = T;
  }

  const monthsToMonthlyBE = monthlyBE ?? COHORT_HORIZON;
  const spendToMonthlyBE = Math.min(monthsToMonthlyBE, testLen) * spendPerMonth;
  const cashGapBuffer = Math.abs(maxDeficit) * 0.5;
  const cashRequired = spendToMonthlyBE + cashGapBuffer;
  const budgetSufficient = totalBudget >= cashRequired;

  // --- P&L ---
  // D0 view: monthly revenue only from first payments of new cohort
  // @Payback view: cumulative LTV at Payback mark multiplied by purchases
  const fixedMonthly = Math.max(0, inputs.fixedCostsMonthly);
  const revMonthD0 = purchPerMonth * arppuWithD0;
  const profitMonthD0 = revMonthD0 - spendPerMonth - fixedMonthly;
  const revTotalD0 = totalPurchases * arppuWithD0;
  const profitTotalD0 = revTotalD0 - totalBudget - fixedMonthly * monthsOfBudget;
  const ltvPB = paybackMonth !== null ? totalLTV(paybackMonth) : ltv6;
  const revMonthPB = purchPerMonth * ltvPB;
  const profitMonthPB = revMonthPB - spendPerMonth - fixedMonthly;
  const revTotalPB = totalPurchases * ltvPB;
  const profitTotalPB = revTotalPB - totalBudget - fixedMonthly * monthsOfBudget;

  // Waterfall (monthly, D0 view): gross → store fee → refund → COGS → fixed → spend → net
  const waterfallGross = purchPerMonth * arppuGrossD0;
  const waterfallStoreFeeCut = waterfallGross * storeFee;
  const afterStore = waterfallGross - waterfallStoreFeeCut;
  const waterfallRefundCut = afterStore * refundRate;
  const afterRefund = afterStore - waterfallRefundCut;
  const waterfallCogsCut = purchPerMonth * cogs;  // D0 month: 1 month of COGS per new user
  const waterfallFixedCut = fixedMonthly;
  const waterfallAdSpend = spendPerMonth;
  const waterfallNetProfit = afterRefund - waterfallCogsCut - waterfallFixedCut - waterfallAdSpend;

  // Sensitivity helper
  function sensPaybackAt(cpaDeltaPct: number, churnDeltaPct: number): number | null {
    const testCPA = eCPA * (1 + cpaDeltaPct / 100);
    const testChurnM = churnM * (1 + churnDeltaPct / 100);
    for (let m = 0; m <= 13; m++) {
      let v: number;
      if (m === 0) v = arppuWithD0;
      else v = sensLtvAt(m, testChurnM);
      if (v >= testCPA) return m;
    }
    return null;
  }

  function sensLtvAt(months: number, testChurnM: number): number {
    const alt = (p: Plan): number => {
      const Pm = p.periodMonths;
      if (Pm >= 12) return Math.pow(renewal, Pm / 12);
      if (Pm >= 1) return Math.pow(1 - testChurnM, Pm);
      const scale = testChurnM / Math.max(0.001, churnM);
      const sw = Math.min(0.95, churnW * scale);
      const weeks = Pm * (30.44 / 7);
      return Math.pow(1 - sw, weeks);
    };
    const g = plans.reduce((s, p) => {
      const R = alt(p);
      let rev = introPrice(p);
      for (let k = 1; k * p.periodMonths <= months; k++) {
        rev += p.fullPrice * Math.pow(R, k);
      }
      return s + planShare(p) * rev;
    }, 0);
    const am = plans.reduce((s, p) => {
      const R = alt(p);
      let a = 0;
      for (let k = 0; k * p.periodMonths < months; k++) {
        const periodLen = Math.min(p.periodMonths, months - k * p.periodMonths);
        a += periodLen * Math.pow(R, k);
      }
      return s + planShare(p) * a;
    }, 0);
    const nltv = g * netMult - am * cogs;
    let pack = 0;
    if (inputs.upsells.packs.enabled) {
      for (const item of inputs.upsells.packs.items) {
        pack += item.price * (item.conv / 100) * netMult * am;
      }
    }
    return nltv + d0UpsellRev + pack;
  }

  return {
    mode: inputs.mode,
    isSaas,

    shareY,

    arppuGrossD0, arppuGrossFull, arppuNetD0,
    d0UpsellRev, arppuWithD0,
    blendedPaidCPA, eCPA, blendedConv,

    ltv1, ltv3, ltv6, ltv12, ltv13,
    roasD0, paybackMonth,

    totalPurchases, budgetPerDay, purchPerDay, purchPerMonth, spendPerMonth,
    monthsOfBudget, paybackBeforeBudgetEnds,

    ltvAtPayback, revenueAtPayback, profitAtPayback,

    maxCPA, cpaOk, cpaMargin,
    minARPPU, arppuOk, arppuMargin,
    maxChurnM, churnOk, churnMargin,
    minArppuForPayback, arppuForPaybackOk, arppuForPaybackMargin,

    monthlyBE, cumulBE, maxDeficit, cashRequired, budgetSufficient,

    revMonthD0, profitMonthD0, revTotalD0, profitTotalD0,
    revMonthPB, profitMonthPB, revTotalPB, profitTotalPB,

    waterfallGross,
    waterfallStoreFeeCut,
    waterfallRefundCut,
    waterfallCogsCut,
    waterfallFixedCut,
    waterfallAdSpend,
    waterfallNetProfit,

    inputs,

    grossLTV, netLTV, upsellLTV, totalLTV, sensPaybackAt
  };
}

function normalize(inputs: Inputs): Inputs {
  const clone = structuredClone(inputs);
  clone.totalBudget = Math.max(0, clone.totalBudget || 0);
  clone.renewal = clamp(clone.renewal, 0, 100);
  clone.churnM = clamp(clone.churnM, 0, 100);
  clone.churnW = clamp(clone.churnW, 0, 100);
  clone.storeFee = clamp(clone.storeFee, 0, 100);
  clone.refundRate = clamp(clone.refundRate, 0, 100);
  clone.cogs = Math.max(0, clone.cogs);
  clone.webShare = clamp(clone.webShare, 0, 100);
  clone.appShare = clamp(clone.appShare, 0, 100);
  clone.webConv = clamp(clone.webConv, 0, 100);
  clone.appConv = clamp(clone.appConv, 0, 100);
  clone.organic = clamp(clone.organic, 0, 100);
  clone.email = clamp(clone.email, 0, 100);
  return clone;
}

function clamp(n: number, lo: number, hi: number): number {
  if (!isFinite(n)) return lo;
  return Math.max(lo, Math.min(hi, n));
}

export const fmt = (n: number, d = 2): string => {
  if (!isFinite(n)) return '—';
  const sign = n < 0 ? '-' : '';
  const abs = Math.abs(n);
  return sign + '$' + abs.toFixed(d).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

export const fmtK = (n: number): string => {
  if (!isFinite(n)) return '—';
  const abs = Math.abs(n);
  if (abs >= 1000) return (n < 0 ? '-' : '') + '$' + (abs / 1000).toFixed(1) + 'K';
  return fmt(n, 0);
};
