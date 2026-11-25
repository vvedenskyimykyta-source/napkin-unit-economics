/**
 * Period presets — pick-list for plan editor.
 */
export interface PeriodPreset {
  id: string;
  label: string;
  periodMonths: number;
}

export const PERIODS: PeriodPreset[] = [
  { id: 'weekly',    label: 'Weekly',    periodMonths: 0.23 },
  { id: 'biweekly',  label: '2 weeks',   periodMonths: 0.46 },
  { id: '3-day',     label: '3 days',    periodMonths: 0.099 },
  { id: 'monthly',   label: 'Monthly',   periodMonths: 1 },
  { id: 'quarterly', label: 'Quarterly', periodMonths: 3 },
  { id: 'semi',      label: '6 months',  periodMonths: 6 },
  { id: 'yearly',    label: 'Yearly',    periodMonths: 12 }
];

export function matchPeriod(periodMonths: number): PeriodPreset | undefined {
  return PERIODS.find((p) => Math.abs(p.periodMonths - periodMonths) < 0.02);
}
