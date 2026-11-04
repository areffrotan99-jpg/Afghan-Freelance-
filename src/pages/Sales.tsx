import { useState } from 'react';
import { Plus, Printer, Pencil, Trash2, Download } from 'lucide-react';
import { api, useFetch, OfflineQueuedError } from '../lib/api';
import { toast } from '../lib/toast';
import { formatDate, formatMoney } from '../lib/format';
import type { Sale } from '../types';
import { DateRangeBar, PageHeader, useDateRange } from '../components/PageHeader';
import { Card, Empty, SearchBox, Segmented, Spinner, Badge, Confirm } from '../components/ui';
import { SaleForm } from '../components/SaleForm';
import { useMeta } from '../lib/meta';
import { useDebounced } from '../lib/useDebounced';
import { printSaleInvoice } from '../lib/docs';
import { exportExcel } from '../lib/print';

interface SalesResponse {
  total: number;
  items: Sale[];
  sum: { netTotal: number; paid: number; credit: number; discount: number; profit: number };
}

export function SalesPage() {
  const range = useDateRange('month');
  const { meta, reloadMeta } = useMeta();
  const [q, setQ] = useState('');
  const debouncedQ = useDebounced(q);
  const [type, setType] = useState<'' | 'cash' | 'credit'>('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Sale | null>(null);
  const [deleting, setDeleting] = useState<Sale | null>(null);
  const [busy, setBusy] = useState(false);

  const path = `/api/sales?from=${range.from}&to=${range.to}&type=${type}&q=${encodeURIComponent(debouncedQ)}&limit=300`;
  const { data, loading, reload, error } = useFetch<SalesResponse>(path);

  const openNew = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const remove = async () => {
    if (!deleting) return;
    setBusy(true);
    try {
      await api.del(`/api/sales/${deleting.id}?rev=${deleting.rev}`);
      toast('فاکتور حذف شد و سند حسابداری آن باطل گردید.');
      setDeleting(null);
      reload();
      reloadMeta();
    } catch (err) {
      if (err instanceof OfflineQueuedError) toast(err.message, 'warning');
      else toast(err instanceof Error ? err.message : 'حذف ناموفق بود.', 'error');
    } finally {
      setBusy(false);
    }
  };

  const exportList = () => {
    if (!data?.items.length) {
      toast('فاکتوری برای خروجی وجود ندارد.', 'warning');
      return;
    }
    exportExcel(
      `sales-${range.from}_${range.to}`,
      'فروش',
      ['شماره', 'تاریخ', 'مشتری', 'مجموع اقلام', 'تخفیف', 'مبلغ خالص', 'پرداخت', 'نسیه', 'سود'],
      data.items.map((s) => [
        s.no,
        formatDate(s.date),
        s.customerName,
        s.itemsTotal,
        s.discount,
        s.netTotal,
        s.paid,
        s.credit,
        s.profit || 0,
      ]),
      `فهرست فروش ${formatDate(range.from)} تا ${formatDate(range.to)}`,
    );
  };

  return (
    <div dir="rtl">
      <PageHeader title="مدیریت فروش" subtitle="ثبت فروش نقدی و نسیه، تخفیف، محاسبه سود و چاپ فاکتور">
        <button className="btn-outline btn-sm" onClick={exportList}>
          <Download size={14} /> خروجی اکسل
        </button>
        <button className="btn-primary btn-sm" onClick={openNew}>
          <Plus size={15} /> فاکتور فروش جدید
        </button>
      </PageHeader>

      <DateRangeBar {...range} extra={<SearchBox value={q} onChange={setQ} placeholder="جستجوی شماره یا مشتری…" className="w-full sm:w-56" />} />

      {data ? (
        <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
          {[
            { label: 'تعداد فاکتور', value: String(data.total) },
            { label: 'مجموع فروش', value: `${formatMoney(data.sum.netTotal)} ؋` },
            { label: 'پرداخت نقدی', value: `${formatMoney(data.sum.paid)} ؋` },
            { label: 'فروش نسیه', value: `${formatMoney(data.sum.credit)} ؋` },
            { label: 'سود ناخالص', value: `${formatMoney(data.sum.profit)} ؋` },
          ].map((item) => (
            <div key={item.label} className="card px-3 py-2.5">
              <p className="text-[11px] font-semibold text-slate-500">{item.label}</p>
              <p className="num mt-1 text-sm font-extrabold text-slate-800">{item.value}</p>
            </div>
          ))}
        </div>
      ) : null}

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-3">
          <h2 className="text-sm font-bold text-slate-800">فاکتورهای فروش</h2>
          <Segmented
            value={type}
            onChange={setType}
            options={[
              { value: '', label: 'همه' },
              { value: 'cash', label: 'نقدی' },
              { value: 'credit', label: 'نسیه' },
            ]}
          />
        </div>

        {loading && !data ? <Spinner /> : null}
        {error && !data ? <div className="p-4 text-sm text-rose-600">{error}</div> : null}

        {data && data.items.length === 0 ? (
          <Empty
            title="فاکتوری در این بازه یافت نشد"
            hint="برای شروع، اولین فاکتور فروش را ثبت کنید."
            action={
              <button className="btn-primary btn-sm mt-2" onClick={openNew}>
                <Plus size={14} /> ثبت فروش
              </button>
            }
          />
        ) : null}

        {data && data.items.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>شماره</th>
                  <th>تاریخ</th>
                  <th>مشتری</th>
                  <th>اقلام</th>
                  <th>مبلغ</th>
                  <th>تخفیف</th>
                  <th>پرداخت</th>
                  <th>نسیه</th>
                  <th>سود</th>
                  <th className="no-print">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((sale) => (
                  <tr key={sale.id}>
                    <td className="num font-bold text-slate-800">{sale.no}</td>
                    <td className="whitespace-nowrap">{formatDate(sale.date)}</td>
                    <td className="max-w-[150px] truncate">{sale.customerName}</td>
                    <td className="max-w-[180px] truncate text-xs text-slate-500">
                      {(sale.items || []).map((i) => `${i.name} ×${i.qty}`).join(' ، ')}
                    </td>
                    <td className="num font-semibold">{formatMoney(sale.netTotal)}</td>
                    <td className="num text-amber-700">{sale.discount ? formatMoney(sale.discount) : '—'}</td>
                    <td className="num text-emerald-700">{formatMoney(sale.paid)}</td>
                    <td className="num">
                      {sale.credit > 0 ? <Badge tone="red">{formatMoney(sale.credit)}</Badge> : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="num">
                      <span className={(sale.profit || 0) >= 0 ? 'text-emerald-700' : 'text-rose-600'}>{formatMoney(sale.profit)}</span>
                    </td>
                    <td className="no-print">
                      <div className="flex items-center gap-1">
                        <button
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
                          title="چاپ فاکتور"
                          onClick={() => meta && printSaleInvoice(sale, meta.settings)}
                        >
                          <Printer size={15} />
                        </button>
                        <button
                          className="rounded-lg p-1.5 text-sky-600 hover:bg-sky-50"
                          title="ویرایش"
                          onClick={() => {
                            setEditing(sale);
                            setFormOpen(true);
                          }}
                        >
                          <Pencil size={15} />
                        </button>
                        <button className="rounded-lg p-1.5 text-rose-600 hover:bg-rose-50" title="حذف" onClick={() => setDeleting(sale)}>
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={4}>مجموع ({data.total} فاکتور)</td>
                  <td className="num">{formatMoney(data.sum.netTotal)}</td>
                  <td className="num">{formatMoney(data.sum.discount)}</td>
                  <td className="num">{formatMoney(data.sum.paid)}</td>
                  <td className="num">{formatMoney(data.sum.credit)}</td>
                  <td className="num">{formatMoney(data.sum.profit)}</td>
                  <td className="no-print" />
                </tr>
              </tfoot>
            </table>
            {data.total > data.items.length ? (
              <p className="px-4 py-2 text-[11px] text-slate-500">برای عملکرد بهتر، {data.total - data.items.length} فاکتور قدیمی‌تر نمایش داده نشده است؛ بازه را محدودتر کنید.</p>
            ) : null}
          </div>
        ) : null}
      </Card>

      {formOpen ? (
        <SaleForm
          open={formOpen}
          sale={editing}
          parties={meta?.parties || []}
          products={meta?.products || []}
          reloadMeta={reloadMeta}
          onClose={() => setFormOpen(false)}
          onSaved={() => {
            reload();
            reloadMeta();
          }}
        />
      ) : null}

      <Confirm
        open={Boolean(deleting)}
        busy={busy}
        title="حذف فاکتور فروش"
        message={
          <>
            آیا از حذف فاکتور <b>{deleting?.no}</b> مطمئن هستید؟
            <br />
            با حذف، سند حسابداری آن باطل و موجودی ادویه به حالت قبل برمی‌گردد. این عملیات قابل بازگشت نیست.
          </>
        }
        onCancel={() => setDeleting(null)}
        onConfirm={remove}
      />
    </div>
  );
}
