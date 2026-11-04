import { useMemo } from 'react';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Users,
  Building2,
  Plus,
  ShoppingCart,
  Package,
  Receipt,
  ArrowLeftRight,
  AlertTriangle,
  ChevronLeft,
} from 'lucide-react';
import { useFetch } from '../lib/api';
import { formatDate, formatMoney, todayISO } from '../lib/format';
import { navigate } from '../lib/router';
import { Card, CardHeader, Empty, Spinner, StatCard, Badge } from '../components/ui';
import { PageHeader } from '../components/PageHeader';
import type { Summary } from '../types';

interface DashboardData {
  date: string;
  todayStats: Summary;
  monthStats: Summary;
  yearStats: Summary;
  series: { date: string; sales: number; expenses: number; profit: number }[];
  lowStock: { id: string; name: string; stock: number; unit: string; minStock: number }[];
  recentSales: { id: string; no: string; date: string; customerName: string; netTotal: number; paid: number; credit: number }[];
  topDebtors: { id: string; name: string; balance: number }[];
  counts: { customers: number; companies: number; products: number; sales: number };
}

function SalesChart({ series }: { series: { date: string; sales: number; profit: number }[] }) {
  const max = Math.max(1, ...series.map((s) => Math.max(s.sales, 0)));
  return (
    <div className="flex h-40 items-end gap-1 px-1">
      {series.map((point, index) => {
        const height = Math.round((Math.max(0, point.sales) / max) * 100);
        const profitHeight = Math.round((Math.max(0, point.profit) / max) * 100);
        return (
          <div key={point.date} className="group relative flex h-full flex-1 flex-col justify-end gap-0.5">
            <div className="relative flex h-full items-end justify-center">
              <div className="w-full rounded-t bg-emerald-200" style={{ height: `${Math.max(height, 2)}%` }} />
              <div
                className="absolute bottom-0 w-full rounded-t bg-emerald-600"
                style={{ height: `${Math.max(profitHeight, point.profit > 0 ? 2 : 0)}%` }}
              />
            </div>
            {index % 3 === 0 || index === series.length - 1 ? (
              <span className="mt-1 truncate text-center text-[9px] text-slate-400">{formatDate(point.date).slice(5)}</span>
            ) : (
              <span className="mt-1 h-3" />
            )}
            <div className="pointer-events-none absolute -top-8 right-1/2 z-10 hidden translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-2 py-1 text-[10px] font-bold text-white group-hover:block">
              فروش: {formatMoney(point.sales)} · سود: {formatMoney(point.profit)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function Dashboard() {
  const date = todayISO();
  const { data, loading, error } = useFetch<DashboardData>(`/api/dashboard?date=${date}`);

  const stats = data?.monthStats;
  const topExpenses = useMemo(() => Object.entries(stats?.expenseByCategory || {}).sort((a, b) => b[1] - a[1]).slice(0, 4), [stats]);

  const actions = [
    { label: 'فاکتور فروش جدید', icon: ShoppingCart, path: '/sales', tone: 'bg-emerald-700' },
    { label: 'ثبت خرید', icon: Package, path: '/purchases', tone: 'bg-sky-700' },
    { label: 'ثبت مصرف', icon: Receipt, path: '/expenses', tone: 'bg-amber-600' },
    { label: 'دریافت قرض', icon: ArrowLeftRight, path: '/customers', tone: 'bg-violet-700' },
  ];

  if (loading && !data) return <Spinner />;
  if (error && !data) return <div className="card card-pad text-sm text-rose-600">{error}</div>;
  if (!data) return null;

  return (
    <div dir="rtl">
      <PageHeader title="داشبورد" subtitle={`خلاصه وضعیت مالی — ${formatDate(data.date)}`}>
        <button className="btn-outline btn-sm" onClick={() => navigate('/reports')}>
          گزارش‌های مالی
        </button>
      </PageHeader>

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard
          label="موجودی صندوق"
          value={`${formatMoney(data.todayStats.cashBalance)} ؋`}
          hint="نقدینگی فعلی"
          tone="emerald"
          icon={<Wallet size={18} />}
          onClick={() => navigate('/cashbox')}
        />
        <StatCard
          label="فروش امروز"
          value={`${formatMoney(data.todayStats.netSales)} ؋`}
          hint={`${data.todayStats.salesCount} فاکتور`}
          tone="sky"
          icon={<TrendingUp size={18} />}
          onClick={() => navigate('/sales')}
        />
        <StatCard
          label="سود خالص این ماه"
          value={`${formatMoney(data.monthStats.netProfit)} ؋`}
          hint={`فروش ماه: ${formatMoney(data.monthStats.netSales)} ؋`}
          tone={data.monthStats.netProfit >= 0 ? 'emerald' : 'rose'}
          icon={<TrendingDown size={18} />}
          onClick={() => navigate('/reports')}
        />
        <StatCard
          label="قرض مشتریان"
          value={`${formatMoney(data.todayStats.receivables)} ؋`}
          hint={`${data.counts.customers} مشتری`}
          tone="amber"
          icon={<Users size={18} />}
          onClick={() => navigate('/customers')}
        />
        <StatCard
          label="بدهی به شرکت‌ها"
          value={`${formatMoney(data.todayStats.payables)} ؋`}
          hint={`${data.counts.companies} شرکت`}
          tone="rose"
          icon={<Building2 size={18} />}
          onClick={() => navigate('/companies')}
        />
      </div>

      <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.label}
              onClick={() => navigate(action.path)}
              className="card flex items-center gap-2.5 p-3 text-right transition hover:border-emerald-300 hover:shadow"
            >
              <span className={`grid h-9 w-9 place-items-center rounded-xl text-white ${action.tone}`}>
                <Icon size={17} />
              </span>
              <span className="text-xs font-bold text-slate-700">{action.label}</span>
            </button>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="روند فروش و سود ۱۴ روز اخیر"
            subtitle="ستون روشن: فروش · ستون تیره: سود خالص روز"
            action={
              <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-500">
                <span className="flex items-center gap-1">
                  <i className="inline-block h-2.5 w-2.5 rounded bg-emerald-200" /> فروش
                </span>
                <span className="flex items-center gap-1">
                  <i className="inline-block h-2.5 w-2.5 rounded bg-emerald-600" /> سود
                </span>
              </div>
            }
          />
          <div className="card-pad">
            <SalesChart series={data.series} />
            <div className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-100 pt-3 text-center">
              <div>
                <p className="text-[11px] text-slate-500">فروش ماه</p>
                <p className="text-sm font-extrabold text-slate-800">{formatMoney(data.monthStats.netSales)} ؋</p>
              </div>
              <div>
                <p className="text-[11px] text-slate-500">مصارف ماه</p>
                <p className="text-sm font-extrabold text-slate-800">{formatMoney(data.monthStats.expensesTotal)} ؋</p>
              </div>
              <div>
                <p className="text-[11px] text-slate-500">سود ناخالص ماه</p>
                <p className="text-sm font-extrabold text-slate-800">{formatMoney(data.monthStats.grossProfit)} ؋</p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="هشدار موجودی" subtitle="ادویه‌های نزدیک به اتمام" icon={<AlertTriangle size={16} />} />
          {data.lowStock.length === 0 ? (
            <Empty title="موجودی همه اقلام مناسب است" hint="هیچ ادویه‌ای به حد هشدار نرسیده است." />
          ) : (
            <ul className="divide-y divide-slate-100">
              {data.lowStock.map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-2 px-4 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold text-slate-800">{item.name}</p>
                    <p className="text-[11px] text-slate-500">حد هشدار: {item.minStock}</p>
                  </div>
                  <Badge tone={item.stock <= 0 ? 'red' : 'amber'}>
                    {formatMoney(item.stock)} {item.unit}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="آخرین فروش‌ها"
            action={
              <button className="btn-ghost btn-sm" onClick={() => navigate('/sales')}>
                همه فاکتورها <ChevronLeft size={14} />
              </button>
            }
          />
          {data.recentSales.length === 0 ? (
            <Empty
              title="هنوز فروشی ثبت نشده است"
              hint="با دکمه «فاکتور فروش جدید» اولین فروش خود را ثبت کنید."
              action={
                <button className="btn-primary btn-sm mt-2" onClick={() => navigate('/sales')}>
                  <Plus size={14} /> ثبت فروش
                </button>
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>شماره</th>
                    <th>تاریخ</th>
                    <th>مشتری</th>
                    <th>مبلغ</th>
                    <th>پرداخت</th>
                    <th>نسیه</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentSales.map((sale) => (
                    <tr key={sale.id}>
                      <td className="num font-bold text-slate-800">{sale.no}</td>
                      <td>{formatDate(sale.date)}</td>
                      <td className="max-w-[140px] truncate">{sale.customerName}</td>
                      <td className="num font-semibold">{formatMoney(sale.netTotal)}</td>
                      <td className="num text-emerald-700">{formatMoney(sale.paid)}</td>
                      <td className="num text-rose-600">{formatMoney(sale.credit)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader title="بیشترین قرض‌داران" icon={<Users size={16} />} />
            {data.topDebtors.length === 0 ? (
              <Empty title="قرض معوقی وجود ندارد" />
            ) : (
              <ul className="divide-y divide-slate-100">
                {data.topDebtors.map((party) => (
                  <li key={party.id} className="flex items-center justify-between gap-2 px-4 py-2.5">
                    <span className="truncate text-xs font-bold text-slate-800">{party.name}</span>
                    <span className="num text-xs font-extrabold text-rose-600">{formatMoney(party.balance)} ؋</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card>
            <CardHeader title="ترکیب مصارف این ماه" icon={<Receipt size={16} />} />
            {topExpenses.length === 0 ? (
              <Empty title="مصرفی ثبت نشده است" />
            ) : (
              <ul className="space-y-2 px-4 py-3">
                {topExpenses.map(([category, amount]) => {
                  const share = stats && stats.expensesTotal > 0 ? Math.round((amount / stats.expensesTotal) * 100) : 0;
                  return (
                    <li key={category}>
                      <div className="mb-1 flex items-center justify-between text-[11px] font-semibold text-slate-600">
                        <span>{category}</span>
                        <span className="num">{formatMoney(amount)} ؋</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-slate-100">
                        <div className="h-1.5 rounded-full bg-amber-500" style={{ width: `${share}%` }} />
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
