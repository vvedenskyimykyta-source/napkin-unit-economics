import type { Inputs, Plan } from '../engine/types';
import type { I18N } from '../i18n/strings';
import { Panel } from './Panel';
import { Field, NumField, Slider, Switch } from './fields';
import { PROCESSORS, processorById } from '../engine/processors';
import { PERIODS, matchPeriod } from '../engine/periods';
import { nicheById } from '../engine/niches';
import {
  CurrencyDollar, CreditCard, TrendDown, Coins, Target, Rocket, Trash
} from '@phosphor-icons/react';

interface SidebarProps {
  inputs: Inputs;
  set: <K extends keyof Inputs>(k: K, v: Inputs[K]) => void;
  t: I18N;
}

const ICON = { size: 15, weight: 'duotone' as const };

export function Sidebar({ inputs, set, t }: SidebarProps) {
  const isSaas = inputs.mode === 'saas';
  const niche = nicheById(inputs.niche);
  const b = niche?.bench;

  const setUpsell = (kind: 'd0' | 'packs', patch: Partial<typeof inputs.upsells.d0>) => {
    set('upsells', { ...inputs.upsells, [kind]: { ...inputs.upsells[kind], ...patch } });
  };

  const updatePlan = (id: string, patch: Partial<Plan>) => {
    set('plans', inputs.plans.map((p) => p.id === id ? { ...p, ...patch } : p));
  };
  const addPlan = () => {
    const newId = 'plan-' + Date.now();
    set('plans', [...inputs.plans, {
      id: newId, label: 'New plan', periodMonths: 1, introPrice: 9.99, fullPrice: 14.99, share: 0
    }]);
  };
  const removePlan = (id: string) => {
    if (inputs.plans.length <= 1) return;
    set('plans', inputs.plans.filter((p) => p.id !== id));
  };

  const pickProcessor = (id: string) => {
    const proc = processorById(id);
    set('processor', id);
    if (id !== 'custom') set('storeFee', proc.fee);
  };

  return (
    <aside className="hidden lg:flex flex-col border-r border-[var(--color-border-subtle)] bg-[var(--color-surface-0)] overflow-y-auto">
      <Panel title={t.pBudget} icon={<CurrencyDollar {...ICON} />}>
        <Field label={t.totalBudget}>
          <NumField value={inputs.totalBudget} onChange={(v) => set('totalBudget', v)} step={1000} min={0} prefix="$" />
        </Field>
      </Panel>

      <Panel title={t.pPricing} icon={<CreditCard {...ICON} />}>
        <Switch
          checked={inputs.introPricing}
          onChange={(v) => set('introPricing', v)}
          label={t.introPricing}
        />
        <div className="space-y-2">
          {inputs.plans.map((p) => (
            <PlanRow
              key={p.id}
              plan={p}
              showIntro={inputs.introPricing}
              onChange={(patch) => updatePlan(p.id, patch)}
              onRemove={() => removePlan(p.id)}
              canRemove={inputs.plans.length > 1}
            />
          ))}
          <button
            type="button"
            onClick={addPlan}
            className="w-full py-1.5 text-[11px] font-medium text-[var(--color-text-3)] rounded-[var(--radius-xs)] border border-dashed border-[var(--color-border)] hover:border-[var(--color-accent-500)]/50 hover:text-[var(--color-text-2)]"
          >
            + Add plan
          </button>
        </div>
      </Panel>

      <Panel title={t.pRetention} icon={<TrendDown {...ICON} />}>
        <Field label={t.renewal} hint="period ≥ 12 mo">
          <Slider value={inputs.renewal} onChange={(v) => set('renewal', v)} min={10} max={98}
            band={b ? b.yearlyRenewal : undefined} />
        </Field>
        <Field label={t.churnM} hint="period 1–11 mo">
          <Slider value={inputs.churnM} onChange={(v) => set('churnM', v)} min={1} max={80}
            band={b ? b.monthlyChurn : undefined} />
        </Field>
        {!isSaas && (
          <Field label={t.churnW} hint="period < 1 mo">
            <Slider value={inputs.churnW} onChange={(v) => set('churnW', v)} min={5} max={90} />
          </Field>
        )}
      </Panel>

      <Panel title={t.pCosts} icon={<Coins {...ICON} />}>
        <Field label="Payment processor">
          <Select
            value={inputs.processor}
            onChange={pickProcessor}
            options={PROCESSORS.map((p) => ({ value: p.id, label: p.label, note: p.note }))}
          />
        </Field>
        <Field label={`Effective fee (${inputs.processor === 'custom' ? 'manual' : 'auto'})`}>
          <Slider
            value={inputs.storeFee}
            onChange={(v) => { set('storeFee', v); set('processor', 'custom'); }}
            min={0} max={35}
          />
        </Field>
        <Field label={t.refundRate}>
          <Slider value={inputs.refundRate} onChange={(v) => set('refundRate', v)} min={0} max={20} />
        </Field>
        <Field label={t.cogs}>
          <NumField value={inputs.cogs} onChange={(v) => set('cogs', v)} step={0.1} prefix="$" min={0} />
        </Field>
      </Panel>

      <Panel title={t.pTraffic} icon={<Target {...ICON} />}>
        <ChannelBlock
          name={t.web}
          enabled={inputs.channels.web}
          onToggle={(v) => set('channels', { ...inputs.channels, web: v })}
          share={inputs.webShare} onShare={(v) => set('webShare', v)}
          cpa={inputs.webCPA} onCpa={(v) => set('webCPA', v)}
          conv={inputs.webConv} onConv={(v) => set('webConv', v)}
          cpaBand={b ? b.cpa : undefined}
          convBand={b ? b.paywallConv : undefined}
          t={t}
        />
        <ChannelBlock
          name={t.app}
          enabled={inputs.channels.app}
          onToggle={(v) => set('channels', { ...inputs.channels, app: v })}
          share={inputs.appShare} onShare={(v) => set('appShare', v)}
          cpa={inputs.appCPA} onCpa={(v) => set('appCPA', v)}
          conv={inputs.appConv} onConv={(v) => set('appConv', v)}
          cpaBand={b ? b.cpa : undefined}
          convBand={b ? b.paywallConv : undefined}
          t={t}
        />
        <Field label={<span>{t.organic} <span className="text-[var(--color-text-3)]">({t.organicSub})</span></span>}>
          <Slider value={inputs.organic} onChange={(v) => set('organic', v)} min={0} max={80} />
        </Field>
        <Field label={<span>{t.email} <span className="text-[var(--color-text-3)]">({t.emailSub})</span></span>}>
          <Slider value={inputs.email} onChange={(v) => set('email', v)} min={0} max={60} />
        </Field>
      </Panel>

      <Panel title={t.pUpsells} icon={<Rocket {...ICON} />}>
        <UpsellList
          label={<><div className="text-[10px] font-semibold tracking-wider uppercase text-[var(--color-text-3)]">{t.d0Upsells}</div><div className="text-[10px] text-[var(--color-text-dim)]">{t.d0UpsellsSub}</div></>}
          cfg={inputs.upsells.d0}
          onChange={(patch) => setUpsell('d0', patch)}
          addLabel={t.addUpsell}
        />
        <UpsellList
          label={<><div className="text-[10px] font-semibold tracking-wider uppercase text-[var(--color-text-3)]">{t.monthlyPacks}</div><div className="text-[10px] text-[var(--color-text-dim)]">{t.monthlyPacksSub}</div></>}
          cfg={inputs.upsells.packs}
          onChange={(patch) => setUpsell('packs', patch)}
          addLabel={t.addPack}
        />
      </Panel>
    </aside>
  );
}

