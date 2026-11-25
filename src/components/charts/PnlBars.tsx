import * as d3 from 'd3';
import type { ComputeResult } from '../../engine/types';
import { fmtK } from '../../engine/calc';

interface Row { label: string; month: number; total: number; }

export function PnlBars({ result, width = 760, height = 240 }: { result: ComputeResult; width?: number; height?: number }) {
  const r = result;
  const rows: Row[] = [
    { label: 'Rev D0', month: r.revMonthD0, total: r.revTotalD0 },
    { label: 'Spend', month: -r.spendPerMonth, total: -r.inputs.totalBudget },
    { label: 'Profit D0', month: r.profitMonthD0, total: r.profitTotalD0 },
    { label: 'Rev @PB', month: r.revMonthPB, total: r.revTotalPB },
    { label: 'Profit @PB', month: r.profitMonthPB, total: r.profitTotalPB }
  ];

  const M = { top: 10, right: 100, bottom: 28, left: 86 };
  const W = width - M.left - M.right;
  const H = height - M.top - M.bottom;

  const yScale = d3.scaleBand<string>().domain(rows.map((r) => r.label)).range([0, H]).padding(0.3);
  const max = d3.max(rows, (d) => Math.max(Math.abs(d.month), Math.abs(d.total))) ?? 1;
  const xScale = d3.scaleLinear().domain([-max, max]).range([0, W]);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
      <g transform={`translate(${M.left},${M.top})`}>
        {/* Zero line */}
        <line x1={xScale(0)} x2={xScale(0)} y1={0} y2={H} stroke="var(--color-border)" />

        {rows.map((d) => {
          const bandY = yScale(d.label)!;
          const barHMonth = yScale.bandwidth() * 0.45;
          const barHTotal = yScale.bandwidth() * 0.45;
          const colMonth = d.month >= 0 ? 'var(--color-good)' : 'var(--color-bad)';
          const colTotal = d.total >= 0 ? 'var(--color-accent-500)' : 'var(--color-bad)';

          return (
            <g key={d.label} transform={`translate(0,${bandY})`}>
              <text x={-10} y={yScale.bandwidth() / 2} dy="0.35em" textAnchor="end" fontSize={11}
                className="fill-[var(--color-text-2)]">{d.label}</text>

              {/* month bar */}
              <rect
                x={Math.min(xScale(0), xScale(d.month))}
                y={0}
                width={Math.abs(xScale(d.month) - xScale(0))}
                height={barHMonth}
                fill={colMonth}
                rx={2}
              />
              <text x={xScale(d.month) + (d.month >= 0 ? 6 : -6)} y={barHMonth / 2} dy="0.35em" fontSize={10}
                textAnchor={d.month >= 0 ? 'start' : 'end'}
                className="fill-[var(--color-text-2)] mono">
                {(d.month >= 0 ? '+' : '') + fmtK(d.month)}/mo
              </text>

              {/* total bar */}
              <rect
                x={Math.min(xScale(0), xScale(d.total))}
                y={yScale.bandwidth() - barHTotal}
                width={Math.abs(xScale(d.total) - xScale(0))}
                height={barHTotal}
                fill={colTotal}
                opacity={0.8}
                rx={2}
              />
              <text x={xScale(d.total) + (d.total >= 0 ? 6 : -6)} y={yScale.bandwidth() - barHTotal / 2} dy="0.35em" fontSize={10}
                textAnchor={d.total >= 0 ? 'start' : 'end'}
                className="fill-[var(--color-text-3)] mono">
                {(d.total >= 0 ? '+' : '') + fmtK(d.total)}/total
              </text>
            </g>
          );
        })}

        {/* X axis bottom tick: scale label */}
        <text x={W} y={H + 18} textAnchor="end" fontSize={10} className="fill-[var(--color-text-3)] mono">
          scale: {fmtK(max)}
        </text>
      </g>
    </svg>
  );
}
