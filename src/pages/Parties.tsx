import { useEffect, useMemo, useState } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  FileText,
  Printer,
  ArrowDownLeft,
  ArrowUpRight,
  Users,
  Building2,
  Download,
} from 'lucide-react';
import { api, useFetch, OfflineQueuedError } from '../lib/api';
import { toast } from '../lib/toast';
import { formatDate, formatMoney, todayISO } from '../lib/format';
import type { PartyRow, Statement } from '../types';
import { PageHeader, useDateRange, DateRangeBar } from '../components/PageHeader';
import { Card, Confirm, Empty, Field, Modal, SearchBox, Spinner, StatCard, Badge } from '../components/ui';
import { JalaliDateInput } from '../components/JalaliDateInput';
import { SettlementModal } from '../components/SettlementModal';
import { useMeta } from '../lib/meta';
import { useDebounced } from '../lib/useDebounced';
import { printPartyStatement } from '../lib/docs';
import { exportExcel } from '../lib/print';

interface PartiesResponse {
  items: PartyRow[];
  totals: { customers: number; companies: number };
}

export function PartiesPage({ type }: { type: 'customer' | 'company' }) {
  const isCustomer = type === 'customer';
  const range = useDateRange('month');
  const { meta, reloadMeta } = useMeta();
  const [q, setQ] = useState('');
  const debouncedQ = useDebounced(q);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<PartyRow | null>(null);
  const [deleting, setDeleting] = useState<PartyRow | null>(null);
  const [statementFor, setStatementFor] = useState<PartyRow | null>(null);
  const [settleFor, setSettleFor] = useState<PartyRow | null>(null);
  const [busy, setBusy] = useState(false);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [note, setNote] = useState('');
  const [opening, setOpening] = useState('');
  const [openingDate, setOpeningDate] = useState(todayISO());
  const [saving, setSaving] = useState(false);

  const { data, loading, reload, error } = useFetch<PartiesResponse>(
    `/api/parties?type=${type}&q=${encodeURIComponent(debouncedQ)}`,
  );
  const statementPath = statementFor
    ? `/api/parties/${statementFor.id}/statement?from=${range.from}&to=${range.to}`
    : null;
  const statement = useFetch<Statement>(statementPath);

  const totals = useMemo(() => {
    const items = data?.items || [];
    return {
      count: items.length,
      withBalance: items.filter((p) => p.balance > 0.009).length,
      sum: items.reduce((s, p) => s + Math.max(0, p.balance), 0),
    };
  }, [data]);

  useEffect(() => {
    if (!formOpen) return;
    setName(editing?.name || '');
    setPhone(editing?.phone || '');
    setAddress(editing?.address || '');
    setNote(editing?.note || '');
    setOpening('');
    setOpeningDate(todayISO());
  }, [formOpen, editing]);

  const save = async () => {
    if (!name.trim()) {
      toast('نام الزامی است.', 'error');
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/api/parties/${editing.id}`, { name, phone, address, note, rev: editing.rev }, 'ویرایش طرف حساب');
        toast('اطلاعات ذخیره شد.');
      } else {
        await api.post(
          '/api/parties',
          { name, phone, address, note, type, openingBalance: Number(opening) || 0, openingDate },
          'ثبت طرف حساب',
        );
        toast(isCustomer ? 'مشتری جدید ثبت شد.' : 'شرکت جدید ثبت شد.');
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
      await api.del(`/api/parties/${deleting.id}`);
      toast('حساب حذف شد.');
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
      `${type}s`,
      isCustomer ? 'مشتریان' : 'شرکت‌ها',
      ['نام', 'تلفون', 'آدرس', 'باقی حساب (افغانی)', 'آخرین معامله'],
      data.items.map((p) => [p.name, p.phone || '', p.address || '', p.balance, p.lastDate ? formatDate(p.lastDate) : '']),
      isCustomer ? 'فهرست مشتریان و قرض‌ها' : 'فهرست شرکت‌ها و بدهی‌ها',
    );
  };

  return (
    <div dir="rtl">
      <PageHeader
        title={isCustomer ? 'مشتریان و قرض‌داری' : 'حساب شرکت‌ها'}
        subtitle={
          isCustomer
            ? 'ثبت قرض مشتریان، دریافت پرداخت و مشاهده باقی‌مانده بدهی'
            : 'بدهی به شرکت‌های تأمین‌کننده، پرداخت‌ها و باقی‌مانده حساب'
        }
      >
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
          <Plus size={15} /> {isCustomer ? 'مشتری جدید' : 'شرکت جدید'}
        </button>
      </PageHeader>

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label={isCustomer ? 'کل قرض مشتریان' : 'کل بدهی به شرکت‌ها'} value={`${formatMoney(totals.sum)} ؋`} tone={isCustomer ? 'amber' : 'rose'} icon={isCustomer ? <Users size={18} /> : <Building2 size={18} />} />
        <StatCard label="تعداد حساب‌ها" value={String(totals.count)} tone="slate" />
        <StatCard label="حساب‌های دارای باقی" value={String(totals.withBalance)} tone="sky" />
        <div className="card px-4 py-3">
          <p className="text-[11px] font-semibold text-slate-500">جستجو</p>
          <div className="mt-1.5">
            <SearchBox value={q} onChange={setQ} placeholder={isCustomer ? 'نام یا تلفون مشتری…' : 'نام شرکت…'} />
          </div>
        </div>
      </div>

      <Card>
        <div className="border-b border-slate-100 px-4 py-3">
          <h2 className="text-sm font-bold text-slate-800">{isCustomer ? 'فهرست مشتریان' : 'فهرست شرکت‌ها'}</h2>
        </div>
        {loading && !data ? <Spinner /> : null}
        {error && !data ? <div className="p-4 text-sm text-rose-600">{error}</div> : null}
        {data && data.items.length === 0 ? (
          <Empty
            title={isCustomer ? 'مشتری ثبت نشده است' : 'شرکتی ثبت نشده است'}
            hint="برای ثبت فروش یا خرید نسیه، ابتدا طرف حساب را ایجاد کنید."
          />
        ) : null}
        {data && data.items.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>نام</th>
                  <th>تلفون</th>
                  <th>آدرس</th>
                  <th>آخرین معامله</th>
                  <th>باقی حساب</th>
                  <th className="no-print">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((party) => (
                  <tr key={party.id}>
                    <td className="font-bold text-slate-800">{party.name}</td>
                    <td className="num text-xs" dir="ltr">
                      {party.phone || '—'}
                    </td>
                    <td className="max-w-[160px] truncate text-xs text-slate-500">{party.address || '—'}</td>
                    <td className="whitespace-nowrap text-xs">{party.lastDate ? formatDate(party.lastDate) : '—'}</td>
                    <td className="num">
                      {party.balance > 0.009 ? (
                        <Badge tone={isCustomer ? 'amber' : 'red'}>{formatMoney(party.balance)} ؋</Badge>
                      ) : party.balance < -0.009 ? (
                        <Badge tone="blue">{formatMoney(Math.abs(party.balance))} ؋ بستانکار</Badge>
                      ) : (
                        <span className="text-xs text-slate-400">تسویه</span>
                      )}
                    </td>
                    <td className="no-print">
                      <div className="flex items-center gap-1">
                        <button
                          className="rounded-lg p-1.5 text-emerald-700 hover:bg-emerald-50"
                          title={isCustomer ? 'دریافت قرض' : 'پرداخت به شرکت'}
                          onClick={() => setSettleFor(party)}
                        >
                          {isCustomer ? <ArrowDownLeft size={15} /> : <ArrowUpRight size={15} />}
                        </button>
                        <button
                          className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100"
                          title="صورت‌حساب"
                          onClick={() => setStatementFor(party)}
                        >
                          <FileText size={15} />
                        </button>
                        <button
                          className="rounded-lg p-1.5 text-sky-600 hover:bg-sky-50"
                          title="ویرایش"
                          onClick={() => {
                            setEditing(party);
                            setFormOpen(true);
                          }}
                        >
                          <Pencil size={15} />
                        </button>
                        <button className="rounded-lg p-1.5 text-rose-600 hover:bg-rose-50" title="حذف" onClick={() => setDeleting(party)}>
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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
        title={editing ? `ویرایش ${editing.name}` : isCustomer ? 'ثبت مشتری جدید' : 'ثبت شرکت جدید'}
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
          <Field label="نام" required className="sm:col-span-2">
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder={isCustomer ? 'نام مشتری' : 'نام شرکت'} />
          </Field>
          <Field label="شماره تلفون">
            <input className="input" dir="ltr" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="07xx xxx xxx" />
          </Field>
          <Field label="آدرس">
            <input className="input" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="اختیاری" />
          </Field>
          {!editing ? (
            <>
              <Field label="باقی حساب قبلی (افغانی)" hint="قرض/بدهی که از قبل داشته است">
                <input className="input" type="number" min="0" dir="ltr" value={opening} onChange={(e) => setOpening(e.target.value)} placeholder="0" />
              </Field>
              <Field label="تاریخ باقی قبلی">
                <JalaliDateInput value={openingDate} onChange={setOpeningDate} />
              </Field>
            </>
          ) : null}
          <Field label="یادداشت" className="sm:col-span-2">
            <input className="input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="توضیح اختیاری" />
          </Field>
        </div>
      </Modal>

      <Modal
        open={Boolean(statementFor)}
        onClose={() => setStatementFor(null)}
        size="lg"
        title={`صورت‌حساب — ${statementFor?.name || ''}`}
        subtitle={`${formatDate(range.from)} تا ${formatDate(range.to)}`}
        footer={
          <>
            <button className="btn-outline" onClick={() => setStatementFor(null)}>
              بستن
            </button>
            <button
              className="btn-outline"
              onClick={() => statement.data && meta && printPartyStatement(statement.data, meta.settings)}
            >
              <Printer size={15} /> چاپ / PDF
            </button>
          </>
        }
      >
        <div className="mb-3 grid grid-cols-3 gap-2 rounded-xl bg-slate-50 p-3 text-center">
          <div>
            <p className="text-[11px] text-slate-500">باقی قبلی</p>
            <p className="num text-sm font-bold">{formatMoney(statement.data?.opening)}</p>
          </div>
          <div>
            <p className="text-[11px] text-slate-500">{isCustomer ? 'جمع قرض دوره' : 'جمع خرید دوره'}</p>
            <p className="num text-sm font-bold text-rose-600">
              {formatMoney((statement.data?.rows || []).reduce((s, r) => s + r.charge, 0))}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-slate-500">باقی فعلی</p>
            <p className="num text-sm font-bold text-emerald-700">{formatMoney(statement.data?.closing)}</p>
          </div>
        </div>

        {statement.loading && !statement.data ? <Spinner /> : null}
        {statement.data && statement.data.rows.length === 0 ? <Empty title="حرکتی در این بازه ثبت نشده است" /> : null}
        {statement.data && statement.data.rows.length > 0 ? (
          <div className="max-h-[45vh] overflow-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>تاریخ</th>
                  <th>شرح</th>
                  <th>{isCustomer ? 'قرض' : 'خرید'}</th>
                  <th>پرداخت</th>
                  <th>باقی</th>
                </tr>
              </thead>
              <tbody>
                {statement.data.rows.map((row) => (
                  <tr key={row.id}>
                    <td className="whitespace-nowrap text-xs">{formatDate(row.date)}</td>
                    <td className="max-w-[240px] truncate text-xs">{row.description}</td>
                    <td className="num text-rose-600">{row.charge ? formatMoney(row.charge) : '—'}</td>
                    <td className="num text-emerald-700">{row.payment ? formatMoney(row.payment) : '—'}</td>
                    <td className="num font-bold">{formatMoney(row.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </Modal>

      <SettlementModal
        open={Boolean(settleFor)}
        type={isCustomer ? 'receive' : 'pay'}
        parties={meta?.parties || []}
        initialPartyId={settleFor?.id}
        onClose={() => setSettleFor(null)}
        onSaved={() => {
          reload();
          reloadMeta();
        }}
      />

      <Confirm
        open={Boolean(deleting)}
        busy={busy}
        title="حذف حساب"
        message={
          <>
            آیا حساب <b>{deleting?.name}</b> حذف شود؟
            <br />
            فقط حساب‌هایی که باقی‌مانده صفر دارند قابل حذف هستند.
          </>
        }
        onCancel={() => setDeleting(null)}
        onConfirm={remove}
      />
    </div>
  );
}
