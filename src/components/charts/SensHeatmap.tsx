import type { ComputeResult } from '../../engine/types';

const CPA_STEPS = [-30, -20, -10, 0, 10, 20, 30];
const CHURN_STEPS = [-30, -20, -10, 0, 10, 20, 30];

/**
 * Sequential 7-stop ramp (dark→accent) for Payback.
 * Status colors reserved for the >13 / null case.
 */
const RAMP = [
  'var(--color-seq-6)',  // 0-1 mo — best
  'var(--color-seq-5)',
  'var(--color-seq-4)',
  'var(--color-seq-3)',
  'var(--color-seq-2)',
  'var(--color-seq-1)',
  'var(--color-seq-0)'   // 13 mo — worst
];

function colorFor(pb: number | null): string {
  if (pb === null) return 'var(--color-bad-bg)';
  const idx = Math.min(RAMP.length - 1, Math.floor((pb / 13) * (RAMP.length - 1)));
  return RAMP[idx];
}

export function SensHeatmap({ result }: { result: ComputeResult }) {
  return (
    <div className="space-y-2">
      <div className="text-[11px] mono text-[var(--color-text-3)] mb-2">
        CPA × Churn → Payback (M)
      </div>
      <div
        className="grid gap-[2px] text-[10px] mono tabular"
        style={{ gridTemplateColumns: `60px repeat(${CHURN_STEPS.length}, 1fr)` }}
      >
        <div />
        {CHURN_STEPS.map((c) => (
          <div key={c} className="text-center text-[var(--color-text-3)] font-semibold py-1">
            {c >= 0 ? '+' : ''}{c}%
          </div>
        ))}
        {CPA_STEPS.map((cpa) => (
          <div key={cpa} className="contents">
            <div className="text-right pr-2 text-[var(--color-text-3)] font-semibold flex items-center justify-end">
              CPA {cpa >= 0 ? '+' : ''}{cpa}%
            </div>
            {CHURN_STEPS.map((ch) => {
              const pb = result.sensPaybackAt(cpa, ch);
              const isCurrent = cpa === 0 && ch === 0;
              const bg = colorFor(pb);
              return (
                <div
                  key={ch}
                  className={`text-center py-1.5 rounded-sm font-medium ${isCurrent ? 'ring-2 ring-[var(--color-text)]' : ''}`}
                  style={{
                    background: bg,
                    color: pb === null || pb > 10 ? 'var(--color-text-2)' : 'var(--color-surface-0)'
                  }}
                >
                  {pb === null ? '—' : pb === 0 ? 'D0' : 'M' + pb}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
