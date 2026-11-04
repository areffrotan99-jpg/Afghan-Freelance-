/* ------------------------------------------------------------------ */
/*  تقویم هجری شمسی (افغانی) و قالب‌بندی اعداد و پول                    */
/* ------------------------------------------------------------------ */
export const JALALI_MONTHS = [
  'حمل',
  'ثور',
  'جوزا',
  'سرطان',
  'اسد',
  'سنبله',
  'میزان',
  'عقرب',
  'قوس',
  'جدی',
  'دلو',
  'حوت',
];

export const WEEK_DAYS = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه'];

const div = (a: number, b: number) => ~~(a / b);
const mod = (a: number, b: number) => a - ~~(a / b) * b;

const BREAKS = [-61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210, 1635, 2060, 2097, 2192, 2262, 2324, 2394, 2456, 3178];

function jalCal(jy: number): { leap: number; gy: number; march: number } {
  const bl = BREAKS.length;
  const gy = jy + 621;
  let leapJ = -14;
  let jp = BREAKS[0];
  let jump = 0;
  if (jy < jp || jy >= BREAKS[bl - 1]) throw new Error('سال شمسی نامعتبر');
  for (let i = 1; i < bl; i += 1) {
    const jm = BREAKS[i];
    jump = jm - jp;
    if (jy < jm) break;
    leapJ = leapJ + div(jump, 33) * 8 + div(mod(jump, 33), 4);
    jp = jm;
  }
  let n = jy - jp;
  leapJ = leapJ + div(n, 33) * 8 + div(mod(n, 33) + 3, 4);
  if (mod(jump, 33) === 4 && jump - n === 4) leapJ += 1;
  const leapG = div(gy, 4) - div((div(gy, 100) + 1) * 3, 4) - 150;
  const march = 20 + leapJ - leapG;
  if (jump - n < 6) n = n - jump + div(jump + 4, 33) * 33;
  let leap = mod(mod(n + 1, 33) - 1, 4);
  if (leap === -1) leap = 4;
  return { leap, gy, march };
}

function g2d(gy: number, gm: number, gd: number): number {
  let d = div((gy + div(gm - 8, 6) + 100100) * 1461, 4) + div(153 * mod(gm + 9, 12) + 2, 5) + gd - 34840408;
  d = d - div(div(gy + 100100 + div(gm - 8, 6), 100) * 3, 4) + 752;
  return d;
}

function d2g(jdn: number): { gy: number; gm: number; gd: number } {
  let j = 4 * jdn + 139361631;
  j = j + div(div(4 * jdn + 183187720, 146097) * 3, 4) * 4 - 3908;
  const i = div(mod(j, 1461), 4) * 5 + 308;
  const gd = div(mod(i, 153), 5) + 1;
  const gm = mod(div(i, 153), 12) + 1;
  const gy = div(j, 1461) - 100100 + div(8 - gm, 6);
  return { gy, gm, gd };
}

function j2d(jy: number, jm: number, jd: number): number {
  const r = jalCal(jy);
  return g2d(r.gy, 3, r.march) + (jm - 1) * 31 - div(jm, 7) * (jm - 7) + jd - 1;
}

export function isoToJalali(iso: string): { jy: number; jm: number; jd: number } {
  const [gy, gm, gd] = (iso || todayISO()).slice(0, 10).split('-').map(Number);
  const jdn = g2d(gy, gm, gd);
  const g = d2g(jdn);
  let jy = g.gy - 621;
  const r = jalCal(jy);
  const jdn1f = g2d(g.gy, 3, r.march);
  let k = jdn - jdn1f;
  let jm: number;
  let jd: number;
  if (k >= 0) {
    if (k <= 185) {
      jm = 1 + div(k, 31);
      jd = mod(k, 31) + 1;
      return { jy, jm, jd };
    }
    k -= 186;
  } else {
    jy -= 1;
    k += 179;
    if (r.leap === 1) k += 1;
  }
  jm = 7 + div(k, 30);
  jd = mod(k, 30) + 1;
  return { jy, jm, jd };
}

export function jalaliToISO(jy: number, jm: number, jd: number): string {
  const g = d2g(j2d(jy, jm, jd));
  return `${g.gy}-${String(g.gm).padStart(2, '0')}-${String(g.gd).padStart(2, '0')}`;
}

export function isLeapJalali(jy: number): boolean {
  return mod(mod(jy + 2346, 2820) + 474, 2820) < 682;
}

export function jalaliMonthLength(jy: number, jm: number): number {
  if (jm <= 6) return 31;
  if (jm <= 11) return 30;
  return isLeapJalali(jy) ? 30 : 29;
}

export function todayISO(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export function formatDate(iso?: string | null): string {
  if (!iso) return '—';
  try {
    const { jy, jm, jd } = isoToJalali(iso);
    return `${jy}/${String(jm).padStart(2, '0')}/${String(jd).padStart(2, '0')}`;
  } catch {
    return iso;
  }
}

export function formatDateLong(iso?: string | null): string {
  if (!iso) return '—';
  try {
    const { jy, jm, jd } = isoToJalali(iso);
    return `${jd} ${JALALI_MONTHS[jm - 1]} ${jy}`;
  } catch {
    return iso;
  }
}

export function weekdayOf(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  return WEEK_DAYS[(d.getDay() + 1) % 7];
}

export function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function todayJalali() {
  return isoToJalali(todayISO());
}

/** شنبه آغاز هفته در افغانستان */
export function startOfWeek(iso: string): string {
  const { jy, jm, jd } = isoToJalali(iso);
  const dow = (new Date(`${iso}T00:00:00`).getDay() + 1) % 7; // شنبه = 0
  return jalaliToISO(jy, jm, jd - dow);
}

export function startOfMonth(iso: string): string {
  const { jy, jm } = isoToJalali(iso);
  return jalaliToISO(jy, jm, 1);
}

export function startOfYear(iso: string): string {
  const { jy } = isoToJalali(iso);
  return jalaliToISO(jy, 1, 1);
}

export function endOfMonth(iso: string): string {
  const { jy, jm } = isoToJalali(iso);
  return jalaliToISO(jy, jm, jalaliMonthLength(jy, jm));
}

export type RangePreset = 'today' | 'week' | 'month' | 'year' | 'custom';

export function presetRange(preset: Exclude<RangePreset, 'custom'>, base = todayISO()) {
  switch (preset) {
    case 'today':
      return { from: base, to: base };
    case 'week':
      return { from: startOfWeek(base), to: base };
    case 'month':
      return { from: startOfMonth(base), to: base };
    case 'year':
      return { from: startOfYear(base), to: base };
    default:
      return { from: startOfMonth(base), to: base };
  }
}

export function formatMoney(value?: number | null, withUnit = false): string {
  const n = Number(value || 0);
  const text = n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  return withUnit ? `${text} ؋` : text;
}

export function formatNumber(value?: number | null): string {
  return Number(value || 0).toLocaleString('en-US', { maximumFractionDigits: 2 });
}

export function formatQty(value?: number | null): string {
  return Number(value || 0).toLocaleString('en-US', { maximumFractionDigits: 2 });
}

export const CURRENCY = 'افغانی (AFN)';

export function docTypeLabel(type: string): string {
  switch (type) {
    case 'sale':
      return 'فروش';
    case 'purchase':
      return 'خرید';
    case 'expense':
      return 'مصرف';
    case 'receive':
      return 'دریافت';
    case 'pay':
      return 'پرداخت';
    case 'capital':
      return 'سرمایه';
    case 'opening':
      return 'افتتاحیه';
    default:
      return type;
  }
}
