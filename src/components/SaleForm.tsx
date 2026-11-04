import { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2, UserPlus, Wallet } from 'lucide-react';
import { api, OfflineQueuedError } from '../lib/api';
import { toast } from '../lib/toast';
import { formatMoney, todayISO } from '../lib/format';
import type { MetaProduct, MetaParty, Sale } from '../types';
import { Field, Modal } from './ui';
import { JalaliDateInput } from './JalaliDateInput';
import { QuickPartyModal } from './QuickPartyModal';

interface Row {
  key: string;
  productId: string;
  name: string;
  qty: string;
  unitPrice: string;
}

const newRow = (): Row => ({
  key: Math.random().toString(36).slice(2),
  productId: '',
  name: '',
  qty: '1',
  unitPrice: '',
});

export function SaleForm({
  open,
  sale,
  parties,
  products,
  onClose,
  onSaved,
  reloadMeta,
}: {
  open: boolean;
  sale: Sale | null;
  parties: MetaParty[];
  products: MetaProduct[];
  onClose: () => void;
  onSaved: () => void;
  reloadMeta: () => void;
}) {
  const [date, setDate] = useState(todayISO());
  const [partyId, setPartyId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [rows, setRows] = useState<Row[]>([newRow()]);
  const [discount, setDiscount] = useState('');
  const [paid, setPaid] = useState('');
  const [paidTouched, setPaidTouched] = useState(false);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [partyModal, setPartyModal] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (sale) {
      setDate(sale.date);
      setPartyId(sale.partyId || '');
      setCustomerName(sale.customerName === 'مشتری نقدی' ? '' : sale.customerName);
      setRows(
        (sale.items || []).map((item) => ({
          key: Math.random().toString(36).slice(2),
          productId: item.productId || '',
          name: item.name,
          qty: String(item.qty),
          unitPrice: String(item.unitPrice),
        })),
      );
      setDiscount(String(sale.discount || ''));
      setPaid(String(sale.paid ?? ''));
      setPaidTouched(true);
      setNote(sale.note || '');
    } else {
      setDate(todayISO());
      setPartyId('');
      setCustomerName('');
      setRows([newRow()]);
      setDiscount('');
      setPaid('');
      setPaidTouched(false);
      setNote('');
    }
  }, [open, sale]);

  const customers = useMemo(() => parties.filter((p) => p.type === 'customer'), [parties]);
  const productMap = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);

  const items = rows.map((row) => {
    const product = productMap.get(row.productId);
    return {
      productId: row.productId || null,
      name: row.name || product?.name || '',
      qty: Number(row.qty) || 0,
      unitPrice: Number(row.unitPrice) || 0,
      cost: product ? Number(product.avgCost) || 0 : 0,
    };
  });

  const itemsTotal = Math.round(items.reduce((s, i) => s + i.qty * i.unitPrice, 0) * 100) / 100;
  const discountNum = Math.min(Math.max(Number(discount) || 0, 0), itemsTotal);
  const netTotal = Math.round((itemsTotal - discountNum) * 100) / 100;
  const paidNum = paidTouched ? Math.min(Math.max(Number(paid) || 0, 0), netTotal) : netTotal;
  const credit = Math.round((netTotal - paidNum) * 100) / 100;
  const profit = Math.round((items.reduce((s, i) => s + i.qty * (i.unitPrice - (i.cost || 0)), 0) - discountNum) * 100) / 100;

  const updateRow = (key: string, patch: Partial<Row>) => {
    setRows((list) => list.map((row) => (row.key === key ? { ...row, ...patch } : row)));
  };

  const pickProduct = (key: string, productId: string) => {
    const product = productMap.get(productId);
    updateRow(key, {
      productId,
      name: product?.name || '',
      unitPrice: product ? String(product.price) : '',
    });
  };

  const submit = async () => {
    const cleanItems = items.filter((i) => i.qty > 0 && (i.name.trim() || i.productId));
    if (cleanItems.length === 0) {
      toast('حداقل یک قلم کالا با تعداد مشخص وارد کنید.', 'error');
      return;
    }
    if (credit > 0 && !partyId) {
      toast('برای فروش نسیه باید مشتری را انتخاب کنید.', 'error');
      return;
    }
    setBusy(true);
    try {
      const payload = {
        date,
        partyId: partyId || null,
        customerName: customerName.trim(),
        items: cleanItems.map((i) => ({ productId: i.productId, name: i.name, qty: i.qty, unitPrice: i.unitPrice })),
        discount: discountNum,
        paid: paidNum,
        note,
        ...(sale ? { rev: sale.rev } : {}),
      };
      if (sale) await api.put(`/api/sales/${sale.id}`, payload, 'ویرایش فاکتور فروش');
      else await api.post('/api/sales', payload, 'ثبت فاکتور فروش');
      toast(sale ? 'فاکتور فروش ویرایش شد.' : 'فاکتور فروش ثبت شد.');
      onSaved();
      onClose();
    } catch (err) {
      if (err instanceof OfflineQueuedError) {
        toast(err.message, 'warning');
        onClose();
      } else {
        toast(err instanceof Error ? err.message : 'ثبت ناموفق بود.', 'error');
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        size="xl"
        title={sale ? `ویرایش فاکتور ${sale.no}` : 'فاکتور فروش جدید'}
        subtitle="مبلغ‌ها به افغانی محاسبه می‌شود؛ فروش نسیه به‌صورت خودکار در حساب مشتری ثبت می‌گردد."
        footer={
          <>
            <div className="me-auto text-xs font-bold text-slate-600">
              مبلغ نهایی: <span className="num text-base text-emerald-700">{formatMoney(netTotal)}</span> ؋
              {credit > 0 ? <span className="ms-3 text-rose-600">نسیه: {formatMoney(credit)} ؋</span> : null}
            </div>
            <button className="btn-outline" onClick={onClose}>
              انصراف
            </button>
            <button className="btn-primary" onClick={submit} disabled={busy}>
              {busy ? 'در حال ذخیره…' : sale ? 'ذخیره تغییرات' : 'ثبت فاکتور'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="تاریخ فاکتور" required>
              <JalaliDateInput value={date} onChange={setDate} />
            </Field>
            <Field label="مشتری" hint="برای فروش نقدی می‌توانید خالی بگذارید">
              <div className="flex gap-1.5">
                <select className="input" value={partyId} onChange={(e) => setPartyId(e.target.value)}>
                  <option value="">مشتری نقدی (بدون حساب)</option>
                  {customers.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <button type="button" className="btn-outline shrink-0 px-2" onClick={() => setPartyModal(true)} title="مشتری جدید">
                  <UserPlus size={16} />
                </button>
              </div>
            </Field>
            <Field label="نام مشتری (اختیاری)">
              <input
                className="input"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="مثلاً: احمد ولی"
                disabled={Boolean(partyId)}
              />
            </Field>
          </div>

          <div className="rounded-xl border border-slate-200">
            <div className="hidden gap-2 border-b border-slate-100 bg-slate-50 px-3 py-2 text-[11px] font-bold text-slate-500 sm:grid sm:grid-cols-[minmax(0,1fr)_70px_110px_110px_36px]">
              <span>نام کالا</span>
              <span>تعداد</span>
              <span>قیمت واحد</span>
              <span>مجموع</span>
              <span />
            </div>
            <div className="divide-y divide-slate-100">
              {rows.map((row) => {
                const product = productMap.get(row.productId);
                const lineTotal = (Number(row.qty) || 0) * (Number(row.unitPrice) || 0);
                return (
                  <div key={row.key} className="grid grid-cols-2 gap-2 p-2.5 sm:grid-cols-[minmax(0,1fr)_70px_110px_110px_36px] sm:items-center">
                    <div className="col-span-2 sm:col-span-1">
                      <select className="input mb-1" value={row.productId} onChange={(e) => pickProduct(row.key, e.target.value)}>
                        <option value="">— کالای آزاد (بدون موجودی) —</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} {p.stock <= 0 ? '(اتمام موجودی)' : `— موجودی ${p.stock}`}
                          </option>
                        ))}
                      </select>
                      <input
                        className="input"
                        value={row.name}
                        onChange={(e) => updateRow(row.key, { name: e.target.value })}
                        placeholder="نام کالا / خدمت"
                      />
                      {product ? (
                        <p className="mt-1 text-[10px] text-slate-500">
                          موجودی: {formatMoney(product.stock)} {product.unit} · بهای تمام‌شده: {formatMoney(product.avgCost)} ؋
                        </p>
                      ) : null}
                    </div>
                    <input
                      className="input text-center"
                      type="number"
                      min="0"
                      step="1"
                      value={row.qty}
                      onChange={(e) => updateRow(row.key, { qty: e.target.value })}
                      dir="ltr"
                      aria-label="تعداد"
                    />
                    <input
                      className="input text-center"
                      type="number"
                      min="0"
                      step="0.01"
                      value={row.unitPrice}
                      onChange={(e) => updateRow(row.key, { unitPrice: e.target.value })}
                      placeholder="قیمت"
                      dir="ltr"
                      aria-label="قیمت واحد"
                    />
                    <span className="num px-1 text-sm font-bold text-slate-700">{formatMoney(lineTotal)}</span>
                    <button
                      type="button"
                      className="justify-self-end rounded-lg p-2 text-rose-500 hover:bg-rose-50"
                      onClick={() => setRows((list) => (list.length > 1 ? list.filter((r) => r.key !== row.key) : [newRow()]))}
                      title="حذف قلم"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
            <div className="border-t border-slate-100 p-2.5">
              <button type="button" className="btn-ghost btn-sm text-emerald-700" onClick={() => setRows((list) => [...list, newRow()])}>
                <Plus size={14} /> افزودن قلم دیگر
              </button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="تخفیف (افغانی)">
              <input
                className="input"
                type="number"
                min="0"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                placeholder="0"
                dir="ltr"
              />
            </Field>
            <Field label="مبلغ پرداخت‌شده" hint="اگر کمتر از مبلغ کل باشد، باقی به‌عنوان قرض ثبت می‌شود">
              <div className="flex gap-1.5">
                <input
                  className="input"
                  type="number"
                  min="0"
                  value={paidTouched ? paid : netTotal ? String(netTotal) : ''}
                  onChange={(e) => {
                    setPaidTouched(true);
                    setPaid(e.target.value);
                  }}
                  dir="ltr"
                />
                <button
                  type="button"
                  className="btn-outline shrink-0 px-2"
                  title="پرداخت کامل"
                  onClick={() => {
                    setPaidTouched(true);
                    setPaid(String(netTotal));
                  }}
                >
                  <Wallet size={15} />
                </button>
              </div>
            </Field>
            <Field label="یادداشت">
              <input className="input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="توضیح اختیاری" />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-50 p-3 text-xs sm:grid-cols-5">
            <div>
              <p className="text-slate-500">مجموع اقلام</p>
              <p className="num mt-0.5 text-sm font-bold">{formatMoney(itemsTotal)}</p>
            </div>
            <div>
              <p className="text-slate-500">تخفیف</p>
              <p className="num mt-0.5 text-sm font-bold text-amber-700">{formatMoney(discountNum)}</p>
            </div>
            <div>
              <p className="text-slate-500">قابل پرداخت</p>
              <p className="num mt-0.5 text-sm font-bold text-emerald-700">{formatMoney(netTotal)}</p>
            </div>
            <div>
              <p className="text-slate-500">باقی (نسیه)</p>
              <p className={`num mt-0.5 text-sm font-bold ${credit > 0 ? 'text-rose-600' : 'text-slate-600'}`}>{formatMoney(credit)}</p>
            </div>
            <div>
              <p className="text-slate-500">سود برآوردی</p>
              <p className={`num mt-0.5 text-sm font-bold ${profit >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>{formatMoney(profit)}</p>
            </div>
          </div>
        </div>
      </Modal>

      <QuickPartyModal
        open={partyModal}
        type="customer"
        onClose={() => setPartyModal(false)}
        onCreated={(party) => {
          setPartyId(party.id);
          reloadMeta();
        }}
      />
    </>
  );
}
