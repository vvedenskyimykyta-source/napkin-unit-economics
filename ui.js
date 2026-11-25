/* ============================================
   Napkin Unit Economics — UI rendering & handlers
   ============================================ */

// ---------- Mode switching ----------
function setMode(mode) {
  S.mode = mode;
  document.body.classList.toggle('mode-mobile', mode === 'mobile');
  document.body.classList.toggle('mode-saas',   mode === 'saas');
  document.querySelectorAll('.mode-btn').forEach(b => b.classList.toggle('active', b.dataset.mode === mode));
  applyPreset(PRESETS[mode]);
  applyModeLabels();
  renderAll();
}

function applyPreset(p) {
  const set = (id, v) => { const el = document.getElementById(id); if (el) el.value = v; };
  set('total-budget', p.totalBudget);
  set('price-yearly-first', p.priceYearlyFirst);
  set('price-yearly-full',  p.priceYearlyFull);
  set('price-monthly-first', p.priceMonthlyFirst);
  set('price-monthly-full',  p.priceMonthlyFull);
  set('price-weekly-first',  p.priceWeeklyFirst);
  set('price-weekly-full',   p.priceWeeklyFull);
  set('price-yearly',  p.priceYearlyFull);
  set('price-monthly', p.priceMonthlyFull);
  set('price-weekly',  p.priceWeeklyFull);
  set('share-yearly',  p.shareY);
  set('share-monthly', p.shareM);
  set('share-weekly',  Math.max(0, 100 - p.shareY - p.shareM));
  set('renewal', p.renewal);
  set('churn-m', p.churnM);
  set('churn-w', p.churnW);
  set('store-fee', p.storeFee);
  set('refund', p.refund);
  set('cogs',  p.cogs);
  set('web-share', p.webShare);
  set('app-share', p.appShare);
  set('web-cpa', p.webCPA);
  set('app-cpa', p.appCPA);
  set('web-conv', p.webConv);
  set('app-conv', p.appConv);
  set('organic', p.organic);
  set('email',   p.email);

  S.introPricing = p.introPricing;
  S.channels = { ...p.channels };

  const togIntro = document.getElementById('tog-intro'); if (togIntro) togIntro.checked = p.introPricing;
  const togWeb = document.getElementById('tog-web');     if (togWeb) togWeb.checked = p.channels.web;
  const togApp = document.getElementById('tog-app');     if (togApp) togApp.checked = p.channels.app;

  togglePricingUI();
  toggleChannelUI('web');
  toggleChannelUI('app');
  refreshAllSliderFill();
  syncShareDisplay();
}

function applyModeLabels() {
  const isSaas = S.mode === 'saas';
  const t = I18N[S.lang];
  const storeLbl = document.getElementById('l-store'); if (storeLbl) storeLbl.textContent = isSaas ? t.lStoreFeeSaas : t.lStoreFeeMobile;
  const storeInp = document.getElementById('store-fee');
  if (storeInp) {
    storeInp.max = isSaas ? 10 : 30;
  }
  const churnWInp = document.getElementById('churn-w');
  if (churnWInp) churnWInp.disabled = isSaas;
}