interface PlanRowProps {
  plan: Plan;
  showIntro: boolean;
  onChange: (patch: Partial<Plan>) => void;
  onRemove: () => void;
  canRemove: boolean;
}

function PlanRow({ plan, showIntro, onChange, onRemove, canRemove }: PlanRowProps) {
  const matched = matchPeriod(plan.periodMonths);
  return (
    <div className="rounded-[var(--radius-sm)] bg-[var(--color-surface-1)] border border-[var(--color-border-subtle)] p-2.5 space-y-2">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={plan.label}
          onChange={(e) => onChange({ label: e.target.value })}
          className="flex-1 bg-transparent text-[12px] font-medium focus:outline-none"
        />
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="w-5 h-5 grid place-items-center text-[var(--color-text-dim)] hover:text-[var(--color-bad)]"
            aria-label="remove plan"
          >
            <Trash size={11} weight="duotone" />
          </button>
        )}
      </div>

      <Field label="Period">
        <Select
          value={matched?.id ?? 'custom'}
          onChange={(id) => {
            const preset = PERIODS.find((p) => p.id === id);
            if (preset) onChange({ periodMonths: preset.periodMonths });
          }}
          options={[
            ...PERIODS.map((p) => ({ value: p.id, label: p.label })),
            { value: 'custom', label: `Custom (${plan.periodMonths.toFixed(2)} mo)` }
          ]}
        />
      </Field>

      <div className={showIntro ? 'grid grid-cols-2 gap-2' : 'grid grid-cols-1'}>
        {showIntro && (
          <Field label="First payment">
            <NumField value={plan.introPrice} onChange={(v) => onChange({ introPrice: v })} step={1} prefix="$" min={0} />
          </Field>
        )}
        <Field label={showIntro ? 'Rebill' : 'Price'}>
          <NumField value={plan.fullPrice} onChange={(v) => onChange({ fullPrice: v })} step={1} prefix="$" min={0} />
        </Field>
      </div>

      <Field label="Share %">
        <Slider value={plan.share} onChange={(v) => onChange({ share: v })} />
      </Field>
    </div>
  );
}

