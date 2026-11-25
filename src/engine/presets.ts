import type { Inputs, Mode } from './types';

/* ============================================
   Default presets per mode
   v2 adds a niche layer on top in Phase E.
   ============================================ */

const BASE: Omit<Inputs, 'mode'> = {
  totalBudget: 50000,
  introPricing: true,
  priceYearlyFirst: 44,
  priceYearlyFull: 89,
  priceMonthlyFirst: 15,
  priceMonthlyFull: 30,
  priceWeeklyFirst: 4.99,
  priceWeeklyFull: 9.99,
  shareYearly: 60,
  shareMonthly: 30,
  renewal: 55,
  churnM: 30,
  churnW: 50,
  storeFee: 15,
  refundRate: 2,
  cogs: 0.8,
  channels: { web: true, app: true },
  webShare: 40,
  appShare: 60,
  webCPA: 50,
  appCPA: 35,
  webConv: 2.0,
  appConv: 8.0,
  organic: 15,
  email: 10,
  upsells: {
    d0: {
      enabled: true,
      items: [
        { price: 9.99, conv: 12 },
        { price: 19.99, conv: 5 }
      ]
    },
    packs: {
      enabled: true,
      items: [
        { price: 4.99, conv: 5 },
        { price: 9.99, conv: 2 }
      ]
    }
  }
};

const MOBILE: Inputs = { mode: 'mobile', ...BASE };

const SAAS: Inputs = {
  mode: 'saas',
  ...BASE,
  totalBudget: 60000,
  priceYearlyFirst: 468,   // $49/mo yearly ~ 20% annual discount
  priceYearlyFull: 588,
  priceMonthlyFirst: 29,
  priceMonthlyFull: 49,
  priceWeeklyFirst: 0,
  priceWeeklyFull: 0,
  shareYearly: 35,
  shareMonthly: 65,
  renewal: 85,
  churnM: 6,
  churnW: 0,
  storeFee: 3,
  refundRate: 1,
  cogs: 5,
  channels: { web: true, app: false },
  webShare: 85,
  appShare: 15,
  webCPA: 120,
  appCPA: 220,
  webConv: 3.0,
  appConv: 1.5,
  organic: 25,
  email: 15
};

export function getPreset(mode: Mode): Inputs {
  return structuredClone(mode === 'saas' ? SAAS : MOBILE);
}

export type { Mode };