// ---------- Lang ----------
function setLang(lang) {
  S.lang = lang;
  document.querySelectorAll('.lang-btn').forEach(b => b.classList.toggle('active', b.dataset.lang === lang));
  const t = I18N[lang];

  const set = (id, key) => { const el = document.getElementById(id); if (el && t[key] != null) el.textContent = t[key]; };

  set('t-hero',          'heroTitle');
  set('t-hero-grad',     'heroGrad');
  set('t-hero-desc',     'heroDesc');
  set('t-mode-mobile',   'modeMobile');
  set('t-mode-saas',     'modeSaas');

  set('s-budget',        'sBudget');  set('s-budget-sub', 'sBudgetSub');
  set('l-total-budget',  'lTotalBudget');

  set('s-pricing',       'sPricing');  set('s-pricing-sub', 'sPricingSub');
  set('l-intro-pricing', 'lIntroPricing');
  set('l-first-payment', 'lFirstPayment');
  set('l-rebill',        'lRebill');

  set('s-retention',     'sRetention'); set('s-retention-sub', 'sRetentionSub');
  set('l-renewal', 'lRenewal'); set('l-churn-m', 'lChurnM'); set('l-churn-w', 'lChurnW');

  set('s-costs',         'sCosts');   set('s-costs-sub', 'sCostsSub');
  applyModeLabels();
  set('l-refund',        'lRefund');
  set('l-cogs',          'lCogs');

  set('s-traffic',       'sTraffic'); set('s-traffic-sub', 'sTrafficSub');
  set('l-organic',       'lOrganic');
  set('l-email',         'lEmail');

  set('s-upsells',       'sUpsells'); set('s-upsells-sub', 'sUpsellsSub');
  set('l-d0',            'lD0');
  set('l-packs',         'lPacks');
  const btn1 = document.getElementById('btn-add-d0'); if (btn1) btn1.textContent = t.btnAddUpsell;
  const btn2 = document.getElementById('btn-add-packs'); if (btn2) btn2.textContent = t.btnAddPack;

  set('r-results',       'rResults');
  set('s-diag',          'sDiag'); set('s-diag-sub', 'sDiagSub');
  set('s-forecast',      'sForecast'); set('s-forecast-sub', 'sForecastSub');
  set('s-targets',       'sTargets'); set('s-targets-sub', 'sTargetsSub');
  set('th-metric', 'thMetric'); set('th-need', 'thNeed'); set('th-now', 'thNow'); set('th-delta', 'thDelta');

  set('s-ltv',           'sLTV');     set('s-ltv-sub', 'sLTVSub');
  set('s-be',            'sBE');      set('s-be-sub',  'sBESub');
  set('s-pnl',           'sPnL');     set('s-pnl-sub', 'sPnLSub');
  set('s-sens',          'sSens');    set('s-sens-sub','sSensSub');

  set('footer-text',     'footer');

  renderAll();
}

// ---------- Range slider fill ----------
function updateSliderFill(el) {
  const min = parseFloat(el.min) || 0;
  const max = parseFloat(el.max) || 100;
  const v = parseFloat(el.value) || 0;
  const p = ((v - min) / (max - min)) * 100;
  el.style.setProperty('--p', p + '%');
}
function refreshAllSliderFill() {
  document.querySelectorAll('input[type=range]').forEach(updateSliderFill);
}

// ---------- Field display + edit ----------
function editVal(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const nv = prompt(I18N[S.lang] === I18N.en ? 'Enter value:' : 'Введите значение:', el.value);
  if (nv !== null && !isNaN(parseFloat(nv))) {
    el.value = parseFloat(nv);
    updateSliderFill(el);
    if (id.includes('share-')) onShareChange(id.replace('share-', ''));
    else renderAll();
  }
}

function syncShareDisplay() {
  const y = gv('share-yearly'), m = gv('share-monthly');
  const w = S.mode === 'saas' ? 0 : Math.max(0, 100 - y - m);
  const inSaas = S.mode === 'saas';
  // In SaaS, w is always 0 (weekly hidden)
  const yFinal = inSaas ? Math.round((y / Math.max(y + m, 1)) * 100) : y;
  const mFinal = inSaas ? 100 - yFinal : m;
  document.getElementById('val-share-y').textContent = yFinal + '%';
  document.getElementById('val-share-m').textContent = mFinal + '%';
  const valW = document.getElementById('val-share-w'); if (valW) valW.textContent = w + '%';
  const sW = document.getElementById('share-weekly'); if (sW) { sW.value = w; updateSliderFill(sW); }
}

function onShareChange(type) {
  if (S.mode === 'saas') {
    // Y and M must sum to 100 — moving one adjusts the other
    const y = gv('share-yearly'), m = gv('share-monthly');
    if (type === 'yearly')      document.getElementById('share-monthly').value = Math.max(0, 100 - y);
    else if (type === 'monthly') document.getElementById('share-yearly').value  = Math.max(0, 100 - m);
  } else {
    const y = gv('share-yearly'), m = gv('share-monthly');
    if (y + m > 100) {
      if (type === 'yearly')      document.getElementById('share-monthly').value = 100 - y;
      else                        document.getElementById('share-yearly').value  = 100 - m;
    }
  }
  refreshAllSliderFill();
  syncShareDisplay();
  renderAll();
}

