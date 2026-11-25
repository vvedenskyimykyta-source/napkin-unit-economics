import { useMemo } from 'react';
import * as d3 from 'd3';
import type { ComputeResult } from '../../engine/types';
import { fmtK } from '../../engine/calc';

interface Point { t: number; revenue: number; spend: number; cash: number; }

export function CohortArea({ result, width = 760, height = 220 }: { result: ComputeResult; width?: number; height?: number }) {
  const data: Point[] = useMemo(() => {
    const r = result;
    const pts: Point[] = [];
    // Rebuild the cohort pass to get monthly series
    const deltaLTV: number[] = [];
    for (let m = 1; m <= 24; m++) {
      const curr = r.totalLTV(m);
      const prev = m === 1 ? r.arppuWithD0 : r.totalLTV(m - 1);
      deltaLTV.push(curr - prev);
    }
    let cumulRev = 0;
    let cumulSpend = 0;
    for (let T = 1; T <= 24; T++) {
      let monthlyRev = 0;
      for (let cohort = 1; cohort <= T; cohort++) {
        const age = T - cohort;
        if (age === 0) monthlyRev += r.purchPerMonth * r.arppuWithD0;
        else if (age < deltaLTV.length) monthlyRev += r.purchPerMonth * deltaLTV[age];
      }
      cumulRev += monthlyRev;
      cumulSpend += r.spendPerMonth;
      pts.push({ t: T, revenue: cumulRev, spend: cumulSpend, cash: cumulRev - cumulSpend });
    }
    return pts;
  }, [result]);

  const M = { top: 20, right: 30, bottom: 36, left: 76 };
  const W = width - M.left - M.right;
  const H = height - M.top - M.bottom;

  const xScale = d3.scaleLinear().domain([0, 24]).range([0, W]);
  const yMin = Math.min(0, d3.min(data, (d) => d.cash) ?? 0);
  const yMax = Math.max(...data.map((d) => Math.max(d.revenue, d.spend)));
  const yScale = d3.scaleLinear().domain([yMin, yMax]).range([H, 0]);

  const revLine = d3.line<Point>().x((d) => xScale(d.t)).y((d) => yScale(d.revenue)).curve(d3.curveMonotoneX);
  const spendLine = d3.line<Point>().x((d) => xScale(d.t)).y((d) => yScale(d.spend)).curve(d3.curveMonotoneX);
  const cashArea = d3.area<Point>().x((d) => xScale(d.t)).y0(yScale(0)).y1((d) => yScale(d.cash)).curve(d3.curveMonotoneX);

  const monthlyBE = result.monthlyBE;
  const cumulBE = result.cumulBE;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
      <defs>
        <linearGradient id="cashNeg" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="var(--color-bad)" stopOpacity="0.3" />
          <stop offset="1" stopColor="var(--color-bad)" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="cashPos" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="var(--color-good)" stopOpacity="0.3" />
          <stop offset="1" stopColor="var(--color-good)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <g transform={`translate(${M.left},${M.top})`}>
        {/* Grid */}
        {yScale.ticks(4).map((v, i) => (
          <g key={i} transform={`translate(0,${yScale(v)})`}>
            <line x1={0} x2={W} stroke="var(--color-border-subtle)" strokeDasharray="2 3" />
            <text x={-10} y={5} textAnchor="end" fontSize={12} className="fill-[var(--color-text-3)] mono">
              {fmtK(v)}
            </text>
          </g>
        ))}
        {[0, 6, 12, 18, 24].map((v, i) => (
          <text key={i} x={xScale(v)} y={H + 22} textAnchor="middle" fontSize={12} className="fill-[var(--color-text-3)] mono">
            M{v}
          </text>
        ))}

        {/* Zero line */}
        <line x1={0} x2={W} y1={yScale(0)} y2={yScale(0)} stroke="var(--color-border)" strokeWidth={1} />

        {/* Cash area */}
        <path d={cashArea(data) ?? ''} fill={yMin < 0 ? 'url(#cashNeg)' : 'url(#cashPos)'} />

        {/* Spend line */}
        <path d={spendLine(data) ?? ''} fill="none" stroke="var(--color-warn)" strokeWidth={1.5} strokeDasharray="3 3" />
        {/* Revenue line */}
        <path d={revLine(data) ?? ''} fill="none" stroke="var(--color-accent-500)" strokeWidth={2} />

        {/* BE markers */}
        {monthlyBE && (
          <g>
            <line x1={xScale(monthlyBE)} x2={xScale(monthlyBE)} y1={0} y2={H} stroke="var(--color-good)" strokeWidth={1} opacity={0.5} />
            <text x={xScale(monthlyBE) + 4} y={12} fontSize={10} className="fill-[var(--color-good)] mono" fontWeight={600}>
              Op BE M{monthlyBE}
            </text>
          </g>
        )}
        {cumulBE && (
          <g>
            <line x1={xScale(cumulBE)} x2={xScale(cumulBE)} y1={0} y2={H} stroke="var(--color-accent-400)" strokeWidth={1} opacity={0.5} />
            <text x={xScale(cumulBE) + 4} y={24} fontSize={10} className="fill-[var(--color-accent-400)] mono" fontWeight={600}>
              Cumul BE M{cumulBE}
            </text>
          </g>
        )}

        {/* Legend */}
        <g transform={`translate(${W - 120},${0})`}>
          <g transform="translate(0,0)">
            <rect width={8} height={2} y={5} fill="var(--color-accent-500)" />
            <text x={14} y={10} fontSize={10} className="fill-[var(--color-text-3)]">Revenue</text>
          </g>
          <g transform="translate(70,0)">
            <rect width={8} height={2} y={5} fill="var(--color-warn)" />
            <text x={14} y={10} fontSize={10} className="fill-[var(--color-text-3)]">Spend</text>
          </g>
        </g>
      </g>
    </svg>
  );
}
