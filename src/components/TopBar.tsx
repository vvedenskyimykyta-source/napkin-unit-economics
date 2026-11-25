import { DeviceMobile, Browsers, Info, Question } from '@phosphor-icons/react';
import { useState } from 'react';
import type { Mode } from '../engine/types';
import type { I18N, Lang } from '../i18n/strings';
import { clsx } from 'clsx';

interface TopBarProps {
  mode: Mode;
  onModeChange: (m: Mode) => void;
  lang: Lang;
  onLangChange: (l: Lang) => void;
  onHelp: () => void;
  t: I18N;
  rightExtra?: React.ReactNode;
  children?: React.ReactNode;
}

export function TopBar({ mode, onModeChange, lang, onLangChange, onHelp, t, rightExtra, children }: TopBarProps) {
  return (
    <header className="border-b border-[var(--color-border-subtle)] bg-[var(--color-surface-0)]/80 backdrop-blur-md sticky top-0 z-40">
      <div className="h-16 px-5 lg:px-8 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <span className="text-[22px] leading-none" role="img" aria-label="calculator">🧮</span>
          <span className="font-semibold text-[16px] tracking-tight">Napkin</span>
        </div>

        {/* Center: Mode toggle (prominent) */}
        <div className="flex-1 flex justify-center">
          <ModeToggle mode={mode} onChange={onModeChange} t={t} />
        </div>

        {/* Right: lang + extras + help */}
        <div className="flex items-center gap-2">
          <LangToggle lang={lang} onChange={onLangChange} />
          <button
            onClick={onHelp}
            className="w-8 h-8 grid place-items-center rounded-full bg-[var(--color-surface-1)] border border-[var(--color-border-subtle)] text-[var(--color-text-3)] hover:text-[var(--color-text)] hover:border-[var(--color-border)]"
            title="How to use Napkin"
            aria-label="help"
          >
            <Question size={14} weight="duotone" />
          </button>
          {rightExtra}
        </div>
      </div>

      {/* Second row: niche selector with info */}
      {children && (
        <div className="px-5 lg:px-8 pb-3 flex items-center justify-center gap-3">
          {children}
        </div>
      )}
    </header>
  );
}

function LangToggle({ lang, onChange }: { lang: Lang; onChange: (l: Lang) => void }) {
  return (
    <div className="inline-flex p-1 rounded-full bg-[var(--color-surface-1)] border border-[var(--color-border-subtle)]">
      <button
        onClick={() => onChange('en')}
        className={clsx(
          'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wider uppercase transition',
          lang === 'en' ? 'bg-[var(--color-surface-3)] text-[var(--color-text)]' : 'text-[var(--color-text-3)] hover:text-[var(--color-text-2)]'
        )}
      >
        <span aria-hidden>🇺🇸</span> EN
      </button>
      <button
        onClick={() => onChange('uk')}
        className={clsx(
          'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wider uppercase transition',
          lang === 'uk' ? 'bg-[var(--color-surface-3)] text-[var(--color-text)]' : 'text-[var(--color-text-3)] hover:text-[var(--color-text-2)]'
        )}
      >
        <span aria-hidden>🇺🇦</span> UK
      </button>
    </div>
  );
}

interface ModeToggleProps {
  mode: Mode;
  onChange: (m: Mode) => void;
  t: I18N;
}

function ModeToggle({ mode, onChange, t }: ModeToggleProps) {
  // v2.1: bigger, more prominent, centered
  return (
    <div className="inline-flex p-1 rounded-full bg-[var(--color-surface-1)] border border-[var(--color-border)] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <button
        onClick={() => onChange('mobile')}
        className={clsx(
          'px-5 py-2 rounded-full text-[13px] font-semibold flex items-center gap-2 transition-all',
          mode === 'mobile'
            ? 'bg-gradient-to-br from-[var(--color-accent-500)] to-[var(--color-accent-700)] text-white shadow-md'
            : 'text-[var(--color-text-3)] hover:text-[var(--color-text-2)]'
        )}
      >
        <DeviceMobile size={16} weight="duotone" />
        {t.modeMobile}
      </button>
      <button
        onClick={() => onChange('saas')}
        className={clsx(
          'px-5 py-2 rounded-full text-[13px] font-semibold flex items-center gap-2 transition-all',
          mode === 'saas'
            ? 'bg-gradient-to-br from-[var(--color-accent-500)] to-[var(--color-accent-700)] text-white shadow-md'
            : 'text-[var(--color-text-3)] hover:text-[var(--color-text-2)]'
        )}
      >
        <Browsers size={16} weight="duotone" />
        {t.modeSaas}
      </button>
    </div>
  );
}

export function NicheHeaderWrap({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center gap-2">{children}</div>;
}

export function InfoTip({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-flex">
      <button
        type="button"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onClick={() => setOpen((v) => !v)}
        className="w-4 h-4 grid place-items-center text-[var(--color-text-3)] hover:text-[var(--color-text-2)]"
        aria-label="info"
      >
        <Info size={14} weight="duotone" />
      </button>
      {open && (
        <span className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-[280px] rounded-[var(--radius)] bg-[var(--color-surface-2)] border border-[var(--color-border)] px-3 py-2 text-[12px] leading-snug text-[var(--color-text-2)] shadow-lg z-50">
          {text}
        </span>
      )}
    </span>
  );
}
