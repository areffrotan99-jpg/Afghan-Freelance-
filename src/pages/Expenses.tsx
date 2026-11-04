import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Download, Receipt } from 'lucide-react';
import { api, useFetch, OfflineQueuedError } from '../lib/api';
import { toast } from '../lib/toast';
import { formatDate, formatMoney, todayISO } from '../lib/format';
import type { Expense } from '../types';
import { DateRangeBar, PageHeader, useDateRange } from '../components/PageHeader';
import { Card, Confirm, Empty, Field, Modal, SearchBox, Spinner } from '../components/ui';
import { JalaliDateInput } from '../components/JalaliDateInput';
import { useMeta } from '../lib/meta';
import { useDebounced } from '../lib/useDebounced';
import { exportExcel } from '../lib/print';

interface ExpensesResponse {
  total: number;
  items: Expense[];
  sum: number;
  byCategory: Record<string, number>;
}

export function ExpensesPage() {
  const range = useDateRange('month');
  const { meta } = useMeta();
  const [q, setQ] = useState('');
  const debouncedQ = useDebounced(q);
  const [category, setCategory] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [deleting, setDeleting] = useState<Expense | null>(null);
  const [busy, setBusy] = useState(false);

  const [date, setDate] = useState(todayISO());
  const [formCategory, setFormCategory] = useState('کرایه');
  const [amount, setAmount] = useState('');
  const [payee, setPayee] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const path = `/api/expenses?from=${range.from}&to=${range.to}&category=${encodeURIComponent(category)}&q=${encodeURIComponent(
    debouncedQ,
  )}`;
  const { data, loading, reload, error } = useFetch<ExpensesResponse>(path);

  useEffect(() => {
    if (!formOpen) return;
    setDate(editing?.date || todayISO());
    setFormCategory(editing?.category || 'کرایه');
    setAmount(editing ? String(editing.amount) : '');
    setPayee(editing?.payee || '');
    setNote(editing?.note || '');
  }, [formOpen, editing]);

  const save = async () => {
    const value = Number(amount);
    if (!value || value <= 0) {
      toast('مبلغ مصرف را وارد کنید.', 'error');
      return;
    }
    setSaving(true);
    try {
      const payload = { date, category: formCategory, amount: value, payee, note, ...(editing ? { rev: editing.rev } : {}) };
      if (editing) await api.put(`/api/expenses/${editing.id}`, payload, 'ویرایش مصرف');
      else await api.post('/api/expenses', payload, 'ثبت مصرف');
      toast(editing ? 'مصرف ویرایش شد.' : 'مصرف ثبت شد و از صندوق کسر گردید.');
      setFormOpen(false);
      setEditing(null);
      reload();
    } catch (err) {
      if (err instanceof OfflineQueuedError) {
        toast(err.message, 'warning');
        setFormOpen(false);
      } else toast(err instanceof Error ? err.message : 'ثبت ناموفق بود.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!deleting) return;
    setBusy(true);
    try {
      await api.del(`/api/expenses/${deleting.id}?rev=${deleting.rev}`);
      toast('مصرف حذف و مبلغ به صندوق برگشت.');
      setDeleting(null);
      reload();
    } catch (err) {
      if (err instanceof OfflineQueuedError) toast(err.message, 'warning');
      else toast(err instanceof Error ? err.message : 'حذف ناموفق بود.', 'error');
    } finally {
      setBusy(false);
    }
  };

  const exportList = () => {
    if (!data?.items.length) {
      toast('مصرفی برای خروجی وجود ندارد.', 'warning');
      return;
    }
    exportExcel(
      `expenses-${range.from}_${range.to}`,
      'مصارف',
      ['شماره', 'تاریخ', 'نوع مصرف', 'مصرف‌گیرنده', 'مبلغ (افغانی)', 'یادداشت'],
      data.items.map((e) => [e.no, formatDate(e.date), e.category, e.payee, e.amount, e.note || '']),
      `فهرست مصارف ${formatDate(range.from)} تا ${formatDate(range.to)}`,
    );
  };

  return (
    <div dir="rtl">
      <PageHeader title="مدیریت مصارف" subtitle="کرایه، معاش، برق، ترانسپورت و سایر هزینه‌های داروخانه">
        <button className="btn-outline btn-sm" onClick={exportList}>
          <Download size={14} /> خروجی اکسل
        </button>
        <button
          className="btn-primary btn-sm"
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus size={15} /> ثبت مصرف جدید
        </button>
      </PageHeader>

      <DateRangeBar {...range} extra={<SearchBox value={q} onChange={setQ} placeholder="جستجو…" className="w-full sm:w-52" />} />

      {data ? (
        <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="card px-4 py-3">
            <p className="text-[11px] font-semibold text-slate-500">مجموع مصارف این بازه</p>
            <p className="num mt-1 text-xl font-extrabold text-rose-600">{formatMoney(data.sum)} ؋</p>
            <p className="mt-0.5 text-[11px] text-slate-500">{data.total} مورد</p>
          </div>
          <div className="card px-4 py-3 sm:col-span-2">
            <p className="mb-2 text-[11px] font-semibold text-slate-500">تفکیک بر اساس نوع مصرف</p>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(data.byCategory).length === 0 ? (
                <span className="text-[11px] text-slate-400">داده‌ای موجود نیست</span>
              ) : (
                Object.entries(data.byCategory)
                  .sort((a, b) => b[1] - a[1])
                  .map(([key, value]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setCategory(category === key ? '' : key)}
                      className={`rounded-lg px-2.5 py-1 text-[11px] font-bold ${
                        category === key ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                      }`}
                    >
                      {key}: {formatMoney(value)}
                    </button>
                  ))
              )}
              {category ? (
                <button type="button" onClick={() => setCategory('')} className="rounded-lg px-2 py-1 text-[11px] font-bold text-slate-500 underline">
                  حذف فیلتر
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      <Card>
        <div className="border-b border-slate-100 px-4 py-3">
          <h2 className="flex items-center gap-2 text-sm font-bold text-slate-800">
            <Receipt size={16} className="text-amber-600" />
            فهرست مصارف
          </h2>
        </div>
        {loading && !data ? <Spinner /> : null}
        {error && !data ? <div className="p-4 text-sm text-rose-600">{error}</div> : null}
        {data && data.items.length === 0 ? (
          <Empty title="مصرفی ثبت نشده است" hint="مصارف به‌صورت خودکار از موجودی صندوق کسر می‌شوند." />
        ) : null}
        {data && data.items.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>شماره</th>
                  <th>تاریخ</th>
                  <th>نوع مصرف</th>
                  <th>مصرف‌گیرنده</th>
                  <th>مبلغ</th>
                  <th>یادداشت</th>
                  <th className="no-print">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((expense) => (
                  <tr key={expense.id}>
                    <td className="num font-bold text-slate-800">{expense.no}</td>
                    <td className="whitespace-nowrap">{formatDate(expense.date)}</td>
                    <td className="font-semibold">{expense.category}</td>
                    <td className="max-w-[140px] truncate">{expense.payee || '—'}</td>
                    <td className="num font-bold text-rose-600">{formatMoney(expense.amount)}</td>
                    <td className="max-w-[200px] truncate text-xs text-slate-500">{expense.note || '—'}</td>
                    <td className="no-print">
                      <div className="flex items-center gap-1">
                        <button
                          className="rounded-lg p-1.5 text-sky-600 hover:bg-sky-50"
                          title="ویرایش"
                          onClick={() => {
                            setEditing(expense);
                            setFormOpen(true);
                          }}
                        >
                          <Pencil size={15} />
                        </button>
                        <button className="rounded-lg p-1.5 text-rose-600 hover:bg-rose-50" title="حذف" onClick={() => setDeleting(expense)}>
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={4}>مجموع</td>
                  <td className="num text-rose-600">{formatMoney(data.sum)}</td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            </table>
          </div>
        ) : null}
      </Card>

      <Modal
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        title={editing ? `ویرایش مصرف ${editing.no}` : 'ثبت مصرف جدید'}
        size="md"
        footer={
          <>
            <button
              className="btn-outline"
              onClick={() => {
                setFormOpen(false);
                setEditing(null);
              }}
            >
              انصراف
            </button>
            <button className="btn-primary" onClick={save} disabled={saving}>
              {saving ? 'در حال ذخیره…' : 'ذخیره'}
            </button>
          </>
        }
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="تاریخ" required>
            <JalaliDateInput value={date} onChange={setDate} />
          </Field>
          <Field label="نوع مصرف" required>
            <select className="input" value={formCategory} onChange={(e) => setFormCategory(e.target.value)}>
              {(meta?.expenseCategories || ['کرایه', 'معاش کارمندان', 'برق', 'ترانسپورت', 'متفرقه']).map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
          <Field label="مبلغ (افغانی)" required>
            <input className="input" type="number" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} dir="ltr" placeholder="0" />
          </Field>
          <Field label="مصرف‌گیرنده / توضیح">
            <input className="input" value={payee} onChange={(e) => setPayee(e.target.value)} placeholder="مثلاً: مالک کرایه" />
          </Field>
          <Field label="یادداشت" className="sm:col-span-2">
            <input className="input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="توضیح بیشتر" />
          </Field>
        </div>
        <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-[11px] text-amber-800">
          مبلغ مصرف به‌صورت خودکار از صندوق نقدی کسر و در دفتر کل ثبت می‌شود.
        </p>
      </Modal>

      <Confirm
        open={Boolean(deleting)}
        busy={busy}
        title="حذف مصرف"
        message={<>آیا مصرف <b>{deleting?.no}</b> حذف شود؟ مبلغ آن به صندوق برگشت داده می‌شود.</>}
        onCancel={() => setDeleting(null)}
        onConfirm={remove}
      />
    </div>
  );
}
