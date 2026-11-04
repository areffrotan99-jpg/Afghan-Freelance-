import { useMemo } from 'react';
import { JALALI_MONTHS, isoToJalali, jalaliMonthLength, jalaliToISO, todayISO } from '../lib/format';

export function JalaliDateInput({
  value,
  onChange,
  className,
}: {
  value: string;
  onChange: (iso: string) => void;
  className?: string;
}) {
  const parts = useMemo(() => {
    try {
      return isoToJalali(value || todayISO());
    } catch {
      return isoToJalali(todayISO());
    }
  }, [value]);

  const currentYear = isoToJalali(todayISO()).jy;
  const years = useMemo(() => {
    const list: number[] = [];
    for (let y = currentYear - 6; y <= currentYear + 1; y += 1) list.push(y);
    if (!list.includes(parts.jy)) list.push(parts.jy);
    return list.sort((a, b) => a - b);
  }, [currentYear, parts.jy]);

  const update = (jy: number, jm: number, jd: number) => {
    const maxDay = jalaliMonthLength(jy, jm);
    onChange(jalaliToISO(jy, jm, Math.min(jd, maxDay)));
  };

  const days = Array.from({ length: jalaliMonthLength(parts.jy, parts.jm) }, (_, i) => i + 1);

  return (
    <div className={className ? `${className} grid grid-cols-[1fr_1.2fr_1.2fr] gap-1.5` : 'grid grid-cols-[1fr_1.2fr_1.2fr] gap-1.5'}>
      <select className="input px-2" value={parts.jd} onChange={(e) => update(parts.jy, parts.jm, Number(e.target.value))}>
        {days.map((d) => (
          <option key={d} value={d}>
            {d}
          </option>
        ))}
      </select>
      <select className="input px-2" value={parts.jm} onChange={(e) => update(parts.jy, Number(e.target.value), parts.jd)}>
        {JALALI_MONTHS.map((m, i) => (
          <option key={m} value={i + 1}>
            {m}
          </option>
        ))}
      </select>
      <select className="input px-2" value={parts.jy} onChange={(e) => update(Number(e.target.value), parts.jm, parts.jd)}>
        {years.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
    </div>
  );
}
