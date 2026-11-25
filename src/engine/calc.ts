import type { Inputs, ComputeResult } from './types';

/* ============================================
   Napkin Unit Economics — Engine
   Pure calculation. No DOM, no side effects.
   ============================================ */

export function compute(raw: Inputs): ComputeResult {
  const inputs = normalize(raw);
  const isSaas = inputs.mode === 'saas';

  const totalBudget = inputs.totalBudget;

  // Pricing (intro vs rebill)
  const pYF = inputs.introPricing ? inputs.priceYearlyFirst : inputs.priceYearlyFull;
  const pYR = inputs.priceYearlyFull;
  const pMF = inputs.introPricing ? inputs.priceMonthlyFirst : inputs.priceMonthlyFull;
  const pMR = inputs.priceMonthlyFull;
  const pWF = inputs.introPricing ? inputs.priceWeeklyFirst : inputs.priceWeeklyFull;
  const pWR = inputs.priceWeeklyFull;

  // Plan mix (normalized)
  let shareY = inputs.shareYearly / 100;
  let shareM = inputs.shareMonthly / 100;
  let shareW = isSaas ? 0 : Math.max(0, 1 - shareY - shareM);
  if (isSaas) {
    const s = shareY + shareM;
    if (s > 0) { shareY /= s; shareM /= s; } else { shareY = 1; shareM = 0; }
  }

  const renewal = inputs.renewal / 100;
  const churnM = inputs.churnM / 100;
  const churnW = isSaas ? 0 : inputs.churnW / 100;

  const storeFee = inputs.storeFee / 100;
  const refundRate = inputs.refundRate / 100;
  const cogs = inputs.cogs;

  const netMult = (1 - storeFee) * (1 - refundRate);

  // ARPPU D0 / rebill-avg
  const arppuGrossD0 = pYF * shareY + pMF * shareM + pWF * shareW;
  const arppuGrossFull = pYR * shareY + pMR * shareM + pWR * shareW;
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

  // --- LTV functions (closures over above) ---
  function grossLTV(months: number): number {
    let yearly = pYF;
    if (months >= 12) yearly += pYR * renewal;
    if (months >= 24) yearly += pYR * renewal * renewal;

    let monthly = pMF;
    for (let i = 1; i < months; i++) {
      monthly += pMR * Math.pow(1 - churnM, i);
    }

    let weekly = pWF;
    const weeks = months * 4.33;
    for (let i = 1; i < Math.floor(weeks); i++) {
      weekly += pWR * Math.pow(1 - churnW, i);
    }
    return shareY * yearly + shareM * monthly + shareW * weekly;
  }

  function netLTV(months: number): number {
    const gltv = grossLTV(months);
    const yearlyMonths =
      Math.min(months, 12) + (months >= 12 ? Math.min(months - 12, 12) * renewal : 0);
    const yearlyCogs = shareY * yearlyMonths * cogs;

    let monthlyCogs = 0;
    for (let i = 0; i < months; i++) monthlyCogs += cogs * Math.pow(1 - churnM, i);
    monthlyCogs *= shareM;

    let weeklyCogs = 0;
    const weeks = months * 4.33;
    for (let i = 0; i < Math.floor(weeks); i++) {
      weeklyCogs += (cogs / 4.33) * Math.pow(1 - churnW, i);
    }
    weeklyCogs *= shareW;

    return gltv * netMult - yearlyCogs - monthlyCogs - weeklyCogs;
  }

  function activeMonths(months: number): number {
    const yM =
      Math.min(months, 12) + (months >= 12 ? Math.min(months - 12, 12) * renewal : 0);
    let mSum = 0;
    for (let i = 0; i < months; i++) mSum += Math.pow(1 - churnM, i);
    let wSum = 0;
    const weeks = months * 4.33;
    for (let i = 0; i < Math.floor(weeks); i++) wSum += Math.pow(1 - churnW, i);
    return shareY * yM + shareM * mSum + shareW * (wSum / 4.33);
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

  // Key metrics
  const ltv1 = totalLTV(1);
  const ltv3 = totalLTV(3);
  const ltv6 = totalLTV(6);
  const ltv12 = totalLTV(12);
  const ltv13 = totalLTV(13);

  const roasD0 = arppuWithD0 / eCPA;

  let paybackMonth: number | null = null;
  for (let m = 0; m <= 13; m++) {
    const v = m === 0 ? arppuWithD0 : totalLTV(m);
    if (v >= eCPA) { paybackMonth = m; break; }
  }

  // Forecast
  const totalPurchases = totalBudget / eCPA;
  const minMonths = paybackMonth !== null ? Math.max(paybackMonth + 1, 6) : 6;
  const budgetPerDay = totalBudget / (minMonths * 30);
  const purchPerDay = budgetPerDay / eCPA;
  const purchPerMonth = purchPerDay * 30;
  const spendPerMonth = budgetPerDay * 30;
  const monthsOfBudget = Math.floor(totalBudget / spendPerMonth);
  const paybackBeforeBudgetEnds = paybackMonth !== null && paybackMonth <= monthsOfBudget;

  const ltvAtPayback = paybackMonth !== null ? totalLTV(paybackMonth) : ltv13;
  const revenueAtPayback = totalPurchases * ltvAtPayback;
  const profitAtPayback = revenueAtPayback - totalBudget;

  // Targets
  const maxCPA = ltv13;
  const cpaOk = eCPA <= maxCPA;
  const cpaMargin = ((maxCPA / eCPA) - 1) * 100;

  const minARPPU = eCPA * 0.7;
  const arppuOk = arppuWithD0 >= minARPPU;
  const arppuMargin = ((arppuWithD0 / minARPPU) - 1) * 100;

  // Max churn where LTV13 >= eCPA
  const safeChurnM = Math.max(0.001, churnM);
  let maxChurnM = churnM;
  for (let c = 0.95; c >= 0.01; c -= 0.01) {
    const testChurnW = Math.min(0.95, churnW * (c / safeChurnM));
    if (scenarioLTV13(c, testChurnW) >= eCPA) { maxChurnM = c; break; }
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

  function scenarioLTV13(tcm: number, tcw: number): number {
    const testChurnM = tcm;
    const testChurnW = Math.min(0.95, Math.max(0, tcw));
    const months = 13;
    const yearly = pYF + pYR * renewal;
    let monthly = pMF;
    for (let i = 1; i < months; i++) monthly += pMR * Math.pow(1 - testChurnM, i);
    let weekly = pWF;
    const weeks = months * 4.33;
    for (let i = 1; i < Math.floor(weeks); i++) weekly += pWR * Math.pow(1 - testChurnW, i);
    const g = shareY * yearly + shareM * monthly + shareW * weekly;

    const yM = 12 + 1 * renewal;
    const yearlyCogs = shareY * yM * cogs;
    let mCogs = 0;
    for (let i = 0; i < months; i++) mCogs += cogs * Math.pow(1 - testChurnM, i);
    mCogs *= shareM;
    let wCogs = 0;
    for (let i = 0; i < Math.floor(weeks); i++) wCogs += (cogs / 4.33) * Math.pow(1 - testChurnW, i);
    wCogs *= shareW;

    const nltv = g * netMult - yearlyCogs - mCogs - wCogs;

    let mSum = 0;
    for (let i = 0; i < months; i++) mSum += Math.pow(1 - testChurnM, i);
    let wSum = 0;
    for (let i = 0; i < Math.floor(weeks); i++) wSum += Math.pow(1 - testChurnW, i);
    const activeM = shareY * yM + shareM * mSum + shareW * (wSum / 4.33);

    let pack = 0;
    if (inputs.upsells.packs.enabled) {
      for (const item of inputs.upsells.packs.items) {
        pack += item.price * (item.conv / 100) * netMult * activeM;
      }
    }
    return nltv + d0UpsellRev + pack;
  }

  // Cohort BE
  const deltaLTV: number[] = [];
  for (let m = 1; m <= 24; m++) {
    const curr = totalLTV(m);
    const prev = m === 1 ? arppuWithD0 : totalLTV(m - 1);
    deltaLTV.push(curr - prev);
  }

  let cumulRev = 0;
  let cumulSpend = 0;
  let monthlyBE: number | null = null;
  let cumulBE: number | null = null;
  let maxDeficit = 0;
  for (let T = 1; T <= 24; T++) {
    let monthlyRev = 0;
    for (let cohort = 1; cohort <= T; cohort++) {
      const age = T - cohort;
      if (age === 0) monthlyRev += purchPerMonth * arppuWithD0;
      else if (age < deltaLTV.length) monthlyRev += purchPerMonth * deltaLTV[age];
    }
    cumulRev += monthlyRev;
    cumulSpend += spendPerMonth;
    const monthlyPL = monthlyRev - spendPerMonth;
    const cumulPL = cumulRev - cumulSpend;
    if (cumulPL < maxDeficit) maxDeficit = cumulPL;
    if (monthlyBE === null && monthlyPL >= 0) monthlyBE = T;
    if (cumulBE === null && cumulPL >= 0) cumulBE = T;
  }

  const monthsToMonthlyBE = monthlyBE ?? 24;
  const spendToMonthlyBE = monthsToMonthlyBE * spendPerMonth;
  const cashGapBuffer = Math.abs(maxDeficit) * 0.5;
  const cashRequired = spendToMonthlyBE + cashGapBuffer;
  const budgetSufficient = totalBudget >= cashRequired;

  // P&L
  const revMonthD0 = purchPerMonth * arppuWithD0;
  const profitMonthD0 = revMonthD0 - spendPerMonth;
  const revTotalD0 = totalPurchases * arppuWithD0;
  const profitTotalD0 = revTotalD0 - totalBudget;
  const ltvPB = paybackMonth !== null ? totalLTV(paybackMonth) : ltv6;
  const revMonthPB = purchPerMonth * ltvPB;
  const profitMonthPB = revMonthPB - spendPerMonth;
  const revTotalPB = totalPurchases * ltvPB;
  const profitTotalPB = revTotalPB - totalBudget;

  // Sensitivity helper
  function sensPaybackAt(cpaDeltaPct: number, churnDeltaPct: number): number | null {
    const testCPA = eCPA * (1 + cpaDeltaPct / 100);
    const testChurnM = churnM * (1 + churnDeltaPct / 100);
    const testChurnW = Math.min(0.95, churnW * (1 + churnDeltaPct / 100));
    for (let m = 0; m <= 13; m++) {
      let v: number;
      if (m === 0) v = arppuWithD0;
      else v = scenarioLTVm(m, testChurnM, testChurnW);
      if (v >= testCPA) return m;
    }
    return null;
  }

  function scenarioLTVm(months: number, tcm: number, tcw: number): number {
    let yearly = pYF;
    if (months >= 12) yearly += pYR * renewal;
    let monthly = pMF;
    for (let i = 1; i < months; i++) monthly += pMR * Math.pow(1 - tcm, i);
    let weekly = pWF;
    const weeks = months * 4.33;
    for (let i = 1; i < Math.floor(weeks); i++) weekly += pWR * Math.pow(1 - tcw, i);
    const g = shareY * yearly + shareM * monthly + shareW * weekly;

    const yM =
      Math.min(months, 12) + (months >= 12 ? Math.min(months - 12, 12) * renewal : 0);
    const yearlyCogs = shareY * yM * cogs;
    let mCogs = 0;
    for (let i = 0; i < months; i++) mCogs += cogs * Math.pow(1 - tcm, i);
    mCogs *= shareM;
    let wCogs = 0;
    for (let i = 0; i < Math.floor(weeks); i++) wCogs += (cogs / 4.33) * Math.pow(1 - tcw, i);
    wCogs *= shareW;

    const nltv = g * netMult - yearlyCogs - mCogs - wCogs;

    let mSum = 0;
    for (let i = 0; i < months; i++) mSum += Math.pow(1 - tcm, i);
    let wSum = 0;
    for (let i = 0; i < Math.floor(weeks); i++) wSum += Math.pow(1 - tcw, i);
    const activeM = shareY * yM + shareM * mSum + shareW * (wSum / 4.33);

    let pack = 0;
    if (inputs.upsells.packs.enabled) {
      for (const item of inputs.upsells.packs.items) {
        pack += item.price * (item.conv / 100) * netMult * activeM;
      }
    }
    return nltv + d0UpsellRev + pack;
  }

  return {
    mode: inputs.mode,
    isSaas,

    shareY, shareM, shareW,

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

    inputs,

    grossLTV, netLTV, upsellLTV, totalLTV, sensPaybackAt
  };
}

function normalize(inputs: Inputs): Inputs {
  // Clamp a few guard values
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

// --- format helpers used across UI ---
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
