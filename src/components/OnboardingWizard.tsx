import { useState } from 'react';
import { DeviceMobile, Browsers, ArrowRight } from '@phosphor-icons/react';
import { nichesFor } from '../engine/niches';
import type { Mode } from '../engine/types';
import { clsx } from 'clsx';

interface OnboardingProps {
  onDone: (mode: Mode, nicheId: string) => void;
}

export function OnboardingWizard({ onDone }: OnboardingProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [mode, setMode] = useState<Mode | null>(null);
  const [nicheId, setNicheId] = useState<string | null>(null);

  const niches = mode ? nichesFor(mode) : [];

  return (
    <div className="fixed inset-0 z-50 bg-[var(--color-surface-0)]/95 backdrop-blur-sm grid place-items-center p-6">
      <div className="w-full max-w-lg rounded-[var(--radius-xl)] bg-[var(--color-surface-1)] border border-[var(--color-border)] shadow-2xl overflow-hidden">
        {/* Progress */}
        <div className="flex gap-1 p-1 bg-[var(--color-surface-2)]">
          <div className="flex-1 h-1 rounded-full bg-[var(--color-accent-500)]" />
          <div className={clsx('flex-1 h-1 rounded-full', step === 2 ? 'bg-[var(--color-accent-500)]' : 'bg-[var(--color-border)]')} />
        </div>

        <div className="p-6 lg:p-8">
          {step === 1 && (
            <>
              <div className="text-[10px] font-semibold tracking-wider uppercase text-[var(--color-text-3)] mb-2">
                Step 1 of 2
              </div>
              <h2 className="font-semibold tracking-tight text-[22px] mb-1">
                What are you building? <span aria-hidden>🧮</span>
              </h2>
              <p className="text-[13px] text-[var(--color-text-2)] mb-6">
                Mobile subscriptions and B2B SaaS have very different norms. Picking one loads realistic benchmarks.
              </p>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <ChoiceCard
                  selected={mode === 'mobile'}
                  onClick={() => setMode('mobile')}
                  icon={<DeviceMobile size={28} weight="duotone" />}
                  title="Mobile App"
                  sub="Apple / Google, intro pricing, weekly plans, D0 upsells"
                />
                <ChoiceCard
                  selected={mode === 'saas'}
                  onClick={() => setMode('saas')}
                  icon={<Browsers size={28} weight="duotone" />}
                  title="Web & SaaS"
                  sub="Stripe / Paddle, annual plans, trial-to-paid, seats"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  disabled={!mode}
                  onClick={() => setStep(2)}
                  className={clsx(
                    'inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-[13px] font-semibold transition',
                    mode
                      ? 'bg-gradient-to-br from-[var(--color-accent-500)] to-[var(--color-accent-700)] text-white shadow-md hover:shadow-lg'
                      : 'bg-[var(--color-surface-3)] text-[var(--color-text-3)] cursor-not-allowed'
                  )}
                >
                  Next <ArrowRight size={14} weight="bold" />
                </button>
              </div>
            </>
          )}

          {step === 2 && mode && (
            <>
              <div className="text-[10px] font-semibold tracking-wider uppercase text-[var(--color-text-3)] mb-2">
                Step 2 of 2
              </div>
              <h2 className="font-semibold tracking-tight text-[22px] mb-1">
                Pick your niche <span aria-hidden>🎯</span>
              </h2>
              <p className="text-[13px] text-[var(--color-text-2)] mb-5">
                Churn, CPA, pricing and paywall norms differ a lot by niche. Your sliders will highlight the typical range.
              </p>

              <select
                value={nicheId ?? ''}
                onChange={(e) => setNicheId(e.target.value)}
                className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-[var(--radius)] px-4 py-3 text-[14px] font-medium focus:outline-none focus:border-[var(--color-accent-500)] mb-6"
              >
                <option value="">— Choose niche —</option>
                {niches.map((n) => (
                  <option key={n.id} value={n.id}>{n.label}</option>
                ))}
              </select>

              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-[12px] text-[var(--color-text-3)] hover:text-[var(--color-text-2)]"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  disabled={!nicheId}
                  onClick={() => nicheId && onDone(mode, nicheId)}
                  className={clsx(
                    'inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-[13px] font-semibold transition',
                    nicheId
                      ? 'bg-gradient-to-br from-[var(--color-accent-500)] to-[var(--color-accent-700)] text-white shadow-md hover:shadow-lg'
                      : 'bg-[var(--color-surface-3)] text-[var(--color-text-3)] cursor-not-allowed'
                  )}
                >
                  Start calculating <ArrowRight size={14} weight="bold" />
                </button>
              </div>
            </>
          )}
        </div>

        <div className="px-6 py-3 bg-[var(--color-surface-2)] border-t border-[var(--color-border-subtle)] text-[11px] text-[var(--color-text-3)] flex items-center justify-between">
          <span>No account. Nothing is sent to a server.</span>
          <button
            type="button"
            onClick={() => mode ? onDone(mode, 'mobile-generic') : onDone('mobile', 'mobile-generic')}
            className="hover:text-[var(--color-text-2)]"
          >
            Skip →
          </button>
        </div>
      </div>
    </div>
  );
}

interface ChoiceCardProps {
  selected: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  sub: string;
}
function ChoiceCard({ selected, onClick, icon, title, sub }: ChoiceCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        'text-left rounded-[var(--radius-md)] border p-4 transition-all',
        selected
          ? 'border-[var(--color-accent-500)] bg-[var(--color-accent-500)]/10'
          : 'border-[var(--color-border)] bg-[var(--color-surface-2)] hover:border-[var(--color-border-strong)]'
      )}
    >
      <div className={clsx(
        'mb-3',
        selected ? 'text-[var(--color-accent-300)]' : 'text-[var(--color-text-2)]'
      )}>
        {icon}
      </div>
      <div className="font-semibold text-[14px] tracking-tight mb-1">{title}</div>
      <div className="text-[11px] text-[var(--color-text-3)] leading-snug">{sub}</div>
    </button>
  );
}
