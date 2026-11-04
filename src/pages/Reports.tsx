import { Printer, Download, TrendingUp, Wallet, Landmark, Receipt, Scale } from 'lucide-react';
import { useFetch } from '../lib/api';
import { formatDate, formatMoney } from '../lib/format';
import type { Summary } from '../types';
import { DateRangeBar, PageHeader, useDateRange } from '../components/PageHeader';
import { Card, CardHeader, Empty, Spinner, StatCard } from '../components/ui';
import { useMeta } from '../lib/meta';
import { printGenericReport } from '../lib/docs';
import { exportExcel } from '../lib/print';
import { toast } from '../lib/toast';

interface ReportResponse extends Summary {
  series: { date: string; sales: number; expenses: number; profit: number }[];
  productSales: { name: string; qty: number; revenue: number; cost: number }[];
}

function Row({ label, value, strong, tone }: { label: string; value: number; strong?: boolean; tone?: 'green' | 'red' }) {
  return (
    <div className={`flex items-center justify-between gap-3 px-4 py-2 ${strong ? 'bg-slate-50 font-extrabold' : 'font-medium'}`}>
      <span className={strong ? 'text-sm text-slate-900' : 'text-xs text-slate-600'}>{label}</span>
      <span
        className={`num text-sm ${tone === 'green' ? 'text-emerald-700' : tone === 'red' ? 'text-rose-600' : 'text-slate-800'} ${
          strong ? 'font-extrabold' : 'font-bold'
        }`}
      >
        {formatMoney(value)}
      </span>
    </div>
  );
}

