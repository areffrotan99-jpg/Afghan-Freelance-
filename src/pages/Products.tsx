import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Download, History, Pill, AlertTriangle } from 'lucide-react';
import { api, useFetch, OfflineQueuedError } from '../lib/api';
import { toast } from '../lib/toast';
import { formatDate, formatMoney, todayISO } from '../lib/format';
import type { ProductRow } from '../types';
import { PageHeader } from '../components/PageHeader';
import { Card, Confirm, Empty, Field, Modal, SearchBox, Spinner, StatCard, Badge } from '../components/ui';
import { JalaliDateInput } from '../components/JalaliDateInput';
import { useMeta } from '../lib/meta';
import { useDebounced } from '../lib/useDebounced';
import { exportExcel } from '../lib/print';

interface ProductsResponse {
  items: ProductRow[];
  totals: { count: number; stockValue: number; low: number };
}

interface MoveRow {
  date: string;
  type: string;
  no: string;
  party: string;
  qty: number;
  price: number;
}

const UNITS = ['عدد', 'بکس', 'شیشه', 'بوتل', 'استرپ', 'تخته', 'کیلوگرام', 'گرام', 'پاکت'];
const CATEGORIES = ['قرص و کپسول', 'شربت', 'آمپول', 'پماد و کرم', 'قطره', 'پودر', 'لوازم بهداشتی', 'سایر'];

