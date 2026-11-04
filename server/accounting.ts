import {
  getDb,
  round2,
  num,
  docNo,
  uid,
  type JournalEntry,
  type JournalLine,
  type Product,
  type Sale,
  type Purchase,
  type Party,
} from './db';

/* ------------------------------------------------------------------ */
/*  نمودار حساب‌ها (Chart of accounts)                                  */
/* ------------------------------------------------------------------ */
export const ACCOUNTS = {
  CASH: '1000',
  AR: '1100',
  INVENTORY: '1200',
  AP: '2000',
  CAPITAL: '3000',
  SALES: '4000',
  SALES_DISCOUNT: '4010',
  COGS: '5000',
  EXPENSE: '6000',
} as const;

export const ACCOUNT_LIST = [
  { code: ACCOUNTS.CASH, name: 'صندوق نقدی', type: 'asset' as const },
  { code: ACCOUNTS.AR, name: 'حساب مشتریان (قرض‌ها)', type: 'asset' as const },
  { code: ACCOUNTS.INVENTORY, name: 'موجودی ادویه', type: 'asset' as const },
  { code: ACCOUNTS.AP, name: 'حساب شرکت‌ها (بدهی)', type: 'liability' as const },
  { code: ACCOUNTS.CAPITAL, name: 'سرمایه و حساب افتتاحیه', type: 'equity' as const },
  { code: ACCOUNTS.SALES, name: 'درآمد فروش', type: 'income' as const },
  { code: ACCOUNTS.SALES_DISCOUNT, name: 'تخفیف فروش', type: 'income' as const },
  { code: ACCOUNTS.COGS, name: 'بهای تمام‌شده کالای فروش‌رفته', type: 'expense' as const },
  { code: ACCOUNTS.EXPENSE, name: 'مصارف عملیاتی', type: 'expense' as const },
];

export const EXPENSE_CATEGORIES = [
  'کرایه',
  'معاش کارمندان',
  'برق',
  'ترانسپورت',
  'تلفون و انترنت',
  'نظافت و حفظ‌الصحه',
  'قرطاسیه',
  'ترمیم و نگهداری',
  'متفرقه',
];

/* ------------------------------------------------------------------ */
/*  ثبت سند حسابداری                                                   */
/* ------------------------------------------------------------------ */
export interface PostInput {
  date: string;
  description: string;
  refType: JournalEntry['refType'];
  refId: string;
  refNo: string;
  lines: JournalLine[];
  user: { id: string; name: string };
}

export function postEntry(input: PostInput): JournalEntry {
  const db = getDb();
  const lines = input.lines
    .map((l) => ({
      account: l.account,
      debit: round2(num(l.debit)),
      credit: round2(num(l.credit)),
      partyId: l.partyId || null,
      note: l.note,
    }))
    .filter((l) => l.debit !== 0 || l.credit !== 0);

  const debit = round2(lines.reduce((s, l) => s + l.debit, 0));
  const credit = round2(lines.reduce((s, l) => s + l.credit, 0));
  if (Math.abs(debit - credit) > 0.009) {
    throw new Error(`سند حسابداری متوازن نیست (بدهکار ${debit} / بستانکار ${credit})`);
  }
  if (lines.length === 0) throw new Error('سند حسابداری خالی است.');

  const entry: JournalEntry = {
    id: uid('jnl_'),
    no: Number(docNo('JV', 'journal').split('-')[1]),
    date: input.date,
    description: input.description,
    refType: input.refType,
    refId: input.refId,
    refNo: input.refNo,
    lines,
    status: 'active',
    amount: debit,
    createdAt: new Date().toISOString(),
    createdBy: input.user?.name || '',
  };
  db.journals.push(entry);
  return entry;
}

/** ابطال سند (سند معکوس در دفتر کل باقی می‌ماند ولی در محاسبات شمرده نمی‌شود) */
export function reverseEntry(entryId: string | null | undefined, user: { id: string; name: string }, note?: string) {
  if (!entryId) return;
  const db = getDb();
  const entry = db.journals.find((j) => j.id === entryId);
  if (!entry || entry.status === 'reversed') return;
  entry.status = 'reversed';
  entry.reversedAt = new Date().toISOString();
  entry.revokedNote = note || `ابطال توسط ${user?.name || ''}`;
}

/** ابطال همه اسناد یک سند مالی */
export function reverseByRef(refId: string, user: { id: string; name: string }, note?: string) {
  const db = getDb();
  for (const entry of db.journals) {
    if (entry.refId === refId && entry.status === 'active') {
      entry.status = 'reversed';
      entry.reversedAt = new Date().toISOString();
      entry.revokedNote = note || `ابطال توسط ${user?.name || ''}`;
    }
  }
}

