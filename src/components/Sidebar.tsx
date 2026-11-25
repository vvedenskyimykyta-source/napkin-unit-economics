import type { Inputs } from '../engine/types';
import type { I18N } from '../i18n/strings';
import { Panel } from './Panel';
import { Field, NumField, Slider, Switch } from './fields';
import {
  CurrencyDollar, CreditCard, TrendDown, Coins, Target, Rocket
} from '@phosphor-icons/react';

interface SidebarProps {
  inputs: Inputs;
  set: <K extends keyof Inputs>(k: K, v: Inputs[K]) => void;
  t: I18N;
}

const ICON = { size: 15, weight: 'duotone' as const };

export function Sidebar({ inputs, set, t }: SidebarProps) {
  const isSaas = inputs.mode === 'saas';
  const shareW = isSaas ? 0 : Math.max(0, 100 - inputs.shareYearly - inputs.shareMonthly);

  const setUpsell = (kind: 'd0' | 'packs', patch: Partial<typeof inputs.upsells.d0>) => {
    set('upsells', { ...inputs.upsells, [kind]: { ...inputs.upsells[kind], ...patch } });
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
        {inputs.introPricing && (
          <div className="rounded-[var(--radius-sm)] bg-[var(--color-accent-500)]/10 border border-[var(--color-accent-500)]/30 p-2.5 space-y-2.5">
            <div className="text-[10px] font-semibold tracking-wider uppercase text-[var(--color-accent-300)]">
              {t.firstPayment}
            </div>
            <div className={isSaas ? 'grid grid-cols-2 gap-2' : 'grid grid-cols-3 gap-2'}>
              <Field label={t.yearly}>
                <NumField value={inputs.priceYearlyFirst} onChange={(v) => set('priceYearlyFirst', v)} step={1} prefix="$" />
              </Field>
              <Field label={t.monthly}>
                <NumField value={inputs.priceMonthlyFirst} onChange={(v) => set('priceMonthlyFirst', v)} step={1} prefix="$" />
              </Field>
              {!isSaas && (
                <Field label={t.weekly}>
                  <NumField value={inputs.priceWeeklyFirst} onChange={(v) => set('priceWeeklyFirst', v)} step={0.5} prefix="$" />
                </Field>
              )}
            </div>
          </div>
        )}
        <div className="rounded-[var(--radius-sm)] bg-[var(--color-surface-1)] border border-[var(--color-border-subtle)] p-2.5 space-y-2.5">
          <div className="text-[10px] font-semibold tracking-wider uppercase text-[var(--color-text-3)]">
            {t.rebill}
          </div>
          <div className={isSaas ? 'grid grid-cols-2 gap-2' : 'grid grid-cols-3 gap-2'}>
            <Field label={t.yearly}>
              <NumField value={inputs.priceYearlyFull} onChange={(v) => set('priceYearlyFull', v)} step={1} prefix="$" />
            </Field>
            <Field label={t.monthly}>
              <NumField value={inputs.priceMonthlyFull} onChange={(v) => set('priceMonthlyFull', v)} step={1} prefix="$" />
            </Field>
            {!isSaas && (
              <Field label={t.weekly}>
                <NumField value={inputs.priceWeeklyFull} onChange={(v) => set('priceWeeklyFull', v)} step={0.5} prefix="$" />
              </Field>
            )}
          </div>
        </div>

        <div className="pt-1 space-y-2.5">
          <div className="text-[10px] font-semibold tracking-wider uppercase text-[var(--color-text-3)]">
            {t.planMix}
          </div>
          <Field label={`${t.yearly} %`}>
            <Slider value={inputs.shareYearly} onChange={(v) => set('shareYearly', v)} />
          </Field>
          <Field label={`${t.monthly} %`}>
            <Slider value={inputs.shareMonthly} onChange={(v) => set('shareMonthly', v)} />
          </Field>
          {!isSaas && (
            <Field label={`${t.weekly} %`}>
              <Slider value={shareW} onChange={() => {}} disabled />
            </Field>
          )}
        </div>
      </Panel>

      <Panel title={t.pRetention} icon={<TrendDown {...ICON} />}>
        <Field label={t.renewal}>
          <Slider value={inputs.renewal} onChange={(v) => set('renewal', v)} min={10} max={98} />
        </Field>
        <Field label={t.churnM}>
          <Slider value={inputs.churnM} onChange={(v) => set('churnM', v)} min={1} max={80} />
        </Field>
        {!isSaas && (
          <Field label={t.churnW}>
            <Slider value={inputs.churnW} onChange={(v) => set('churnW', v)} min={5} max={90} />
          </Field>
        )}
      </Panel>

      <Panel title={t.pCosts} icon={<Coins {...ICON} />}>
        <Field label={isSaas ? t.storeFeeSaas : t.storeFeeMobile}>
          <Slider value={inputs.storeFee} onChange={(v) => set('storeFee', v)} min={0} max={isSaas ? 10 : 30} />
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
          t={t}
        />
        <ChannelBlock
          name={t.app}
          enabled={inputs.channels.app}
          onToggle={(v) => set('channels', { ...inputs.channels, app: v })}
          share={inputs.appShare} onShare={(v) => set('appShare', v)}
          cpa={inputs.appCPA} onCpa={(v) => set('appCPA', v)}
          conv={inputs.appConv} onConv={(v) => set('appConv', v)}
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
          isPack
        />
      </Panel>
    </aside>
  );
}

interface ChannelBlockProps {
  name: string;
  enabled: boolean;
  onToggle: (v: boolean) => void;
  share: number; onShare: (v: number) => void;
  cpa: number; onCpa: (v: number) => void;
  conv: number; onConv: (v: number) => void;
  t: I18N;
}
function ChannelBlock({ name, enabled, onToggle, share, onShare, cpa, onCpa, conv, onConv, t }: ChannelBlockProps) {
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
          </Field>
          <Field label={t.paywallConv}>
            <NumField value={conv} onChange={onConv} step={0.1} />
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
  isPack?: boolean;
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
