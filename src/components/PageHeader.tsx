import { useState, type ReactNode } from 'react';
import { CalendarDays } from 'lucide-react';
import { formatDate, presetRange, todayISO, type RangePreset } from '../lib/format';
import { JalaliDateInput } from './JalaliDateInput';

export function PageHeader({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children?: ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3 no-print">
      <div>
        <h1 className="text-lg font-extrabold text-slate-900 sm:text-xl">{title}</h1>
        {subtitle ? <p className="mt-1 text-xs text-slate-500">{subtitle}</p> : null}
      </div>
      {children ? <div className="flex flex-wrap items-center gap-2">{children}</div> : null}
    </div>
  );
}

const PRESETS: { value: RangePreset; label: string }[] = [
  { value: 'today', label: 'امروز' },
  { value: 'week', label: 'این هفته' },
  { value: 'month', label: 'این ماه' },
  { value: 'year', label: 'این سال' },
  { value: 'custom', label: 'بازه دلخواه' },
];

export function useDateRange(initial: RangePreset = 'month') {
  const base = todayISO();
  const [preset, setPresetState] = useState<RangePreset>(initial);
  const [range, setRange] = useState(() =>
    initial === 'custom' ? { from: presetRange('month', base).from, to: base } : presetRange(initial as Exclude<RangePreset, 'custom'>, base),
  );

  const setPreset = (p: RangePreset) => {
    setPresetState(p);
    if (p !== 'custom') setRange(presetRange(p as Exclude<RangePreset, 'custom'>, base));
  };

  return {
    ...range,
    preset,
    setPreset,
    setFrom: (from: string) => {
      setPresetState('custom');
      setRange((r) => ({ ...r, from }));
    },
    setTo: (to: string) => {
      setPresetState('custom');
      setRange((r) => ({ ...r, to }));
    },
    label: `${formatDate(range.from)} تا ${formatDate(range.to)}`,
  };
}

export function DateRangeBar({
  from,
  to,
  preset,
  setPreset,
  setFrom,
  setTo,
  extra,
}: {
  from: string;
  to: string;
  preset: RangePreset;
  setPreset: (p: RangePreset) => void;
  setFrom: (v: string) => void;
  setTo: (v: string) => void;
  extra?: ReactNode;
}) {
  return (
    <div className="card card-pad mb-4 no-print">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-wrap gap-1.5">
          {PRESETS.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => setPreset(p.value)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                preset === p.value ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="ms-auto grid grid-cols-2 gap-2">
          <div>
            <span className="label flex items-center gap-1">
              <CalendarDays size={12} /> از تاریخ
            </span>
            <JalaliDateInput value={from} onChange={setFrom} />
          </div>
          <div>
            <span className="label flex items-center gap-1">
              <CalendarDays size={12} /> تا تاریخ
            </span>
            <JalaliDateInput value={to} onChange={setTo} />
          </div>
        </div>
        {extra}
      </div>
    </div>
  );
}
