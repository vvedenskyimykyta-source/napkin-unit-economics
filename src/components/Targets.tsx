import type { ComputeResult } from '../engine/types';
import { fmt } from '../engine/calc';
import type { I18N } from '../i18n/strings';
import { clsx } from 'clsx';

export function Targets({ result, t }: { result: ComputeResult; t: I18N }) {
  const r = result;
  const rows = [
    { name: 'Max CPA', sub: 'where LTV13 ≥ CPA', need: '≤ ' + fmt(r.maxCPA, 0), now: fmt(r.eCPA, 0), ok: r.cpaOk, margin: r.cpaMargin },
    { name: 'Min ARPPU D0', sub: 'for ROAS D0 ≥ 0.7×', need: '≥ ' + fmt(r.minARPPU, 2), now: fmt(r.arppuWithD0, 2), ok: r.arppuOk, margin: r.arppuMargin },
    { name: 'Min ARPPU for Payback', sub: 'minimum to recoup in 13 mo', need: '≥ ' + fmt(r.minArppuForPayback, 2), now: fmt(r.arppuWithD0, 2), ok: r.arppuForPaybackOk, margin: r.arppuForPaybackMargin },
    { name: 'Max Monthly Churn', sub: 'where LTV13 ≥ eCPA', need: '≤ ' + (r.maxChurnM * 100).toFixed(0) + '%', now: r.inputs.churnM.toFixed(0) + '%', ok: r.churnOk, margin: r.churnMargin }
  ];

  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-[13px] font-semibold tracking-tight">{t.sTargets}</h2>
        <p className="text-[11px] text-[var(--color-text-3)]">{t.sTargetsSub}</p>
      </div>
      <div className="rounded-[var(--radius-md)] bg-[var(--color-surface-1)] border border-[var(--color-border-subtle)] overflow-hidden">
        <div className="grid grid-cols-[1.6fr_1fr_1fr_1fr] gap-3 px-4 py-2 border-b border-[var(--color-border-subtle)] bg-[var(--color-surface-2)]">
          <HeaderCol>Metric</HeaderCol>
          <HeaderCol>Need</HeaderCol>
          <HeaderCol>Now</HeaderCol>
          <HeaderCol>Buffer</HeaderCol>
        </div>
        {rows.map((row, i) => {
          const chipClass = row.ok && row.margin > 20 ? 'ok' : row.ok ? 'warn' : 'bad';
          const chipColor = chipClass === 'ok' ? 'var(--color-good)' : chipClass === 'warn' ? 'var(--color-warn)' : 'var(--color-bad)';
          const chipBg    = chipClass === 'ok' ? 'var(--color-good-bg)' : chipClass === 'warn' ? 'var(--color-warn-bg)' : 'var(--color-bad-bg)';
          return (
            <div
              key={i}
              className={clsx('grid grid-cols-[1.6fr_1fr_1fr_1fr] gap-3 px-4 py-2.5', i < rows.length - 1 && 'border-b border-[var(--color-border-subtle)]')}
            >
              <div>
                <div className="text-[13px] font-medium">{row.name}</div>
                <div className="text-[11px] text-[var(--color-text-3)]">{row.sub}</div>
              </div>
              <div className="text-[13px] mono tabular self-center">{row.need}</div>
              <div className="text-[13px] mono tabular text-[var(--color-text-3)] self-center">{row.now}</div>
              <div className="self-center">
                <span
                  className="inline-block text-[11px] mono font-semibold px-2 py-0.5 rounded-full tabular"
                  style={{ color: chipColor, background: chipBg }}
                >
                  {row.ok ? '✓' : '✗'} {(row.margin > 0 ? '+' : '') + row.margin.toFixed(0)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function HeaderCol({ children }: { children: React.ReactNode }) {
  return <div className="text-[10px] font-semibold tracking-wider uppercase text-[var(--color-text-3)]">{children}</div>;
}
