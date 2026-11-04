import { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2, Building2 } from 'lucide-react';
import { api, OfflineQueuedError } from '../lib/api';
import { toast } from '../lib/toast';
import { formatMoney, todayISO } from '../lib/format';
import type { MetaProduct, MetaParty, Purchase } from '../types';
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

const newRow = (): Row => ({ key: Math.random().toString(36).slice(2), productId: '', name: '', qty: '1', unitPrice: '' });

export function PurchaseForm({
  open,
  purchase,
  parties,
  products,
  onClose,
  onSaved,
  reloadMeta,
}: {
  open: boolean;
  purchase: Purchase | null;
  parties: MetaParty[];
  products: MetaProduct[];
  onClose: () => void;
  onSaved: () => void;
  reloadMeta: () => void;
}) {
  const [date, setDate] = useState(todayISO());
  const [partyId, setPartyId] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [rows, setRows] = useState<Row[]>([newRow()]);
  const [discount, setDiscount] = useState('');
  const [paid, setPaid] = useState('');
  const [paidTouched, setPaidTouched] = useState(false);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [partyModal, setPartyModal] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (purchase) {
      setDate(purchase.date);
      setPartyId(purchase.partyId || '');
      setCompanyName(purchase.companyName === 'خرید نقدی' ? '' : purchase.companyName);
      setRows(
        (purchase.items || []).map((item) => ({
          key: Math.random().toString(36).slice(2),
          productId: item.productId || '',
          name: item.name,
          qty: String(item.qty),
          unitPrice: String(item.unitPrice),
        })),
      );
      setDiscount(String(purchase.discount || ''));
      setPaid(String(purchase.paid ?? ''));
      setPaidTouched(true);
      setNote(purchase.note || '');
    } else {
      setDate(todayISO());
      setPartyId('');
      setCompanyName('');
      setRows([newRow()]);
      setDiscount('');
      setPaid('');
      setPaidTouched(false);
      setNote('');
    }
  }, [open, purchase]);

  const companies = useMemo(() => parties.filter((p) => p.type === 'company'), [parties]);
  const productMap = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);

  const items = rows.map((row) => {
    const product = productMap.get(row.productId);
    return {
      productId: row.productId || null,
      name: row.name || product?.name || '',
      qty: Number(row.qty) || 0,
      unitPrice: Number(row.unitPrice) || 0,
    };
  });

  const itemsTotal = Math.round(items.reduce((s, i) => s + i.qty * i.unitPrice, 0) * 100) / 100;
  const discountNum = Math.min(Math.max(Number(discount) || 0, 0), itemsTotal);
  const netTotal = Math.round((itemsTotal - discountNum) * 100) / 100;
  const paidNum = paidTouched ? Math.min(Math.max(Number(paid) || 0, 0), netTotal) : netTotal;
  const credit = Math.round((netTotal - paidNum) * 100) / 100;

  const updateRow = (key: string, patch: Partial<Row>) =>
    setRows((list) => list.map((row) => (row.key === key ? { ...row, ...patch } : row)));

  const pickProduct = (key: string, productId: string) => {
    const product = productMap.get(productId);
    updateRow(key, { productId, name: product?.name || '', unitPrice: product ? String(product.avgCost || '') : '' });
  };

  const submit = async () => {
    const cleanItems = items.filter((i) => i.qty > 0 && (i.name.trim() || i.productId));
    if (cleanItems.length === 0) {
      toast('حداقل یک قلم خرید با تعداد مشخص وارد کنید.', 'error');
      return;
    }
    if (credit > 0 && !partyId) {
      toast('برای خرید نسیه باید شرکت را انتخاب کنید.', 'error');
      return;
    }
    setBusy(true);
    try {
      const payload = {
        date,
        partyId: partyId || null,
        companyName: companyName.trim(),
        items: cleanItems.map((i) => ({ productId: i.productId, name: i.name, qty: i.qty, unitPrice: i.unitPrice })),
        discount: discountNum,
        paid: paidNum,
        note,
        ...(purchase ? { rev: purchase.rev } : {}),
      };
      if (purchase) await api.put(`/api/purchases/${purchase.id}`, payload, 'ویرایش فاکتور خرید');
      else await api.post('/api/purchases', payload, 'ثبت فاکتور خرید');
      toast(purchase ? 'فاکتور خرید ویرایش شد.' : 'فاکتور خرید ثبت شد و موجودی ادویه به‌روز گردید.');
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
        title={purchase ? `ویرایش فاکتور خرید ${purchase.no}` : 'فاکتور خرید جدید'}
        subtitle="با ثبت خرید، موجودی و بهای تمام‌شده (میانگین موزون) ادویه به‌طور خودکار به‌روز می‌شود."
        footer={
          <>
            <div className="me-auto text-xs font-bold text-slate-600">
              مبلغ خرید: <span className="num text-base text-emerald-700">{formatMoney(netTotal)}</span> ؋
              {credit > 0 ? <span className="ms-3 text-rose-600">بدهی به شرکت: {formatMoney(credit)} ؋</span> : null}
            </div>
            <button className="btn-outline" onClick={onClose}>
              انصراف
            </button>
            <button className="btn-primary" onClick={submit} disabled={busy}>
              {busy ? 'در حال ذخیره…' : purchase ? 'ذخیره تغییرات' : 'ثبت خرید'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="تاریخ خرید" required>
              <JalaliDateInput value={date} onChange={setDate} />
            </Field>
            <Field label="شرکت تأمین‌کننده" hint="برای خرید نقدی می‌توانید خالی بگذارید">
              <div className="flex gap-1.5">
                <select className="input" value={partyId} onChange={(e) => setPartyId(e.target.value)}>
                  <option value="">خرید نقدی (بدون حساب)</option>
                  {companies.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <button type="button" className="btn-outline shrink-0 px-2" onClick={() => setPartyModal(true)} title="شرکت جدید">
                  <Building2 size={16} />
                </button>
              </div>
            </Field>
            <Field label="نام شرکت (اختیاری)">
              <input
                className="input"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="مثلاً: شرکت ادویه افغان"
                disabled={Boolean(partyId)}
              />
            </Field>
          </div>

          <div className="rounded-xl border border-slate-200">
            <div className="hidden gap-2 border-b border-slate-100 bg-slate-50 px-3 py-2 text-[11px] font-bold text-slate-500 sm:grid sm:grid-cols-[minmax(0,1fr)_70px_110px_110px_36px]">
              <span>نام کالا</span>
              <span>تعداد</span>
              <span>قیمت خرید واحد</span>
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
                            {p.name} — موجودی {p.stock}
                          </option>
                        ))}
                      </select>
                      <input
                        className="input"
                        value={row.name}
                        onChange={(e) => updateRow(row.key, { name: e.target.value })}
                        placeholder="نام کالا"
                      />
                      {product ? (
                        <p className="mt-1 text-[10px] text-slate-500">
                          موجودی فعلی: {formatMoney(product.stock)} {product.unit} · میانگین بهای تمام‌شده: {formatMoney(product.avgCost)} ؋
                        </p>
                      ) : null}
                    </div>
                    <input
                      className="input text-center"
                      type="number"
                      min="0"
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
                      aria-label="قیمت خرید"
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
            <Field label="تخفیف خرید (افغانی)">
              <input className="input" type="number" min="0" value={discount} onChange={(e) => setDiscount(e.target.value)} placeholder="0" dir="ltr" />
            </Field>
            <Field label="مبلغ پرداخت‌شده" hint="باقی‌مانده به‌عنوان بدهی به شرکت ثبت می‌شود">
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
            </Field>
            <Field label="یادداشت">
              <input className="input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="شماره بل / توضیح" />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-50 p-3 text-xs sm:grid-cols-4">
            <div>
              <p className="text-slate-500">مجموع اقلام</p>
              <p className="num mt-0.5 text-sm font-bold">{formatMoney(itemsTotal)}</p>
            </div>
            <div>
              <p className="text-slate-500">تخفیف</p>
              <p className="num mt-0.5 text-sm font-bold text-amber-700">{formatMoney(discountNum)}</p>
            </div>
            <div>
              <p className="text-slate-500">مبلغ خالص</p>
              <p className="num mt-0.5 text-sm font-bold text-emerald-700">{formatMoney(netTotal)}</p>
            </div>
            <div>
              <p className="text-slate-500">باقی (بدهی)</p>
              <p className={`num mt-0.5 text-sm font-bold ${credit > 0 ? 'text-rose-600' : 'text-slate-600'}`}>{formatMoney(credit)}</p>
            </div>
          </div>
        </div>
      </Modal>

      <QuickPartyModal
        open={partyModal}
        type="company"
        onClose={() => setPartyModal(false)}
        onCreated={(party) => {
          setPartyId(party.id);
          reloadMeta();
        }}
      />
    </>
  );
}
