import type { Inputs, Mode, Plan } from './types';
import { defaultProcessorFor, processorById } from './processors';

const mobilePlans = (): Plan[] => [
  { id: 'yearly',  label: 'Yearly',  periodMonths: 12,   introPrice: 44,   fullPrice: 89,   share: 60 },
  { id: 'monthly', label: 'Monthly', periodMonths: 1,    introPrice: 15,   fullPrice: 30,   share: 30 },
  { id: 'weekly',  label: 'Weekly',  periodMonths: 0.23, introPrice: 4.99, fullPrice: 9.99, share: 10 }
];

const saasPlans = (): Plan[] => [
  { id: 'yearly',  label: 'Yearly',  periodMonths: 12, introPrice: 468, fullPrice: 588, share: 35 },
  { id: 'monthly', label: 'Monthly', periodMonths: 1,  introPrice: 29,  fullPrice: 49,  share: 65 }
];

const BASE: Omit<Inputs, 'mode' | 'plans' | 'processor' | 'storeFee'> = {
  totalBudget: 50000,
  introPricing: true,
  renewal: 55,
  churnM: 30,
  churnW: 50,
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
    d0: { enabled: true, items: [{ price: 9.99, conv: 12 }, { price: 19.99, conv: 5 }] },
    packs: { enabled: true, items: [{ price: 4.99, conv: 5 }, { price: 9.99, conv: 2 }] }
  }
};

const MOBILE: Inputs = {
  mode: 'mobile',
  ...BASE,
  plans: mobilePlans(),
  processor: defaultProcessorFor('mobile'),
  storeFee: processorById(defaultProcessorFor('mobile')).fee
};

const SAAS: Inputs = {
  mode: 'saas',
  ...BASE,
  totalBudget: 60000,
  plans: saasPlans(),
  renewal: 85,
  churnM: 6,
  churnW: 0,
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
  email: 15,
  processor: defaultProcessorFor('saas'),
  storeFee: processorById(defaultProcessorFor('saas')).fee
};

export function getPreset(mode: Mode): Inputs {
  return structuredClone(mode === 'saas' ? SAAS : MOBILE);
}

export type { Mode };