export function ProductsPage() {
  const { reloadMeta } = useMeta();
  const [q, setQ] = useState('');
  const debouncedQ = useDebounced(q);
  const [lowOnly, setLowOnly] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ProductRow | null>(null);
  const [deleting, setDeleting] = useState<ProductRow | null>(null);
  const [movesFor, setMovesFor] = useState<ProductRow | null>(null);
  const [busy, setBusy] = useState(false);

  const [name, setName] = useState('');
  const [unit, setUnit] = useState('عدد');
  const [category, setCategory] = useState('قرص و کپسول');
  const [price, setPrice] = useState('');
  const [cost, setCost] = useState('');
  const [stock, setStock] = useState('');
  const [minStock, setMinStock] = useState('5');
  const [barcode, setBarcode] = useState('');
  const [expiry, setExpiry] = useState('');
  const [saving, setSaving] = useState(false);

  const { data, loading, reload, error } = useFetch<ProductsResponse>(
    `/api/products?q=${encodeURIComponent(debouncedQ)}${lowOnly ? '&low=1' : ''}`,
  );
  const moves = useFetch<{ rows: MoveRow[] }>(movesFor ? `/api/products/${movesFor.id}/moves` : null);

  useEffect(() => {
    if (!formOpen) return;
    setName(editing?.name || '');
    setUnit(editing?.unit || 'عدد');
    setCategory(editing?.category || 'قرص و کپسول');
    setPrice(editing ? String(editing.price) : '');
    setCost(editing ? String(editing.avgCost) : '');
    setStock(editing ? String(editing.stock) : '');
    setMinStock(editing ? String(editing.minStock) : '5');
    setBarcode(editing?.barcode || '');
    setExpiry(editing?.expiry || '');
  }, [formOpen, editing]);

  const save = async () => {
    if (!name.trim()) {
      toast('نام ادویه الزامی است.', 'error');
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await api.put(
          `/api/products/${editing.id}`,
          { name, unit, category, price: Number(price) || 0, minStock: Number(minStock) || 0, barcode, expiry, rev: editing.rev },
          'ویرایش ادویه',
        );
        toast('اطلاعات ادویه ذخیره شد.');
      } else {
        await api.post(
          '/api/products',
          {
            name,
            unit,
            category,
            price: Number(price) || 0,
            cost: Number(cost) || 0,
            stock: Number(stock) || 0,
            minStock: Number(minStock) || 0,
            barcode,
            expiry,
          },
          'ثبت ادویه',
        );
        toast('ادویه ثبت شد.');
      }
      setFormOpen(false);
      setEditing(null);
      reload();
      reloadMeta();
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
      await api.del(`/api/products/${deleting.id}`);
      toast('ادویه از فهرست حذف شد.');
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
      toast('داده‌ای برای خروجی وجود ندارد.', 'warning');
      return;
    }
    exportExcel(
      'products',
      'موجودی',
      ['نام ادویه', 'کتگوری', 'واحد', 'موجودی', 'حد هشدار', 'بهای تمام‌شده', 'قیمت فروش', 'ارزش موجودی'],
      data.items.map((p) => [p.name, p.category || '', p.unit, p.stock, p.minStock, p.avgCost, p.price, p.stockValue]),
      'فهرست ادویه و موجودی',
    );
  };

  return (
    <div dir="rtl">
      <PageHeader title="ادویه و موجودی" subtitle="مدیریت اقلام داروخانه، قیمت‌ها، موجودی و بهای تمام‌شده">
        <button className="btn-outline btn-sm" onClick={exportList}>
          <Download size={14} /> اکسل
        </button>
        <button
          className="btn-primary btn-sm"
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus size={15} /> ادویه جدید
        </button>
      </PageHeader>

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="تعداد اقلام" value={String(data?.totals.count || 0)} tone="sky" icon={<Pill size={18} />} />
        <StatCard label="ارزش موجودی" value={`${formatMoney(data?.totals.stockValue)} ؋`} tone="emerald" hint="بر اساس بهای تمام‌شده" />
        <StatCard label="اقلام کم موجود" value={String(data?.totals.low || 0)} tone="amber" icon={<AlertTriangle size={18} />} />
        <div className="card px-4 py-3">
          <p className="text-[11px] font-semibold text-slate-500">جستجو و فیلتر</p>
          <div className="mt-1.5 flex gap-1.5">
            <SearchBox value={q} onChange={setQ} placeholder="نام ادویه…" className="flex-1" />
            <button
              type="button"
              onClick={() => setLowOnly((v) => !v)}
              className={`rounded-lg px-2 text-[11px] font-bold ${lowOnly ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600'}`}
              title="فقط اقلام کم موجود"
            >
              کم موجود
            </button>
          </div>
        </div>
      </div>

      <Card>
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <h2 className="text-sm font-bold text-slate-800">فهرست ادویه</h2>
          {lowOnly ? <span className="text-[11px] font-bold text-amber-700">فیلتر: فقط کم موجود</span> : null}
        </div>
        {loading && !data ? <Spinner /> : null}
        {error && !data ? <div className="p-4 text-sm text-rose-600">{error}</div> : null}
        {data && data.items.length === 0 ? (
          <Empty title="ادویه‌ای ثبت نشده است" hint="ابتدا اقلام داروخانه را ثبت کنید تا در فاکتور فروش و خرید قابل انتخاب باشند." />
        ) : null}
        {data && data.items.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>نام ادویه</th>
                  <th>کتگوری</th>
                  <th>موجودی</th>
                  <th>بهای تمام‌شده</th>
                  <th>قیمت فروش</th>
                  <th>ارزش موجودی</th>
                  <th>انقضا</th>
                  <th className="no-print">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((product) => {
                  const low = Number(product.stock) <= Number(product.minStock);
                  return (
                    <tr key={product.id}>
                      <td>
                        <p className="font-bold text-slate-800">{product.name}</p>
                        {product.barcode ? <p className="num text-[10px] text-slate-400">{product.barcode}</p> : null}
                      </td>
                      <td className="text-xs text-slate-500">{product.category || '—'}</td>
                      <td>
                        <Badge tone={Number(product.stock) <= 0 ? 'red' : low ? 'amber' : 'green'}>
                          {formatMoney(product.stock)} {product.unit}
                        </Badge>
                      </td>
                      <td className="num text-xs">{formatMoney(product.avgCost)}</td>
                      <td className="num font-semibold">{formatMoney(product.price)}</td>
                      <td className="num text-xs text-slate-600">{formatMoney(product.stockValue)}</td>
                      <td className="text-xs text-slate-500">{product.expiry ? formatDate(product.expiry) : '—'}</td>
                      <td className="no-print">
                        <div className="flex items-center gap-1">
                          <button
                            className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100"
                            title="گردش موجودی"
                            onClick={() => setMovesFor(product)}
                          >
                            <History size={15} />
                          </button>
                          <button
                            className="rounded-lg p-1.5 text-sky-600 hover:bg-sky-50"
                            title="ویرایش"
                            onClick={() => {
                              setEditing(product);
                              setFormOpen(true);
                            }}
                          >
                            <Pencil size={15} />
                          </button>
                          <button className="rounded-lg p-1.5 text-rose-600 hover:bg-rose-50" title="حذف" onClick={() => setDeleting(product)}>
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
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
        size="md"
        title={editing ? `ویرایش ${editing.name}` : 'ثبت ادویه جدید'}
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
          <Field label="نام ادویه" required className="sm:col-span-2">
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="مثلاً: پاراسیتامول ۵۰۰ ملی‌گرام" />
          </Field>
          <Field label="کتگوری">
            <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
          <Field label="واحد">
            <select className="input" value={unit} onChange={(e) => setUnit(e.target.value)}>
              {UNITS.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </Field>
          <Field label="قیمت فروش (افغانی)">
            <input className="input" type="number" min="0" dir="ltr" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0" />
          </Field>
          {!editing ? (
            <>
              <Field label="بهای خرید هر واحد" hint="برای محاسبه سود و بهای تمام‌شده">
                <input className="input" type="number" min="0" dir="ltr" value={cost} onChange={(e) => setCost(e.target.value)} placeholder="0" />
              </Field>
              <Field label="موجودی اولیه" hint="موجودی اولیه به‌عنوان حساب افتتاحیه ثبت می‌شود">
                <input className="input" type="number" min="0" dir="ltr" value={stock} onChange={(e) => setStock(e.target.value)} placeholder="0" />
              </Field>
            </>
          ) : (
            <Field label="موجودی فعلی" hint="موجودی فقط با ثبت خرید و فروش تغییر می‌کند">
              <div className="input bg-slate-50 text-slate-500">{formatMoney(editing.stock)} {editing.unit}</div>
            </Field>
          )}
          <Field label="حد هشدار موجودی">
            <input className="input" type="number" min="0" dir="ltr" value={minStock} onChange={(e) => setMinStock(e.target.value)} />
          </Field>
          <Field label="بارکد">
            <input className="input" dir="ltr" value={barcode} onChange={(e) => setBarcode(e.target.value)} placeholder="اختیاری" />
          </Field>
          <Field label="تاریخ انقضا">
            <JalaliDateInput value={expiry || todayISO()} onChange={setExpiry} />
          </Field>
        </div>
      </Modal>

      <Modal
        open={Boolean(movesFor)}
        onClose={() => setMovesFor(null)}
        size="lg"
        title={`گردش موجودی — ${movesFor?.name || ''}`}
        subtitle={`موجودی فعلی: ${formatMoney(movesFor?.stock)} ${movesFor?.unit || ''}`}
      >
        {moves.loading && !moves.data ? <Spinner /> : null}
        {moves.data && moves.data.rows.length === 0 ? <Empty title="حرکتی ثبت نشده است" /> : null}
        {moves.data && moves.data.rows.length > 0 ? (
          <div className="max-h-[50vh] overflow-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>تاریخ</th>
                  <th>نوع</th>
                  <th>شماره</th>
                  <th>طرف حساب</th>
                  <th>تعداد</th>
                  <th>قیمت واحد</th>
                </tr>
              </thead>
              <tbody>
                {moves.data.rows.map((row, index) => (
                  <tr key={`${row.no}-${index}`}>
                    <td className="whitespace-nowrap text-xs">{formatDate(row.date)}</td>
                    <td>
                      <Badge tone={row.type === 'خرید' ? 'blue' : 'green'}>{row.type}</Badge>
                    </td>
                    <td className="num text-xs">{row.no}</td>
                    <td className="max-w-[160px] truncate text-xs">{row.party}</td>
                    <td className={`num font-bold ${row.qty > 0 ? 'text-emerald-700' : 'text-rose-600'}`}>{formatMoney(row.qty)}</td>
                    <td className="num text-xs">{formatMoney(row.price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </Modal>

      <Confirm
        open={Boolean(deleting)}
        busy={busy}
        title="حذف ادویه"
        message={<>آیا <b>{deleting?.name}</b> از فهرست ادویه حذف شود؟ سوابق فروش و خرید آن حفظ می‌شود.</>}
        onCancel={() => setDeleting(null)}
        onConfirm={remove}
      />
    </div>
  );
}
