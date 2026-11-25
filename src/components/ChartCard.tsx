import type { ReactNode } from 'react';

interface ChartCardProps {
  title: string;
  sub?: string;
  children: ReactNode;
}

export function ChartCard({ title, sub, children }: ChartCardProps) {
  return (
    <section className="rounded-[var(--radius-md)] bg-[var(--color-surface-1)] border border-[var(--color-border-subtle)] p-5">
      <div className="mb-3">
        <h3 className="text-[13px] font-semibold tracking-tight">{title}</h3>
        {sub && <p className="text-[11px] text-[var(--color-text-3)]">{sub}</p>}
      </div>
      {children}
    </section>
  );
}
