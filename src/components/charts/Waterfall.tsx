import type { ComputeResult } from '../../engine/types';
import { fmtK } from '../../engine/calc';

interface Step {
  label: string;
  value: number;     // signed amount at this step
  kind: 'gross' | 'cut' | 'net';
}

export function Waterfall({ result, width = 760, height = 260 }: { result: ComputeResult; width?: number; height?: number }) {
  const r = result;
  const steps: Step[] = [
    { label: 'Gross Rev',    value:  r.waterfallGross,          kind: 'gross' },
    { label: 'Store Fee',    value: -r.waterfallStoreFeeCut,    kind: 'cut' },
    { label: 'Refunds',      value: -r.waterfallRefundCut,      kind: 'cut' },
    { label: 'COGS',         value: -r.waterfallCogsCut,        kind: 'cut' },
    { label: 'Fixed Costs',  value: -r.waterfallFixedCut,       kind: 'cut' },
    { label: 'Ad Spend',     value: -r.waterfallAdSpend,        kind: 'cut' },
    { label: 'Net Profit',   value:  r.waterfallNetProfit,      kind: 'net' }
  ];

  const M = { top: 24, right: 30, bottom: 54, left: 30 };
  const W = width - M.left - M.right;
  const H = height - M.top - M.bottom;

  // Compute running totals
  let running = 0;
  const bars = steps.map((s, i) => {
    const isGrossOrNet = s.kind === 'gross' || s.kind === 'net';
    const start = isGrossOrNet ? 0 : running;
    const end = isGrossOrNet ? s.value : running + s.value;
    if (!isGrossOrNet) running = end; else running = end;
    if (i === 0) running = s.value;
    if (s.kind === 'net') running = s.value;
    return { ...s, start, end };
  });

  const vals = bars.flatMap((b) => [b.start, b.end]);
  const maxAbs = Math.max(...vals.map(Math.abs), 1);
  const yScale = (v: number) => H / 2 - (v / maxAbs) * (H / 2.2);

  const bandW = W / steps.length;
  const barW = bandW * 0.65;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
      <g transform={`translate(${M.left},${M.top})`}>
        {/* Zero line */}
        <line x1={0} x2={W} y1={yScale(0)} y2={yScale(0)} stroke="var(--color-border)" strokeWidth={1} />

        {bars.map((b, i) => {
          const cx = i * bandW + bandW / 2;
          const y0 = yScale(b.start);
          const y1 = yScale(b.end);
          const top = Math.min(y0, y1);
          const barH = Math.abs(y1 - y0);
          const color =
            b.kind === 'gross' ? 'var(--color-accent-500)' :
            b.kind === 'net'   ? (b.value >= 0 ? 'var(--color-good)' : 'var(--color-bad)') :
                                 'var(--color-bad)';

          return (
            <g key={b.label}>
              <rect
                x={cx - barW / 2}
                y={top}
                width={barW}
                height={Math.max(2, barH)}
                fill={color}
                rx={3}
                opacity={b.kind === 'cut' ? 0.75 : 1}
              />
              <text
                x={cx}
                y={top - 8}
                textAnchor="middle"
                fontSize={12}
                className="fill-[var(--color-text)] mono"
                fontWeight={600}
              >
                {b.value >= 0 ? '+' : ''}{fmtK(b.value)}
              </text>
              <text
                x={cx}
                y={H + 22}
                textAnchor="middle"
                fontSize={12}
                className="fill-[var(--color-text-2)]"
                fontWeight={500}
              >
                {b.label}
              </text>
              {/* Connector */}
              {i < bars.length - 1 && bars[i].kind !== 'net' && bars[i + 1].kind !== 'gross' && (
                <line
                  x1={cx + barW / 2}
                  x2={(i + 1) * bandW + bandW / 2 - barW / 2}
                  y1={yScale(bars[i].end)}
                  y2={yScale(bars[i].end)}
                  stroke="var(--color-border)"
                  strokeDasharray="3 3"
                  strokeWidth={1}
                />
              )}
            </g>
          );
        })}
      </g>
    </svg>
  );
}
