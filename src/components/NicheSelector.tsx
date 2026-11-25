import { nichesFor } from '../engine/niches';
import type { Mode } from '../engine/types';

interface NicheSelectorProps {
  mode: Mode;
  value: string;
  onChange: (id: string) => void;
}

export function NicheSelector({ mode, value, onChange }: NicheSelectorProps) {
  const niches = nichesFor(mode);
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] font-semibold tracking-wider uppercase text-[var(--color-text-3)] hidden md:inline">
        Niche
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-[var(--color-surface-1)] border border-[var(--color-border-subtle)] rounded-full px-3 py-1 text-[11px] font-medium focus:outline-none focus:border-[var(--color-accent-500)] max-w-[220px]"
      >
        {niches.map((n) => (
          <option key={n.id} value={n.id}>{n.label}</option>
        ))}
      </select>
    </div>
  );
}
