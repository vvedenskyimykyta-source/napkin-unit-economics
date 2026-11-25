/* ============================================
   Napkin Unit Economics — Calculation Engine
   Pure math + rule-based diagnostics. No DOM.
   ============================================ */

// -------- Global state --------
const S = {
  mode: 'mobile',           // 'mobile' | 'saas'
  lang: 'ru',
  introPricing: true,
  channels: { web: true, app: true },
  upsells: {
    d0:    { enabled: true, items: [{ price: 9.99, conv: 12 }, { price: 19.99, conv: 5 }] },
    packs: { enabled: true, items: [{ price: 4.99, conv: 5  }, { price: 9.99,  conv: 2 }] }
  }
};

// -------- Mode presets --------
const PRESETS = {
  mobile: {
    totalBudget: 50000,
    priceYearlyFirst: 44,  priceYearlyFull: 89,
    priceMonthlyFirst: 15, priceMonthlyFull: 30,
    priceWeeklyFirst: 4.99,priceWeeklyFull: 9.99,
    shareY: 60, shareM: 30,          // shareW = 10
    renewal: 55, churnM: 30, churnW: 50,
    storeFee: 15, refund: 2, cogs: 0.80,
    webShare: 40, appShare: 60,
    webCPA: 50, appCPA: 35,
    webConv: 2.0, appConv: 8.0,
    organic: 15, email: 10,
    introPricing: true,
    channels: { web: true, app: true }
  },
  saas: {
    totalBudget: 60000,
    priceYearlyFirst: 468, priceYearlyFull: 588, // $49/mo yearly, 20% annual discount
    priceMonthlyFirst: 29, priceMonthlyFull: 49,
    priceWeeklyFirst: 0,   priceWeeklyFull: 0,   // not used in SaaS
    shareY: 35, shareM: 65,          // shareW = 0, forced
    renewal: 85, churnM: 6, churnW: 0,
    storeFee: 3, refund: 1, cogs: 5.00,          // Stripe ~2.9%+30c; higher COGS for infra/support
    webShare: 85, appShare: 15,
    webCPA: 120, appCPA: 220,
    webConv: 3.0, appConv: 1.5,
    organic: 25, email: 15,
    introPricing: true,                          // trial→paid acts as intro
    channels: { web: true, app: false }
  }
};

// -------- Helpers --------
const gv = id => parseFloat(document.getElementById(id)?.value) || 0;
const fmt = (n, d = 2) => {
  if (!isFinite(n)) return '—';
  const sign = n < 0 ? '-' : '';
  const abs = Math.abs(n);
  return sign + '$' + abs.toFixed(d).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};
const fmtK = n => {
  if (!isFinite(n)) return '—';
  const abs = Math.abs(n);
  if (abs >= 1000) return (n < 0 ? '-' : '') + '$' + (abs / 1000).toFixed(1) + 'K';
  return fmt(n, 0);
};
const pct = (n, d = 0) => (n * 100).toFixed(d) + '%';

