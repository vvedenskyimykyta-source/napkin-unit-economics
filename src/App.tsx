import { useEffect, useMemo, useState } from 'react';
import { compute } from './engine/calc';
import { getPreset, applyNiche, type Mode } from './engine/presets';
import type { Inputs } from './engine/types';
import { strings, type Lang } from './i18n/strings';
import { TopBar } from './components/TopBar';
import { Sidebar } from './components/Sidebar';
import { NicheSelector } from './components/NicheSelector';
import { KPITiles } from './components/KPITiles';
import { Diagnostics } from './components/Diagnostics';
import { Forecast } from './components/Forecast';
import { Targets } from './components/Targets';
import { ChartCard } from './components/ChartCard';
import { LtvCurve } from './components/charts/LtvCurve';
import { CohortArea } from './components/charts/CohortArea';
import { SensHeatmap } from './components/charts/SensHeatmap';
import { PnlBars } from './components/charts/PnlBars';
import { Waterfall } from './components/charts/Waterfall';
import { CohortStack } from './components/charts/CohortStack';
import { BaselineBar } from './components/BaselineBar';
import { OnboardingWizard } from './components/OnboardingWizard';
import { BaselineModal } from './components/BaselineModal';
import { InstructionsDrawer } from './components/InstructionsDrawer';
import { ExportMenu } from './components/ExportMenu';

const LS_BASELINE = 'napkin.baseline.v1';
const LS_SIDEBAR_WIDTH = 'napkin.sidebarWidth.v1';
const LS_ONBOARDED = 'napkin.onboarded.v1';
const LS_THEME = 'napkin.theme.v1';

type Theme = 'dark' | 'light';