// ---------- Intro pricing toggle ----------
function togglePricingUI() {
  const enabled = S.introPricing;
  document.getElementById('pricing-intro').style.display = enabled ? 'block' : 'none';
  document.getElementById('pricing-standard').style.display = enabled ? 'none' : 'block';
}
function toggleIntroPricing() {
  S.introPricing = document.getElementById('tog-intro').checked;
  togglePricingUI();
  if (!S.introPricing) {
    document.getElementById('price-yearly').value  = gv('price-yearly-full');
    document.getElementById('price-monthly').value = gv('price-monthly-full');
    document.getElementById('price-weekly').value  = gv('price-weekly-full');
  }
  renderAll();
}
function syncPricing(plan) {
  const v = gv('price-' + plan);
  document.getElementById('price-' + plan + '-first').value = v;
  document.getElementById('price-' + plan + '-full').value  = v;
}

// ---------- Channel toggle ----------
function toggleChannel(ch) {
  const el = document.getElementById('tog-' + ch);
  S.channels[ch] = el.checked;
  toggleChannelUI(ch);
  renderAll();
}
function toggleChannelUI(ch) {
  const card = document.getElementById('ch-' + ch);
  if (!card) return;
  card.classList.toggle('disabled', !S.channels[ch]);
}

// ---------- Upsells ----------
function renderUpsells() {
  const t = I18N[S.lang];
  ['d0', 'packs'].forEach(type => {
    const list = document.getElementById(type + '-list');
    const items = S.upsells[type].items;
    list.innerHTML = items.map((item, i) => `
      <div class="upsell-row">
        <span class="upsell-num">#${i + 1}</span>
        <input type="number" class="upsell-input" value="${item.price}" min="0.99" max="999" step="0.01"
          onchange="updUpsell('${type}', ${i}, 'price', this.value)">
        <input type="number" class="upsell-input" value="${item.conv}" min="0" max="100" step="0.5"
          onchange="updUpsell('${type}', ${i}, 'conv', this.value)">
        <button class="upsell-del" onclick="delUpsell('${type}', ${i})" aria-label="delete">×</button>
      </div>
    `).join('');
  });
}
function updUpsell(type, idx, field, value) {
  S.upsells[type].items[idx][field] = parseFloat(value) || 0;
  renderAll();
}
function addUpsell(type) {
  S.upsells[type].items.push({ price: 9.99, conv: 5 });
  renderUpsells();
  renderAll();
}
function delUpsell(type, idx) {
  if (S.upsells[type].items.length > 1) {
    S.upsells[type].items.splice(idx, 1);
    renderUpsells();
    renderAll();
  }
}
function toggleUpsell(type) {
  S.upsells[type].enabled = document.getElementById('tog-' + type).checked;
  const block = document.getElementById(type + '-list').closest('.upsell-block');
  block.classList.toggle('disabled', !S.upsells[type].enabled);
  renderAll();
}

// ---------- Slider display update ----------
function onSliderInput(el) {
  updateSliderFill(el);
  const dispMap = {
    'renewal': 'val-renewal', 'churn-m': 'val-churn-m', 'churn-w': 'val-churn-w',
    'store-fee': 'val-store', 'refund': 'val-refund',
    'web-share': 'val-web-share', 'app-share': 'val-app-share',
    'organic': 'val-organic', 'email': 'val-email'
  };
  const did = dispMap[el.id];
  if (did) { const d = document.getElementById(did); if (d) d.textContent = parseFloat(el.value) + '%'; }
  renderAll();
}

// ============================================
// Main render pipeline
// ============================================
let ltvExpanded = false;
function toggleLtvExpand() {
  ltvExpanded = !ltvExpanded;
  document.getElementById('ltv-hidden').classList.toggle('show', ltvExpanded);
  const t = I18N[S.lang];
  document.getElementById('ltv-expand-text').textContent = ltvExpanded ? t.btnCollapse : t.btnExpand;
  document.getElementById('ltv-expand-icon').textContent = ltvExpanded ? '▲' : '▼';
}