// -------- Core calculation --------
function compute() {
  const mode = S.mode;
  const isSaas = mode === 'saas';

  const totalBudget = gv('total-budget');

  // Pricing — intro vs rebill
  let priceYFirst, priceYFull, priceMFirst, priceMFull, priceWFirst, priceWFull;
  if (S.introPricing) {
    priceYFirst = gv('price-yearly-first');
    priceYFull  = gv('price-yearly-full');
    priceMFirst = gv('price-monthly-first');
    priceMFull  = gv('price-monthly-full');
    priceWFirst = gv('price-weekly-first');
    priceWFull  = gv('price-weekly-full');
  } else {
    priceYFirst = priceYFull = gv('price-yearly');
    priceMFirst = priceMFull = gv('price-monthly');
    priceWFirst = priceWFull = gv('price-weekly');
  }

  // Plan mix shares
  let shareY = gv('share-yearly') / 100;
  let shareM = gv('share-monthly') / 100;
  let shareW = isSaas ? 0 : Math.max(0, 1 - shareY - shareM);
  if (isSaas) {
    // normalize Y + M to 100% in SaaS mode
    const sum = shareY + shareM;
    if (sum > 0) { shareY /= sum; shareM /= sum; } else { shareY = 1; shareM = 0; }
  }

  const renewal  = gv('renewal') / 100;
  const churnM   = gv('churn-m') / 100;
  const churnW   = isSaas ? 0 : gv('churn-w') / 100;

  const storeFee   = gv('store-fee') / 100;
  const refundRate = gv('refund') / 100;
  const cogs       = gv('cogs');

  // Traffic channels
  const webEnabled = S.channels.web;
  const appEnabled = S.channels.app;
  const webShare = webEnabled ? gv('web-share') / 100 : 0;
  const appShare = appEnabled ? gv('app-share') / 100 : 0;
  const webCPA  = gv('web-cpa');
  const appCPA  = gv('app-cpa');
  const webConv = gv('web-conv') / 100;
  const appConv = gv('app-conv') / 100;

  const organicPct = gv('organic') / 100;
  const emailPct   = gv('email') / 100;

  // ======== Derived ========
  const netMult = (1 - storeFee) * (1 - refundRate);

  const arppuGrossD0 = priceYFirst * shareY + priceMFirst * shareM + priceWFirst * shareW;
  const arppuGrossFull = priceYFull * shareY + priceMFull * shareM + priceWFull * shareW;
  const arppuNetD0 = arppuGrossD0 * netMult;

  // D0 upsell revenue (take rate × price × net)
  let d0UpsellRev = 0;
  if (S.upsells.d0.enabled) {
    S.upsells.d0.items.forEach(item => {
      d0UpsellRev += item.price * (item.conv / 100) * netMult;
    });
  }
  const arppuWithD0 = arppuNetD0 + d0UpsellRev;

  // Blended CPA from paid channels, then diluted by organic+email
  const totalChShare = webShare + appShare;
  const normWebShare = totalChShare > 0 ? webShare / totalChShare : 0;
  const normAppShare = totalChShare > 0 ? appShare / totalChShare : 0;
  let blendedPaidCPA;
  if (!webEnabled && !appEnabled) blendedPaidCPA = webCPA;
  else blendedPaidCPA = normWebShare * webCPA + normAppShare * appCPA;

  const directShare = Math.max(0.1, 1 - organicPct - emailPct);
  const eCPA = Math.max(0.5, blendedPaidCPA * directShare);

  const blendedConv = totalChShare > 0 ? normWebShare * webConv + normAppShare * appConv : webConv;

  // ======== LTV functions ========
  function grossLTV(months) {
    let yearly = priceYFirst;
    if (months >= 12) yearly += priceYFull * renewal;
    if (months >= 24) yearly += priceYFull * renewal * renewal;

    let monthly = priceMFirst;
    for (let i = 1; i < months; i++) {
      monthly += priceMFull * Math.pow(1 - churnM, i);
    }

    let weekly = priceWFirst;
    const weeks = months * 4.33;
    for (let i = 1; i < Math.floor(weeks); i++) {
      weekly += priceWFull * Math.pow(1 - churnW, i);
    }

    return shareY * yearly + shareM * monthly + shareW * weekly;
  }

  function netLTV(months) {
    const gltv = grossLTV(months);

    // yearly cogs: assume full-year coverage after each payment until renewal; cap at months
    const yearlyMonths = Math.min(months, 12) + (months >= 12 ? Math.min(months - 12, 12) * renewal : 0);
    const yearlyCogs = shareY * yearlyMonths * cogs;

    let monthlyCogs = 0;
    for (let i = 0; i < months; i++) monthlyCogs += cogs * Math.pow(1 - churnM, i);
    monthlyCogs *= shareM;

    let weeklyCogs = 0;
    const weeks = months * 4.33;
    for (let i = 0; i < Math.floor(weeks); i++) weeklyCogs += (cogs / 4.33) * Math.pow(1 - churnW, i);
    weeklyCogs *= shareW;

    return gltv * netMult - yearlyCogs - monthlyCogs - weeklyCogs;
  }

  function activeMonths(months) {
    const yM = Math.min(months, 12) + (months >= 12 ? Math.min(months - 12, 12) * renewal : 0);
    let mSum = 0;
    for (let i = 0; i < months; i++) mSum += Math.pow(1 - churnM, i);
    let wSum = 0;
    const weeks = months * 4.33;
    for (let i = 0; i < Math.floor(weeks); i++) wSum += Math.pow(1 - churnW, i);
    return shareY * yM + shareM * mSum + shareW * (wSum / 4.33);
  }

  function upsellLTV(months) {
    let packLTV = 0;
    if (S.upsells.packs.enabled) {
      S.upsells.packs.items.forEach(item => {
        packLTV += item.price * (item.conv / 100) * netMult * activeMonths(months);
      });
    }
    return d0UpsellRev + packLTV;
  }

  function totalLTV(months) { return netLTV(months) + upsellLTV(months); }

  // ======== Scenario LTV (for sensitivity & max-churn) ========
  // Scales churnM AND churnW by the same multiplier (not proportional to base).
  // We keep weekly churn's absolute relative movement: new_cw = cw * (new_cm / cm) but capped at 0.95.
  function scenarioLTV13(testChurnM, testChurnWRaw) {
    const testChurnW = Math.min(0.95, Math.max(0, testChurnWRaw));
    const months = 13;
    let yearly = priceYFirst + priceYFull * renewal;
    let monthly = priceMFirst;
    for (let i = 1; i < months; i++) monthly += priceMFull * Math.pow(1 - testChurnM, i);
    let weekly = priceWFirst;
    const weeks = months * 4.33;
    for (let i = 1; i < Math.floor(weeks); i++) weekly += priceWFull * Math.pow(1 - testChurnW, i);
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

    let yM2 = 12 + 1 * renewal;
    let mSum = 0;
    for (let i = 0; i < months; i++) mSum += Math.pow(1 - testChurnM, i);
    let wSum = 0;
    for (let i = 0; i < Math.floor(weeks); i++) wSum += Math.pow(1 - testChurnW, i);
    const activeM = shareY * yM2 + shareM * mSum + shareW * (wSum / 4.33);

    let packLTV = 0;
    if (S.upsells.packs.enabled) {
      S.upsells.packs.items.forEach(item => { packLTV += item.price * (item.conv / 100) * netMult * activeM; });
    }
    return nltv + d0UpsellRev + packLTV;
  }

  // ======== Key metrics ========
  const ltv1  = totalLTV(1);
  const ltv3  = totalLTV(3);
  const ltv6  = totalLTV(6);
  const ltv12 = totalLTV(12);
  const ltv13 = totalLTV(13);

  const roasD0 = arppuWithD0 / eCPA;

  let paybackMonth = null;
  for (let m = 0; m <= 13; m++) {
    const ltvAtMonth = m === 0 ? arppuWithD0 : totalLTV(m);
    if (ltvAtMonth >= eCPA) { paybackMonth = m; break; }
  }

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

  // ======== Target metrics ========
  const maxCPA = ltv13;
  const cpaOk = eCPA <= maxCPA;
  const cpaMargin = ((maxCPA / eCPA) - 1) * 100;

  const minARPPU = eCPA * 0.7;
  const arppuOk = arppuWithD0 >= minARPPU;
  const arppuMargin = ((arppuWithD0 / minARPPU) - 1) * 100;

  // Max monthly churn at which LTV13 still >= eCPA
  // Scale weekly proportionally; cap at 0.95.
  const safeChurnM = Math.max(0.001, churnM);
  let maxChurnM = churnM;
  // Search 1%-95% in 1% steps for the max churn still clearing eCPA
  for (let c = 0.95; c >= 0.01; c -= 0.01) {
    const testChurnW = Math.min(0.95, churnW * (c / safeChurnM));
    if (scenarioLTV13(c, testChurnW) >= eCPA) {
      maxChurnM = c;
      break;
    }
  }
  if (maxChurnM < 0.01) maxChurnM = 0.01;
  const churnOk = churnM <= maxChurnM;
  const churnMargin = ((maxChurnM / Math.max(churnM, 0.001)) - 1) * 100;

  const ltvFromRebillsOnly = ltv13 - arppuWithD0;
  const minArppuForPayback = Math.max(0, eCPA - ltvFromRebillsOnly);
  const arppuForPaybackOk = arppuWithD0 >= minArppuForPayback;
  const arppuForPaybackMargin = minArppuForPayback > 0 ? ((arppuWithD0 / minArppuForPayback) - 1) * 100 : 100;

  // ======== Cohort break-even ========
  const deltaLTV = [];
  for (let m = 1; m <= 24; m++) {
    const curr = totalLTV(m);
    const prev = m === 1 ? arppuWithD0 : totalLTV(m - 1);
    deltaLTV.push(curr - prev);
  }

  let cumulRev = 0, cumulSpend = 0;
  let monthlyBE = null, cumulBE = null;
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
    if (cumulBE   === null && cumulPL   >= 0) cumulBE = T;
  }

  const monthsToMonthlyBE = monthlyBE || 24;
  const spendToMonthlyBE = monthsToMonthlyBE * spendPerMonth;
  const cashGapBuffer = Math.abs(maxDeficit) * 0.5;
  const cashRequired = spendToMonthlyBE + cashGapBuffer;
  const budgetSufficient = totalBudget >= cashRequired;

  // ======== P&L (at Payback, totals over budget run) ========
  const revMonthD0 = purchPerMonth * arppuWithD0;
  const profitMonthD0 = revMonthD0 - spendPerMonth;
  const revTotalD0 = totalPurchases * arppuWithD0;
  const profitTotalD0 = revTotalD0 - totalBudget;
  const ltvPB = paybackMonth !== null ? totalLTV(paybackMonth) : ltv6;
  const revMonthPB = purchPerMonth * ltvPB;
  const profitMonthPB = revMonthPB - spendPerMonth;
  const revTotalPB = totalPurchases * ltvPB;
  const profitTotalPB = revTotalPB - totalBudget;

  // ======== Sensitivity ========
  function sensPaybackAt(cpaMult, churnMult) {
    const testCPA = eCPA * (1 + cpaMult / 100);
    const testChurnM = churnM * (1 + churnMult / 100);
    const testChurnW = Math.min(0.95, churnW * (1 + churnMult / 100));
    for (let m = 0; m <= 13; m++) {
      let v;
      if (m === 0) v = arppuWithD0;
      else v = scenarioLTVm(m, testChurnM, testChurnW);
      if (v >= testCPA) return m;
    }
    return null;
  }

  function scenarioLTVm(months, testChurnM, testChurnW) {
    let yearly = priceYFirst;
    if (months >= 12) yearly += priceYFull * renewal;
    let monthly = priceMFirst;
    for (let i = 1; i < months; i++) monthly += priceMFull * Math.pow(1 - testChurnM, i);
    let weekly = priceWFirst;
    const weeks = months * 4.33;
    for (let i = 1; i < Math.floor(weeks); i++) weekly += priceWFull * Math.pow(1 - testChurnW, i);
    const g = shareY * yearly + shareM * monthly + shareW * weekly;

    const yM = Math.min(months, 12) + (months >= 12 ? Math.min(months - 12, 12) * renewal : 0);
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

    let packLTV = 0;
    if (S.upsells.packs.enabled) {
      S.upsells.packs.items.forEach(item => { packLTV += item.price * (item.conv / 100) * netMult * activeM; });
    }
    return nltv + d0UpsellRev + packLTV;
  }

  // ======== Package result ========
  return {
    // inputs echoed
    mode, isSaas,
    totalBudget,
    priceYFirst, priceYFull, priceMFirst, priceMFull, priceWFirst, priceWFull,
    shareY, shareM, shareW,
    renewal, churnM, churnW,
    storeFee, refundRate, cogs,
    webEnabled, appEnabled, webShare, appShare, webCPA, appCPA, webConv, appConv,
    organicPct, emailPct,

    // derived
    netMult, arppuGrossD0, arppuGrossFull, arppuNetD0, d0UpsellRev, arppuWithD0,
    blendedPaidCPA, eCPA, blendedConv,

    // key metrics
    ltv1, ltv3, ltv6, ltv12, ltv13,
    roasD0, paybackMonth,
    totalPurchases, budgetPerDay, purchPerDay, purchPerMonth, spendPerMonth,
    monthsOfBudget, paybackBeforeBudgetEnds,
    ltvAtPayback, revenueAtPayback, profitAtPayback,

    // targets
    maxCPA, cpaOk, cpaMargin,
    minARPPU, arppuOk, arppuMargin,
    maxChurnM, churnOk, churnMargin,
    minArppuForPayback, arppuForPaybackOk, arppuForPaybackMargin,

    // break-even
    monthlyBE, cumulBE, maxDeficit, cashRequired, budgetSufficient,

    // P&L
    revMonthD0, profitMonthD0, revTotalD0, profitTotalD0,
    revMonthPB, profitMonthPB, revTotalPB, profitTotalPB, ltvPB,

    // functions for timeline rendering
    grossLTV, netLTV, upsellLTV, totalLTV, sensPaybackAt
  };
}

