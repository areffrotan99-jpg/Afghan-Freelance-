import { useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, Printer, Download, Coins, Wallet } from 'lucide-react';
import { api, useFetch, OfflineQueuedError } from '../lib/api';
import { toast } from '../lib/toast';
import { formatDate, formatMoney, todayISO, docTypeLabel } from '../lib/format';
import { DateRangeBar, PageHeader, useDateRange } from '../components/PageHeader';
import { Card, Empty, Field, Modal, Spinner, Badge } from '../components/ui';
import { JalaliDateInput } from '../components/JalaliDateInput';
import { SettlementModal } from '../components/SettlementModal';
import { useMeta } from '../lib/meta';
import { useAuth } from '../lib/session';
import { printGenericReport } from '../lib/docs';
import { exportExcel } from '../lib/print';

interface CashRow {
  id: string;
  no: number;
  date: string;
  description: string;
  refType: string;
  refNo: string;
  debit: number;
  credit: number;
  balance: number;
}

interface CashbookResponse {
  opening: number;
  closing: number;
  totalIn: number;
  totalOut: number;
  rows: CashRow[];
  from: string;
  to: string;
}

export function CashboxPage() {
  const range = useDateRange('month');
  const { meta } = useMeta();
  const { user } = useAuth();
  const [settleType, setSettleType] = useState<'receive' | 'pay' | null>(null);
  const [capitalOpen, setCapitalOpen] = useState(false);
  const [capitalDate, setCapitalDate] = useState(todayISO());
  const [capitalAmount, setCapitalAmount] = useState('');
  const [capitalNote, setCapitalNote] = useState('');
  const [busy, setBusy] = useState(false);

  const { data, loading, reload, error } = useFetch<CashbookResponse>(`/api/cashbook?from=${range.from}&to=${range.to}`);

  const addCapital = async () => {
    const value = Number(capitalAmount);
    if (!value || value <= 0) {
      toast('مبلغ را وارد کنید.', 'error');
      return;
    }
    setBusy(true);
    try {
      await api.post('/api/opening-cash', { amount: value, date: capitalDate, note: capitalNote }, 'ثبت سرمایه');
      toast('مبلغ به صندوق اضافه شد.');
      setCapitalOpen(false);
      setCapitalAmount('');
      setCapitalNote('');
      reload();
    } catch (err) {
      toast(err instanceof Error ? err.message : 'ثبت ناموفق بود.', 'error');
    } finally {
      setBusy(false);
    }
  };

  const printCash = () => {
    if (!data || !meta) return;
    printGenericReport(meta.settings, 'کتاب صندوق (گردش نقدی)', `${formatDate(data.from)} تا ${formatDate(data.to)}`, [
      {
        columns: ['شماره', 'تاریخ', 'شرح', 'دریافت', 'پرداخت', 'موجودی'],
        rows: [
          ['', '', 'موجودی ابتدای دوره', 0, 0, data.opening],
          ...data.rows.map((r) => [String(r.no), formatDate(r.date), r.description, r.debit, r.credit, r.balance]),
        ],
        footer: ['', '', 'مجموع', data.totalIn, data.totalOut, data.closing],
      },
    ]);
  };

  const exportCash = () => {
    if (!data) return;
    exportExcel(
      `cashbook-${data.from}_${data.to}`,
      'صندوق',
      ['شماره', 'تاریخ', 'شرح', 'دریافت', 'پرداخت', 'موجودی'],
      [
        ['', '', 'موجودی ابتدای دوره', 0, 0, data.opening],
        ...data.rows.map((r) => [r.no, formatDate(r.date), r.description, r.debit, r.credit, r.balance]),
      ],
      `کتاب صندوق ${formatDate(data.from)} تا ${formatDate(data.to)}`,
    );
  };

  return (
    <div dir="rtl">
      <PageHeader title="مدیریت صندوق" subtitle="موجودی نقدی، دریافت‌ها، پرداخت‌ها و گردش کامل پول">
        <button className="btn-outline btn-sm" onClick={printCash}>
          <Printer size={14} /> چاپ / PDF
        </button>
        <button className="btn-outline btn-sm" onClick={exportCash}>
          <Download size={14} /> اکسل
        </button>
        <button className="btn-primary btn-sm" onClick={() => setSettleType('receive')}>
          <ArrowDownLeft size={15} /> دریافت از مشتری
        </button>
        <button className="btn-dark btn-sm" onClick={() => setSettleType('pay')}>
          <ArrowUpRight size={15} /> پرداخت به شرکت
        </button>
      </PageHeader>

      <DateRangeBar {...range} />

      {data ? (
        <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div className="card px-4 py-3">
            <p className="text-[11px] font-semibold text-slate-500">موجودی ابتدای دوره</p>
            <p className="num mt-1 text-lg font-extrabold text-slate-800">{formatMoney(data.opening)} ؋</p>
          </div>
          <div className="card px-4 py-3">
            <p className="text-[11px] font-semibold text-slate-500">مجموع دریافت‌ها</p>
            <p className="num mt-1 text-lg font-extrabold text-emerald-700">{formatMoney(data.totalIn)} ؋</p>
          </div>
          <div className="card px-4 py-3">
            <p className="text-[11px] font-semibold text-slate-500">مجموع پرداخت‌ها</p>
            <p className="num mt-1 text-lg font-extrabold text-rose-600">{formatMoney(data.totalOut)} ؋</p>
          </div>
          <div className="card border-emerald-200 bg-emerald-50 px-4 py-3">
            <p className="text-[11px] font-semibold text-emerald-700">موجودی فعلی صندوق</p>
            <p className="num mt-1 text-lg font-extrabold text-emerald-800">{formatMoney(data.closing)} ؋</p>
          </div>
        </div>
      ) : null}

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-3">
          <h2 className="flex items-center gap-2 text-sm font-bold text-slate-800">
            <Wallet size={16} className="text-emerald-700" /> گردش صندوق
          </h2>
          {user?.role === 'admin' ? (
            <button className="btn-ghost btn-sm text-emerald-700" onClick={() => setCapitalOpen(true)}>
              <Coins size={14} /> افزایش موجودی (سرمایه / افتتاحیه)
            </button>
          ) : null}
        </div>

        {loading && !data ? <Spinner /> : null}
        {error && !data ? <div className="p-4 text-sm text-rose-600">{error}</div> : null}
        {data && data.rows.length === 0 ? (
          <Empty title="در این بازه گردش نقدی وجود ندارد" hint="با ثبت فروش، دریافت قرض یا پرداخت، گردش صندوق در اینجا نمایش داده می‌شود." />
        ) : null}

        {data && data.rows.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>تاریخ</th>
                  <th>شرح</th>
                  <th>نوع</th>
                  <th>دریافت</th>
                  <th>پرداخت</th>
                  <th>موجودی</th>
                </tr>
              </thead>
              <tbody>
                {data.rows.map((row) => (
                  <tr key={row.id}>
                    <td className="num text-xs text-slate-400">{row.no}</td>
                    <td className="whitespace-nowrap">{formatDate(row.date)}</td>
                    <td className="max-w-[280px] truncate">{row.description}</td>
                    <td>
                      <Badge tone={row.debit > 0 ? 'green' : 'red'}>{docTypeLabel(row.refType)}</Badge>
                    </td>
                    <td className="num text-emerald-700">{row.debit ? formatMoney(row.debit) : '—'}</td>
                    <td className="num text-rose-600">{row.credit ? formatMoney(row.credit) : '—'}</td>
                    <td className="num font-bold text-slate-800">{formatMoney(row.balance)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={4}>مجموع</td>
                  <td className="num text-emerald-700">{formatMoney(data.totalIn)}</td>
                  <td className="num text-rose-600">{formatMoney(data.totalOut)}</td>
                  <td className="num">{formatMoney(data.closing)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        ) : null}
      </Card>

      <SettlementModal
        open={settleType !== null}
        type={settleType || 'receive'}
        parties={meta?.parties || []}
        onClose={() => setSettleType(null)}
        onSaved={reload}
      />

      <Modal
        open={capitalOpen}
        onClose={() => setCapitalOpen(false)}
        size="sm"
        title="افزایش موجودی صندوق"
        subtitle="برای ثبت موجودی اولیه صندوق یا آوردن سرمایه به داروخانه"
        footer={
          <>
            <button className="btn-outline" onClick={() => setCapitalOpen(false)}>
              انصراف
            </button>
            <button className="btn-primary" onClick={addCapital} disabled={busy}>
              {busy ? 'در حال ذخیره…' : 'ثبت در صندوق'}
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <Field label="مبلغ (افغانی)" required>
            <input className="input" type="number" min="0" value={capitalAmount} onChange={(e) => setCapitalAmount(e.target.value)} dir="ltr" placeholder="0" />
          </Field>
          <Field label="تاریخ" required>
            <JalaliDateInput value={capitalDate} onChange={setCapitalDate} />
          </Field>
          <Field label="شرح">
            <input className="input" value={capitalNote} onChange={(e) => setCapitalNote(e.target.value)} placeholder="مثلاً: موجودی اولیه صندوق" />
          </Field>
        </div>
      </Modal>
    </div>
  );
}
