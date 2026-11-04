import { useState } from 'react';
import { Plus, Printer, Pencil, Trash2, Download } from 'lucide-react';
import { api, useFetch, OfflineQueuedError } from '../lib/api';
import { toast } from '../lib/toast';
import { formatDate, formatMoney } from '../lib/format';
import type { Purchase } from '../types';
import { DateRangeBar, PageHeader, useDateRange } from '../components/PageHeader';
import { Card, Empty, SearchBox, Segmented, Spinner, Badge, Confirm } from '../components/ui';
import { PurchaseForm } from '../components/PurchaseForm';
import { useMeta } from '../lib/meta';
import { useDebounced } from '../lib/useDebounced';
import { printPurchaseInvoice } from '../lib/docs';
import { exportExcel } from '../lib/print';

interface PurchasesResponse {
  total: number;
  items: Purchase[];
  sum: { netTotal: number; paid: number; credit: number; discount: number };
}

export function PurchasesPage() {
  const range = useDateRange('month');
  const { meta, reloadMeta } = useMeta();
  const [q, setQ] = useState('');
  const debouncedQ = useDebounced(q);
  const [type, setType] = useState<'' | 'cash' | 'credit'>('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Purchase | null>(null);
  const [deleting, setDeleting] = useState<Purchase | null>(null);
  const [busy, setBusy] = useState(false);

  const path = `/api/purchases?from=${range.from}&to=${range.to}&type=${type}&q=${encodeURIComponent(debouncedQ)}&limit=300`;
  const { data, loading, reload, error } = useFetch<PurchasesResponse>(path);

  const openNew = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const remove = async () => {
    if (!deleting) return;
    setBusy(true);
    try {
      await api.del(`/api/purchases/${deleting.id}?rev=${deleting.rev}`);
      toast('فاکتور خرید حذف و موجودی اصلاح شد.');
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
      toast('خریدی برای خروجی وجود ندارد.', 'warning');
      return;
    }
    exportExcel(
      `purchases-${range.from}_${range.to}`,
      'خرید',
      ['شماره', 'تاریخ', 'شرکت', 'مجموع اقلام', 'تخفیف', 'مبلغ خالص', 'پرداخت', 'باقی'],
      data.items.map((p) => [p.no, formatDate(p.date), p.companyName, p.itemsTotal, p.discount, p.netTotal, p.paid, p.credit]),
      `فهرست خرید ${formatDate(range.from)} تا ${formatDate(range.to)}`,
    );
  };

  return (
    <div dir="rtl">
      <PageHeader title="مدیریت خرید" subtitle="ثبت خرید از شرکت‌ها، پرداخت نقدی و نسیه، بدهی به شرکت‌ها و به‌روزرسانی موجودی">
        <button className="btn-outline btn-sm" onClick={exportList}>
          <Download size={14} /> خروجی اکسل
        </button>
        <button className="btn-primary btn-sm" onClick={openNew}>
          <Plus size={15} /> فاکتور خرید جدید
        </button>
      </PageHeader>

      <DateRangeBar {...range} extra={<SearchBox value={q} onChange={setQ} placeholder="جستجوی شماره یا شرکت…" className="w-full sm:w-56" />} />

      {data ? (
        <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            { label: 'تعداد فاکتور خرید', value: String(data.total) },
            { label: 'مجموع خرید', value: `${formatMoney(data.sum.netTotal)} ؋` },
            { label: 'پرداخت نقدی', value: `${formatMoney(data.sum.paid)} ؋` },
            { label: 'خرید نسیه (بدهی)', value: `${formatMoney(data.sum.credit)} ؋` },
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
          <h2 className="text-sm font-bold text-slate-800">فاکتورهای خرید</h2>
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
            title="خریدی در این بازه ثبت نشده است"
            hint="خریدها باعث افزایش موجودی و محاسبه بهای تمام‌شده می‌شوند."
            action={
              <button className="btn-primary btn-sm mt-2" onClick={openNew}>
                <Plus size={14} /> ثبت خرید
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
                  <th>شرکت</th>
                  <th>اقلام</th>
                  <th>مبلغ خالص</th>
                  <th>پرداخت</th>
                  <th>باقی</th>
                  <th className="no-print">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((purchase) => (
                  <tr key={purchase.id}>
                    <td className="num font-bold text-slate-800">{purchase.no}</td>
                    <td className="whitespace-nowrap">{formatDate(purchase.date)}</td>
                    <td className="max-w-[150px] truncate">{purchase.companyName}</td>
                    <td className="max-w-[200px] truncate text-xs text-slate-500">
                      {(purchase.items || []).map((i) => `${i.name} ×${i.qty}`).join(' ، ')}
                    </td>
                    <td className="num font-semibold">{formatMoney(purchase.netTotal)}</td>
                    <td className="num text-emerald-700">{formatMoney(purchase.paid)}</td>
                    <td className="num">
                      {purchase.credit > 0 ? <Badge tone="red">{formatMoney(purchase.credit)}</Badge> : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="no-print">
                      <div className="flex items-center gap-1">
                        <button
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
                          title="چاپ"
                          onClick={() => meta && printPurchaseInvoice(purchase, meta.settings)}
                        >
                          <Printer size={15} />
                        </button>
                        <button
                          className="rounded-lg p-1.5 text-sky-600 hover:bg-sky-50"
                          title="ویرایش"
                          onClick={() => {
                            setEditing(purchase);
                            setFormOpen(true);
                          }}
                        >
                          <Pencil size={15} />
                        </button>
                        <button className="rounded-lg p-1.5 text-rose-600 hover:bg-rose-50" title="حذف" onClick={() => setDeleting(purchase)}>
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
                  <td className="num">{formatMoney(data.sum.paid)}</td>
                  <td className="num">{formatMoney(data.sum.credit)}</td>
                  <td className="no-print" />
                </tr>
              </tfoot>
            </table>
          </div>
        ) : null}
      </Card>

      {formOpen ? (
        <PurchaseForm
          open={formOpen}
          purchase={editing}
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
        title="حذف فاکتور خرید"
        message={
          <>
            آیا از حذف فاکتور <b>{deleting?.no}</b> مطمئن هستید؟
            <br />
            موجودی ادویه و بهای تمام‌شده اصلاح می‌شود و سند حسابداری آن باطل می‌گردد.
          </>
        }
        onCancel={() => setDeleting(null)}
        onConfirm={remove}
      />
    </div>
  );
}
