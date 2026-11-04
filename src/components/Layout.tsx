import { useEffect, useState, type ReactNode } from 'react';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Receipt,
  Wallet,
  Users,
  Building2,
  Pill,
  BookOpen,
  BarChart3,
  Settings,
  HelpCircle,
  LogOut,
  Menu,
  X,
  Wifi,
  WifiOff,
  RefreshCw,
  CloudUpload,
} from 'lucide-react';
import { usePath, navigate } from '../lib/router';
import { useAuth } from '../lib/session';
import { useSync, flushOutbox } from '../lib/api';
import { cx } from './ui';
import { formatDate } from '../lib/format';

export const NAV_ITEMS = [
  { path: '/', label: 'داشبورد', icon: LayoutDashboard },
  { path: '/sales', label: 'فروش', icon: ShoppingCart },
  { path: '/purchases', label: 'خرید', icon: Package },
  { path: '/expenses', label: 'مصارف', icon: Receipt },
  { path: '/cashbox', label: 'صندوق', icon: Wallet },
  { path: '/customers', label: 'مشتریان و قرض‌ها', icon: Users },
  { path: '/companies', label: 'حساب شرکت‌ها', icon: Building2 },
  { path: '/products', label: 'ادویه و موجودی', icon: Pill },
  { path: '/ledger', label: 'دفتر کل', icon: BookOpen },
  { path: '/reports', label: 'گزارش‌ها', icon: BarChart3 },
  { path: '/settings', label: 'تنظیمات و پشتیبان‌گیری', icon: Settings },
  { path: '/guide', label: 'راهنمای استفاده', icon: HelpCircle },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const path = usePath();
  const { user, logout } = useAuth();
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 px-4 py-5">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-extrabold text-white">فروتن درملتون</p>
          <p className="text-[11px] text-slate-400">سیستم حسابداری داروخانه</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-2.5 pb-4">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = path === item.path;
          return (
            <button
              key={item.path}
              type="button"
              onClick={() => {
                navigate(item.path);
                onNavigate?.();
              }}
              className={cx('sidebar-link w-full', active && 'sidebar-link-active')}
            >
              <Icon size={17} />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-3">
        <div className="mb-2 flex items-center gap-2 px-1">
          <div className="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-xs font-bold text-white">
            {user?.name?.slice(0, 1) || 'م'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold text-white">{user?.name}</p>
            <p className="text-[10px] text-slate-400">{user?.role === 'admin' ? 'مدیر سیستم' : 'حسابدار'}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => void logout()}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-white/10 px-2 py-2 text-xs font-semibold text-slate-200 hover:bg-rose-500/80 hover:text-white"
        >
          <LogOut size={14} />
          خروج از حساب
        </button>
      </div>
    </div>
  );
}

export function Layout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const { online, pending, flushing } = useSync();
  const { user } = useAuth();
  const path = usePath();

  useEffect(() => {
    setOpen(false);
  }, [path]);

  return (
    <div className="flex min-h-screen bg-slate-100">
      <aside className="fixed inset-y-0 right-0 z-30 hidden w-64 bg-slate-900 lg:block">
        <SidebarContent />
      </aside>

      {open ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/60" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 right-0 w-72 bg-slate-900 shadow-2xl">
            <button
              type="button"
              className="absolute left-3 top-4 rounded-lg p-1.5 text-slate-300 hover:bg-white/10"
              onClick={() => setOpen(false)}
            >
              <X size={18} />
            </button>
            <SidebarContent onNavigate={() => setOpen(false)} />
          </div>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col lg:mr-64">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur no-print">
          <div className="flex items-center justify-between gap-3 px-3 py-2.5 sm:px-5">
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
                onClick={() => setOpen(true)}
              >
                <Menu size={20} />
              </button>
              <div className="lg:hidden">
                <p className="text-sm font-extrabold text-slate-900">فروتن درملتون</p>
                <p className="text-[10px] text-slate-500">حسابداری داروخانه</p>
              </div>
              <div className="hidden lg:block">
                <p className="text-xs text-slate-500">
                  امروز: <span className="font-bold text-slate-700">{formatDate(new Date().toISOString().slice(0, 10))}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {pending > 0 ? (
                <button
                  type="button"
                  onClick={() => void flushOutbox()}
                  disabled={flushing}
                  className="flex items-center gap-1.5 rounded-lg bg-amber-50 px-2.5 py-1.5 text-[11px] font-bold text-amber-700 hover:bg-amber-100"
                >
                  <CloudUpload size={14} className={flushing ? 'animate-pulse' : ''} />
                  {pending} مورد در انتظار ارسال
                </button>
              ) : null}
              <span
                className={cx(
                  'flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-bold',
                  online ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700',
                )}
                title={online ? 'اتصال برقرار است' : 'حالت آفلاین — اطلاعات محلی ذخیره می‌شود'}
              >
                {online ? <Wifi size={14} /> : <WifiOff size={14} />}
                {online ? 'آنلاین' : 'آفلاین'}
              </span>
              <button
                type="button"
                onClick={() => void flushOutbox()}
                className="hidden rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 sm:block"
                title="همگام‌سازی"
              >
                <RefreshCw size={15} className={flushing ? 'animate-spin' : ''} />
              </button>
              <span className="hidden text-xs font-semibold text-slate-600 sm:block">{user?.name}</span>
            </div>
          </div>
          {!online ? (
            <div className="bg-rose-600 px-4 py-1.5 text-center text-[11px] font-semibold text-white">
              اینترنت قطع است — کار شما در حافظه این دستگاه ذخیره می‌شود و پس از وصل شدن اینترنت خودکار ارسال می‌گردد.
            </div>
          ) : null}
        </header>

        <main className="mx-auto w-full max-w-[1500px] flex-1 p-3 sm:p-5">{children}</main>

        <footer className="px-4 py-4 text-center text-[11px] text-slate-400 no-print">
          فروتن درملتون — سیستم حسابداری داروخانه · تمام مبالغ به افغانی (AFN)
        </footer>
      </div>
    </div>
  );
}
