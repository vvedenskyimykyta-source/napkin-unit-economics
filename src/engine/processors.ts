export interface Processor {
  id: string;
  label: string;
  fee: number;   // percent
  note?: string;
}

export const PROCESSORS: Processor[] = [
  { id: 'custom',       label: 'Custom',                       fee: 0,    note: 'Set fee manually' },
  { id: 'apple_30',     label: 'Apple App Store (30%)',        fee: 30,   note: 'Standard rate' },
  { id: 'apple_15',     label: 'Apple App Store (15%)',        fee: 15,   note: 'Small Business Program / year 2+' },
  { id: 'google_30',    label: 'Google Play (30%)',            fee: 30 },
  { id: 'google_15',    label: 'Google Play (15%)',            fee: 15,   note: 'First $1M / year or subs year 2+' },
  { id: 'stripe',       label: 'Stripe',                        fee: 2.9,  note: '+ $0.30/txn (not modeled)' },
  { id: 'paddle',       label: 'Paddle',                        fee: 5,    note: 'MoR, VAT handled' },
  { id: 'lemonsqueezy', label: 'Lemon Squeezy',                 fee: 5,    note: '+ $0.50/txn (not modeled)' },
  { id: 'paypal',       label: 'PayPal',                        fee: 3.49, note: 'Standard rate' },
  { id: 'revenuecat',   label: 'RevenueCat (on top of store)', fee: 1,    note: 'Add to store fee manually' }
];

export function processorById(id: string): Processor {
  return PROCESSORS.find((p) => p.id === id) ?? PROCESSORS[0];
}

export function defaultProcessorFor(mode: 'mobile' | 'saas'): string {
  return mode === 'saas' ? 'stripe' : 'apple_30';
}