export default function App() {
  const [mode, setMode] = useState<Mode>('mobile');
  const [lang, setLang] = useState<Lang>('en');
  const [inputs, setInputs] = useState<Inputs>(() => getPreset('mobile'));
  const [sidebarWidth, setSidebarWidth] = useState<number>(() => {
    try {
      const raw = localStorage.getItem(LS_SIDEBAR_WIDTH);
      return raw ? parseInt(raw, 10) || 340 : 340;
    } catch { return 340; }
  });
  const updateSidebarWidth = (w: number) => {
    setSidebarWidth(w);
    try { localStorage.setItem(LS_SIDEBAR_WIDTH, String(w)); } catch {}
  };
  const [baselineInputs, setBaselineInputs] = useState<Inputs | null>(() => {
    try {
      const raw = localStorage.getItem(LS_BASELINE);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [onboarded, setOnboarded] = useState<boolean>(() => {
    try { return localStorage.getItem(LS_ONBOARDED) === '1'; } catch { return false; }
  });
  const [theme, setThemeState] = useState<Theme>(() => {
    try { return (localStorage.getItem(LS_THEME) as Theme) || 'dark'; } catch { return 'dark'; }
  });
  const setTheme = (t: Theme) => {
    setThemeState(t);
    try { localStorage.setItem(LS_THEME, t); } catch {}
    document.documentElement.setAttribute('data-theme', t);
  };
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);
  const [baselineModalOpen, setBaselineModalOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  const t = strings(lang);

  const set = <K extends keyof Inputs>(k: K, v: Inputs[K]) => {
    setInputs((prev) => ({ ...prev, [k]: v }));
  };

  const changeMode = (m: Mode) => {
    setMode(m);
    setInputs(getPreset(m));
  };

  const changeNiche = (nicheId: string) => {
    setInputs((prev) => applyNiche(prev, nicheId));
  };

  const clearBaseline = () => {
    setBaselineInputs(null);
    try { localStorage.removeItem(LS_BASELINE); } catch {}
  };
  const saveBaselineFromModal = (next: Inputs) => {
    setBaselineInputs(next);
    try { localStorage.setItem(LS_BASELINE, JSON.stringify(next)); } catch {}
    setBaselineModalOpen(false);
  };

  const finishOnboarding = (m: Mode, nicheId: string) => {
    setMode(m);
    setInputs(applyNiche(getPreset(m), nicheId));
    setOnboarded(true);
    try { localStorage.setItem(LS_ONBOARDED, '1'); } catch {}
  };

  const result = useMemo(() => compute(inputs), [inputs]);
  const baselineResult = useMemo(
    () => baselineInputs ? compute(baselineInputs) : null,
    [baselineInputs]
  );

  // Keep mode in sync when baseline is restored from localStorage
  useEffect(() => {
    if (baselineInputs && baselineInputs.mode !== mode) {
      // noop — baseline can be from a different mode; comparison still useful
    }
  }, [baselineInputs, mode]);

  return (
    <div className="min-h-[100dvh] flex flex-col">
      {!onboarded && <OnboardingWizard onDone={finishOnboarding} />}
      {baselineModalOpen && (
        <BaselineModal initial={inputs} onSave={saveBaselineFromModal} onClose={() => setBaselineModalOpen(false)} />
      )}
      {helpOpen && <InstructionsDrawer onClose={() => setHelpOpen(false)} />}

      <TopBar
        mode={mode}
        onModeChange={changeMode}
        lang={lang}
        onLangChange={setLang}
        onHelp={() => setHelpOpen(true)}
        theme={theme}
        onThemeChange={setTheme}
        t={t}
        rightExtra={<ExportMenu inputs={inputs} targetSelector="#napkin-canvas" />}
      >
        <NicheSelector mode={mode} value={inputs.niche} onChange={changeNiche} />
      </TopBar>

      <div className="flex-1 flex min-h-0">
        <Sidebar inputs={inputs} set={set} t={t} width={sidebarWidth} onWidthChange={updateSidebarWidth} />

        <main className="flex-1 bg-[var(--color-surface-0)] overflow-y-auto">
          <div id="napkin-canvas" className="max-w-6xl mx-auto p-6 lg:p-10 space-y-6">
            <section>
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
                Napkin Unit Economics
              </h1>
              <p className="text-[var(--color-text-2)] mt-2 max-w-xl text-sm">
                {t.tagline}. Punch in budget, pricing, CPA, churn. Get LTV, Payback, cohort break-even.
              </p>
            </section>

            <BaselineBar
              current={result}
              baseline={baselineResult}
              onSetBaseline={() => setBaselineModalOpen(true)}
              onClearBaseline={clearBaseline}
            />

            <KPITiles result={result} baseline={baselineResult} />
            <Diagnostics result={result} />
            <Forecast result={result} t={t} />

            <ChartCard title={t.sLTV} sub={t.sLTVSub}>
              <LtvCurve result={result} width={1100} height={280} />
            </ChartCard>

            <ChartCard title="Cohort activity" sub="how each test-month's cohort stays active over time">
              <CohortStack result={result} />
            </ChartCard>

            <ChartCard title={t.sBE} sub={t.sBESub}>
              <CohortArea result={result} width={1100} height={280} />
            </ChartCard>

            <Targets result={result} t={t} />

            <ChartCard title={t.sPnL} sub={t.sPnLSub}>
              <PnlBars result={result} width={1100} height={280} />
            </ChartCard>

            <ChartCard title="Monthly waterfall" sub="gross revenue → net profit, step by step">
              <Waterfall result={result} width={1100} height={300} />
            </ChartCard>

            <ChartCard title={t.sSens} sub={t.sSensSub}>
              <SensHeatmap result={result} />
            </ChartCard>

            <footer className="pt-8 pb-4 border-t border-[var(--color-border-subtle)] flex items-center justify-between gap-3 text-[11px] text-[var(--color-text-3)]">
              <span>
                Built by <a href="https://www.linkedin.com/in/nickvvedenskyi/" target="_blank" rel="noopener" className="text-[var(--color-accent-300)] hover:text-[var(--color-accent-200)] font-medium">Nick Vedensky</a>. MIT.
              </span>
              <a href="https://github.com/vvedenskyimykyta-source/napkin-unit-economics" target="_blank" rel="noopener" className="hover:text-[var(--color-text-2)]">
                GitHub
              </a>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}