interface SelectOpt { value: string; label: string; note?: string; }
function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: SelectOpt[] }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-[var(--radius-sm)] px-2.5 py-1.5 text-[12px] focus:outline-none focus:border-[var(--color-accent-500)]"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}{o.note ? ` — ${o.note}` : ''}</option>
      ))}
    </select>
  );
}

interface ChannelBlockProps {
  name: string;
  enabled: boolean;
  onToggle: (v: boolean) => void;
  share: number; onShare: (v: number) => void;
  cpa: number; onCpa: (v: number) => void;
  conv: number; onConv: (v: number) => void;
  cpaBand?: { low: number; mid: number; high: number };
  convBand?: { low: number; mid: number; high: number };
  t: I18N;
}
function ChannelBlock({ name, enabled, onToggle, share, onShare, cpa, onCpa, conv, onConv, cpaBand, convBand, t }: ChannelBlockProps) {
  return (
    <div className="rounded-[var(--radius-sm)] bg-[var(--color-surface-1)] border border-[var(--color-border-subtle)] p-2.5 space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold">{name}</span>
        <Switch checked={enabled} onChange={onToggle} />
      </div>
      <div className={enabled ? '' : 'opacity-40 pointer-events-none'}>
        <Field label={t.budgetShare}>
          <Slider value={share} onChange={onShare} />
        </Field>
        <div className="grid grid-cols-2 gap-2 mt-2">
          <Field label={t.cpa}>
            <NumField value={cpa} onChange={onCpa} step={1} prefix="$" />
            {cpaBand && (
              <div className="text-[10px] mono text-[var(--color-info)]/70 mt-1">
                niche ${cpaBand.low}–${cpaBand.high}
              </div>
            )}
          </Field>
          <Field label={t.paywallConv}>
            <NumField value={conv} onChange={onConv} step={0.1} />
            {convBand && (
              <div className="text-[10px] mono text-[var(--color-info)]/70 mt-1">
                niche {convBand.low}–{convBand.high}%
              </div>
            )}
          </Field>
        </div>
      </div>
    </div>
  );
}

interface UpsellListProps {
  label: React.ReactNode;
  cfg: { enabled: boolean; items: { price: number; conv: number }[] };
  onChange: (patch: Partial<UpsellListProps['cfg']>) => void;
  addLabel: string;
}
function UpsellList({ label, cfg, onChange, addLabel }: UpsellListProps) {
  const upd = (idx: number, field: 'price' | 'conv', v: number) => {
    const items = cfg.items.map((it, i) => i === idx ? { ...it, [field]: v } : it);
    onChange({ items });
  };
  const add = () => onChange({ items: [...cfg.items, { price: 9.99, conv: 5 }] });
  const del = (idx: number) => {
    if (cfg.items.length <= 1) return;
    onChange({ items: cfg.items.filter((_, i) => i !== idx) });
  };
  return (
    <div className="rounded-[var(--radius-sm)] bg-[var(--color-surface-1)] border border-[var(--color-border-subtle)] p-2.5 space-y-2">
      <div className="flex items-center justify-between">
        <div>{label}</div>
        <Switch checked={cfg.enabled} onChange={(v) => onChange({ enabled: v })} />
      </div>
      <div className={cfg.enabled ? 'space-y-1.5' : 'opacity-40 pointer-events-none space-y-1.5'}>
        {cfg.items.map((it, i) => (
          <div key={i} className="grid grid-cols-[1fr_1fr_24px] gap-1.5 items-center">
            <NumField value={it.price} onChange={(v) => upd(i, 'price', v)} step={0.5} prefix="$" />
            <NumField value={it.conv} onChange={(v) => upd(i, 'conv', v)} step={0.5} />
            <button
              type="button"
              onClick={() => del(i)}
              className="w-6 h-6 rounded-[var(--radius-xs)] text-[var(--color-text-3)] hover:bg-[var(--color-bad-bg)] hover:text-[var(--color-bad)] text-sm"
              aria-label="delete"
            >
              ×
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={add}
          className="w-full py-1.5 text-[11px] font-medium text-[var(--color-text-3)] rounded-[var(--radius-xs)] border border-dashed border-[var(--color-border)] hover:border-[var(--color-accent-500)]/50 hover:text-[var(--color-text-2)]"
        >
          + {addLabel}
        </button>
      </div>
    </div>
  );
}
