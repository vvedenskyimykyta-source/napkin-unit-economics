/* ============================================
   Napkin Unit Economics — i18n (RU / EN)
   ============================================ */
const I18N = {
  ru: {
    heroTitle: 'Napkin Unit Economics',
    heroGrad: 'как на салфетке',
    heroDesc: 'Прикинь юнит-экономику подписки за 2 минуты. Вводишь бюджет, цены, CPA, churn — получаешь прогноз, где не сходится и что подкрутить. Для мобилок и для Web/SaaS.',

    modeMobile: 'Mobile App',
    modeSaas: 'Web & SaaS',

    sBudget: 'Бюджет',
    sBudgetSub: 'сколько готов потратить на тест',
    lTotalBudget: 'Общий бюджет на тест, $',

    sPricing: 'Цены подписок',
    sPricingSub: 'intro (первый платёж) и rebill (все следующие)',
    lIntroPricing: 'Intro pricing (первый платёж со скидкой)',
    lFirstPayment: 'First payment — со скидкой',
    lRebill: 'Rebill — полная цена',
    lYearly: 'Yearly', lMonthly: 'Monthly', lWeekly: 'Weekly',

    sRetention: 'Retention / Churn',
    sRetentionSub: 'сколько юзеров остаётся платить',
    lRenewal: 'Yearly Renewal Rate',
    lChurnM: 'Monthly Churn',
    lChurnW: 'Weekly Churn',

    sCosts: 'Расходы',
    sCostsSub: 'что съедает выручку',
    lStoreFeeMobile: 'Store Fee (Apple/Google)',
    lStoreFeeSaas: 'Payment Processor Fee',
    lRefund: 'Refund Rate',
    lCogs: 'COGS / user / month, $',

    sTraffic: 'Каналы трафика',
    sTrafficSub: 'откуда приходят юзеры',
    lWeb: 'Web', lApp: 'App',
    lShare: 'Доля бюджета',
    lCPA: 'CPA, $',
    lConv: 'Paywall Conv, %',
    lOrganic: 'Organic % (от всех покупок)',
    lEmail: 'Email % (от всех покупок)',

    sUpsells: 'Апселы',
    sUpsellsSub: 'дополнительная выручка с юзера',
    lD0: 'D0 Upsells (сразу после покупки)',
    lPacks: 'Monthly Packs (ежемесячно)',
    thPrice: 'Цена, $', thConv: 'Conv, %', thConvPacks: 'Conv, %/мес',
    btnAddUpsell: '+ Добавить апсел',
    btnAddPack: '+ Добавить пак',

    rResults: 'Результаты',

    kpiArppu: 'ARPPU Net', kpiArppuSub: 'c D0 апселами',
    kpiECPA: 'eCPA', kpiECPASub: 'effective CPA',
    kpiROAS: 'ROAS D0', kpiROASSub: 'окупаемость сразу',
    kpiPayback: 'Payback', kpiPaybackSub: 'LTV ≥ eCPA',
    kpiLTV13: 'LTV 13mo', kpiLTV13Sub: 'от eCPA',

    sDiag: 'Smart Diagnostics',
    sDiagSub: 'где юнит-экономика проседает',

    sForecast: 'Прогноз при текущих вводных',
    sForecastSub: 'сколько юзеров и хватит ли бюджета',
    fBudgetDay: 'Рек. бюджет/день',
    fPurchMonth: 'Покупок в месяц',
    fPurchTotal: 'Покупок всего',
    fBudgetLast: 'Бюджета хватит',
    fPLAt: 'P&L при Payback',

    sTargets: 'Целевые метрики для break-even за 13 мес',
    sTargetsSub: 'границы метрик при которых экономика сходится',
    thMetric: 'Метрика', thNeed: 'Нужно', thNow: 'Сейчас', thDelta: 'Запас',
    tMaxCPA: 'Max CPA', tMaxCPASub: 'при котором LTV13 ≥ CPA',
    tMinARPPU: 'Min ARPPU D0', tMinARPPUSub: 'для ROAS D0 ≥ 0.7×',
    tMinARPPUPB: 'Min ARPPU for Payback', tMinARPPUPBSub: 'минимум для окупаемости за 13 мес',
    tMaxChurn: 'Max Monthly Churn', tMaxChurnSub: 'при котором LTV13 ≥ eCPA',

    sLTV: 'LTV Timeline',
    sLTVSub: 'как растёт доход с одного юзера по месяцам',
    thPeriod: 'Period', thGross: 'Gross LTV', thNet: 'Net LTV', thUpsells: '+ Upsells', thTotal: 'Total LTV', thVsCPA: 'vs eCPA',
    btnExpand: 'Показать все месяцы', btnCollapse: 'Скрыть',

    sBE: 'Business Break-Even (когортная модель)',
    sBESub: 'когда бизнес выйдет в ноль с учётом накопления всех когорт',
    beMonthly: 'Monthly BE', beMonthlySub: 'операционная прибыльность',
    beCumul: 'Cumulative BE', beCumulSub: 'полный возврат инвестиций',
    beGap: 'Max Cash Gap', beGapSub: 'пик минуса на счету',
    beCash: 'Cash Required', beCashSub: 'до операционной прибыльности',

    sPnL: 'P&L (при рекомендуемом бюджете)',
    sPnLSub: 'прибыль/убыток при D0 и после Payback',

    sSens: 'Sensitivity Analysis',
    sSensSub: 'как меняется Payback при колебании параметров',
    sensCPAChurn: 'CPA × Churn → Payback',
    sensCPAChurnSub: 'риски по трафику и retention',
    sensBudgetCPA: 'Budget × CPA → хватит ли',
    sensBudgetCPASub: 'планирование инвестиций',
    sensCPAConv: 'CPA × Paywall Conv',
    sensCPAConvSub: 'качество трафика и продукта',

    footer: 'Open source · MIT · Made by',
  },
  en: {
    heroTitle: 'Napkin Unit Economics',
    heroGrad: 'back-of-napkin math',
    heroDesc: "Sanity-check your subscription unit economics in 2 minutes. Plug in budget, prices, CPA, churn — get forecast, where it breaks and what to tune. For mobile apps and Web/SaaS.",

    modeMobile: 'Mobile App',
    modeSaas: 'Web & SaaS',

    sBudget: 'Budget',
    sBudgetSub: 'how much you plan to spend on the test',
    lTotalBudget: 'Total test budget, $',

    sPricing: 'Subscription Prices',
    sPricingSub: 'intro (first payment) and rebill (all next ones)',
    lIntroPricing: 'Intro pricing (first payment discounted)',
    lFirstPayment: 'First payment — discounted',
    lRebill: 'Rebill — full price',
    lYearly: 'Yearly', lMonthly: 'Monthly', lWeekly: 'Weekly',

    sRetention: 'Retention / Churn',
    sRetentionSub: 'how many keep paying',
    lRenewal: 'Yearly Renewal Rate',
    lChurnM: 'Monthly Churn',
    lChurnW: 'Weekly Churn',

    sCosts: 'Costs',
    sCostsSub: 'what eats revenue',
    lStoreFeeMobile: 'Store Fee (Apple/Google)',
    lStoreFeeSaas: 'Payment Processor Fee',
    lRefund: 'Refund Rate',
    lCogs: 'COGS / user / month, $',

    sTraffic: 'Traffic Channels',
    sTrafficSub: 'where users come from',
    lWeb: 'Web', lApp: 'App',
    lShare: 'Budget share',
    lCPA: 'CPA, $',
    lConv: 'Paywall Conv, %',
    lOrganic: 'Organic % (of all purchases)',
    lEmail: 'Email % (of all purchases)',

    sUpsells: 'Upsells',
    sUpsellsSub: 'extra revenue per user',
    lD0: 'D0 Upsells (right after purchase)',
    lPacks: 'Monthly Packs (recurring)',
    thPrice: 'Price, $', thConv: 'Conv, %', thConvPacks: 'Conv, %/mo',
    btnAddUpsell: '+ Add upsell',
    btnAddPack: '+ Add pack',

    rResults: 'Results',

    kpiArppu: 'ARPPU Net', kpiArppuSub: 'with D0 upsells',
    kpiECPA: 'eCPA', kpiECPASub: 'effective CPA',
    kpiROAS: 'ROAS D0', kpiROASSub: 'day-0 recoup',
    kpiPayback: 'Payback', kpiPaybackSub: 'LTV ≥ eCPA',
    kpiLTV13: 'LTV 13mo', kpiLTV13Sub: 'of eCPA',

    sDiag: 'Smart Diagnostics',
    sDiagSub: 'where unit economics breaks down',

    sForecast: 'Forecast at current inputs',
    sForecastSub: 'how many users and will budget last',
    fBudgetDay: 'Rec. budget/day',
    fPurchMonth: 'Purchases/mo',
    fPurchTotal: 'Total purchases',
    fBudgetLast: 'Budget lasts',
    fPLAt: 'P&L at Payback',

    sTargets: 'Target metrics for break-even in 13 mo',
    sTargetsSub: 'metric boundaries where it still works',
    thMetric: 'Metric', thNeed: 'Need', thNow: 'Now', thDelta: 'Buffer',
    tMaxCPA: 'Max CPA', tMaxCPASub: 'where LTV13 ≥ CPA',
    tMinARPPU: 'Min ARPPU D0', tMinARPPUSub: 'for ROAS D0 ≥ 0.7×',
    tMinARPPUPB: 'Min ARPPU for Payback', tMinARPPUPBSub: 'minimum to recoup in 13 mo',
    tMaxChurn: 'Max Monthly Churn', tMaxChurnSub: 'where LTV13 ≥ eCPA',

    sLTV: 'LTV Timeline',
    sLTVSub: 'how per-user revenue grows month-over-month',
    thPeriod: 'Period', thGross: 'Gross LTV', thNet: 'Net LTV', thUpsells: '+ Upsells', thTotal: 'Total LTV', thVsCPA: 'vs eCPA',
    btnExpand: 'Show all months', btnCollapse: 'Collapse',

    sBE: 'Business Break-Even (cohort model)',
    sBESub: 'when the business turns profitable with cumulative cohorts',
    beMonthly: 'Monthly BE', beMonthlySub: 'operational profitability',
    beCumul: 'Cumulative BE', beCumulSub: 'full ROI',
    beGap: 'Max Cash Gap', beGapSub: 'peak negative cash',
    beCash: 'Cash Required', beCashSub: 'until operational BE',

    sPnL: 'P&L (at recommended budget)',
    sPnLSub: 'profit/loss at D0 and after Payback',

    sSens: 'Sensitivity Analysis',
    sSensSub: 'how Payback changes when parameters wobble',
    sensCPAChurn: 'CPA × Churn → Payback',
    sensCPAChurnSub: 'traffic and retention risk',
    sensBudgetCPA: 'Budget × CPA → will it last',
    sensBudgetCPASub: 'investment planning',
    sensCPAConv: 'CPA × Paywall Conv',
    sensCPAConvSub: 'traffic and product quality',

    footer: 'Open source · MIT · Made by',
  }
};

window.I18N = I18N;
