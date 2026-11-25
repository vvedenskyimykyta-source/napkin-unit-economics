import type { ReactNode } from 'react';
import { CaretDown } from '@phosphor-icons/react';
import { useState } from 'react';
import { clsx } from 'clsx';

interface PanelProps {
  title: ReactNode;
  icon?: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
}

export function Panel({ title, icon, defaultOpen = true, children }: PanelProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="border-b border-[var(--color-border-subtle)] last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-4 py-2.5 text-left hover:bg-[var(--color-surface-1)] transition-colors"
      >
        {icon && <span className="text-[var(--color-text-3)]">{icon}</span>}
        <span className="flex-1 text-[12px] font-semibold tracking-tight">{title}</span>
        <CaretDown size={12} weight="bold" className={clsx('text-[var(--color-text-3)] transition-transform', !open && '-rotate-90')} />
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-3">{children}</div>
      )}
    </section>
  );
}
