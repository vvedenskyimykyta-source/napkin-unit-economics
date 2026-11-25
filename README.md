<div align="center">

# Napkin Unit Economics

**Back-of-the-napkin unit economics calculator for Mobile Apps and Web/SaaS.**

Prototype pricing, CPA, churn, LTV, Payback, cohort break-even and sensitivity — in one page, under 2 minutes, no account needed.

[**Live → calc.nickvvedenskyi.com**](https://calc.nickvvedenskyi.com)

</div>

---

## What it does

Plug in your budget, prices, CPA, churn and retention. Get back:

- **Health Score** (0–100) — single number summarizing the economy
- **KPI tiles** — ARPPU · eCPA · ROAS D0 · Payback · LTV 13mo
- **Smart Diagnostics** — rule-based "where the economics breaks" with concrete places to dig. No AI, no tokens — pure JS rules.
- **Forecast** — users per month, budget runway, P&L at payback
- **Target metrics** — Max CPA, Min ARPPU and Max Churn where unit economics still works
- **LTV curve** — month-by-month cumulative LTV with Payback marker
- **Cohort Break-Even** — stacked area of revenue vs spend with Op BE and Cumulative BE markers
- **P&L bars** — monthly and total profit at D0 and after Payback
- **Monthly waterfall** — Gross Rev → store fee → refund → COGS → fixed → ad spend → Net Profit
- **Sensitivity heatmap** — Payback shift across CPA × Churn perturbations

## Two modes, 15 niches

Switch **Mobile Apps** / **Web & SaaS** at the top. Then pick a niche — Fitness, Meditation, AI Assistant, Dating, Education, Health, Productivity, Generic Mobile; AI Tools, Developer Tools, Design, Marketing, Analytics, Finance, Generic SaaS — and benchmark bands snap onto the sliders.

## Scenarios

Enter your real numbers → click **Save as baseline**. Now every slider move shows the delta vs baseline on each KPI tile and Payback, with a Health Score delta on top. Try the "what if churn drops 5 points" question and see the Payback shift in milliseconds.

## Flexible plans

Pricing isn't locked to Yearly / Monthly / Weekly. Add quarterly, semester, 6-month, 3-day — any period. Each plan carries its own intro + rebill prices and share of the mix.

## Payment processor picker

Pick Apple 30%, Apple 15%, Google Play, Stripe, Paddle, PayPal, RevenueCat, Lemon Squeezy — or Custom. The fee auto-fills.

## Why it exists

Most founders either:
1. Guess their unit economics by vibes
2. Open a Google Sheet somebody's cousin built in 2019
3. Spend three days building their own model

This is for case **4**: open a page, plug in 10 numbers, see whether your business works in 2 minutes. Not a substitute for a real model at scale — a napkin check before you commit a real budget.

## How to use

1. Pick **Mobile App** or **Web & SaaS** at the top
2. Pick your niche → benchmark bands light up on the sliders
3. Enter your actual numbers (budget, prices, CPA from ad platform, your best churn guess)
4. Read **Diagnostics** first — it tells you what's weak and where to dig
5. Read **Targets** — it tells you how much slack you have
6. Hit **Save as baseline** → now move sliders to see "what if"

**Nothing is sent to a server. Everything runs in your browser.** Baseline is stored in `localStorage`.

## Benchmarks

Per-niche benchmarks (median + range) for Monthly Churn, Yearly Renewal, CPA, Paywall Conversion, ARPPU — based on public sources ~2024–2026: RevenueCat State of Subscription Apps, ChartMogul SaaS Benchmarks, Phiture reports, Lenny's Benchmarks, OpenView 2024 Benchmarks. These are directional, not audited.

## Formulas (the short version)

- **ARPPU D0** = weighted avg of first payments across plan mix × (1 − store fee) × (1 − refund rate) + D0 upsell take-rate revenue
- **eCPA** = blended paid CPA × (1 − organic share − email share) — dilutes paid CPA by free channels
- **LTV(n)** per plan: payments at `k·period` for `k = 0, 1, …, n/period`; each discounted by retention^k; monthly pack upsells on active user-months; minus COGS × active months
- **Retention per period** depends on period length — `yearlyRenewal^(period/12)` for ≥12mo, `(1 − monthlyChurn)^period` for 1–12mo, `(1 − weeklyChurn)^weeks` for <1mo
- **Payback** = first month where cumulative LTV(m) ≥ eCPA
- **Cohort BE** = full monthly cohort model summing revenue from all live cohorts vs spend; finds Monthly BE, Cumulative BE and peak cash gap; cash required includes a 50% buffer over max deficit
- **Health Score** = weighted combination of Payback (40pts), LTV/CAC (30pts), ROAS D0 (15pts), budget sufficiency (15pts)

Full source: [`src/engine/calc.ts`](src/engine/calc.ts) and [`src/engine/diagnose.ts`](src/engine/diagnose.ts).

## Stack

- Vite + React 18 + TypeScript
- Tailwind v4 (OKLCH dark-first design tokens)
- D3 (scales + line/area generators)
- Phosphor Icons
- No server, no backend, no account

## Local development

```bash
git clone https://github.com/vvedenskyimykyta-source/napkin-unit-economics.git
cd napkin-unit-economics
npm install
npm run dev
```

## Project layout

```
src/
├── main.tsx
├── App.tsx
├── components/
│   ├── TopBar.tsx       — mode + niche + language toggle
│   ├── Sidebar.tsx      — all input panels (plans, costs, traffic, upsells)
│   ├── Panel.tsx        — collapsible section wrapper
│   ├── fields.tsx       — Slider, NumField, Switch, Field primitives
│   ├── NicheSelector.tsx
│   ├── BaselineBar.tsx  — Health Score + baseline/scenario diffs
│   ├── KPITiles.tsx     — 5 top KPIs with baseline delta
│   ├── Diagnostics.tsx  — rule-based findings card
│   ├── Forecast.tsx
│   ├── Targets.tsx
│   ├── ChartCard.tsx
│   └── charts/
│       ├── LtvCurve.tsx       — line + area, Payback marker, eCPA threshold
│       ├── CohortArea.tsx     — revenue vs spend, cash gap shaded, BE markers
│       ├── SensHeatmap.tsx    — sequential ramp heatmap
│       ├── PnlBars.tsx        — month + total horizontal bars
│       └── Waterfall.tsx      — Gross Rev → Net Profit flow
├── engine/
│   ├── types.ts
│   ├── calc.ts          — pure math engine (plan-based LTV)
│   ├── diagnose.ts      — rule-based advisor
│   ├── score.ts         — Health Score
│   ├── presets.ts       — mode presets + applyNiche()
│   ├── processors.ts    — Apple / Google / Stripe / Paddle / ...
│   ├── periods.ts       — Weekly / Monthly / Yearly / custom
│   └── niches.ts        — 15 niches × [low, mid, high] benchmarks
├── i18n/
│   └── strings.ts       — EN + UK
└── styles/
    └── globals.css      — Tailwind v4 + design tokens
```

## Roadmap

- [x] v2 — full redesign, sidebar/canvas, 5 charts, niches, scenarios, waterfall
- [ ] v2.1 — Time-To-Paying (trial length), extra seats / NDR, multi-step channel funnel (CPC → CPT → CVR)
- [ ] v2.2 — shareable URL permalinks, export to PDF, Monte Carlo sensitivity
- [ ] v2.3 — Ukrainian benchmarks for local niches

Open a GitHub issue for feature requests or formula bugs.

## License

MIT — do whatever, just don't claim you wrote it. See [LICENSE](LICENSE).

## Credits

Built by [Nick Vedensky](https://nickvvedenskyi.com) — Fractional Head of Growth for early-stage tech, working with mobile and SaaS founders on monetization, pricing and unit economics.

If this saved you an afternoon, star the repo and pass it on.
