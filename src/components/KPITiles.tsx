import type { ComputeResult } from '../engine/types';
import { fmt } from '../engine/calc';

interface KPIProps {
  result: ComputeResult;
}

export function KPITiles({ result }: KPIProps) {
  const r = result;
  const paybackStr = r.paybackMonth !== null
    ? (r.paybackMonth === 0 ? 'D0' : 'M' + r.paybackMonth)
    : '>M13';

  const paybackStatus: 'good' | 'warn' | 'bad' =
    r.paybackMonth !== null && r.paybackMonth <= 3 ? 'good' :
    r.paybackMonth !== null && r.paybackMonth <= (r.isSaas ? 12 : 6) ? 'warn' : 'bad';

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
      <Tile label="ARPPU Net" value={fmt(r.arppuWithD0, 2)} sub="with D0 upsells" />
      <Tile label="eCPA"      value={fmt(r.eCPA, 2)}        sub="effective CPA" />
      <Tile label="ROAS D0"   value={r.roasD0.toFixed(2) + '×'} sub={`${(r.roasD0 * 100).toFixed(0)}% day-0 recoup`} />
      <Tile label="Payback"   value={paybackStr} sub="LTV ≥ eCPA" status={paybackStatus} />
      <Tile label="LTV 13mo"  value={fmt(r.ltv13, 0)} sub={`${(r.ltv13 / Math.max(r.eCPA, 0.01)).toFixed(1)}× of eCPA`} />
    </div>
  );
}

interface TileProps {
  label: string;
  value: string;
  sub: string;
  status?: 'good' | 'warn' | 'bad';
}

function Tile({ label, value, sub, status }: TileProps) {
  const statusColor =
    status === 'good' ? 'var(--color-good)' :
    status === 'warn' ? 'var(--color-warn)' :
    status === 'bad'  ? 'var(--color-bad)' : undefined;

  return (
    <div className="relative rounded-[var(--radius-md)] bg-[var(--color-surface-1)] border border-[var(--color-border-subtle)] p-4 overflow-hidden">
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: statusColor ?? 'var(--color-border)' }}
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
      <div className="text-[11px] text-[var(--color-text-3)] mt-1">{sub}</div>
    </div>
  );
}
