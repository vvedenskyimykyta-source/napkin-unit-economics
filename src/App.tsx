import { useMemo, useState } from 'react';
import { compute } from './engine/calc';
import { getPreset, type Mode } from './engine/presets';
import type { Inputs } from './engine/types';
import { strings, type Lang } from './i18n/strings';
import { TopBar } from './components/TopBar';
import { Sidebar } from './components/Sidebar';
import { KPITiles } from './components/KPITiles';

export default function App() {
  const [mode, setMode] = useState<Mode>('mobile');
  const [lang, setLang] = useState<Lang>('en');
  const [inputs, setInputs] = useState<Inputs>(() => getPreset('mobile'));

  const t = strings(lang);

  const set = <K extends keyof Inputs>(k: K, v: Inputs[K]) => {
    setInputs((prev) => ({ ...prev, [k]: v }));
  };

  const changeMode = (m: Mode) => {
    setMode(m);
    setInputs(getPreset(m));
  };

  const result = useMemo(() => compute(inputs), [inputs]);

  return (
    <div className="min-h-[100dvh] flex flex-col">
      <TopBar mode={mode} onModeChange={changeMode} lang={lang} onLangChange={setLang} t={t} />

      <div className="flex-1 grid lg:grid-cols-[340px_1fr] min-h-0">
        <Sidebar inputs={inputs} set={set} t={t} />

        <main className="bg-[var(--color-surface-0)] overflow-y-auto">
          <div className="max-w-6xl mx-auto p-6 lg:p-10 space-y-8">
            <section>
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
                Napkin Unit Economics
              </h1>
              <p className="text-[var(--color-text-2)] mt-2 max-w-xl">
                {t.tagline}. Punch in budget, pricing, CPA, churn. Get LTV, Payback, cohort break-even.
              </p>
            </section>

            <KPITiles result={result} />

            <section className="text-xs mono text-[var(--color-text-dim)] border border-dashed border-[var(--color-border-subtle)] rounded-[var(--radius)] p-4">
              Phase B complete. Coming next: C (real charts — LTV curve, cohort stacked area, sensitivity heatmap, P&L waterfall), D (flexible plans, payment processors), E (niches + benchmarks), F (baseline vs scenarios), G (B2B SaaS features).
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
