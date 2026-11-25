import { Bookmark, X, Trash } from '@phosphor-icons/react';
import type { ComputeResult } from '../engine/types';
import { healthScore } from '../engine/score';

interface BaselineBarProps {
  current: ComputeResult;
  baseline: ComputeResult | null;
  onSetBaseline: () => void;
  onClearBaseline: () => void;
}

export function BaselineBar({ current, baseline, onSetBaseline, onClearBaseline }: BaselineBarProps) {
  const score = healthScore(current);
  const bScore = baseline ? healthScore(baseline) : null;
  const scoreDelta = bScore !== null ? score - bScore : null;

  const scoreColor =
    score >= 70 ? 'var(--color-good)' :
    score >= 45 ? 'var(--color-warn)' : 'var(--color-bad)';

  return (
    <div className="rounded-[var(--radius-md)] bg-[var(--color-surface-1)] border border-[var(--color-border-subtle)] p-4 flex items-center gap-5">
      {/* Score */}
      <div className="flex items-center gap-3">
        <div className="relative w-14 h-14">
          <svg viewBox="0 0 48 48" className="w-14 h-14 -rotate-90">
            <circle cx={24} cy={24} r={20} fill="none" stroke="var(--color-surface-3)" strokeWidth={4} />
            <circle
              cx={24} cy={24} r={20} fill="none"
              stroke={scoreColor} strokeWidth={4} strokeLinecap="round"
              strokeDasharray={`${(score / 100) * 125.66} 125.66`}
            />
          </svg>
          <div className="absolute inset-0 grid place-items-center">
            <span className="text-[16px] font-bold mono" style={{ color: scoreColor }}>{score}</span>
          </div>
        </div>
        <div>
          <div className="text-[10px] font-semibold tracking-wider uppercase text-[var(--color-text-3)]">
            Health score
          </div>
          <div className="text-[13px] text-[var(--color-text-2)]">
            {scoreDelta !== null ? (
              <>
                vs baseline{' '}
                <span style={{ color: scoreDelta >= 0 ? 'var(--color-good)' : 'var(--color-bad)' }}>
                  {scoreDelta >= 0 ? '+' : ''}{scoreDelta} pts
                </span>
              </>
            ) : (
              'Save baseline to compare scenarios'
            )}
          </div>
        </div>
      </div>

      <div className="flex-1" />

      {/* Delta pills vs baseline */}
      {baseline && (
        <div className="hidden lg:flex items-center gap-3">
          <DeltaPill
            label="Payback"
            current={current.paybackMonth}
            baseline={baseline.paybackMonth}
            lowerIsBetter
            format={(v) => v === null ? '—' : v === 0 ? 'D0' : 'M' + v}
          />
          <DeltaPill
            label="LTV/CAC"
            current={current.ltv13 / Math.max(current.eCPA, 0.01)}
            baseline={baseline.ltv13 / Math.max(baseline.eCPA, 0.01)}
            format={(v) => v.toFixed(2) + '×'}
          />
          <DeltaPill
            label="eCPA"
            current={current.eCPA}
            baseline={baseline.eCPA}
            lowerIsBetter
            format={(v) => '$' + v.toFixed(0)}
          />
        </div>
      )}

      {/* Baseline button */}
      {baseline ? (
        <button
          onClick={onClearBaseline}
          className="text-[11px] text-[var(--color-text-3)] hover:text-[var(--color-bad)] inline-flex items-center gap-1"
          title="Clear baseline"
        >
          <Trash size={12} weight="duotone" /> Clear baseline
        </button>
      ) : (
        <button
          onClick={onSetBaseline}
          className="text-[11px] font-medium px-3 py-1.5 rounded-full border border-[var(--color-accent-500)]/40 text-[var(--color-accent-300)] hover:bg-[var(--color-accent-500)]/10 inline-flex items-center gap-1"
        >
          <Bookmark size={12} weight="duotone" /> Save as baseline
        </button>
      )}
    </div>
  );
}

interface DeltaPillProps {
  label: string;
  current: number | null;
  baseline: number | null;
  lowerIsBetter?: boolean;
  format: (v: number) => string;
}

function DeltaPill({ label, current, baseline, lowerIsBetter, format }: DeltaPillProps) {
  const c = current ?? NaN;
  const b = baseline ?? NaN;
  const hasBoth = isFinite(c) && isFinite(b);
  const delta = hasBoth ? c - b : null;
  const better = delta !== null ? (lowerIsBetter ? delta < 0 : delta > 0) : null;
  const color =
    better === null ? 'var(--color-text-3)' :
    better ? 'var(--color-good)' : (delta === 0 ? 'var(--color-text-3)' : 'var(--color-bad)');

  return (
    <div className="flex items-baseline gap-1.5">
      <span className="text-[10px] font-semibold tracking-wider uppercase text-[var(--color-text-3)]">
        {label}
      </span>
      <span className="text-[12px] mono font-semibold tabular text-[var(--color-text)]">
        {current !== null ? format(current) : '—'}
      </span>
      {delta !== null && (
        <span className="text-[11px] mono tabular" style={{ color }}>
          ({delta > 0 ? '+' : ''}{format(delta).replace(/^\$/, '')})
        </span>
      )}
    </div>
  );
}

export { X };
