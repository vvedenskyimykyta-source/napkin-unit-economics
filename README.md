<div align="center">

# Napkin Unit Economics

**Back-of-the-napkin unit economics calculator for Mobile Apps and Web/SaaS.**

Prototype pricing, CPA, churn, LTV, Payback, cohort break-even and sensitivity — in one page, under 2 minutes, no account needed.

[**Live → calc.nickvedensky.com**](https://calc.nickvedensky.com)

</div>

---

## What it does

Plug in your budget, prices, CPA, churn and retention. Get back:

- **ARPPU · eCPA · ROAS D0 · Payback · LTV13** at a glance
- **Smart Diagnostics** — rule-based "where the economics breaks" with concrete places to dig (pricing, retention, upsells, traffic quality). No AI, no tokens — pure JS rules.
- **Forecast** — users/month, budget runway, P&L at payback
- **Target metrics** — the Max CPA, Min ARPPU and Max Churn boundaries where unit economics still works
- **LTV Timeline** — month-by-month revenue per user, intro pricing and renewals accounted for
- **Cohort Break-Even** — Monthly BE, Cumulative BE, Max Cash Gap, Cash Required
- **Sensitivity** — three matrices (CPA × Churn, Budget × CPA, CPA × Paywall Conversion)

## Two modes

<table>
<tr>
<td width="50%">

**Mobile App**
- Yearly / Monthly / Weekly plans
- Store fee (Apple/Google)
- Intro pricing → Rebill
- D0 upsells & monthly packs
- Typical: 30% monthly churn, $35 CPA, 60% yearly share

</td>
<td width="50%">

**Web & SaaS**
- Yearly / Monthly only
- Payment processor fee (~3%)
- Trial-to-paid pricing flow
- Typical: 6% monthly churn, $120 CPA, 35% annual share

</td>
</tr>
</table>

## Why this exists

Most founders either:
1. Guess their unit economics by vibes
2. Open a Google Sheet that someone's cousin built in 2019
3. Spend three days building their own model

This is for case **4**: open a page, plug in 10 numbers, see whether your business works in 2 minutes. Not a substitute for a real model — a napkin check before you commit a real budget.

## How to use

1. Pick **Mobile App** or **Web & SaaS** at the top
2. Enter your actual numbers (budget, prices, CPA from ad platform, your best churn guess)
3. Read the **Smart Diagnostics** block first — it tells you what's weak
4. Read the **Targets** block — it tells you how much slack you have
5. Pull the sliders to see what fixes it

**Nothing is sent to a server. Everything runs in your browser.**

## Formulas (the short version)

- **ARPPU D0** = weighted avg of first payments across plan mix × (1 − store fee) × (1 − refund rate) + D0 upsell take-rate revenue
- **eCPA** = blended paid CPA × (1 − organic share − email share) — dilutes paid CPA by free channels
- **LTV(n)** = subscription revenue over n months (intro + rebills with renewal/churn) + monthly pack upsells on active users − COGS × active months
- **Payback** = first month where LTV(m) ≥ eCPA
- **Cohort BE** = full monthly cohort model summing revenue from all live cohorts vs spend; finds Monthly BE, Cumulative BE and peak cash gap

For edge cases and the actual code: see [`calc.js`](calc.js).

## Local development

Pure static — no build step.

```bash
# Clone
git clone https://github.com/vvedenskyimykyta-source/napkin-unit-economics.git
cd napkin-unit-economics

# Open
open index.html
# or serve
python3 -m http.server 8000
```

Files:

- `index.html` — page structure
- `styles.css` — design system (green / cyan / white)
- `calc.js` — pure calculation engine + rule-based diagnostics
- `ui.js` — DOM rendering + event handlers
- `i18n.js` — RU / EN strings

## Roadmap

- [ ] True SaaS-native mode: MRR/ARR, NDR, expansion vs contraction, logo vs revenue churn
- [ ] Shareable permalinks (encode inputs in URL)
- [ ] Export to PDF / PNG for a decks
- [ ] More presets (fitness app, meditation app, B2B SaaS, consumer B2C)
- [ ] Monte Carlo sensitivity (replace fixed-step matrices)

Open a GitHub issue if you want one of these sooner, or if you catch a formula bug.

## License

MIT — do whatever, just don't claim you wrote it. See [LICENSE](LICENSE).

## Credits

Built by [Nick Vedensky](https://nickvedensky.com) — growth lead working with mobile and SaaS founders on monetization, pricing and unit economics.

If this saved you an afternoon, star the repo and pass it on.
