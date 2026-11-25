import type { ComputeResult } from '../engine/types';
import { fmt, fmtK } from '../engine/calc';
import type { I18N } from '../i18n/strings';

export function Forecast({ result, t }: { result: ComputeResult; t: I18N }) {
  const r = result;
  const paybackStr = r.paybackMonth !== null
    ? (r.paybackMonth === 0 ? 'D0' : 'M' + r.paybackMonth) : '—';
  const budgetStatus = r.paybackBeforeBudgetEnds ? 'good' : (r.paybackMonth !== null ? 'warn' : 'bad');
  const profitStatus = r.profitAtPayback >= 0 ? 'good' : 'bad';

  return (
    <SectionHead title={t.sForecast} sub={t.sForecastSub}>
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <Cell label="Rec. budget / day" value={fmt(r.budgetPerDay, 0)} sub={`${fmtK(r.budgetPerDay * 30)}/mo`} />
        <Cell label="Purchases / mo" value={Math.round(r.purchPerMonth).toLocaleString()} sub={`${Math.round(r.purchPerDay)}/day`} />
        <Cell label="Total purchases" value={Math.round(r.totalPurchases).toLocaleString()} sub="over full budget" />
        <Cell label="Budget lasts" value={r.monthsOfBudget + ' mo'}
          sub={r.paybackBeforeBudgetEnds ? `✓ Payback ${paybackStr}` : r.paybackMonth !== null ? `⚠ Payback ${paybackStr}` : '✗ no payback'}
          status={budgetStatus as 'good' | 'warn' | 'bad'} />
        <Cell label="P&L at Payback"
          value={(r.profitAtPayback >= 0 ? '+' : '') + fmtK(r.profitAtPayback)}
          sub={`Rev ${fmtK(r.revenueAtPayback)}`}
          status={profitStatus as 'good' | 'bad'} />
      </div>
    </SectionHead>
  );
}

function SectionHead({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-[13px] font-semibold tracking-tight">{title}</h2>
        <p className="text-[11px] text-[var(--color-text-3)]">{sub}</p>
      </div>
      {children}
    </section>
  );
}

interface CellProps {
  label: string;
  value: string;
  sub: string;
  status?: 'good' | 'warn' | 'bad';
}
function Cell({ label, value, sub, status }: CellProps) {
  const color = status === 'good' ? 'var(--color-good)' : status === 'warn' ? 'var(--color-warn)' : status === 'bad' ? 'var(--color-bad)' : undefined;
  return (
    <div className="rounded-[var(--radius-md)] bg-[var(--color-surface-1)] border border-[var(--color-border-subtle)] p-3">
      <div className="text-[10px] font-semibold tracking-wider uppercase text-[var(--color-text-3)] mb-1">{label}</div>
      <div className="text-[18px] mono font-semibold tracking-tight" style={{ color }}>{value}</div>
      <div className="text-[11px] text-[var(--color-text-3)] mt-0.5">{sub}</div>
    </div>
  );
}
