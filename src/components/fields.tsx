import type { ReactNode } from 'react';
import { clsx } from 'clsx';

export function Field({ label, hint, children }: { label: ReactNode; hint?: ReactNode; children: ReactNode }) {
  return (
    <label className="block">
      <div className="flex items-baseline justify-between mb-1.5">
        <span className="text-[11px] font-medium text-[var(--color-text-2)]">{label}</span>
        {hint && <span className="text-[10px] mono text-[var(--color-text-3)]">{hint}</span>}
      </div>
      {children}
    </label>
  );
}

interface NumFieldProps {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  prefix?: string;
}

export function NumField({ value, onChange, min, max, step = 1, prefix }: NumFieldProps) {
  return (
    <div className="relative">
      {prefix && (
        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] text-[var(--color-text-3)] mono pointer-events-none">
          {prefix}
        </span>
      )}
      <input
        type="number"
        value={Number.isFinite(value) ? value : 0}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        min={min}
        max={max}
        step={step}
        className={clsx(
          'w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-[var(--radius-sm)]',
          'px-2.5 py-1.5 text-[13px] mono font-medium',
          'focus:outline-none focus:border-[var(--color-accent-500)] focus:ring-2 focus:ring-[var(--color-accent-500)]/20',
          prefix && 'pl-6'
        )}
      />
    </div>
  );
}

interface SliderProps {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  disabled?: boolean;
}

export function Slider({ value, onChange, min = 0, max = 100, step = 1, suffix = '%', disabled }: SliderProps) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className={clsx('space-y-1.5', disabled && 'opacity-40')}>
      <div className="flex items-center justify-between gap-2">
        <input
          type="range"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          style={{
            background: `linear-gradient(to right,
              var(--color-accent-500) 0%, var(--color-accent-500) ${pct}%,
              var(--color-surface-3) ${pct}%, var(--color-surface-3) 100%)`
          }}
          className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer accent-emerald-500
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-[var(--color-text)]
            [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[var(--color-accent-500)]
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:shadow-md
            [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:h-3.5
            [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[var(--color-text)]
            [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[var(--color-accent-500)]"
        />
        <span className="text-[11px] mono font-medium text-[var(--color-text)] tabular min-w-[42px] text-right">
          {value.toFixed(step < 1 ? 1 : 0)}{suffix}
        </span>
      </div>
    </div>
  );
}

interface SwitchProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: ReactNode;
}

export function Switch({ checked, onChange, label }: SwitchProps) {
  return (
    <label className="inline-flex items-center gap-2 cursor-pointer select-none">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={clsx(
          'relative w-8 h-4 rounded-full transition-colors',
          checked ? 'bg-[var(--color-accent-500)]' : 'bg-[var(--color-surface-3)]'
        )}
      >
        <span
          className={clsx(
            'absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white transition-transform',
            checked && 'translate-x-4'
          )}
        />
      </button>
      {label && <span className="text-[11px] text-[var(--color-text-2)]">{label}</span>}
    </label>
  );
}
