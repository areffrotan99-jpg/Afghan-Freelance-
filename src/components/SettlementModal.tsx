import { useEffect, useMemo, useState } from 'react';
import { api, OfflineQueuedError } from '../lib/api';
import { toast } from '../lib/toast';
import { formatMoney, todayISO } from '../lib/format';
import type { MetaParty } from '../types';
import { Field, Modal } from './ui';
import { JalaliDateInput } from './JalaliDateInput';

export function SettlementModal({
  open,
  type,
  parties,
  initialPartyId,
  onClose,
  onSaved,
}: {
  open: boolean;
  type: 'receive' | 'pay';
  parties: MetaParty[];
  initialPartyId?: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [date, setDate] = useState(todayISO());
  const [partyId, setPartyId] = useState('');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('نقدی');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);

  const options = useMemo(() => parties.filter((p) => p.type === (type === 'receive' ? 'customer' : 'company')), [parties, type]);

  useEffect(() => {
    if (!open) return;
    setDate(todayISO());
    setPartyId(initialPartyId || '');
    setAmount('');
    setMethod('نقدی');
    setNote('');
  }, [open, initialPartyId]);

  const save = async () => {
    const value = Number(amount);
    if (!partyId) {
      toast(type === 'receive' ? 'مشتری را انتخاب کنید.' : 'شرکت را انتخاب کنید.', 'error');
      return;
    }
    if (!value || value <= 0) {
      toast('مبلغ را وارد کنید.', 'error');
      return;
    }
    setBusy(true);
    try {
      await api.post('/api/settlements', { date, type, partyId, amount: value, method, note }, type === 'receive' ? 'ثبت دریافت' : 'ثبت پرداخت');
      toast(type === 'receive' ? 'دریافت ثبت شد و از قرض مشتری کسر گردید.' : 'پرداخت ثبت شد و از بدهی شرکت کسر گردید.');
      onSaved();
      onClose();
    } catch (err) {
      if (err instanceof OfflineQueuedError) {
        toast(err.message, 'warning');
        onClose();
      } else toast(err instanceof Error ? err.message : 'ثبت ناموفق بود.', 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      title={type === 'receive' ? 'ثبت دریافت از مشتری' : 'پرداخت به شرکت'}
      subtitle={type === 'receive' ? 'مبلغ دریافت‌شده از قرض مشتری کسر و به صندوق اضافه می‌شود.' : 'مبلغ پرداختی از بدهی شرکت کسر و از صندوق کسر می‌شود.'}
      footer={
        <>
          <button className="btn-outline" onClick={onClose}>
            انصراف
          </button>
          <button className="btn-primary" onClick={save} disabled={busy}>
            {busy ? 'در حال ذخیره…' : 'ثبت'}
          </button>
        </>
      }
    >
      <div className="space-y-3">
        <Field label={type === 'receive' ? 'مشتری' : 'شرکت'} required>
          <select className="input" value={partyId} onChange={(e) => setPartyId(e.target.value)}>
            <option value="">انتخاب کنید…</option>
            {options.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-2">
          <Field label="مبلغ (افغانی)" required>
            <input className="input" type="number" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" dir="ltr" />
          </Field>
          <Field label="تاریخ" required>
            <JalaliDateInput value={date} onChange={setDate} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Field label="طریقه">
            <select className="input" value={method} onChange={(e) => setMethod(e.target.value)}>
              {['نقدی', 'حساب بانکی', 'حساب‌پای', 'دیگر'].map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </Field>
          <Field label="یادداشت">
            <input className="input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="اختیاری" />
          </Field>
        </div>
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-[11px] text-emerald-800">
          {type === 'receive' ? 'دریافت' : 'پرداخت'} به‌صورت خودکار در صندوق و دفتر کل ثبت می‌شود.
        </p>
      </div>
    </Modal>
  );
}

export function formatAmount(value: number) {
  return `${formatMoney(value)} ؋`;
}
