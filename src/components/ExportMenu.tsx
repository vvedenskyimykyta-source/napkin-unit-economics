import { useState, useRef, useEffect } from 'react';
import { DownloadSimple, Image, Code, CaretDown } from '@phosphor-icons/react';
import { toPng } from 'html-to-image';
import type { Inputs } from '../engine/types';

interface ExportMenuProps {
  inputs: Inputs;
  targetSelector: string;  // CSS selector of the element to screenshot
}

export function ExportMenu({ inputs, targetSelector }: ExportMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener('mousedown', onClick);
    return () => window.removeEventListener('mousedown', onClick);
  }, [open]);

  const stamp = () => {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}`;
  };

  const downloadFile = (data: string | Blob, filename: string, mime?: string) => {
    const blob = typeof data === 'string' ? new Blob([data], { type: mime || 'text/plain' }) : data;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const exportJson = () => {
    const payload = {
      version: 'napkin-v2.1',
      exportedAt: new Date().toISOString(),
      inputs
    };
    downloadFile(JSON.stringify(payload, null, 2), `napkin-${stamp()}.json`, 'application/json');
    setOpen(false);
  };

  const exportPng = async () => {
    const el = document.querySelector(targetSelector) as HTMLElement | null;
    if (!el) return;
    try {
      const dataUrl = await toPng(el, {
        pixelRatio: 2,
        backgroundColor: getComputedStyle(document.body).getPropertyValue('background-color') || '#0B0F14',
        cacheBust: true
      });
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `napkin-${stamp()}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error('PNG export failed', err);
      alert('PNG export failed. Try JSON instead.');
    }
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[var(--color-surface-1)] border border-[var(--color-border-subtle)] text-[12px] font-medium text-[var(--color-text-2)] hover:text-[var(--color-text)] hover:border-[var(--color-border)]"
      >
        <DownloadSimple size={13} weight="duotone" />
        Export
        <CaretDown size={10} weight="bold" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-44 rounded-[var(--radius)] bg-[var(--color-surface-2)] border border-[var(--color-border)] shadow-xl overflow-hidden z-50">
          <button onClick={exportPng} className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-left hover:bg-[var(--color-surface-3)]">
            <Image size={14} weight="duotone" />
            PNG snapshot
          </button>
          <button onClick={exportJson} className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-left hover:bg-[var(--color-surface-3)]">
            <Code size={14} weight="duotone" />
            JSON config
          </button>
        </div>
      )}
    </div>
  );
}