/* ------------------------------------------------------------------ */
/*  موجودی و بهای تمام‌شده                                             */
/* ------------------------------------------------------------------ */
export function productById(id?: string | null): Product | undefined {
  if (!id) return undefined;
  return getDb().products.find((p) => p.id === id && !p.deletedAt);
}

export function saleCogs(items: { productId?: string | null; qty: number; cost?: number }[]): number {
  let total = 0;
  for (const item of items) {
    const product = productById(item.productId);
    const unitCost = num(item.cost ?? product?.avgCost ?? 0);
    total += num(item.qty) * unitCost;
  }
  return round2(total);
}

/** ثبت خرید: میانگین موزون بهای تمام‌شده و افزایش موجودی */
export function applyPurchaseToStock(items: { productId?: string | null; qty: number; unitPrice: number }[]) {
  for (const item of items) {
    const product = productById(item.productId);
    if (!product) continue;
    const qty = num(item.qty);
    const unitCost = num(item.unitPrice);
    const currentStock = num(product.stock);
    const newStock = currentStock + qty;
    if (newStock > 0) {
      product.avgCost = round2((currentStock * num(product.avgCost) + qty * unitCost) / newStock);
    } else {
      product.avgCost = unitCost;
    }
    product.stock = round2(newStock);
    product.updatedAt = new Date().toISOString();
  }
}

export function revertPurchaseFromStock(items: { productId?: string | null; qty: number; cost?: number; unitPrice?: number }[]) {
  for (const item of items) {
    const product = productById(item.productId);
    if (!product) continue;
    product.stock = round2(num(product.stock) - num(item.qty));
    product.updatedAt = new Date().toISOString();
  }
}

export function applySaleToStock(items: { productId?: string | null; qty: number }[]) {
  for (const item of items) {
    const product = productById(item.productId);
    if (!product) continue;
    product.stock = round2(num(product.stock) - num(item.qty));
    product.updatedAt = new Date().toISOString();
  }
}

export function revertSaleToStock(items: { productId?: string | null; qty: number }[]) {
  for (const item of items) {
    const product = productById(item.productId);
    if (!product) continue;
    product.stock = round2(num(product.stock) + num(item.qty));
    product.updatedAt = new Date().toISOString();
  }
}

/* ------------------------------------------------------------------ */
/*  مانده حساب‌ها                                                       */
/* ------------------------------------------------------------------ */
export interface JournalFilter {
  from?: string;
  to?: string;
  account?: string;
  partyId?: string;
  includeReversed?: boolean;
}

export function filteredEntries(filter: JournalFilter = {}): JournalEntry[] {
  const db = getDb();
  return db.journals.filter((j) => {
    if (!filter.includeReversed && j.status !== 'active') return false;
    if (filter.from && j.date < filter.from) return false;
    if (filter.to && j.date > filter.to) return false;
    if (filter.account && !j.lines.some((l) => l.account === filter.account)) return false;
    if (filter.partyId && !j.lines.some((l) => l.partyId === filter.partyId)) return false;
    return true;
  });
}

export function accountBalance(account: string, filter: JournalFilter = {}): number {
  let balance = 0;
  for (const entry of filteredEntries(filter)) {
    for (const line of entry.lines) {
      if (line.account !== account) continue;
      balance += num(line.debit) - num(line.credit);
    }
  }
  return round2(balance);
}

/** مانده حساب مشتری (طلب) یا شرکت (بدهی) — همیشه مثبت = بدهکار مشتری / بستانکار شرکت */
export function partyBalance(partyId: string, asOf?: string): number {
  const db = getDb();
  const party = db.parties.find((p) => p.id === partyId);
  if (!party) return 0;
  const account = party.type === 'customer' ? ACCOUNTS.AR : ACCOUNTS.AP;
  let balance = 0;
  for (const entry of filteredEntries({ to: asOf, account })) {
    for (const line of entry.lines) {
      if (line.account !== account || line.partyId !== partyId) continue;
      balance += party.type === 'customer' ? num(line.debit) - num(line.credit) : num(line.credit) - num(line.debit);
    }
  }
  return round2(balance);
}

export function totalReceivable(asOf?: string): number {
  return round2(accountBalance(ACCOUNTS.AR, { to: asOf }));
}

export function totalPayable(asOf?: string): number {
  return round2(-accountBalance(ACCOUNTS.AP, { to: asOf }));
}

export function cashBalance(asOf?: string): number {
  return accountBalance(ACCOUNTS.CASH, { to: asOf });
}

/* ------------------------------------------------------------------ */
/*  گزارش‌ها                                                            */
/* ------------------------------------------------------------------ */
const inRange = (date: string, from: string, to: string) => date >= from && date <= to;

