import type { Mode } from './types';

/**
 * Niche benchmarks — approximate 2024-2026 ranges from public sources
 * (RevenueCat State of Subscription Apps 2024, ChartMogul SaaS Benchmarks,
 * Phiture, Lenny's Benchmarks, OpenView Report, public Appsflyer reports).
 *
 * These are directional, not audited. Each metric has a [low, median, high]
 * triple so UI can draw a benchmark band around the median.
 */

export interface Band {
  low: number;
  mid: number;
  high: number;
}

export interface NicheBench {
  // Pricing
  arppuYearly?: Band;   // annual full price $
  arppuMonthly?: Band;  // monthly full price $

  // Retention
  monthlyChurn: Band;   // % per month
  yearlyRenewal: Band;  // %

  // Acquisition
  cpa: Band;            // $

  // Conversion
  paywallConv: Band;    // %
  trialToPaid?: Band;   // % (SaaS mostly)
}

export interface Niche {
  id: string;
  label: string;
  mode: Mode;
  tagline: string;
  bench: NicheBench;
}

export const NICHES: Niche[] = [
  // --- MOBILE ---
  {
    id: 'mobile-generic',
    label: 'Mobile — Generic',
    mode: 'mobile',
    tagline: 'Baseline mobile subscription',
    bench: {
      arppuYearly:  { low: 40,  mid: 70,  high: 120 },
      arppuMonthly: { low: 6,   mid: 10,  high: 20 },
      monthlyChurn: { low: 15,  mid: 25,  high: 40 },
      yearlyRenewal:{ low: 40,  mid: 55,  high: 70 },
      cpa:          { low: 15,  mid: 30,  high: 70 },
      paywallConv:  { low: 3,   mid: 5,   high: 10 }
    }
  },
  {
    id: 'fitness',
    label: 'Mobile — Fitness & Workout',
    mode: 'mobile',
    tagline: 'Peloton, Nike Training, ...',
    bench: {
      arppuYearly:  { low: 60,  mid: 100, high: 150 },
      arppuMonthly: { low: 10,  mid: 15,  high: 25 },
      monthlyChurn: { low: 12,  mid: 22,  high: 35 },
      yearlyRenewal:{ low: 45,  mid: 58,  high: 70 },
      cpa:          { low: 20,  mid: 40,  high: 90 },
      paywallConv:  { low: 4,   mid: 7,   high: 12 }
    }
  },
  {
    id: 'meditation',
    label: 'Mobile — Meditation & Mindfulness',
    mode: 'mobile',
    tagline: 'Calm, Headspace, ...',
    bench: {
      arppuYearly:  { low: 50,  mid: 70,  high: 100 },
      arppuMonthly: { low: 8,   mid: 13,  high: 18 },
      monthlyChurn: { low: 10,  mid: 18,  high: 30 },
      yearlyRenewal:{ low: 55,  mid: 68,  high: 80 },
      cpa:          { low: 15,  mid: 30,  high: 60 },
      paywallConv:  { low: 3,   mid: 6,   high: 10 }
    }
  },
  {
    id: 'ai-assistant',
    label: 'Mobile — AI Assistant / Chatbot',
    mode: 'mobile',
    tagline: 'AI chat, image gen, voice apps',
    bench: {
      arppuYearly:  { low: 40,  mid: 70,  high: 120 },
      arppuMonthly: { low: 8,   mid: 15,  high: 25 },
      monthlyChurn: { low: 25,  mid: 40,  high: 55 },
      yearlyRenewal:{ low: 30,  mid: 45,  high: 60 },
      cpa:          { low: 10,  mid: 25,  high: 50 },
      paywallConv:  { low: 5,   mid: 10,  high: 18 }
    }
  },
  {
    id: 'dating',
    label: 'Mobile — Dating',
    mode: 'mobile',
    tagline: 'Tinder, Bumble, Hinge',
    bench: {
      arppuYearly:  { low: 120, mid: 220, high: 350 },
      arppuMonthly: { low: 20,  mid: 35,  high: 50 },
      monthlyChurn: { low: 25,  mid: 40,  high: 55 },
      yearlyRenewal:{ low: 25,  mid: 40,  high: 55 },
      cpa:          { low: 20,  mid: 50,  high: 120 },
      paywallConv:  { low: 2,   mid: 4,   high: 8 }
    }
  },
  {
    id: 'education',
    label: 'Mobile — Education / Learning',
    mode: 'mobile',
    tagline: 'Duolingo, language apps, tutoring',
    bench: {
      arppuYearly:  { low: 60,  mid: 90,  high: 140 },
      arppuMonthly: { low: 8,   mid: 13,  high: 20 },
      monthlyChurn: { low: 12,  mid: 22,  high: 35 },
      yearlyRenewal:{ low: 50,  mid: 62,  high: 75 },
      cpa:          { low: 10,  mid: 25,  high: 55 },
      paywallConv:  { low: 2,   mid: 5,   high: 10 }
    }
  },
  {
    id: 'health-tracking',
    label: 'Mobile — Health & Tracking',
    mode: 'mobile',
    tagline: 'MyFitnessPal, sleep trackers, period',
    bench: {
      arppuYearly:  { low: 40,  mid: 60,  high: 90 },
      arppuMonthly: { low: 6,   mid: 10,  high: 15 },
      monthlyChurn: { low: 15,  mid: 25,  high: 40 },
      yearlyRenewal:{ low: 45,  mid: 58,  high: 70 },
      cpa:          { low: 10,  mid: 20,  high: 45 },
      paywallConv:  { low: 3,   mid: 6,   high: 11 }
    }
  },
  {
    id: 'productivity',
    label: 'Mobile — Productivity',
    mode: 'mobile',
    tagline: 'Todoist, Notion mobile, notes',
    bench: {
      arppuYearly:  { low: 30,  mid: 50,  high: 100 },
      arppuMonthly: { low: 4,   mid: 8,   high: 15 },
      monthlyChurn: { low: 8,   mid: 15,  high: 25 },
      yearlyRenewal:{ low: 55,  mid: 70,  high: 85 },
      cpa:          { low: 15,  mid: 30,  high: 60 },
      paywallConv:  { low: 2,   mid: 4,   high: 8 }
    }
  },

  // --- WEB / SAAS ---
  {
    id: 'saas-generic',
    label: 'SaaS — Generic B2B',
    mode: 'saas',
    tagline: 'Baseline B2B SaaS',
    bench: {
      arppuYearly:  { low: 400, mid: 700, high: 1500 },
      arppuMonthly: { low: 29,  mid: 49,  high: 99 },
      monthlyChurn: { low: 3,   mid: 6,   high: 10 },
      yearlyRenewal:{ low: 75,  mid: 85,  high: 92 },
      cpa:          { low: 80,  mid: 150, high: 400 },
      paywallConv:  { low: 1.5, mid: 3,   high: 6 },
      trialToPaid:  { low: 15,  mid: 25,  high: 40 }
    }
  },
  {
    id: 'ai-tools',
    label: 'SaaS — AI Tools',
    mode: 'saas',
    tagline: 'ChatGPT-adjacent, AI writing, AI dev',
    bench: {
      arppuYearly:  { low: 200, mid: 400, high: 800 },
      arppuMonthly: { low: 20,  mid: 40,  high: 80 },
      monthlyChurn: { low: 8,   mid: 15,  high: 25 },
      yearlyRenewal:{ low: 55,  mid: 70,  high: 82 },
      cpa:          { low: 30,  mid: 80,  high: 200 },
      paywallConv:  { low: 2,   mid: 4,   high: 8 },
      trialToPaid:  { low: 10,  mid: 20,  high: 35 }
    }
  },
  {
    id: 'dev-tools',
    label: 'SaaS — Developer Tools',
    mode: 'saas',
    tagline: 'GitHub, Linear, Vercel, infra',
    bench: {
      arppuYearly:  { low: 300, mid: 600, high: 1500 },
      arppuMonthly: { low: 20,  mid: 40,  high: 120 },
      monthlyChurn: { low: 2,   mid: 5,   high: 10 },
      yearlyRenewal:{ low: 80,  mid: 88,  high: 95 },
      cpa:          { low: 50,  mid: 120, high: 300 },
      paywallConv:  { low: 2,   mid: 4,   high: 8 },
      trialToPaid:  { low: 20,  mid: 30,  high: 45 }
    }
  },
  {
    id: 'design-saas',
    label: 'SaaS — Design & Creative',
    mode: 'saas',
    tagline: 'Figma, Canva, design tools',
    bench: {
      arppuYearly:  { low: 100, mid: 200, high: 500 },
      arppuMonthly: { low: 10,  mid: 20,  high: 50 },
      monthlyChurn: { low: 3,   mid: 7,   high: 12 },
      yearlyRenewal:{ low: 70,  mid: 82,  high: 90 },
      cpa:          { low: 30,  mid: 70,  high: 180 },
      paywallConv:  { low: 2,   mid: 4,   high: 8 },
      trialToPaid:  { low: 15,  mid: 25,  high: 40 }
    }
  },
  {
    id: 'marketing-saas',
    label: 'SaaS — Marketing & Sales',
    mode: 'saas',
    tagline: 'CRM, email, growth tools',
    bench: {
      arppuYearly:  { low: 300, mid: 800, high: 2500 },
      arppuMonthly: { low: 25,  mid: 70,  high: 200 },
      monthlyChurn: { low: 3,   mid: 6,   high: 11 },
      yearlyRenewal:{ low: 72,  mid: 83,  high: 92 },
      cpa:          { low: 100, mid: 250, high: 700 },
      paywallConv:  { low: 1,   mid: 2.5, high: 5 },
      trialToPaid:  { low: 10,  mid: 20,  high: 35 }
    }
  },
  {
    id: 'analytics-saas',
    label: 'SaaS — Analytics & Data',
    mode: 'saas',
    tagline: 'Amplitude, Mixpanel, dashboards',
    bench: {
      arppuYearly:  { low: 500, mid: 1500, high: 5000 },
      arppuMonthly: { low: 40,  mid: 120,  high: 400 },
      monthlyChurn: { low: 2,   mid: 5,    high: 9 },
      yearlyRenewal:{ low: 80,  mid: 88,   high: 95 },
      cpa:          { low: 150, mid: 400,  high: 1200 },
      paywallConv:  { low: 1,   mid: 2.5,  high: 5 },
      trialToPaid:  { low: 15,  mid: 25,   high: 40 }
    }
  },
  {
    id: 'finance-saas',
    label: 'SaaS — Finance & Accounting',
    mode: 'saas',
    tagline: 'QuickBooks, Mercury, expense tools',
    bench: {
      arppuYearly:  { low: 300, mid: 700, high: 2000 },
      arppuMonthly: { low: 25,  mid: 60,  high: 170 },
      monthlyChurn: { low: 2,   mid: 4,   high: 8 },
      yearlyRenewal:{ low: 82,  mid: 90,  high: 95 },
      cpa:          { low: 100, mid: 220, high: 550 },
      paywallConv:  { low: 1.5, mid: 3,   high: 6 },
      trialToPaid:  { low: 15,  mid: 25,  high: 40 }
    }
  }
];

export function nichesFor(mode: Mode): Niche[] {
  return NICHES.filter((n) => n.mode === mode);
}

export function nicheById(id: string): Niche | undefined {
  return NICHES.find((n) => n.id === id);
}

export function defaultNicheFor(mode: Mode): string {
  return mode === 'saas' ? 'saas-generic' : 'mobile-generic';
}
