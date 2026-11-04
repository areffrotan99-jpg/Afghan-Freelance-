import { useState } from 'react';
import { Printer, ChevronDown, BookOpen, Download } from 'lucide-react';
import { useFetch } from '../lib/api';
import { formatDate, formatMoney, docTypeLabel } from '../lib/format';
import type { JournalEntry } from '../types';
import { DateRangeBar, PageHeader, useDateRange } from '../components/PageHeader';
import { Badge, Card, Empty, SearchBox, Spinner } from '../components/ui';
import { useMeta } from '../lib/meta';
import { useDebounced } from '../lib/useDebounced';
import { printVoucher } from '../lib/docs';
import { exportExcel } from '../lib/print';

interface LedgerResponse {
  total: number;
  entries: JournalEntry[];
  from: string;
  to: string;
}

export function LedgerPage() {
  const range = useDateRange('month');
  const { meta } = useMeta();
  const [account, setAccount] = useState('');
  const [q, setQ] = useState('');
  const debouncedQ = useDebounced(q);
  const [includeReversed, setIncludeReversed] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const { data, loading, error } = useFetch<LedgerResponse>(
    `/api/ledger?from=${range.from}&to=${range.to}&account=${account}&q=${encodeURIComponent(debouncedQ)}&includeReversed=${
      includeReversed ? 1 : 0
    }&limit=400`,
  );

  const accountName = (code: string) => meta?.accounts.find((a) => a.code === code)?.name || code;

  const toggle = (id: string) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  const exportLedger = () => {
    if (!data?.entries.length) return;
    const rows: (string | number)[][] = [];
    for (const entry of data.entries) {
      for (const line of entry.lines) {
        rows.push([
          entry.no,
          formatDate(entry.date),
          entry.description,
          `${line.account} ${accountName(line.account)}`,
          line.note || '',
          line.debit,
          line.credit,
          entry.status === 'reversed' ? 'باطل‌شده' : 'فعال',
        ]);
      }
    }
    exportExcel(
      `ledger-${data.from}_${data.to}`,
      'دفتر کل',
      ['شماره سند', 'تاریخ', 'شرح', 'حساب', 'تفصیل', 'بدهکار', 'بستانکار', 'وضعیت'],
      rows,
      `دفتر کل ${formatDate(data.from)} تا ${formatDate(data.to)}`,
    );
  };

  return (
    <div dir="rtl">
      <PageHeader title="دفتر کل حساب‌ها" subtitle="ثبت تمام معاملات مالی با تاریخ، مبلغ، شرح و نوع معامله">
        <button className="btn-outline btn-sm" onClick={exportLedger}>
          <Download size={14} /> اکسل
        </button>
      </PageHeader>

      <DateRangeBar
        {...range}
        extra={
          <div className="flex w-full flex-wrap items-end gap-2 sm:w-auto">
            <div className="min-w-[150px] flex-1">
              <span className="label">حساب</span>
              <select className="input" value={account} onChange={(e) => setAccount(e.target.value)}>
                <option value="">همه حساب‌ها</option>
                {(meta?.accounts || []).map((acc) => (
                  <option key={acc.code} value={acc.code}>
                    {acc.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="min-w-[160px] flex-1">
              <span className="label">جستجو</span>
              <SearchBox value={q} onChange={setQ} placeholder="شرح یا شماره سند…" />
            </div>
            <label className="flex items-center gap-1.5 pb-2 text-[11px] font-semibold text-slate-600">
              <input
                type="checkbox"
                className="h-4 w-4 accent-emerald-700"
                checked={includeReversed}
                onChange={(e) => setIncludeReversed(e.target.checked)}
              />
              نمایش اسناد باطل‌شده
            </label>
          </div>
        }
      />

      {data ? (
        <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <div className="card px-3 py-2.5">
            <p className="text-[11px] text-slate-500">تعداد اسناد</p>
            <p className="num mt-1 text-sm font-extrabold">{data.total}</p>
          </div>
          <div className="card px-3 py-2.5">
            <p className="text-[11px] text-slate-500">جمع بدهکار</p>
            <p className="num mt-1 text-sm font-extrabold text-emerald-700">
              {formatMoney(data.entries.reduce((s, e) => s + e.lines.reduce((x, l) => x + l.debit, 0), 0))}
            </p>
          </div>
          <div className="card px-3 py-2.5">
            <p className="text-[11px] text-slate-500">جمع بستانکار</p>
            <p className="num mt-1 text-sm font-extrabold text-rose-600">
              {formatMoney(data.entries.reduce((s, e) => s + e.lines.reduce((x, l) => x + l.credit, 0), 0))}
            </p>
          </div>
          <div className="card px-3 py-2.5">
            <p className="text-[11px] text-slate-500">بازه</p>
            <p className="mt-1 text-xs font-bold text-slate-700">
              {formatDate(data.from)} — {formatDate(data.to)}
            </p>
          </div>
        </div>
      ) : null}

      <Card>
        <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3">
          <BookOpen size={16} className="text-emerald-700" />
          <h2 className="text-sm font-bold text-slate-800">اسناد حسابداری</h2>
        </div>

        {loading && !data ? <Spinner /> : null}
        {error && !data ? <div className="p-4 text-sm text-rose-600">{error}</div> : null}
        {data && data.entries.length === 0 ? (
          <Empty title="سندی در این بازه وجود ندارد" hint="با ثبت فروش، خرید، مصرف یا دریافت و پرداخت، اسناد حسابداری خودکار ساخته می‌شوند." />
        ) : null}

        <div className="divide-y divide-slate-100">
          {(data?.entries || []).map((entry) => {
            const isOpen = expanded[entry.id];
            return (
              <div key={entry.id} className={entry.status === 'reversed' ? 'bg-rose-50/30' : ''}>
                <button type="button" onClick={() => toggle(entry.id)} className="flex w-full flex-wrap items-center gap-2 px-4 py-3 text-right hover:bg-slate-50">
                  <span className="num w-10 shrink-0 text-xs font-bold text-slate-400">{entry.no}</span>
                  <span className="w-[76px] shrink-0 text-xs text-slate-600">{formatDate(entry.date)}</span>
                  <span className="min-w-0 flex-1 truncate text-xs font-semibold text-slate-800">{entry.description}</span>
                  <Badge tone={entry.status === 'reversed' ? 'red' : 'slate'}>{docTypeLabel(entry.refType)}</Badge>
                  <span className="num text-xs font-extrabold text-slate-800">{formatMoney(entry.amount)}</span>
                  <ChevronDown size={15} className={`shrink-0 text-slate-400 transition ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {isOpen ? (
                  <div className="px-4 pb-4">
                    <div className="overflow-x-auto rounded-xl border border-slate-200">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>حساب</th>
                            <th>تفصیل</th>
                            <th>بدهکار</th>
                            <th>بستانکار</th>
                          </tr>
                        </thead>
                        <tbody>
                          {entry.lines.map((line, index) => (
                            <tr key={index}>
                              <td className="text-xs font-semibold">
                                <span className="num me-1 text-slate-400">{line.account}</span>
                                {accountName(line.account)}
                              </td>
                              <td className="text-xs text-slate-500">{line.note || '—'}</td>
                              <td className="num">{line.debit ? formatMoney(line.debit) : '—'}</td>
                              <td className="num">{line.credit ? formatMoney(line.credit) : '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr>
                            <td colSpan={2}>مجموع</td>
                            <td className="num">{formatMoney(entry.debitTotal ?? entry.amount)}</td>
                            <td className="num">{formatMoney(entry.creditTotal ?? entry.amount)}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                      <p className="text-[11px] text-slate-500">
                        ثبت‌کننده: {entry.createdBy || '—'} {entry.status === 'reversed' ? `— باطل‌شده (${entry.revokedNote || ''})` : ''}
                      </p>
                      <button className="btn-outline btn-sm" onClick={() => meta && printVoucher(entry, meta.settings)}>
                        <Printer size={14} /> چاپ سند
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
