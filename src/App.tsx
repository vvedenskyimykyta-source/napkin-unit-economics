import { useMemo, useState } from 'react';
import { compute } from './engine/calc';
import { getPreset, type Mode } from './engine/presets';
import type { Inputs } from './engine/types';
import { strings, type Lang } from './i18n/strings';
import { TopBar } from './components/TopBar';
import { Sidebar } from './components/Sidebar';
import { KPITiles } from './components/KPITiles';
import { Diagnostics } from './components/Diagnostics';
import { Forecast } from './components/Forecast';
import { Targets } from './components/Targets';
import { ChartCard } from './components/ChartCard';
import { LtvCurve } from './components/charts/LtvCurve';
import { CohortArea } from './components/charts/CohortArea';
import { SensHeatmap } from './components/charts/SensHeatmap';
import { PnlBars } from './components/charts/PnlBars';

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
          <div className="max-w-6xl mx-auto p-6 lg:p-10 space-y-6">
            <section>
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
                Napkin Unit Economics
              </h1>
              <p className="text-[var(--color-text-2)] mt-2 max-w-xl text-sm">
                {t.tagline}. Punch in budget, pricing, CPA, churn. Get LTV, Payback, cohort break-even.
              </p>
            </section>

            <KPITiles result={result} />
            <Diagnostics result={result} />
            <Forecast result={result} t={t} />

            <div className="grid lg:grid-cols-2 gap-4">
              <ChartCard title={t.sLTV} sub={t.sLTVSub}>
                <LtvCurve result={result} />
              </ChartCard>
              <ChartCard title={t.sBE} sub={t.sBESub}>
                <CohortArea result={result} />
              </ChartCard>
            </div>

            <Targets result={result} t={t} />

            <ChartCard title={t.sPnL} sub={t.sPnLSub}>
              <PnlBars result={result} />
            </ChartCard>

            <ChartCard title={t.sSens} sub={t.sSensSub}>
              <SensHeatmap result={result} />
            </ChartCard>
          </div>
        </main>
      </div>
    </div>
  );
}