// ============================================
// Rule-based diagnostics — no LLM
// Reads compute() result, emits prioritized findings.
// ============================================
function diagnose(r) {
  const findings = [];
  const isSaas = r.isSaas;

  // Benchmarks differ by mode
  const BM = isSaas ? {
    churnMNorm: 0.07,   churnMBad: 0.12,
    renewalNorm: 0.80,  renewalBad: 0.65,
    ltvCacNorm: 3,      ltvCacBad: 2,
    roasD0Norm: 0.25,   roasD0Great: 0.5,
    yearlyShareNorm: 0.30,
    d0UpsellShareGood: 0.10
  } : {
    churnMNorm: 0.25,   churnMBad: 0.40,
    renewalNorm: 0.50,  renewalBad: 0.30,
    ltvCacNorm: 1.5,    ltvCacBad: 1.0,
    roasD0Norm: 0.55,   roasD0Great: 0.85,
    yearlyShareNorm: 0.50,
    d0UpsellShareGood: 0.15
  };

  const paybackMax = 13;
  const paybackGood = isSaas ? 12 : 6;
  const ltvCac = r.ltv13 / Math.max(r.eCPA, 0.01);

  // ========== Headline status ==========
  let headline;
  if (r.paybackMonth === null) {
    headline = { priority: 'high', msg: `<b>Экономика не сходится за ${paybackMax} мес.</b> LTV13 (${fmt(r.ltv13,0)}) ниже eCPA (${fmt(r.eCPA,0)}). Разрыв: <b>${fmt(r.eCPA - r.ltv13, 0)}</b>.`, where: '' };
  } else if (r.paybackMonth > r.monthsOfBudget) {
    headline = { priority: 'high', msg: `<b>Бюджета не хватит до Payback.</b> Окупаемость на M${r.paybackMonth}, а бюджета хватит только на ${r.monthsOfBudget} мес.`, where: '' };
  } else if (r.paybackMonth <= paybackGood) {
    headline = { priority: 'low', msg: `<b>Экономика сходится.</b> Payback ${r.paybackMonth === 0 ? 'D0' : 'M' + r.paybackMonth}, LTV/CAC ${ltvCac.toFixed(2)}×.`, where: '' };
  } else {
    headline = { priority: 'mid', msg: `<b>Сходится, но окупаемость длинная.</b> Payback M${r.paybackMonth}, LTV/CAC ${ltvCac.toFixed(2)}×.`, where: '' };
  }
  findings.push(headline);

  // ========== Retention / Churn ==========
  if (r.churnM >= BM.churnMBad) {
    findings.push({
      priority: 'high',
      msg: `<b>Monthly Churn ${pct(r.churnM)}</b> — высокий для ${isSaas ? 'SaaS' : 'мобильной подписки'} (норма до ${pct(BM.churnMNorm)}).`,
      where: isSaas
        ? `Копай: онбординг, "aha moment" в первые 7 дней, активация ключевой фичи, win-back emails.`
        : `Копай: онбординг первых 3 дней, активация ключевой функции, push-notifications, re-engagement.`
    });
  } else if (r.churnM >= BM.churnMNorm) {
    findings.push({
      priority: 'mid',
      msg: `<b>Monthly Churn ${pct(r.churnM)}</b> — на границе нормы (норма ≤${pct(BM.churnMNorm)}).`,
      where: `Копай: онбординг, активация в первую неделю, причины отписки (exit survey).`
    });
  }

  if (r.renewal < BM.renewalBad) {
    findings.push({
      priority: 'high',
      msg: `<b>Yearly Renewal ${pct(r.renewal)}</b> — низкий (норма ${pct(BM.renewalNorm)}+).`,
      where: `Копай: напоминания за 30/7 дней до renewal, win-back с скидкой, годовые функции-"якоря", грейс-период.`
    });
  }

  // ========== LTV / CAC ==========
  if (ltvCac < BM.ltvCacBad && r.paybackMonth !== null) {
    findings.push({
      priority: 'high',
      msg: `<b>LTV/CAC ${ltvCac.toFixed(2)}×</b> — критично тонко (норма ${BM.ltvCacNorm}×+). Любой негатив — и экономика ломается.`,
      where: `Копай: CPA (quality trafic sources, лучший креатив), Pricing, Retention.`
    });
  } else if (ltvCac < BM.ltvCacNorm && r.paybackMonth !== null) {
    findings.push({
      priority: 'mid',
      msg: `<b>LTV/CAC ${ltvCac.toFixed(2)}×</b> — ниже целевого ${BM.ltvCacNorm}×. Запас прочности маленький.`,
      where: `Копай: снизить CPA на 15-20%, либо поднять LTV через retention/upsells.`
    });
  }

  // ========== ROAS D0 ==========
  if (r.roasD0 < 0.3) {
    findings.push({
      priority: isSaas ? 'mid' : 'high',
      msg: `<b>ROAS D0 ${(r.roasD0 * 100).toFixed(0)}%</b> — сразу отбивается очень мало (норма ${(BM.roasD0Norm * 100).toFixed(0)}%+).`,
      where: `Копай: intro pricing (слишком большая скидка?), D0 upsell flow, paywall cases, снизить CPA.`
    });
  }

  // ========== Pricing mix ==========
  if (!isSaas && r.shareY < BM.yearlyShareNorm) {
    findings.push({
      priority: 'mid',
      msg: `<b>Yearly доля ${pct(r.shareY)}</b> — низкая. Yearly платит сразу и churn близко к нулю в первые 12 мес → лучший тип подписки для cashflow.`,
      where: `Копай: paywall дизайн (yearly как default), badge "best value", экономия "$X/год", триал только на yearly.`
    });
  }

  // ========== D0 Upsells ==========
  const d0Share = r.arppuWithD0 > 0 ? r.d0UpsellRev / r.arppuWithD0 : 0;
  if (!S.upsells.d0.enabled || r.d0UpsellRev < 0.01) {
    findings.push({
      priority: 'mid',
      msg: `<b>D0 upsells выключены или не дают выручку.</b> При хороших take rates D0 апселы = +10-25% к ARPPU сразу.`,
      where: `Копай: один-два upsell шага сразу после покупки (lifetime add-on, premium feature pack).`
    });
  } else if (d0Share < BM.d0UpsellShareGood) {
    findings.push({
      priority: 'low',
      msg: `<b>D0 upsells дают ${(d0Share * 100).toFixed(0)}% к ARPPU</b>. Можно выжать больше (норма ${(BM.d0UpsellShareGood * 100).toFixed(0)}%+).`,
      where: `Копай: оффер D0 upsell, его цена, фрейминг ("+$X за lifetime доступ").`
    });
  }

  // ========== Traffic quality (Web vs App) ==========
  if (r.webEnabled && r.appEnabled && !isSaas) {
    // In mobile, app CPA usually lower than web (since web paywalls take <5% vs app 5-15%)
    if (r.webCPA > r.appCPA * 1.5 && r.webShare > 0.3) {
      findings.push({
        priority: 'low',
        msg: `<b>Web CPA ${fmt(r.webCPA, 0)} vs App CPA ${fmt(r.appCPA, 0)}</b> — web сильно дороже, но держит ${pct(r.webShare)} бюджета.`,
        where: `Копай: оправдан ли web на этих цифрах? Web обычно даёт выручку без комиссии стора (+15%), но если CPA высокий, net эффект может быть хуже App.`
      });
    }
  }

  // Organic too low → leaning on paid heavily
  if (r.organicPct < 0.05 && r.emailPct < 0.05) {
    findings.push({
      priority: 'low',
      msg: `<b>Organic + Email = ${((r.organicPct + r.emailPct) * 100).toFixed(0)}%</b> — почти вся выручка от paid. Это удорожает eCPA.`,
      where: `Копай: ASO/SEO, referral program, email lifecycle, community (органика снижает eCPA через dilution).`
    });
  }

  // ========== Paywall conversion ==========
  if (r.webEnabled && r.webConv < 0.015) {
    findings.push({
      priority: 'mid',
      msg: `<b>Web paywall conv ${(r.webConv*100).toFixed(1)}%</b> — низкая (норма 2-4% на subscription web).`,
      where: `Копай: paywall дизайн, цена/оффер, скорость загрузки, trial, soft vs hard paywall.`
    });
  }
  if (r.appEnabled && !isSaas && r.appConv < 0.04) {
    findings.push({
      priority: 'mid',
      msg: `<b>App paywall conv ${(r.appConv*100).toFixed(1)}%</b> — низкая (норма 5-10% для мобилки).`,
      where: `Копай: онбординг-paywall flow, trial offer, paywall screens A/B test.`
    });
  }

  // ========== Budget sizing ==========
  if (!r.budgetSufficient && r.paybackMonth !== null) {
    findings.push({
      priority: 'high',
      msg: `<b>Cash Required: ${fmtK(r.cashRequired)}</b> — текущий бюджет ${fmtK(r.totalBudget)} меньше. Риск cashflow-gap.`,
      where: `Копай: либо поднять бюджет до ${fmtK(r.cashRequired)}, либо снизить spend/мес, либо ускорить payback через retention/pricing.`
    });
  }

  return findings;
}

// Expose globals
window.S = S;
window.PRESETS = PRESETS;
window.gv = gv;
window.fmt = fmt;
window.fmtK = fmtK;
window.pct = pct;
window.compute = compute;
window.diagnose = diagnose;
