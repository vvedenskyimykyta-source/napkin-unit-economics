import { useState } from 'react';
import { compute } from './engine/calc';
import { getPreset, type Mode } from './engine/presets';
import { KPITiles } from './components/KPITiles';
import { TopBar } from './components/TopBar';

export default function App() {
  const [mode, setMode] = useState<Mode>('mobile');
  const inputs = getPreset(mode);
  const result = compute(inputs);

  return (
    <div className="min-h-[100dvh] flex flex-col">
      <TopBar mode={mode} onModeChange={setMode} />

      <div className="flex-1 grid lg:grid-cols-[320px_1fr]">
        <aside className="hidden lg:block border-r border-[var(--color-border-subtle)] bg-[var(--color-surface-0)] p-5">
          <div className="text-sm text-[var(--color-text-3)] mb-3">Inputs sidebar</div>
          <div className="text-xs mono text-[var(--color-text-dim)]">
            Scaffolded. Panels land in Phase B.
          </div>
        </aside>

        <main className="p-6 lg:p-10 bg-[var(--color-surface-0)]">
          <div className="max-w-5xl mx-auto space-y-8">
            <section>
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
                Napkin Unit Economics
              </h1>
              <p className="text-[var(--color-text-2)] mt-2 max-w-xl">
                v2 scaffold. Engine ported, design tokens live, layout stubbed.
              </p>
            </section>

            <KPITiles result={result} />

            <section className="text-xs mono text-[var(--color-text-dim)] border border-dashed border-[var(--color-border-subtle)] rounded-[var(--radius)] p-4">
              Phase A complete. Coming next: B (layout + base components), C (real charts), D (flexible plans + processor picker), E (niches), F (scoring/baseline), G (B2B SaaS features).
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
