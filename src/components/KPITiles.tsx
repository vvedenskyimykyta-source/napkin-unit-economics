import type { ComputeResult } from '../engine/types';
import { fmt } from '../engine/calc';

interface KPIProps {
  result: ComputeResult;
  baseline?: ComputeResult | null;
}

export function KPITiles({ result, baseline }: KPIProps) {
  const r = result;
  const b = baseline ?? null;
  const paybackStr = r.paybackMonth !== null
    ? (r.paybackMonth === 0 ? 'D0' : 'M' + r.paybackMonth)
    : '>M13';

  const paybackStatus: 'good' | 'warn' | 'bad' =
    r.paybackMonth !== null && r.paybackMonth <= 3 ? 'good' :
    r.paybackMonth !== null && r.paybackMonth <= (r.isSaas ? 12 : 6) ? 'warn' : 'bad';

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
      <Tile label="ARPPU Net" value={fmt(r.arppuWithD0, 2)} sub="with D0 upsells"
        delta={b && fmtDelta(r.arppuWithD0 - b.arppuWithD0, 2, true)} />
      <Tile label="eCPA"      value={fmt(r.eCPA, 2)}        sub="effective CPA"
        delta={b && fmtDelta(r.eCPA - b.eCPA, 2, false)} />
      <Tile label="ROAS D0"   value={r.roasD0.toFixed(2) + '×'} sub={`${(r.roasD0 * 100).toFixed(0)}% day-0 recoup`}
        delta={b && fmtDelta(r.roasD0 - b.roasD0, 2, true, '×')} />
      <Tile label="Payback"   value={paybackStr} sub="LTV ≥ eCPA" status={paybackStatus}
        delta={b && paybackDelta(r.paybackMonth, b.paybackMonth)} />
      <Tile label="LTV 13mo"  value={fmt(r.ltv13, 0)} sub={`${(r.ltv13 / Math.max(r.eCPA, 0.01)).toFixed(1)}× of eCPA`}
        delta={b && fmtDelta(r.ltv13 - b.ltv13, 0, true)} />
    </div>
  );
}

function fmtDelta(delta: number, digits: number, higherIsBetter: boolean, unit = '$'): { text: string; better: boolean | null } {
  if (!isFinite(delta) || Math.abs(delta) < 1e-6) return { text: '±0', better: null };
  const sign = delta > 0 ? '+' : '';
  const formatted = unit === '$' ? fmt(delta, digits) : sign + delta.toFixed(digits) + unit;
  const final = unit === '$' ? (sign === '+' ? '+' + formatted : formatted) : formatted;
  const better = higherIsBetter ? delta > 0 : delta < 0;
  return { text: final, better };
}

function paybackDelta(cur: number | null, base: number | null): { text: string; better: boolean | null } {
  if (cur === null && base === null) return { text: '—', better: null };
  if (cur === null) return { text: 'lost PB', better: false };
  if (base === null) return { text: 'gained PB', better: true };
  const d = cur - base;
  if (d === 0) return { text: '±0 mo', better: null };
  return { text: (d > 0 ? '+' : '') + d + ' mo', better: d < 0 };
}

interface TileProps {
  label: string;
  value: string;
  sub: string;
  status?: 'good' | 'warn' | 'bad';
  delta?: { text: string; better: boolean | null } | null | false;
}

function Tile({ label, value, sub, status, delta }: TileProps) {
  const statusColor =
    status === 'good' ? 'var(--color-good)' :
    status === 'warn' ? 'var(--color-warn)' :
    status === 'bad'  ? 'var(--color-bad)' : undefined;

  const dColor = delta && delta.better !== null
    ? (delta.better ? 'var(--color-good)' : 'var(--color-bad)')
    : 'var(--color-text-3)';

  return (
    <div className="relative tile-lift rounded-[var(--radius-md)] bg-[var(--color-surface-1)] border border-[var(--color-border-subtle)] p-4 overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <div
        className="absolute top-0 left-0 right-0 h-0.5"
        style={{ background: statusColor ? `linear-gradient(90deg, ${statusColor}, transparent 100%)` : 'linear-gradient(90deg, var(--color-accent-500), transparent 70%)' }}
      />
      <div className="text-[10px] font-semibold tracking-wider uppercase text-[var(--color-text-3)] mb-1.5">
        {label}
      </div>
      <div
        className="text-2xl font-semibold tracking-tight mono"
        style={{ color: statusColor }}
      >
        {value}
      </div>
      <div className="text-[11px] text-[var(--color-text-3)] mt-1 flex items-center justify-between gap-1">
        <span>{sub}</span>
        {delta && typeof delta === 'object' && (
          <span className="mono tabular text-[10px]" style={{ color: dColor }}>{delta.text}</span>
        )}
      </div>
    </div>
  );
}