export function ReportsPage() {
  const range = useDateRange('month');
  const { meta } = useMeta();
  const { data, loading, error } = useFetch<ReportResponse>(`/api/reports/summary?from=${range.from}&to=${range.to}`);

  const printReport = () => {
    if (!data || !meta) return;
    const expenseRows = Object.entries(data.expenseByCategory).map(([category, amount]) => [category, amount]);
    printGenericReport(meta.settings, 'گزارش مالی و صورت سود و زیان', `${formatDate(data.from)} تا ${formatDate(data.to)}`, [
      {
        heading: 'صورت سود و زیان',
        columns: ['شرح', 'مبلغ (افغانی)'],
        rows: [
          ['درآمد فروش', data.salesGross],
          ['کسر: تخفیف فروش', -data.salesDiscount],
          ['فروش خالص', data.netSales],
          ['کسر: بهای تمام‌شده کالای فروش‌رفته', -data.cogs],
          ['سود ناخالص', data.grossProfit],
          ['کسر: مجموع مصارف', -data.expensesTotal],
          ['سود خالص', data.netProfit],
        ],
      },
      {
        heading: 'تفکیک مصارف',
        columns: ['نوع مصرف', 'مبلغ (افغانی)'],
        rows: expenseRows.length ? expenseRows : [['مصرفی ثبت نشده', 0]],
        footer: ['مجموع مصارف', data.expensesTotal],
      },
      {
        heading: 'وضعیت صندوق و حساب‌ها',
        columns: ['شرح', 'مبلغ (افغانی)'],
        rows: [
          ['موجودی صندوق', data.cashBalance],
          ['قرض مشتریان (مطالبات)', data.receivables],
          ['بدهی به شرکت‌ها', data.payables],
          ['ارزش موجودی ادویه', data.inventoryValue],
          ['دریافت نقدی دوره', data.cashIn],
          ['پرداخت نقدی دوره', data.cashOut],
        ],
      },
      {
        heading: 'اقلام پرفروش',
        columns: ['نام ادویه', 'تعداد فروش', 'مبلغ فروش', 'سود'],
        rows: data.productSales.map((p) => [p.name, p.qty, p.revenue, p.revenue - p.cost]),
      },
    ]);
  };

  const exportReport = () => {
    if (!data) {
      toast('گزارش برای خروجی موجود نیست.', 'warning');
      return;
    }
    exportExcel(
      `report-${data.from}_${data.to}`,
      'سود و زیان',
      ['شرح', 'مبلغ (افغانی)'],
      [
        ['درآمد فروش', data.salesGross],
        ['تخفیف فروش', data.salesDiscount],
        ['فروش خالص', data.netSales],
        ['بهای تمام‌شده کالای فروش‌رفته', data.cogs],
        ['سود ناخالص', data.grossProfit],
        ['مجموع مصارف', data.expensesTotal],
        ['سود خالص', data.netProfit],
        ['موجودی صندوق', data.cashBalance],
        ['قرض مشتریان', data.receivables],
        ['بدهی به شرکت‌ها', data.payables],
        ['ارزش موجودی ادویه', data.inventoryValue],
        ...Object.entries(data.expenseByCategory).map(([k, v]) => [`مصرف: ${k}`, v] as [string, number]),
      ],
      `گزارش مالی ${formatDate(data.from)} تا ${formatDate(data.to)}`,
    );
  };

  return (
    <div dir="rtl">
      <PageHeader title="گزارش‌های مالی" subtitle="گزارش روزانه، هفتگی، ماهانه و سالانه همراه با محاسبه دقیق سود و زیان">
        <button className="btn-outline btn-sm" onClick={exportReport}>
          <Download size={14} /> اکسل
        </button>
        <button className="btn-primary btn-sm" onClick={printReport}>
          <Printer size={15} /> چاپ / PDF
        </button>
      </PageHeader>

      <DateRangeBar {...range} />

      {loading && !data ? <Spinner /> : null}
      {error && !data ? <div className="card card-pad text-sm text-rose-600">{error}</div> : null}

      {data ? (
        <>
          <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-5">
            <StatCard label="فروش خالص" value={`${formatMoney(data.netSales)} ؋`} hint={`${data.salesCount} فاکتور`} tone="sky" icon={<TrendingUp size={18} />} />
            <StatCard label="سود ناخالص" value={`${formatMoney(data.grossProfit)} ؋`} hint="فروش منهای بهای تمام‌شده" tone="emerald" icon={<Scale size={18} />} />
            <StatCard label="مجموع مصارف" value={`${formatMoney(data.expensesTotal)} ؋`} hint={`${data.expenseCount} مورد`} tone="amber" icon={<Receipt size={18} />} />
            <StatCard
              label="سود خالص"
              value={`${formatMoney(data.netProfit)} ؋`}
              hint="سود ناخالص منهای مصارف"
              tone={data.netProfit >= 0 ? 'emerald' : 'rose'}
              icon={<Wallet size={18} />}
            />
            <StatCard label="موجودی صندوق" value={`${formatMoney(data.cashBalance)} ؋`} hint={`دریافت ${formatMoney(data.cashIn)} · پرداخت ${formatMoney(data.cashOut)}`} tone="slate" icon={<Landmark size={18} />} />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader title="صورت سود و زیان" subtitle={`${formatDate(data.from)} تا ${formatDate(data.to)}`} />
              <div className="divide-y divide-slate-50 py-1">
                <Row label="درآمد فروش (قبل از تخفیف)" value={data.salesGross} />
                <Row label="کسر: تخفیف فروش" value={-data.salesDiscount} tone="red" />
                <Row label="فروش خالص" value={data.netSales} strong />
                <Row label="کسر: بهای تمام‌شده کالای فروش‌رفته" value={-data.cogs} tone="red" />
                <Row label="سود ناخالص" value={data.grossProfit} strong tone="green" />
                <Row label="کسر: مجموع مصارف" value={-data.expensesTotal} tone="red" />
                <Row label="سود خالص دوره" value={data.netProfit} strong tone={data.netProfit >= 0 ? 'green' : 'red'} />
              </div>
              <div className="border-t border-slate-100 px-4 py-2 text-[11px] text-slate-500">
                روش محاسبه: سود ناخالص = فروش خالص − بهای تمام‌شده · سود خالص = سود ناخالص − مصارف
              </div>
            </Card>

            <div className="space-y-4">
              <Card>
                <CardHeader title="وضعیت حساب‌ها" subtitle="در پایان دوره" />
                <div className="divide-y divide-slate-50 py-1">
                  <Row label="موجودی نقدی صندوق" value={data.cashBalance} />
                  <Row label="قرض مشتریان (طلب داروخانه)" value={data.receivables} tone="green" />
                  <Row label="بدهی به شرکت‌ها" value={data.payables} tone="red" />
                  <Row label="ارزش موجودی ادویه (بهای تمام‌شده)" value={data.inventoryValue} />
                  <Row label="مجموع خرید دوره" value={data.purchasesTotal} />
                  <Row label="خرید نسیه (افزایش بدهی)" value={data.creditPurchases} tone="red" />
                </div>
              </Card>

              <Card>
                <CardHeader title="گردش نقدی دوره" />
                <div className="divide-y divide-slate-50 py-1">
                  <Row label="مجموع دریافت‌ها" value={data.cashIn} tone="green" />
                  <Row label="مجموع پرداخت‌ها" value={data.cashOut} tone="red" />
                  <Row label="خالص گردش نقدی" value={data.cashNet} strong />
                </div>
              </Card>
            </div>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader title="تفکیک مصارف" subtitle="بر اساس نوع هزینه" />
              {Object.keys(data.expenseByCategory).length === 0 ? (
                <Empty title="مصرفی در این بازه ثبت نشده است" />
              ) : (
                <table className="table">
                  <thead>
                    <tr>
                      <th>نوع مصرف</th>
                      <th>مبلغ</th>
                      <th>سهم</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(data.expenseByCategory)
                      .sort((a, b) => b[1] - a[1])
                      .map(([category, amount]) => {
                        const share = data.expensesTotal > 0 ? Math.round((amount / data.expensesTotal) * 100) : 0;
                        return (
                          <tr key={category}>
                            <td className="font-semibold">{category}</td>
                            <td className="num">{formatMoney(amount)}</td>
                            <td>
                              <div className="flex items-center gap-2">
                                <div className="h-1.5 w-16 rounded-full bg-slate-100">
                                  <div className="h-1.5 rounded-full bg-amber-500" style={{ width: `${share}%` }} />
                                </div>
                                <span className="num text-[11px] text-slate-500">{share}%</span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td>مجموع</td>
                      <td className="num">{formatMoney(data.expensesTotal)}</td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              )}
            </Card>

            <Card>
              <CardHeader title="اقلام پرفروش" subtitle="بر اساس مبلغ فروش" />
              {data.productSales.length === 0 ? (
                <Empty title="فروشی در این بازه ثبت نشده است" />
              ) : (
                <table className="table">
                  <thead>
                    <tr>
                      <th>ادویه</th>
                      <th>تعداد</th>
                      <th>مبلغ فروش</th>
                      <th>سود</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.productSales.map((item) => (
                      <tr key={item.name}>
                        <td className="max-w-[180px] truncate font-semibold">{item.name}</td>
                        <td className="num">{formatMoney(item.qty)}</td>
                        <td className="num">{formatMoney(item.revenue)}</td>
                        <td className={`num ${item.revenue - item.cost >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                          {formatMoney(item.revenue - item.cost)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Card>
          </div>
        </>
      ) : null}
    </div>
  );
}
