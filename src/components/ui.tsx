import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X, Search, AlertTriangle } from 'lucide-react';

export const cx = (...classes: (string | false | null | undefined)[]) => classes.filter(Boolean).join(' ');

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx('card', className)}>{children}</div>;
}

export function CardHeader({
  title,
  subtitle,
  action,
  icon,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 sm:px-5">
      <div className="flex items-center gap-2.5">
        {icon ? <span className="text-emerald-700">{icon}</span> : null}
        <div>
          <h2 className="text-sm font-bold text-slate-800">{title}</h2>
          {subtitle ? <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p> : null}
        </div>
      </div>
      {action}
    </div>
  );
}

export function Field({
  label,
  children,
  hint,
  className,
  required,
}: {
  label?: ReactNode;
  children: ReactNode;
  hint?: ReactNode;
  className?: string;
  required?: boolean;
}) {
  return (
    <div className={className}>
      {label ? (
        <label className="label">
          {label}
          {required ? <span className="text-rose-600"> *</span> : null}
        </label>
      ) : null}
      {children}
      {hint ? <p className="mt-1 text-[11px] text-slate-500">{hint}</p> : null}
    </div>
  );
}

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = 'md',
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;
  const width = { sm: 'max-w-md', md: 'max-w-2xl', lg: 'max-w-4xl', xl: 'max-w-6xl' }[size];

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-0 backdrop-blur-sm sm:items-center sm:p-4 no-print" dir="rtl">
      <div
        className={cx(
          'flex max-h-[94vh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl',
          width,
        )}
      >
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-4 py-3 sm:px-5">
          <div>
            <h3 className="text-base font-bold text-slate-900">{title}</h3>
            {subtitle ? <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p> : null}
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-5">{children}</div>
        {footer ? <div className="flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 bg-slate-50 px-4 py-3 sm:px-5">{footer}</div> : null}
      </div>
    </div>,
    document.body,
  );
}

const toneMap: Record<string, string> = {
  green: 'bg-emerald-50 text-emerald-700',
  red: 'bg-rose-50 text-rose-700',
  amber: 'bg-amber-50 text-amber-700',
  blue: 'bg-sky-50 text-sky-700',
  slate: 'bg-slate-100 text-slate-600',
  violet: 'bg-violet-50 text-violet-700',
};

export function Badge({ children, tone = 'slate' }: { children: ReactNode; tone?: keyof typeof toneMap }) {
  return <span className={cx('badge', toneMap[tone] || toneMap.slate)}>{children}</span>;
}

const statTones: Record<string, { bg: string; text: string }> = {
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700' },
  sky: { bg: 'bg-sky-50', text: 'text-sky-700' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-700' },
  rose: { bg: 'bg-rose-50', text: 'text-rose-700' },
  slate: { bg: 'bg-slate-100', text: 'text-slate-700' },
  violet: { bg: 'bg-violet-50', text: 'text-violet-700' },
};

export function StatCard({
  label,
  value,
  hint,
  icon,
  tone = 'emerald',
  onClick,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon?: ReactNode;
  tone?: keyof typeof statTones;
  onClick?: () => void;
}) {
  const t = statTones[tone] || statTones.emerald;
  return (
    <div
      className={cx('card card-pad flex items-start justify-between gap-3', onClick && 'cursor-pointer transition hover:border-emerald-300')}
      onClick={onClick}
    >
      <div className="min-w-0">
        <p className="text-xs font-semibold text-slate-500">{label}</p>
        <p className="mt-1.5 truncate text-lg font-extrabold text-slate-900 sm:text-xl">{value}</p>
        {hint ? <p className="mt-1 text-[11px] text-slate-500">{hint}</p> : null}
      </div>
      {icon ? <span className={cx('grid h-10 w-10 shrink-0 place-items-center rounded-xl', t.bg, t.text)}>{icon}</span> : null}
    </div>
  );
}

export function Empty({ title, hint, action }: { title: string; hint?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-12 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-slate-400">
        <Search size={22} />
      </div>
      <p className="text-sm font-bold text-slate-700">{title}</p>
      {hint ? <p className="max-w-sm text-xs text-slate-500">{hint}</p> : null}
      {action}
    </div>
  );
}

export function Spinner({ label = 'در حال بارگذاری…' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-10 text-sm text-slate-500">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
      {label}
    </div>
  );
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="seg">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          className={cx('seg-item', value === opt.value && 'seg-item-active')}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export function SearchBox({
  value,
  onChange,
  placeholder = 'جستجو…',
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={cx('relative', className)}>
      <Search size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
      <input
        className="input pr-9"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

export function Confirm({
  open,
  title,
  message,
  confirmLabel = 'حذف',
  busy,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title: string;
  message: ReactNode;
  confirmLabel?: string;
  busy?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      size="sm"
      footer={
        <>
          <button className="btn-outline" onClick={onCancel}>
            انصراف
          </button>
          <button className="btn-danger" disabled={busy} onClick={onConfirm}>
            {busy ? 'در حال انجام…' : confirmLabel}
          </button>
        </>
      }
    >
      <div className="flex gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-rose-50 text-rose-600">
          <AlertTriangle size={20} />
        </span>
        <div className="text-sm leading-6 text-slate-700">{message}</div>
      </div>
    </Modal>
  );
}