export function summary(from: string, to: string) {
  const db = getDb();
  const entries = filteredEntries({ from, to });

  let salesGross = 0;
  let salesDiscount = 0;
  let cogs = 0;
  let cashIn = 0;
  let cashOut = 0;
  let expenseFromJournal = 0;

  for (const entry of entries) {
    for (const line of entry.lines) {
      if (line.account === ACCOUNTS.SALES) salesGross += num(line.credit) - num(line.debit);
      if (line.account === ACCOUNTS.SALES_DISCOUNT) salesDiscount += num(line.debit) - num(line.credit);
      if (line.account === ACCOUNTS.COGS) cogs += num(line.debit) - num(line.credit);
      if (line.account === ACCOUNTS.EXPENSE) expenseFromJournal += num(line.debit) - num(line.credit);
      if (line.account === ACCOUNTS.CASH) {
        cashIn += num(line.debit);
        cashOut += num(line.credit);
      }
    }
  }

  salesGross = round2(salesGross);
  salesDiscount = round2(salesDiscount);
  cogs = round2(cogs);

  const expensesList = db.expenses.filter((e) => !e.deletedAt && inRange(e.date, from, to));
  const byCategory: Record<string, number> = {};
  for (const e of expensesList) {
    byCategory[e.category] = round2((byCategory[e.category] || 0) + num(e.amount));
  }
  const expensesTotal = round2(expensesList.reduce((s, e) => s + num(e.amount), 0)) || round2(expenseFromJournal);

  const salesList = db.sales.filter((s) => !s.deletedAt && inRange(s.date, from, to));
  const purchaseList = db.purchases.filter((p) => !p.deletedAt && inRange(p.date, from, to));

  const netSales = round2(salesGross - salesDiscount);
  const grossProfit = round2(netSales - cogs);
  const netProfit = round2(grossProfit - expensesTotal);

  return {
    from,
    to,
    salesGross,
    salesDiscount,
    netSales,
    cogs,
    grossProfit,
    expensesTotal,
    expenseByCategory: byCategory,
    netProfit,
    cashIn: round2(cashIn),
    cashOut: round2(cashOut),
    cashNet: round2(cashIn - cashOut),
    cashBalance: cashBalance(to),
    receivables: totalReceivable(to),
    payables: totalPayable(to),
    inventoryValue: round2(
      db.products.filter((p) => !p.deletedAt).reduce((s, p) => s + num(p.stock) * num(p.avgCost), 0),
    ),
    salesCount: salesList.length,
    purchaseCount: purchaseList.length,
    creditSales: round2(salesList.reduce((s, i) => s + num(i.credit), 0)),
    creditPurchases: round2(purchaseList.reduce((s, i) => s + num(i.credit), 0)),
    purchasesTotal: round2(purchaseList.reduce((s, i) => s + num(i.netTotal), 0)),
    expenseCount: expensesList.length,
  };
}

export function dailySeries(from: string, to: string) {
  const db = getDb();
  const days: { date: string; sales: number; expenses: number; profit: number }[] = [];
  const start = new Date(`${from}T00:00:00Z`);
  const end = new Date(`${to}T00:00:00Z`);
  const cursor = new Date(start);
  let guard = 0;
  while (cursor <= end && guard < 400) {
    const date = cursor.toISOString().slice(0, 10);
    const sales = db.sales.filter((s) => !s.deletedAt && s.date === date);
    const expenses = db.expenses.filter((e) => !e.deletedAt && e.date === date);
    const net = sales.reduce((s, i) => s + num(i.netTotal), 0);
    const exp = expenses.reduce((s, i) => s + num(i.amount), 0);
    const cost = sales.reduce((s, i) => s + num(i.cogs), 0);
    days.push({
      date,
      sales: round2(net),
      expenses: round2(exp),
      profit: round2(net - cost - exp),
    });
    cursor.setUTCDate(cursor.getUTCDate() + 1);
    guard += 1;
  }
  return days;
}

export function cashBook(from: string, to: string) {
  const db = getDb();
  const entries = filteredEntries({ from, to, account: ACCOUNTS.CASH }).sort(
    (a, b) => (a.date === b.date ? a.createdAt.localeCompare(b.createdAt) : a.date.localeCompare(b.date)),
  );
  const opening = cashBalance(new Date(new Date(`${from}T00:00:00Z`).getTime() - 864e5).toISOString().slice(0, 10));
  let balance = opening;
  const rows = entries.map((entry) => {
    let debit = 0;
    let credit = 0;
    for (const line of entry.lines) {
      if (line.account !== ACCOUNTS.CASH) continue;
      debit += num(line.debit);
      credit += num(line.credit);
    }
    balance = round2(balance + debit - credit);
    return {
      id: entry.id,
      no: entry.no,
      date: entry.date,
      description: entry.description,
      refType: entry.refType,
      refNo: entry.refNo,
      refId: entry.refId,
      debit: round2(debit),
      credit: round2(credit),
      balance,
    };
  });
  return {
    opening,
    closing: balance,
    totalIn: round2(rows.reduce((s, r) => s + r.debit, 0)),
    totalOut: round2(rows.reduce((s, r) => s + r.credit, 0)),
    rows,
  };
}

