import { DeviceMobile, Browsers } from '@phosphor-icons/react';
import type { Mode } from '../engine/types';
import type { I18N, Lang } from '../i18n/strings';
import { clsx } from 'clsx';

interface TopBarProps {
  mode: Mode;
  onModeChange: (m: Mode) => void;
  lang: Lang;
  onLangChange: (l: Lang) => void;
  t: I18N;
  children?: React.ReactNode;
}

export function TopBar({ mode, onModeChange, lang, onLangChange, t, children }: TopBarProps) {
  return (
    <header className="h-14 border-b border-[var(--color-border-subtle)] bg-[var(--color-surface-0)]/80 backdrop-blur-md sticky top-0 z-40">
      <div className="h-full px-5 lg:px-8 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-md grid place-items-center bg-gradient-to-br from-[var(--color-accent-500)] to-[var(--color-accent-700)] shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 19 V5 L19 19 V5" />
            </svg>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-semibold tracking-tight">Napkin</span>
            <span className="text-xs text-[var(--color-text-3)] mono">v2</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ModeToggle mode={mode} onChange={onModeChange} t={t} />
          {children}
        </div>

        <div className="flex items-center gap-3">
          <LangToggle lang={lang} onChange={onLangChange} />
          <a href="https://github.com/vvedenskyimykyta-source/napkin-unit-economics"
             target="_blank" rel="noopener"
             className="hidden md:inline text-xs text-[var(--color-text-3)] hover:text-[var(--color-text)] transition-colors">
            GitHub
          </a>
        </div>
      </div>
    </header>
  );
}

function LangToggle({ lang, onChange }: { lang: Lang; onChange: (l: Lang) => void }) {
  return (
    <div className="inline-flex p-0.5 rounded-full bg-[var(--color-surface-1)] border border-[var(--color-border-subtle)]">
      {(['en', 'uk'] as const).map((l) => (
        <button
          key={l}
          onClick={() => onChange(l)}
          className={clsx(
            'px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase transition',
            lang === l ? 'bg-[var(--color-surface-3)] text-[var(--color-text)]' : 'text-[var(--color-text-3)] hover:text-[var(--color-text-2)]'
          )}
        >
          {l}
        </button>
      ))}
    </div>
  );
}

interface ModeToggleProps {
  mode: Mode;
  onChange: (m: Mode) => void;
  t: I18N;
}

function ModeToggle({ mode, onChange, t }: ModeToggleProps) {
  return (
    <div className="inline-flex p-1 rounded-full bg-[var(--color-surface-1)] border border-[var(--color-border-subtle)] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
      <button
        onClick={() => onChange('mobile')}
        className={clsx(
          'px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all',
          mode === 'mobile'
            ? 'bg-[var(--color-surface-3)] text-[var(--color-text)] shadow-sm'
            : 'text-[var(--color-text-3)] hover:text-[var(--color-text-2)]'
        )}
      >
        <DeviceMobile size={13} weight="duotone" />
        {t.modeMobile}
      </button>
      <button
        onClick={() => onChange('saas')}
        className={clsx(
          'px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all',
          mode === 'saas'
            ? 'bg-[var(--color-surface-3)] text-[var(--color-text)] shadow-sm'
            : 'text-[var(--color-text-3)] hover:text-[var(--color-text-2)]'
        )}
      >
        <Browsers size={13} weight="duotone" />
        {t.modeSaas}
      </button>
    </div>
  );
}
