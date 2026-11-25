/* ============================================
   Napkin Unit Economics — Engine types
   ============================================ */

export type Mode = 'mobile' | 'saas';

export type Lang = 'en' | 'uk';

export interface UpsellItem {
  price: number;
  conv: number; // 0-100
}

export interface UpsellConfig {
  enabled: boolean;
  items: UpsellItem[];
}

export interface Plan {
  id: string;             // stable key for React lists
  label: string;          // user-visible label
  periodMonths: number;   // 0.23 week, 1 month, 3 quarter, 6 semi, 12 year, 24 2yr, etc.
  introPrice: number;
  fullPrice: number;
  share: number;          // 0-100, normalized across all plans at compute time
}

export interface Inputs {
  mode: Mode;

  totalBudget: number;

  introPricing: boolean;
  plans: Plan[];

  renewal: number;  // 0-100 (used for plans with periodMonths >= 12)
  churnM: number;   // 0-100 (used for plans with 1 <= periodMonths < 12)
  churnW: number;   // 0-100 (used for plans with periodMonths < 1)

  processor: string;   // processor id; 'custom' means user-set fee
  storeFee: number;    // 0-100 (effective fee, driven by processor unless 'custom')
  refundRate: number;  // 0-100
  cogs: number;        // $/user/month

  channels: {
    web: boolean;
    app: boolean;
  };
  webShare: number;  // 0-100
  appShare: number;  // 0-100
  webCPA: number;
  appCPA: number;
  webConv: number;  // 0-100
  appConv: number;  // 0-100

  organic: number;  // 0-100
  email: number;    // 0-100

  upsells: {
    d0: UpsellConfig;
    packs: UpsellConfig;
  };
}

export interface ComputeResult {
  mode: Mode;
  isSaas: boolean;

  // Share of long (>=12mo) plans — used by diagnostics
  shareY: number;

  // Pricing metrics
  arppuGrossD0: number;
  arppuGrossFull: number;
  arppuNetD0: number;
  d0UpsellRev: number;
  arppuWithD0: number;

  // CPA
  blendedPaidCPA: number;
  eCPA: number;
  blendedConv: number;

  // LTV series
  ltv1: number;
  ltv3: number;
  ltv6: number;
  ltv12: number;
  ltv13: number;

  // Key metrics
  roasD0: number;
  paybackMonth: number | null;

  // Forecast
  totalPurchases: number;
  budgetPerDay: number;
  purchPerDay: number;
  purchPerMonth: number;
  spendPerMonth: number;
  monthsOfBudget: number;
  paybackBeforeBudgetEnds: boolean;

  // P&L
  ltvAtPayback: number;
  revenueAtPayback: number;
  profitAtPayback: number;

  // Targets
  maxCPA: number;
  cpaOk: boolean;
  cpaMargin: number;
  minARPPU: number;
  arppuOk: boolean;
  arppuMargin: number;
  maxChurnM: number;
  churnOk: boolean;
  churnMargin: number;
  minArppuForPayback: number;
  arppuForPaybackOk: boolean;
  arppuForPaybackMargin: number;

  // Cohort BE
  monthlyBE: number | null;
  cumulBE: number | null;
  maxDeficit: number;
  cashRequired: number;
  budgetSufficient: boolean;

  // P&L components
  revMonthD0: number;
  profitMonthD0: number;
  revTotalD0: number;
  profitTotalD0: number;
  revMonthPB: number;
  profitMonthPB: number;
  revTotalPB: number;
  profitTotalPB: number;

  // Echo of inputs needed by renderers
  inputs: Inputs;

  // Curve functions for charts
  grossLTV: (months: number) => number;
  netLTV: (months: number) => number;
  upsellLTV: (months: number) => number;
  totalLTV: (months: number) => number;
  sensPaybackAt: (cpaDeltaPct: number, churnDeltaPct: number) => number | null;
}

export interface DiagnosticFinding {
  priority: 'high' | 'mid' | 'low' | 'info';
  msg: string;
  where: string;
}