export function ledger(filter: JournalFilter & { q?: string; limit?: number }) {
  const entries = filteredEntries(filter)
    .filter((entry) => {
      if (!filter.q) return true;
      const q = filter.q.trim();
      if (!q) return true;
      return (
        entry.description.includes(q) ||
        entry.refNo.includes(q) ||
        String(entry.no).includes(q) ||
        entry.lines.some((l) => l.note?.includes(q))
      );
    })
    .sort((a, b) => (a.date === b.date ? b.no - a.no : b.date.localeCompare(a.date)));
  const limited = filter.limit ? entries.slice(0, filter.limit) : entries;
  return {
    total: entries.length,
    entries: limited.map((entry) => ({
      ...entry,
      debitTotal: round2(entry.lines.reduce((s, l) => s + num(l.debit), 0)),
      creditTotal: round2(entry.lines.reduce((s, l) => s + num(l.credit), 0)),
    })),
  };
}

export function partyStatement(party: Party, from: string, to: string) {
  const db = getDb();
  const account = party.type === 'customer' ? ACCOUNTS.AR : ACCOUNTS.AP;
  const allEntries = filteredEntries({ account, partyId: party.id }).sort((a, b) =>
    a.date === b.date ? a.createdAt.localeCompare(b.createdAt) : a.date.localeCompare(b.date),
  );
  const normalize = (debit: number, credit: number) =>
    party.type === 'customer' ? debit - credit : credit - debit;

  let opening = 0;
  const rows: {
    id: string;
    date: string;
    no: number;
    refNo: string;
    refType: string;
    description: string;
    charge: number;
    payment: number;
    balance: number;
  }[] = [];

  for (const entry of allEntries) {
    let debit = 0;
    let credit = 0;
    for (const line of entry.lines) {
      if (line.account !== account || line.partyId !== party.id) continue;
      debit += num(line.debit);
      credit += num(line.credit);
    }
    const delta = normalize(debit, credit);
    if (entry.date < from) {
      opening = round2(opening + delta);
      continue;
    }
    if (entry.date > to) continue;
    rows.push({
      id: entry.id,
      date: entry.date,
      no: entry.no,
      refNo: entry.refNo,
      refType: entry.refType,
      description: entry.description,
      charge: round2(party.type === 'customer' ? debit : credit),
      payment: round2(party.type === 'customer' ? credit : debit),
      balance: 0,
    });
  }
  let balance = opening;
  for (const row of rows) {
    balance = round2(balance + row.charge - row.payment);
    row.balance = balance;
  }
  return { party, opening: round2(opening), closing: round2(balance), rows };
}

export function productSales(from: string, to: string, limit = 20) {
  const db = getDb();
  const map = new Map<string, { name: string; qty: number; revenue: number; cost: number }>();
  for (const sale of db.sales.filter((s) => !s.deletedAt && inRange(s.date, from, to))) {
    for (const item of sale.items || []) {
      const key = item.productId || item.name;
      const row = map.get(key) || { name: item.name, qty: 0, revenue: 0, cost: 0 };
      row.qty = round2(row.qty + num(item.qty));
      row.revenue = round2(row.revenue + num(item.qty) * num(item.unitPrice));
      row.cost = round2(row.cost + num(item.qty) * num(item.cost ?? 0));
      map.set(key, row);
    }
  }
  return [...map.values()].sort((a, b) => b.revenue - a.revenue).slice(0, limit);
}

export function stockMoves(productId: string) {
  const db = getDb();
  const rows: { date: string; type: string; no: string; party: string; qty: number; price: number }[] = [];
  for (const p of db.purchases.filter((x) => !x.deletedAt)) {
    for (const item of p.items || []) {
      if (item.productId !== productId) continue;
      rows.push({ date: p.date, type: 'خرید', no: p.no, party: p.companyName || '', qty: num(item.qty), price: num(item.unitPrice) });
    }
  }
  for (const s of db.sales.filter((x) => !x.deletedAt)) {
    for (const item of s.items || []) {
      if (item.productId !== productId) continue;
      rows.push({ date: s.date, type: 'فروش', no: s.no, party: s.customerName || '', qty: -num(item.qty), price: num(item.unitPrice) });
    }
  }
  return rows.sort((a, b) => b.date.localeCompare(a.date));
}

export function saleDocCogs(sale: Sale | Purchase): number {
  return round2((sale.items || []).reduce((s, i) => s + num(i.qty) * num(i.cost ?? 0), 0));
}