function renderAll() {
  const r = compute();
  const t = I18N[S.lang];

  renderKPI(r, t);
  renderDiagnostics(r);
  renderForecast(r, t);
  renderTargets(r, t);
  renderLTV(r);
  renderBE(r, t);
  renderPnL(r, t);
  renderSensitivity(r);
}

function renderKPI(r, t) {
  const paybackStr = r.paybackMonth !== null ? (r.paybackMonth === 0 ? 'D0' : 'M' + r.paybackMonth) : '>M13';
  const paybackClass = r.paybackMonth !== null && r.paybackMonth <= 3 ? 'good'
                     : r.paybackMonth !== null && r.paybackMonth <= (r.isSaas ? 12 : 6) ? 'warn' : 'bad';
  document.getElementById('kpi-grid').innerHTML = `
    <div class="kpi-card">
      <div class="kpi-label">${t.kpiArppu}</div>
      <div class="kpi-value">${fmt(r.arppuWithD0, 2)}</div>
      <div class="kpi-sub">${t.kpiArppuSub}</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">${t.kpiECPA}</div>
      <div class="kpi-value">${fmt(r.eCPA, 2)}</div>
      <div class="kpi-sub">${t.kpiECPASub}</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">${t.kpiROAS}</div>
      <div class="kpi-value">${r.roasD0.toFixed(2)}×</div>
      <div class="kpi-sub">${(r.roasD0*100).toFixed(0)}% ${t.kpiROASSub}</div>
    </div>
    <div class="kpi-card ${paybackClass}">
      <div class="kpi-label">${t.kpiPayback}</div>
      <div class="kpi-value">${paybackStr}</div>
      <div class="kpi-sub">${t.kpiPaybackSub}</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">${t.kpiLTV13}</div>
      <div class="kpi-value">${fmt(r.ltv13, 0)}</div>
      <div class="kpi-sub">${(r.ltv13 / Math.max(r.eCPA, 0.01)).toFixed(1)}× ${t.kpiLTV13Sub}</div>
    </div>
  `;
}

function renderDiagnostics(r) {
  const findings = diagnose(r);
  const block = document.getElementById('diag-block');

  const headline = findings[0];
  const rest = findings.slice(1);

  const kind = headline.priority === 'high' ? 'critical' : headline.priority === 'mid' ? 'warning' : '';
  const icon = headline.priority === 'high' ? '!' : headline.priority === 'mid' ? '⚠' : '✓';

  const list = rest.length === 0
    ? ''
    : `<div class="diag-list">${rest.map(f => `
        <div class="diag-item priority-${f.priority}">
          <span class="diag-dot"></span>
          <div class="diag-body">
            <div>${f.msg}</div>
            ${f.where ? `<span class="diag-where">→ ${f.where}</span>` : ''}
          </div>
        </div>
      `).join('')}</div>`;

  block.innerHTML = `
    <div class="diag ${kind}">
      <div class="diag-head">
        <div class="diag-icon" style="font-family: var(--font-display); font-weight: 800; font-size: 20px;">${icon}</div>
        <div>
          <div class="diag-title">${I18N[S.lang].sDiag}</div>
          <div class="diag-sub">${headline.msg}</div>
        </div>
      </div>
      ${list}
    </div>
  `;
}

