import { useState } from 'react';
import { api } from '../lib/api';
import { toast } from '../lib/toast';
import { Field, Modal } from './ui';
import { JalaliDateInput } from './JalaliDateInput';
import { todayISO } from '../lib/format';

export function QuickPartyModal({
  open,
  type,
  onClose,
  onCreated,
}: {
  open: boolean;
  type: 'customer' | 'company';
  onClose: () => void;
  onCreated: (party: { id: string; name: string }) => void;
}) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [opening, setOpening] = useState('');
  const [openingDate, setOpeningDate] = useState(todayISO());
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!name.trim()) {
      toast('نام الزامی است.', 'error');
      return;
    }
    setBusy(true);
    try {
      const result = await api.post<{ party: { id: string; name: string } }>(
        '/api/parties',
        { name: name.trim(), type, phone, openingBalance: Number(opening) || 0, openingDate },
        'ثبت طرف حساب',
      );
      toast(type === 'customer' ? 'مشتری ثبت شد.' : 'شرکت ثبت شد.');
      onCreated(result.party);
      setName('');
      setPhone('');
      setOpening('');
      onClose();
    } catch (err) {
      toast(err instanceof Error ? err.message : 'ثبت ناموفق بود.', 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={type === 'customer' ? 'ثبت مشتری جدید' : 'ثبت شرکت جدید'}
      size="sm"
      footer={
        <>
          <button className="btn-outline" onClick={onClose}>
            انصراف
          </button>
          <button className="btn-primary" onClick={submit} disabled={busy}>
            {busy ? 'در حال ثبت…' : 'ثبت'}
          </button>
        </>
      }
    >
      <div className="space-y-3">
        <Field label="نام" required>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="نام کامل" />
        </Field>
        <Field label="شماره تلفون">
          <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="07xx xxx xxx" dir="ltr" />
        </Field>
        <div className="grid grid-cols-2 gap-2">
          <Field label="باقی حساب قبلی (افغانی)" hint="اگر قرض/بدهی قبلی دارد">
            <input
              className="input"
              type="number"
              min="0"
              value={opening}
              onChange={(e) => setOpening(e.target.value)}
              placeholder="0"
              dir="ltr"
            />
          </Field>
          <Field label="تاریخ باقی قبلی">
            <JalaliDateInput value={openingDate} onChange={setOpeningDate} />
          </Field>
        </div>
      </div>
    </Modal>
  );
}
