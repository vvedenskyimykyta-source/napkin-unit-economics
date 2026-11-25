import { useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { ComputeResult } from '../../engine/types';
import { fmt } from '../../engine/calc';

interface Props {
  result: ComputeResult;
  width?: number;
  height?: number;
}

export function LtvCurve({ result, width = 760, height = 240 }: Props) {
  const r = result;
  const svgRef = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<number | null>(null);

  const data = useMemo(() => {
    const pts: { m: number; ltv: number }[] = [];
    for (let m = 0; m <= 13; m++) {
      const v = m === 0 ? r.arppuWithD0 : r.totalLTV(m);
      pts.push({ m, ltv: v });
    }
    return pts;
  }, [r]);

  const M = { top: 20, right: 24, bottom: 28, left: 56 };
  const W = width - M.left - M.right;
  const H = height - M.top - M.bottom;

  const xScale = d3.scaleLinear().domain([0, 13]).range([0, W]);
  const yMax = Math.max(r.eCPA, d3.max(data, (d) => d.ltv) ?? 0) * 1.1;
  const yScale = d3.scaleLinear().domain([0, yMax]).range([H, 0]);

  const line = d3.line<{ m: number; ltv: number }>()
    .x((d) => xScale(d.m))
    .y((d) => yScale(d.ltv))
    .curve(d3.curveMonotoneX);

  const area = d3.area<{ m: number; ltv: number }>()
    .x((d) => xScale(d.m))
    .y0(H)
    .y1((d) => yScale(d.ltv))
    .curve(d3.curveMonotoneX);

  const paybackPt = r.paybackMonth !== null ? data[r.paybackMonth] : null;

  const onMove = (e: React.MouseEvent<SVGRectElement>) => {
    const rect = svgRef.current!.getBoundingClientRect();
    const scale = width / rect.width;
    const x = (e.clientX - rect.left) * scale - M.left;
    const m = Math.round(xScale.invert(x));
    if (m >= 0 && m <= 13) setHover(m);
  };

  const hoverPt = hover !== null ? data[hover] : null;

  return (
    <svg ref={svgRef} viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
      <defs>
        <linearGradient id="ltvFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="var(--color-accent-500)" stopOpacity="0.25" />
          <stop offset="1" stopColor="var(--color-accent-500)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <g transform={`translate(${M.left},${M.top})`}>
        {/* Grid Y */}
        {yScale.ticks(4).map((v, i) => (
          <g key={i} transform={`translate(0,${yScale(v)})`}>
            <line x1={0} x2={W} stroke="var(--color-border-subtle)" strokeDasharray="2 3" />
            <text x={-8} y={4} textAnchor="end" className="fill-[var(--color-text-3)] mono" fontSize={10}>
              {fmt(v, 0)}
            </text>
          </g>
        ))}
        {/* X ticks */}
        {xScale.ticks(13).map((v, i) => (
          <text key={i} x={xScale(v)} y={H + 18} textAnchor="middle" className="fill-[var(--color-text-3)] mono" fontSize={10}>
            {v === 0 ? 'D0' : 'M' + v}
          </text>
        ))}

        {/* eCPA threshold */}
        <line x1={0} x2={W} y1={yScale(r.eCPA)} y2={yScale(r.eCPA)}
          stroke="var(--color-warn)" strokeDasharray="3 3" strokeWidth={1} />
        <text x={W - 6} y={yScale(r.eCPA) - 6} textAnchor="end" fontSize={10}
          className="fill-[var(--color-warn)] mono" fontWeight={600}>
          eCPA {fmt(r.eCPA, 0)}
        </text>

        {/* Fill + line */}
        <path d={area(data) ?? ''} fill="url(#ltvFill)" />
        <path d={line(data) ?? ''} fill="none" stroke="var(--color-accent-500)" strokeWidth={2} strokeLinecap="round" />

        {/* Points */}
        {data.map((d) => (
          <circle key={d.m} cx={xScale(d.m)} cy={yScale(d.ltv)} r={2.5}
            fill="var(--color-accent-400)" />
        ))}

        {/* Payback marker */}
        {paybackPt && (
          <>
            <line
              x1={xScale(paybackPt.m)} x2={xScale(paybackPt.m)}
              y1={0} y2={H}
              stroke="var(--color-good)" strokeWidth={1}
            />
            <circle cx={xScale(paybackPt.m)} cy={yScale(paybackPt.ltv)} r={5}
              fill="var(--color-good)" stroke="var(--color-surface-0)" strokeWidth={2} />
          </>
        )}

        {/* Hover */}
        {hoverPt && (
          <>
            <line x1={xScale(hoverPt.m)} x2={xScale(hoverPt.m)} y1={0} y2={H}
              stroke="var(--color-text-3)" strokeWidth={1} strokeDasharray="2 2" />
            <circle cx={xScale(hoverPt.m)} cy={yScale(hoverPt.ltv)} r={5}
              fill="var(--color-accent-500)" stroke="var(--color-surface-0)" strokeWidth={2} />
          </>
        )}

        <rect x={0} y={0} width={W} height={H} fill="transparent"
          onMouseMove={onMove} onMouseLeave={() => setHover(null)} />
      </g>
      {hoverPt && (
        <g transform={`translate(${M.left + xScale(hoverPt.m) + 8},${M.top + 4})`}>
          <rect x={0} y={0} width={110} height={44}
            rx={6} fill="var(--color-surface-2)" stroke="var(--color-border)" />
          <text x={8} y={16} fontSize={11} className="fill-[var(--color-text-3)] mono">
            {hoverPt.m === 0 ? 'D0' : 'M' + hoverPt.m}
          </text>
          <text x={8} y={32} fontSize={13} fontWeight={600} className="fill-[var(--color-text) mono]">
            {fmt(hoverPt.ltv, 2)}
          </text>
        </g>
      )}
    </svg>
  );
}