function renderForecast(r, t) {
  const budgetLastsClass = r.paybackBeforeBudgetEnds ? 'good' : (r.paybackMonth !== null ? 'warn' : 'bad');
  const profitClass = r.profitAtPayback >= 0 ? 'good' : 'bad';
  const paybackStr = r.paybackMonth !== null ? (r.paybackMonth === 0 ? 'D0' : 'M' + r.paybackMonth) : '—';
  document.getElementById('forecast-grid').innerHTML = `
    <div class="forecast-card">
      <div class="forecast-label">${t.fBudgetDay}</div>
      <div class="forecast-value">${fmt(r.budgetPerDay, 0)}</div>
      <div class="forecast-sub">${fmtK(r.budgetPerDay * 30)}/mo</div>
    </div>
    <div class="forecast-card">
      <div class="forecast-label">${t.fPurchMonth}</div>
      <div class="forecast-value">${Math.round(r.purchPerMonth).toLocaleString()}</div>
      <div class="forecast-sub">${Math.round(r.purchPerDay)}/day</div>
    </div>
    <div class="forecast-card">
      <div class="forecast-label">${t.fPurchTotal}</div>
      <div class="forecast-value">${Math.round(r.totalPurchases).toLocaleString()}</div>
      <div class="forecast-sub">total budget</div>
    </div>
    <div class="forecast-card ${budgetLastsClass}">
      <div class="forecast-label">${t.fBudgetLast}</div>
      <div class="forecast-value">${r.monthsOfBudget} mo</div>
      <div class="forecast-sub">${r.paybackBeforeBudgetEnds ? '✓ PB ' + paybackStr : r.paybackMonth ? '⚠ PB ' + paybackStr : '✗ no payback'}</div>
    </div>
    <div class="forecast-card ${profitClass}">
      <div class="forecast-label">${t.fPLAt}</div>
      <div class="forecast-value ${r.profitAtPayback >= 0 ? 'green' : 'red'}">${r.profitAtPayback >= 0 ? '+' : ''}${fmtK(r.profitAtPayback)}</div>
      <div class="forecast-sub">rev ${fmtK(r.revenueAtPayback)}</div>
    </div>
  `;
}

function renderTargets(r, t) {
  const deltaStr = m => (m > 0 ? '+' : '') + m.toFixed(0) + '%';
  const deltaClass = (ok, m) => ok && m > 20 ? 'ok' : ok ? 'warn' : 'bad';
  document.getElementById('targets-container').innerHTML = `
    <div class="target-row">
      <div class="target-name">${t.tMaxCPA}<small>${t.tMaxCPASub}</small></div>
      <div class="target-val">≤ ${fmt(r.maxCPA, 0)}</div>
      <div class="target-val muted">${fmt(r.eCPA, 0)}</div>
      <div class="target-delta ${deltaClass(r.cpaOk, r.cpaMargin)}">${r.cpaOk ? '✓ ' : '✗ '}${deltaStr(r.cpaMargin)}</div>
    </div>
    <div class="target-row">
      <div class="target-name">${t.tMinARPPU}<small>${t.tMinARPPUSub}</small></div>
      <div class="target-val">≥ ${fmt(r.minARPPU, 2)}</div>
      <div class="target-val muted">${fmt(r.arppuWithD0, 2)}</div>
      <div class="target-delta ${deltaClass(r.arppuOk, r.arppuMargin)}">${r.arppuOk ? '✓ ' : '✗ '}${deltaStr(r.arppuMargin)}</div>
    </div>
    <div class="target-row">
      <div class="target-name">${t.tMinARPPUPB}<small>${t.tMinARPPUPBSub}</small></div>
      <div class="target-val">≥ ${fmt(r.minArppuForPayback, 2)}</div>
      <div class="target-val muted">${fmt(r.arppuWithD0, 2)}</div>
      <div class="target-delta ${deltaClass(r.arppuForPaybackOk, r.arppuForPaybackMargin)}">${r.arppuForPaybackOk ? '✓ ' : '✗ '}${deltaStr(r.arppuForPaybackMargin)}</div>
    </div>
    <div class="target-row">
      <div class="target-name">${t.tMaxChurn}<small>${t.tMaxChurnSub}</small></div>
      <div class="target-val">≤ ${(r.maxChurnM * 100).toFixed(0)}%</div>
      <div class="target-val muted">${(r.churnM * 100).toFixed(0)}%</div>
      <div class="target-delta ${deltaClass(r.churnOk, r.churnMargin)}">${r.churnOk ? '✓ ' : '✗ '}${deltaStr(r.churnMargin)}</div>
    </div>
  `;
}

