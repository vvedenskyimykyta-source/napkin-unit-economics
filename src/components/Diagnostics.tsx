import { useMemo } from 'react';
import { WarningCircle, Warning, CheckCircle, Info } from '@phosphor-icons/react';
import type { ComputeResult } from '../engine/types';
import { diagnose } from '../engine/diagnose';
import { clsx } from 'clsx';

const DOT = {
  high: { bg: 'var(--color-bad-bg)', dot: 'var(--color-bad)',  text: 'var(--color-bad)',  Icon: WarningCircle },
  mid:  { bg: 'var(--color-warn-bg)', dot: 'var(--color-warn)', text: 'var(--color-warn)', Icon: Warning },
  low:  { bg: 'var(--color-good-bg)', dot: 'var(--color-good)', text: 'var(--color-good)', Icon: CheckCircle },
  info: { bg: 'var(--color-info-bg)', dot: 'var(--color-info)', text: 'var(--color-info)', Icon: Info }
} as const;

// Lightweight **bold** parser → <strong>
function render(md: string) {
  const parts = md.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) => {
    if (p.startsWith('**') && p.endsWith('**')) {
      return <strong key={i} className="text-[var(--color-text)]">{p.slice(2, -2)}</strong>;
    }
    return <span key={i}>{p}</span>;
  });
}

export function Diagnostics({ result }: { result: ComputeResult }) {
  const findings = useMemo(() => diagnose(result), [result]);
  const headline = findings[0];
  const rest = findings.slice(1);
  const kind = DOT[headline.priority];

  return (
    <section className="rounded-[var(--radius-lg)] bg-[var(--color-surface-1)] border border-[var(--color-border-subtle)] overflow-hidden">
      <div className="flex items-start gap-3 p-5 border-b border-[var(--color-border-subtle)]">
        <div
          className="w-9 h-9 rounded-[var(--radius)] grid place-items-center shrink-0"
          style={{ background: kind.bg }}
        >
          <kind.Icon size={20} weight="duotone" style={{ color: kind.text }} />
        </div>
        <div className="min-w-0">
          <div className="text-[10px] font-semibold tracking-wider uppercase text-[var(--color-text-3)] mb-1">
            Diagnostics
          </div>
          <div className="text-[14px] leading-snug text-[var(--color-text-2)]">
            {render(headline.msg)}
          </div>
        </div>
      </div>

      {rest.length > 0 && (
        <ul className="divide-y divide-[var(--color-border-subtle)]">
          {rest.map((f, i) => {
            const k = DOT[f.priority];
            return (
              <li key={i} className="flex gap-3 p-4">
                <span
                  className="w-1.5 h-1.5 rounded-full mt-2 shrink-0"
                  style={{ background: k.dot }}
                />
                <div className="min-w-0 space-y-1">
                  <div className="text-[13px] leading-snug text-[var(--color-text-2)]">
                    {render(f.msg)}
                  </div>
                  {f.where && (
                    <div className="text-[12px] text-[var(--color-text-3)]">
                      <span className={clsx('inline-block mr-1', k.text && '')} style={{ color: k.text }}>→</span>
                      {f.where}
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
