import { X } from '@phosphor-icons/react';

interface InstructionsProps {
  onClose: () => void;
}

export function InstructionsDrawer({ onClose }: InstructionsProps) {
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50" onClick={onClose} />
      <aside className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-md bg-[var(--color-surface-1)] border-l border-[var(--color-border)] shadow-2xl overflow-y-auto">
        <div className="sticky top-0 bg-[var(--color-surface-1)] border-b border-[var(--color-border-subtle)] px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[18px]" aria-hidden>📖</span>
            <h2 className="font-semibold text-[15px] tracking-tight">How to use Napkin</h2>
          </div>
          <button onClick={onClose} className="text-[var(--color-text-3)] hover:text-[var(--color-text)]" aria-label="close">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-6 text-[13px] leading-relaxed">
          <Section title="What this is">
            A back-of-the-napkin unit economics check. Plug in budget, pricing, CPA, churn — get LTV, Payback, cohort break-even, and a diagnostic block that tells you where the math is tight.
            <br /><br />
            <strong>Not</strong> a replacement for a real cohort model at scale. <strong>Not</strong> a dashboard. It's the napkin, by design — the kind of math you'd scribble before committing a real budget.
          </Section>

          <Section title="3-step flow">
            <ol className="list-decimal list-inside space-y-1.5 pl-1">
              <li>Pick your <b>mode</b> (Mobile / Web&SaaS) and <b>niche</b> at the top.</li>
              <li>Open the sidebar panels. Tune the numbers to your actual situation.</li>
              <li>Read the <b>Diagnostics</b> block — it tells you what's weak and where to dig.</li>
            </ol>
            <p className="mt-2 text-[var(--color-text-3)]">
              Optional: hit <b>Save as baseline</b> to lock your current numbers, then play with sliders to see the delta.
            </p>
          </Section>

          <Section title="Key definitions">
            <dl className="space-y-2">
              <DefTerm term="ARPPU D0" def="Average revenue per paying user on day 0 — the first payment they make (weighted by plan mix), net of store fees and refunds, plus day-0 upsell take-rate revenue." />
              <DefTerm term="eCPA" def="Effective CPA — blended paid CPA diluted by organic + email share. If 20% of purchases are organic, your paid CPA effectively stretches 25% further." />
              <DefTerm term="LTV13" def="Total net revenue per paying user across 13 months. Captures intro pricing, rebills at full price, and monthly pack upsells on active users. Net of store fees, refunds, COGS." />
              <DefTerm term="Payback" def="First month where cumulative LTV crosses eCPA. If it never does within 60 months, we say so." />
              <DefTerm term="Cohort BE" def="A monthly-cohort model. Each test month adds a new cohort of buyers. Operational BE is when monthly revenue from all active cohorts covers monthly spend. Cumulative BE is when all money ever paid > all money ever spent." />
              <DefTerm term="LTV/CAC" def="LTV13 / eCPA. Rule of thumb: 1.5× is thin for mobile, 3× is the SaaS norm." />
              <DefTerm term="Health Score" def="0-100 composite: Payback (40 pts), LTV/CAC vs 3× (30 pts), ROAS D0 (15 pts), budget sufficiency (15 pts)." />
            </dl>
          </Section>

          <Section title="How retention is modeled">
            Each plan has a <b>period</b> (days, weeks, months, years). For periods ≥ 12 months we use <b>Yearly Renewal</b> as the retention rate per period. For 1-12 month periods we use <b>Monthly Churn</b> compounded by the period. For sub-monthly periods, <b>Weekly Churn</b>.
            <br /><br />
            This means a quarterly plan at 10% monthly churn has <code className="mono text-[11px]">(1-0.10)^3 = 72.9%</code> quarterly retention. Clean and explicit.
          </Section>

          <Section title="What it doesn't (yet) model">
            <ul className="list-disc list-inside space-y-1 pl-1 text-[var(--color-text-2)]">
              <li>Free trial → paid flow (TTP) with separate trial COGS</li>
              <li>Seat expansion (NDR / GRR dynamics)</li>
              <li>Multi-step B2B funnel (CPC → CPT → CVR → CAC)</li>
              <li>Monte Carlo sensitivity</li>
            </ul>
            <p className="mt-2 text-[11px] text-[var(--color-text-3)]">v2.2 is where those go.</p>
          </Section>

          <Section title="Niche benchmarks — honest about them">
            Benchmarks per niche are <b>approximate medians and ranges</b> based on public 2024-2026 sources (RevenueCat State of Subscription Apps, ChartMogul SaaS Benchmarks, Phiture reports, Lenny's Benchmarks, OpenView). They are directional, not audited, not your reality. Use them as a sanity-check: "are my numbers wildly off?".
          </Section>

          <Section title="Export">
            <b>PNG</b> — captures the results panel as an image you can share or paste. <b>JSON</b> — downloads your current inputs; you can re-import by pasting the content back later.
          </Section>
        </div>
      </aside>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="text-[11px] font-semibold tracking-wider uppercase text-[var(--color-text-3)] mb-2">{title}</h3>
      <div className="text-[var(--color-text-2)]">{children}</div>
    </section>
  );
}

function DefTerm({ term, def }: { term: string; def: string }) {
  return (
    <div>
      <dt className="font-semibold text-[var(--color-text)]">{term}</dt>
      <dd className="text-[12px] text-[var(--color-text-2)] mt-0.5">{def}</dd>
    </div>
  );
}