function renderLTV(r) {
  const mainPeriods = [
    { label: 'D0', months: 0 }, { label: 'M1', months: 1 }, { label: 'M2', months: 2 },
    { label: 'M3', months: 3 }, { label: 'M6', months: 6 }, { label: 'M12', months: 12 },
    { label: 'M13', months: 13 }
  ];
  const hiddenPeriods = [
    { label: 'M4', months: 4 }, { label: 'M5', months: 5 }, { label: 'M7', months: 7 },
    { label: 'M8', months: 8 }, { label: 'M9', months: 9 }, { label: 'M10', months: 10 }, { label: 'M11', months: 11 }
  ];
  const t = I18N[S.lang];
  const hdr = document.getElementById('ltv-head');
  if (hdr) hdr.innerHTML = `<tr>
    <th>${t.thPeriod}</th><th>${t.thGross}</th><th>${t.thNet}</th><th>${t.thUpsells}</th><th>${t.thTotal}</th><th>${t.thVsCPA}</th>
  </tr>`;

  const renderRow = p => {
    const gLTV = p.months === 0 ? r.arppuGrossD0 : r.grossLTV(p.months);
    const nLTV = p.months === 0 ? r.arppuNetD0  : r.netLTV(p.months);
    const uLTV = r.upsellLTV(p.months);
    const tLTV = p.months === 0 ? r.arppuWithD0 : (nLTV + uLTV);
    const vsCPA = (tLTV / Math.max(r.eCPA, 0.01)) * 100;
    const isPayback = r.paybackMonth !== null && p.months === r.paybackMonth;
    const isPast = tLTV >= r.eCPA;
    return `<tr class="${isPayback ? 'payback-row' : ''}">
      <td>${p.label}${isPayback ? ' ← Payback' : ''}</td>
      <td class="muted">${fmt(gLTV, 2)}</td>
      <td>${fmt(nLTV, 2)}</td>
      <td class="positive">+${fmt(uLTV, 2)}</td>
      <td class="${isPast ? 'positive' : ''}">${fmt(tLTV, 2)}</td>
      <td class="${isPast ? 'positive' : 'negative'}">${vsCPA.toFixed(0)}%</td>
    </tr>`;
  };
  document.getElementById('ltv-body').innerHTML = mainPeriods.map(renderRow).join('');
  document.getElementById('ltv-hidden').innerHTML = `<table class="ltv-table"><tbody>${hiddenPeriods.map(renderRow).join('')}</tbody></table>`;
}

function renderBE(r, t) {
  const mbClass = r.monthlyBE && r.monthlyBE <= 6 ? 'good' : r.monthlyBE && r.monthlyBE <= 12 ? 'warn' : 'bad';
  const cbClass = r.cumulBE && r.cumulBE <= 12 ? 'good' : r.cumulBE && r.cumulBE <= 13 ? 'warn' : 'bad';
  const cashClass = r.budgetSufficient ? 'good' : 'bad';
  const cashSub = r.budgetSufficient
    ? (r.totalBudget - r.cashRequired > r.spendPerMonth * 2 ? `✓ +${fmtK(r.totalBudget - r.cashRequired)}` : '✓ ok')
    : `⚠ need ${fmtK(r.cashRequired - r.totalBudget)} more`;
  document.getElementById('be-grid').innerHTML = `
    <div class="be-card ${mbClass}">
      <div class="be-label">${t.beMonthly}</div>
      <div class="be-value">${r.monthlyBE ? 'M' + r.monthlyBE : '>M24'}</div>
      <div class="be-sub">${t.beMonthlySub}</div>
    </div>
    <div class="be-card ${cbClass}">
      <div class="be-label">${t.beCumul}</div>
      <div class="be-value">${r.cumulBE ? 'M' + r.cumulBE : '>M24'}</div>
      <div class="be-sub">${t.beCumulSub}</div>
    </div>
    <div class="be-card bad">
      <div class="be-label">${t.beGap}</div>
      <div class="be-value red">-${fmtK(Math.abs(r.maxDeficit))}</div>
      <div class="be-sub">${t.beGapSub}</div>
    </div>
    <div class="be-card ${cashClass}">
      <div class="be-label">${t.beCash}</div>
      <div class="be-value">${fmtK(r.cashRequired)}</div>
      <div class="be-sub">${cashSub}</div>
    </div>
  `;
}

