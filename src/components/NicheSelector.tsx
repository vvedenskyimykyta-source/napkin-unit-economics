import { nichesFor } from '../engine/niches';
import type { Mode } from '../engine/types';
import { InfoTip } from './TopBar';

interface NicheSelectorProps {
  mode: Mode;
  value: string;
  onChange: (id: string) => void;
}

export function NicheSelector({ mode, value, onChange }: NicheSelectorProps) {
  const niches = nichesFor(mode);
  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] font-semibold tracking-wider uppercase text-[var(--color-text-3)]">
        Niche
      </span>
      <InfoTip text="Picking your niche loads realistic benchmarks for churn, renewal, CPA, pricing and paywall conversion. The sliders will highlight the typical range for your niche." />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-[var(--color-surface-1)] border border-[var(--color-border)] rounded-full px-4 py-2 text-[13px] font-medium focus:outline-none focus:border-[var(--color-accent-500)] max-w-[300px]"
      >
        {niches.map((n) => (
          <option key={n.id} value={n.id}>{n.label}</option>
        ))}
      </select>
    </div>
  );
}
