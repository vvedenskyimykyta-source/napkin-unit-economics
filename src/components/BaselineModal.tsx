import { useState } from 'react';
import { Bookmark, X } from '@phosphor-icons/react';
import { Field, NumField } from './fields';
import type { Inputs } from '../engine/types';

interface BaselineModalProps {
  initial: Inputs;
  onSave: (next: Inputs) => void;
  onClose: () => void;
}

// 6 key metrics the user types their "actual" numbers into.
// We clone `initial` and override just these fields.
export function BaselineModal({ initial, onSave, onClose }: BaselineModalProps) {
  const [churnM, setChurnM] = useState(initial.churnM);
  const [renewal, setRenewal] = useState(initial.renewal);
  const [cpa, setCpa] = useState(Math.round((initial.webCPA + initial.appCPA) / 2));
  const [paywallConv, setPaywallConv] = useState(((initial.webConv + initial.appConv) / 2).toFixed(1));
  const [monthlySpend, setMonthlySpend] = useState(Math.round(initial.totalBudget / Math.max(1, initial.testLengthMonths)));
  const [arppu, setArppu] = useState<number | ''>('');

  const handleSave = () => {
    const next: Inputs = structuredClone(initial);
    next.churnM = churnM;
    next.renewal = renewal;
    next.webCPA = cpa;
    next.appCPA = cpa;
    const conv = parseFloat(String(paywallConv)) || initial.webConv;
    next.webConv = conv;
    next.appConv = conv;
    // Monthly spend × testLength → totalBudget
    next.totalBudget = monthlySpend * next.testLengthMonths;
    // If ARPPU given, scale all plan fullPrice & introPrice proportionally
    if (typeof arppu === 'number' && arppu > 0) {
      const currentArppu = initial.plans.reduce((s, p) => {
        const share = p.share;
        return s + (initial.introPricing ? p.introPrice : p.fullPrice) * share;
      }, 0) / 100;
      const factor = currentArppu > 0 ? arppu / currentArppu : 1;
      next.plans = next.plans.map((p) => ({
        ...p,
        introPrice: +(p.introPrice * factor).toFixed(2),
        fullPrice: +(p.fullPrice * factor).toFixed(2)
      }));
    }
    onSave(next);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm grid place-items-center p-6" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-[var(--radius-xl)] bg-[var(--color-surface-1)] border border-[var(--color-border)] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between p-5 border-b border-[var(--color-border-subtle)]">
          <div className="flex items-center gap-2">
            <Bookmark size={18} weight="duotone" className="text-[var(--color-accent-300)]" />
            <div>
              <h2 className="font-semibold text-[15px] tracking-tight">Your actual situation <span className="text-[11px] font-normal text-[var(--color-text-3)]">— optional</span></h2>
              <p className="text-[11px] text-[var(--color-text-3)]">Fill only the numbers you know. For the rest we keep the niche defaults.</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[var(--color-text-3)] hover:text-[var(--color-text)]" aria-label="close">
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Monthly Churn" hint="leave as-is to skip">
              <NumField value={churnM} onChange={setChurnM} step={1} min={0} max={100} suffix="%" />
            </Field>
            <Field label="Yearly Renewal" hint="leave as-is to skip">
              <NumField value={renewal} onChange={setRenewal} step={1} min={0} max={100} suffix="%" />
            </Field>
            <Field label="Blended CPA" hint="actual average">
              <NumField value={cpa} onChange={setCpa} step={1} min={0} prefix="$" />
            </Field>
            <Field label="Paywall Conv" hint="% of sessions">
              <NumField value={parseFloat(paywallConv as string) || 0} onChange={(v) => setPaywallConv(v.toString())} step={0.1} min={0} max={100} suffix="%" />
            </Field>
            <Field label="Monthly spend" hint="actual $ / month">
              <NumField value={monthlySpend} onChange={setMonthlySpend} step={500} min={0} prefix="$" />
            </Field>
            <Field label="ARPPU" hint="leave 0 to auto-derive">
              <NumField value={typeof arppu === 'number' ? arppu : 0} onChange={setArppu} step={1} min={0} prefix="$" />
            </Field>
          </div>

          <div className="pt-1 text-[11px] text-[var(--color-text-3)] leading-snug">
            Not sure? Just hit <b>Skip</b> — you can always save a baseline later from the Health Score bar.
          </div>
        </div>

        <div className="p-4 bg-[var(--color-surface-2)] border-t border-[var(--color-border-subtle)] flex items-center justify-between gap-2">
          <button onClick={onClose} className="px-4 py-2 text-[12px] text-[var(--color-text-2)] hover:text-[var(--color-text)]">
            Skip
          </button>
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-semibold bg-gradient-to-br from-[var(--color-accent-500)] to-[var(--color-accent-700)] text-white shadow-md hover:shadow-lg"
          >
            <Bookmark size={13} weight="duotone" /> Save baseline
          </button>
        </div>
      </div>
    </div>
  );
}
