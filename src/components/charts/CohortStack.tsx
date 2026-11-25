import { useMemo, useState } from 'react';
import * as d3 from 'd3';
import type { ComputeResult } from '../../engine/types';
/* eslint-disable @typescript-eslint/no-unused-vars */

const HORIZON = 24;

/**
 * Cohort activity: stacked area where each monthly cohort (acquired during
 * the test window) contributes its still-active users. Total height at any
 * month = total active users then.
 */
export function CohortStack({ result, width = 1100, height = 300 }: { result: ComputeResult; width?: number; height?: number }) {
  const r = result;
  const [hover, setHover] = useState<number | null>(null);

  const data = useMemo(() => {
    const testLen = r.inputs.testLengthMonths;
    const purchPerMonth = r.purchPerMonth;
    const series: { month: number; cohorts: number[]; total: number }[] = [];
    for (let m = 0; m <= HORIZON; m++) {
      const cohorts: number[] = [];
      let total = 0;
      for (let c = 0; c < testLen; c++) {
        if (m < c) {
          cohorts.push(0);
          continue;
        }
        const age = m - c;
        const active = purchPerMonth * r.cohortActive(age);
        cohorts.push(active);
        total += active;
      }
      series.push({ month: m, cohorts, total });
    }
    return series;
  }, [r]);

  const testLen = r.inputs.testLengthMonths;
  const M = { top: 20, right: 30, bottom: 40, left: 70 };
  const W = width - M.left - M.right;
  const H = height - M.top - M.bottom;

  const xScale = d3.scaleLinear().domain([0, HORIZON]).range([0, W]);
  const yMax = Math.max(...data.map((d) => d.total)) || 1;
  const yScale = d3.scaleLinear().domain([0, yMax * 1.05]).range([H, 0]);

  // Build stacked y positions
  const stacked = data.map((pt) => {
    let y = 0;
    const layers: { y0: number; y1: number }[] = [];
    pt.cohorts.forEach((v) => {
      layers.push({ y0: y, y1: y + v });
      y += v;
    });
    return { month: pt.month, total: pt.total, layers };
  });

  const fillFor = (i: number) => {
    const ramp = ['var(--color-accent-700)', 'var(--color-accent-600)', 'var(--color-accent-500)', 'var(--color-accent-400)', 'var(--color-accent-300)', 'var(--color-accent-200)'];
    return ramp[i % ramp.length];
  };

  const areaGen = (cohortIdx: number) =>
    d3.area<typeof stacked[0]>()
      .x((d) => xScale(d.month))
      .y0((d) => yScale(d.layers[cohortIdx]?.y0 ?? 0))
      .y1((d) => yScale(d.layers[cohortIdx]?.y1 ?? d.layers[cohortIdx]?.y0 ?? 0))
      .curve(d3.curveMonotoneX);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
      <g transform={`translate(${M.left},${M.top})`}>
        {/* Y grid + labels */}
        {yScale.ticks(4).map((v, i) => (
          <g key={i} transform={`translate(0,${yScale(v)})`}>
            <line x1={0} x2={W} stroke="var(--color-border-subtle)" strokeDasharray="2 3" />
            <text x={-10} y={5} textAnchor="end" fontSize={12} className="fill-[var(--color-text-3)] mono">
              {Math.round(v).toLocaleString()}
            </text>
          </g>
        ))}
        {/* X ticks */}
        {[0, 3, 6, 9, 12, 15, 18, 21, 24].map((v, i) => (
          <text key={i} x={xScale(v)} y={H + 22} textAnchor="middle" fontSize={12} className="fill-[var(--color-text-3)] mono">
            M{v}
          </text>
        ))}

        {/* Stacked layers */}
        {Array.from({ length: testLen }, (_, i) => (
          <path
            key={i}
            d={areaGen(i)(stacked) ?? ''}
            fill={fillFor(i)}
            opacity={0.85}
          >
            <title>Cohort acquired month {i + 1}</title>
          </path>
        ))}

        {/* Spend window marker */}
        <line
          x1={xScale(testLen)}
          x2={xScale(testLen)}
          y1={0}
          y2={H}
          stroke="var(--color-warn)"
          strokeWidth={1.5}
          strokeDasharray="4 4"
          opacity={0.6}
        />
        <text x={xScale(testLen) + 6} y={14} fontSize={11} className="fill-[var(--color-warn)] mono" fontWeight={600}>
          spend ends M{testLen}
        </text>

        {/* Total line on top for clarity */}
        <path
          d={d3.line<typeof stacked[0]>()
            .x((d) => xScale(d.month))
            .y((d) => yScale(d.total))
            .curve(d3.curveMonotoneX)(stacked) ?? ''}
          fill="none"
          stroke="var(--color-text)"
          strokeWidth={1.5}
          opacity={0.4}
        />

        {/* Hover */}
        {hover !== null && (
          <>
            <line x1={xScale(hover)} x2={xScale(hover)} y1={0} y2={H} stroke="var(--color-text-3)" strokeDasharray="2 2" />
            <circle cx={xScale(hover)} cy={yScale(stacked[hover]?.total ?? 0)} r={4}
              fill="var(--color-text)" stroke="var(--color-surface-0)" strokeWidth={2} />
          </>
        )}

        <rect x={0} y={0} width={W} height={H} fill="transparent"
          onMouseMove={(e) => {
            const rect = (e.currentTarget as SVGRectElement).getBoundingClientRect();
            const px = e.clientX - rect.left;
            const m = Math.round(xScale.invert(px));
            if (m >= 0 && m <= HORIZON) setHover(m);
          }}
          onMouseLeave={() => setHover(null)}
        />
      </g>

      {/* Tooltip */}
      {hover !== null && stacked[hover] && (
        <g transform={`translate(${M.left + xScale(hover) + 10},${M.top + 10})`}>
          <rect x={0} y={0} width={160} height={46} rx={8} fill="var(--color-surface-2)" stroke="var(--color-border)" />
          <text x={10} y={18} fontSize={11} className="fill-[var(--color-text-3)] mono">Month {hover}</text>
          <text x={10} y={36} fontSize={14} fontWeight={600} className="fill-[var(--color-text)] mono">
            {Math.round(stacked[hover].total).toLocaleString()} active
          </text>
        </g>
      )}
    </svg>
  );
}