function renderPnL(r, t) {
  document.getElementById('pnl-table').innerHTML = `
    <div class="pnl-cell header"></div>
    <div class="pnl-cell header" style="text-align:right">Month</div>
    <div class="pnl-cell header" style="text-align:right">Total (${r.monthsOfBudget} mo)</div>

    <div class="pnl-cell label">Revenue D0</div>
    <div class="pnl-cell value">${fmtK(r.revMonthD0)}</div>
    <div class="pnl-cell value">${fmtK(r.revTotalD0)}</div>

    <div class="pnl-cell label">Ad Spend</div>
    <div class="pnl-cell value negative">-${fmtK(r.spendPerMonth)}</div>
    <div class="pnl-cell value negative">-${fmtK(r.totalBudget)}</div>

    <div class="pnl-cell label total">Profit D0</div>
    <div class="pnl-cell value total ${r.profitMonthD0 >= 0 ? 'positive' : 'negative'}">${r.profitMonthD0 >= 0 ? '+' : ''}${fmtK(r.profitMonthD0)}</div>
    <div class="pnl-cell value total ${r.profitTotalD0 >= 0 ? 'positive' : 'negative'}">${r.profitTotalD0 >= 0 ? '+' : ''}${fmtK(r.profitTotalD0)}</div>

    <div class="pnl-cell label">Revenue @Payback</div>
    <div class="pnl-cell value">${fmtK(r.revMonthPB)}</div>
    <div class="pnl-cell value">${fmtK(r.revTotalPB)}</div>

    <div class="pnl-cell label total">Profit @Payback</div>
    <div class="pnl-cell value total ${r.profitMonthPB >= 0 ? 'positive' : 'negative'}">${r.profitMonthPB >= 0 ? '+' : ''}${fmtK(r.profitMonthPB)}</div>
    <div class="pnl-cell value total ${r.profitTotalPB >= 0 ? 'positive' : 'negative'}">${r.profitTotalPB >= 0 ? '+' : ''}${fmtK(r.profitTotalPB)}</div>
  `;
}

function renderSensitivity(r) {
  const cpaSteps = [-30, -20, -10, 0, 10, 20, 30];
  const churnSteps = [-30, -20, -10, 0, 10, 20, 30];

  let m1 = '<div class="sens-cell header"></div>';
  churnSteps.forEach(c => { m1 += `<div class="sens-cell header">${c >= 0 ? '+' : ''}${c}%</div>`; });
  cpaSteps.forEach(cpa => {
    m1 += `<div class="sens-cell row-header">CPA ${cpa >= 0 ? '+' : ''}${cpa}%</div>`;
    churnSteps.forEach(ch => {
      const pb = r.sensPaybackAt(cpa, ch);
      const isCurrent = cpa === 0 && ch === 0;
      let cls = pb === null ? 'bad' : pb <= 3 ? 'good' : pb <= 6 ? 'ok' : pb <= 12 ? 'warn' : 'bad';
      if (isCurrent) cls += ' current';
      m1 += `<div class="sens-cell ${cls}">${pb !== null ? (pb === 0 ? 'D0' : 'M' + pb) : '>13'}</div>`;
    });
  });
  const el1 = document.getElementById('sens-cpa-churn');
  el1.style.gridTemplateColumns = `auto repeat(${churnSteps.length}, 1fr)`;
  el1.innerHTML = m1;

  // Matrix 2 — budget × CPA
  const budgetSteps = [0.6, 0.8, 1.0, 1.2, 1.4].map(x => Math.round(r.totalBudget * x / 1000) * 1000);
  const cpaSteps2Rel = [-30, -15, 0, 15, 30, 45];
  let m2 = '<div class="sens-cell header"></div>';
  cpaSteps2Rel.forEach(c => { m2 += `<div class="sens-cell header">${c >= 0 ? '+' : ''}${c}%</div>`; });
  budgetSteps.forEach((b, bIdx) => {
    m2 += `<div class="sens-cell row-header">${fmtK(b)}</div>`;
    cpaSteps2Rel.forEach((cr, cIdx) => {
      const testCPA = r.eCPA * (1 + cr / 100);
      let testPayback = null;
      for (let m = 0; m <= 13; m++) {
        const v = m === 0 ? r.arppuWithD0 : r.totalLTV(m);
        if (v >= testCPA) { testPayback = m; break; }
      }
      const testRunway = r.spendPerMonth > 0 ? Math.floor(b / r.spendPerMonth) : 0;
      const isCurrent = bIdx === 2 && cr === 0;
      const budgetEnough = testPayback !== null && testRunway >= testPayback;
      let cls, txt;
      if (testPayback === null) { cls = 'bad'; txt = '>13'; }
      else if (budgetEnough) { cls = 'good'; txt = testPayback === 0 ? '✓ D0' : '✓ M' + testPayback; }
      else { cls = testPayback <= 12 ? 'warn' : 'bad'; txt = testPayback === 0 ? '✗ D0' : '✗ M' + testPayback; }
      if (isCurrent) cls += ' current';
      m2 += `<div class="sens-cell ${cls}">${txt}</div>`;
    });
  });
  const el2 = document.getElementById('sens-budget-cpa');
  el2.style.gridTemplateColumns = `auto repeat(${cpaSteps2Rel.length}, 1fr)`;
  el2.innerHTML = m2;

  // Matrix 3 — CPA × Conv
  const convSteps = [-30, -20, -10, 0, 10, 20, 30];
  let m3 = '<div class="sens-cell header"></div>';
  convSteps.forEach(c => { m3 += `<div class="sens-cell header">${c >= 0 ? '+' : ''}${c}%</div>`; });
  cpaSteps.forEach(cpa => {
    m3 += `<div class="sens-cell row-header">CPA ${cpa >= 0 ? '+' : ''}${cpa}%</div>`;
    convSteps.forEach(conv => {
      const testCPA = r.eCPA * (1 + cpa / 100);
      const effectiveCPA = testCPA / (1 + conv / 100);
      let pb = null;
      for (let m = 0; m <= 13; m++) {
        const v = m === 0 ? r.arppuWithD0 : r.totalLTV(m);
        if (v >= effectiveCPA) { pb = m; break; }
      }
      const isCurrent = cpa === 0 && conv === 0;
      let cls = pb === null ? 'bad' : pb <= 3 ? 'good' : pb <= 6 ? 'ok' : pb <= 12 ? 'warn' : 'bad';
      if (isCurrent) cls += ' current';
      m3 += `<div class="sens-cell ${cls}">${pb !== null ? (pb === 0 ? 'D0' : 'M' + pb) : '>13'}</div>`;
    });
  });
  const el3 = document.getElementById('sens-cpa-conv');
  el3.style.gridTemplateColumns = `auto repeat(${convSteps.length}, 1fr)`;
  el3.innerHTML = m3;
}

// ---------- Boot ----------
function boot() {
  // Attach range slider listeners
  document.querySelectorAll('input[type=range]').forEach(el => {
    el.addEventListener('input', () => onSliderInput(el));
  });
  // Share sliders need special handling
  const sY = document.getElementById('share-yearly');
  const sM = document.getElementById('share-monthly');
  if (sY) sY.addEventListener('input', () => onShareChange('yearly'));
  if (sM) sM.addEventListener('input', () => onShareChange('monthly'));

  // Pricing inputs sync
  ['yearly', 'monthly', 'weekly'].forEach(p => {
    const el = document.getElementById('price-' + p);
    if (el) el.addEventListener('input', () => { syncPricing(p); renderAll(); });
  });

  // Start on mobile mode
  setMode('mobile');
  setLang('ru');
  renderUpsells();
  renderAll();
}

window.setMode = setMode;
window.setLang = setLang;
window.editVal = editVal;
window.onShareChange = onShareChange;
window.toggleIntroPricing = toggleIntroPricing;
window.syncPricing = syncPricing;
window.toggleChannel = toggleChannel;
window.toggleUpsell = toggleUpsell;
window.addUpsell = addUpsell;
window.delUpsell = delUpsell;
window.updUpsell = updUpsell;
window.toggleLtvExpand = toggleLtvExpand;
window.onSliderInput = onSliderInput;

document.addEventListener('DOMContentLoaded', boot);
