import type express from 'express';
import type { NextFunction, Response } from 'express';
import {
  getDb,
  saveDb,
  uid,
  num,
  round2,
  docNo,
  audit,
  replaceDb,
  hashPassword,
  verifyPassword,
  type Sale,
  type Purchase,
  type Expense,
  type Settlement,
  type Party,
  type Product,
  type DocItem,
  type Database,
} from './db';
import { requireAuth, requireAdmin, login, createSession, destroySession, currentUser, setPassword, type AuthedRequest } from './auth';
import {
  ACCOUNTS,
  ACCOUNT_LIST,
  EXPENSE_CATEGORIES,
  postEntry,
  reverseByRef,
  reverseEntry,
  accountBalance,
  partyBalance,
  totalReceivable,
  totalPayable,
  cashBalance,
  summary,
  dailySeries,
  cashBook,
  ledger,
  partyStatement,
  productSales,
  stockMoves,
  applyPurchaseToStock,
  revertPurchaseFromStock,
  applySaleToStock,
  revertSaleToStock,
  productById,
} from './accounting';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const today = () => new Date().toISOString().slice(0, 10);
const bad = (res: Response, message: string, status = 400) => res.status(status).json({ error: message });
const validDate = (value: unknown): string => {
  const s = String(value || '').slice(0, 10);
  if (!DATE_RE.test(s)) throw new Error('تاریخ معتبر نیست.');
  return s;
};
const clean = (v: unknown, max = 200) => String(v ?? '').trim().slice(0, max);

/** ارسال درخواست با کلید یکتا — جلوگیری از ثبت تکراری هنگام همگام‌سازی آفلاین */
function idempotent<T>(req: AuthedRequest, res: Response, handler: () => T): T | void {
  const db = getDb();
  const key = clean(req.headers['idempotency-key'], 120);
  const cacheKey = `${req.user?.id || 'anon'}:${key}`;
  if (key) {
    const cached = db.idempotency[cacheKey];
    if (cached) {
      res.status(cached.status).json(cached.body as object);
      return;
    }
  }
  const snapshot = JSON.stringify(db);
  let result: T;
  try {
    result = handler();
  } catch (err) {
    replaceDb(JSON.parse(snapshot));
    throw err;
  }
  saveDb();
  const status = res.statusCode === 200 ? 201 : res.statusCode;
  if (key) {
    db.idempotency[cacheKey] = { at: new Date().toISOString(), status, body: result };
    const cutoff = Date.now() - 30 * 864e5;
    for (const [k, v] of Object.entries(db.idempotency)) {
      if (new Date(v.at).getTime() < cutoff) delete db.idempotency[k];
    }
    saveDb();
  }
  res.status(status).json(result as object);
}

function ensureRev(current: { rev: number }, body: { rev?: unknown }) {
  if (body.rev !== undefined && num(body.rev) !== current.rev) {
    const err = new Error('این اطلاعات توسط دستگاه دیگری تغییر کرده است. صفحه را تازه کنید.');
    (err as Error & { status?: number }).status = 409;
    throw err;
  }
}

/* ------------------------------ فروش ------------------------------ */
interface DocBody {
  date?: string;
  partyId?: string | null;
  customerName?: string;
  companyName?: string;
  items?: { productId?: string | null; name?: string; qty?: unknown; unitPrice?: unknown }[];
  discount?: unknown;
  paid?: unknown;
  note?: string;
  rev?: unknown;
}

function buildItems(raw: DocBody['items'], mode: 'sale' | 'purchase'): DocItem[] {
  const list = Array.isArray(raw) ? raw : [];
  const items: DocItem[] = [];
  for (const row of list) {
    const qty = round2(num(row?.qty));
    const unitPrice = round2(num(row?.unitPrice));
    const name = clean(row?.name, 160);
    if (qty <= 0) throw new Error('تعداد هر قلم باید بیشتر از صفر باشد.');
    if (unitPrice < 0) throw new Error('قیمت نمی‌تواند منفی باشد.');
    if (!name && !row?.productId) throw new Error('نام قلم کالا الزامی است.');
    const product = productById(row?.productId || null);
    let cost: number | undefined;
    if (mode === 'sale') cost = product ? num(product.avgCost) : 0;
    items.push({
      productId: product ? product.id : null,
      name: name || product?.name || 'قلم بدون نام',
      qty,
      unitPrice,
      ...(cost !== undefined ? { cost } : {}),
    });
  }
  if (items.length === 0) throw new Error('حداقل یک قلم کالا لازم است.');
  return items;
}

function totalsOf(items: DocItem[], discountRaw: unknown, paidRaw: unknown) {
  const itemsTotal = round2(items.reduce((s, i) => s + i.qty * i.unitPrice, 0));
  let discount = round2(num(discountRaw));
  if (discount < 0) discount = 0;
  if (discount > itemsTotal) discount = itemsTotal;
  const netTotal = round2(itemsTotal - discount);
  let paid = round2(num(paidRaw));
  if (paid < 0) paid = 0;
  if (paid > netTotal) paid = netTotal;
  const credit = round2(netTotal - paid);
  return { itemsTotal, discount, netTotal, paid, credit };
}

function postSale(sale: Sale, user: { id: string; name: string }) {
  const lines = [];
  if (sale.paid > 0) lines.push({ account: ACCOUNTS.CASH, debit: sale.paid, credit: 0, note: 'دریافت نقدی فروش' });
  if (sale.credit > 0)
    lines.push({ account: ACCOUNTS.AR, debit: sale.credit, credit: 0, partyId: sale.partyId || null, note: 'فروش نسیه' });
  if (sale.discount > 0)
    lines.push({ account: ACCOUNTS.SALES_DISCOUNT, debit: sale.discount, credit: 0, note: 'تخفیف فروش' });
  lines.push({ account: ACCOUNTS.SALES, debit: 0, credit: sale.itemsTotal, note: 'درآمد فروش' });
  if (sale.cogs > 0) {
    lines.push({ account: ACCOUNTS.COGS, debit: sale.cogs, credit: 0, note: 'بهای تمام‌شده' });
    lines.push({ account: ACCOUNTS.INVENTORY, debit: 0, credit: sale.cogs, note: 'کاهش موجودی' });
  }
  const entry = postEntry({
    date: sale.date,
    description: `فروش شماره ${sale.no} — ${sale.customerName || 'مشتری نقدی'}`,
    refType: 'sale',
    refId: sale.id,
    refNo: sale.no,
    lines,
    user,
  });
  sale.journalId = entry.id;
}

function postPurchase(purchase: Purchase, user: { id: string; name: string }) {
  const lines = [];
  lines.push({ account: ACCOUNTS.INVENTORY, debit: purchase.netTotal, credit: 0, note: 'خرید ادویه' });
  if (purchase.paid > 0) lines.push({ account: ACCOUNTS.CASH, debit: 0, credit: purchase.paid, note: 'پرداخت نقدی خرید' });
  if (purchase.credit > 0)
    lines.push({
      account: ACCOUNTS.AP,
      debit: 0,
      credit: purchase.credit,
      partyId: purchase.partyId || null,
      note: 'خرید نسیه',
    });
  const entry = postEntry({
    date: purchase.date,
    description: `خرید شماره ${purchase.no} — ${purchase.companyName || 'شرکت'}`,
    refType: 'purchase',
    refId: purchase.id,
    refNo: purchase.no,
    lines,
    user,
  });
  purchase.journalId = entry.id;
}

export function registerApi(app: express.Express) {
  /* ---------------------- سلامت سرویس ---------------------- */
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'Frotan Pharmacy Accounting', timestamp: new Date().toISOString() });
  });

  /* ---------------------- ورود و خروج ---------------------- */
  app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body || {};
    const result = login(username, password);
    if ('error' in result) return bad(res, result.error, 401);
    createSession(res, result.user.id);
    const db = getDb();
    db.users.find((u) => u.id === result.user.id)!.createdAt = result.user.createdAt;
    audit(result.user, 'ورود', 'user', result.user.id);
    saveDb();
    res.json({ user: { id: result.user.id, username: result.user.username, name: result.user.name, role: result.user.role } });
  });

  app.post('/api/auth/logout', (req: AuthedRequest, res) => {
    destroySession(req, res);
    res.json({ ok: true });
  });

  app.get('/api/auth/me', (req, res) => {
    const user = currentUser(req);
    if (!user) return res.status(401).json({ error: 'وارد نشده‌اید', user: null });
    res.json({ user: { id: user.id, username: user.username, name: user.name, role: user.role } });
  });

  app.post('/api/auth/password', requireAuth, (req: AuthedRequest, res) => {
    const { currentPassword, newPassword } = req.body || {};
    const user = req.user!;
    if (!verifyPassword(String(currentPassword || ''), user.passwordHash))
      return bad(res, 'رمز عبور فعلی درست نیست.');
    if (String(newPassword || '').length < 6) return bad(res, 'رمز عبور جدید باید حداقل ۶ حرف باشد.');
    setPassword(user, String(newPassword));
    audit(user, 'تغییر رمز عبور', 'user', user.id);
    saveDb();
    res.json({ ok: true });
  });

  /* ---------------------- داده‌های پایه ---------------------- */
  app.get('/api/meta', requireAuth, (req: AuthedRequest, res) => {
    const db = getDb();
    res.json({
      settings: db.settings,
      accounts: ACCOUNT_LIST,
      expenseCategories: EXPENSE_CATEGORIES,
      parties: db.parties.filter((p) => !p.deletedAt).map((p) => ({ id: p.id, name: p.name, type: p.type })),
      products: db.products
        .filter((p) => !p.deletedAt)
        .map((p) => ({ id: p.id, name: p.name, unit: p.unit, price: p.price, stock: p.stock, avgCost: p.avgCost })),
      user: { id: req.user!.id, name: req.user!.name, username: req.user!.username, role: req.user!.role },
      serverTime: new Date().toISOString(),
    });
  });

  app.put('/api/settings', requireAuth, requireAdmin, (req: AuthedRequest, res) => {
    const db = getDb();
    const body = req.body || {};
    db.settings = {
      ...db.settings,
      pharmacyName: clean(body.pharmacyName, 80) || db.settings.pharmacyName,
      ownerName: clean(body.ownerName, 80),
      address: clean(body.address, 200),
      phone: clean(body.phone, 40),
      lowStockThreshold: Math.max(0, num(body.lowStockThreshold)),
      footerNote: clean(body.footerNote, 200),
    };
    audit(req.user!, 'ویرایش تنظیمات', 'settings', 'main');
    saveDb();
    res.json({ settings: db.settings });
  });

  /* ---------------------- داشبورد ---------------------- */
  app.get('/api/dashboard', requireAuth, (req, res) => {
    const db = getDb();
    const date = DATE_RE.test(String(req.query.date)) ? String(req.query.date) : today();
    const monthStart = `${date.slice(0, 7)}-01`;
    const yearStart = `${date.slice(0, 4)}-01-01`;
    const seriesFrom = new Date(new Date(`${date}T00:00:00Z`).getTime() - 13 * 864e5).toISOString().slice(0, 10);

    const lowStock = db.products
      .filter((p) => !p.deletedAt && num(p.stock) <= num(p.minStock ?? db.settings.lowStockThreshold))
      .slice(0, 8)
      .map((p) => ({ id: p.id, name: p.name, stock: p.stock, unit: p.unit, minStock: p.minStock }));

    const recentSales = db.sales
      .filter((s) => !s.deletedAt)
      .slice()
      .sort((a, b) => (a.date === b.date ? b.createdAt.localeCompare(a.createdAt) : b.date.localeCompare(a.date)))
      .slice(0, 6)
      .map((s) => ({ id: s.id, no: s.no, date: s.date, customerName: s.customerName, netTotal: s.netTotal, paid: s.paid, credit: s.credit }));

    const topDebtors = db.parties
      .filter((p) => !p.deletedAt && p.type === 'customer')
      .map((p) => ({ id: p.id, name: p.name, balance: partyBalance(p.id) }))
      .filter((p) => p.balance > 0.009)
      .sort((a, b) => b.balance - a.balance)
      .slice(0, 5);

    res.json({
      date,
      todayStats: summary(date, date),
      monthStats: summary(monthStart, date),
      yearStats: summary(yearStart, date),
      series: dailySeries(seriesFrom, date),
      lowStock,
      recentSales,
      topDebtors,
      counts: {
        customers: db.parties.filter((p) => !p.deletedAt && p.type === 'customer').length,
        companies: db.parties.filter((p) => !p.deletedAt && p.type === 'company').length,
        products: db.products.filter((p) => !p.deletedAt).length,
        sales: db.sales.filter((s) => !s.deletedAt).length,
      },
    });
  });

  /* ---------------------- فروش ---------------------- */
  app.get('/api/sales', requireAuth, (req, res) => {
    const db = getDb();
    const from = req.query.from ? validDate(req.query.from) : '0000-01-01';
    const to = req.query.to ? validDate(req.query.to) : '9999-12-31';
    const q = clean(req.query.q, 80);
    const type = clean(req.query.type, 20);
    const partyId = clean(req.query.partyId, 80);
    let rows = db.sales.filter((s) => !s.deletedAt && s.date >= from && s.date <= to);
    if (partyId) rows = rows.filter((s) => s.partyId === partyId);
    if (type === 'cash') rows = rows.filter((s) => num(s.credit) === 0);
    if (type === 'credit') rows = rows.filter((s) => num(s.credit) > 0);
    if (q) rows = rows.filter((s) => s.no.includes(q) || (s.customerName || '').includes(q) || (s.note || '').includes(q));
    rows = rows.slice().sort((a, b) => (a.date === b.date ? b.createdAt.localeCompare(a.createdAt) : b.date.localeCompare(a.date)));
    const total = rows.length;
    const limit = Math.min(500, Math.max(1, num(req.query.limit) || 100));
    const offset = Math.max(0, num(req.query.offset));
    const items = rows.slice(offset, offset + limit).map((s) => ({ ...s, profit: round2(num(s.netTotal) - num(s.cogs)) }));
    res.json({
      total,
      items,
      sum: {
        netTotal: round2(rows.reduce((s, i) => s + num(i.netTotal), 0)),
        paid: round2(rows.reduce((s, i) => s + num(i.paid), 0)),
        credit: round2(rows.reduce((s, i) => s + num(i.credit), 0)),
        discount: round2(rows.reduce((s, i) => s + num(i.discount), 0)),
        profit: round2(rows.reduce((s, i) => s + num(i.netTotal) - num(i.cogs), 0)),
      },
    });
  });

  app.get('/api/sales/:id', requireAuth, (req, res) => {
    const sale = getDb().sales.find((s) => s.id === req.params.id && !s.deletedAt);
    if (!sale) return bad(res, 'فاکتور فروش یافت نشد.', 404);
    res.json({ sale });
  });

  app.post('/api/sales', requireAuth, (req: AuthedRequest, res) => {
    idempotent(req, res, () => {
      const db = getDb();
      const body: DocBody = req.body || {};
      const db2 = db;
      const date = validDate(body.date);
      const items = buildItems(body.items, 'sale');
      const party = body.partyId ? db2.parties.find((p) => p.id === body.partyId && !p.deletedAt) : null;
      if (body.partyId && !party) throw new Error('مشتری انتخاب‌شده یافت نشد.');
      if (party && party.type !== 'customer') throw new Error('برای فروش باید مشتری انتخاب شود.');
      const totals = totalsOf(items, body.discount, body.paid);
      if (totals.credit > 0 && !party) throw new Error('برای فروش نسیه، مشتری را انتخاب کنید.');

      const sale: Sale = {
        id: uid('sal_'),
        no: docNo('SL', 'sale'),
        date,
        partyId: party?.id || null,
        customerName: clean(body.customerName, 120) || party?.name || 'مشتری نقدی',
        items,
        ...totals,
        cogs: round2(items.reduce((s, i) => s + num(i.qty) * num(i.cost ?? 0), 0)),
        note: clean(body.note, 300),
        journalId: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: req.user!.name,
        rev: 1,
      };
      db.sales.push(sale);
      applySaleToStock(items);
      postSale(sale, req.user!);
      audit(req.user!, 'ثبت فروش', 'sale', sale.id, `${sale.no} — ${sale.netTotal} افغانی`);
      return { sale };
    });
  });

  app.put('/api/sales/:id', requireAuth, (req: AuthedRequest, res) => {
    const db = getDb();
    const sale = db.sales.find((s) => s.id === req.params.id && !s.deletedAt);
    if (!sale) return bad(res, 'فاکتور فروش یافت نشد.', 404);
    ensureRev(sale, req.body || {});
    const body: DocBody = req.body || {};
    const date = validDate(body.date ?? sale.date);
    const items = buildItems(body.items ?? sale.items, 'sale');
    const party = body.partyId ? db.parties.find((p) => p.id === body.partyId && !p.deletedAt) : null;
    if (party && party.type !== 'customer') return bad(res, 'برای فروش باید مشتری انتخاب شود.');
    const totals = totalsOf(items, body.discount ?? sale.discount, body.paid ?? sale.paid);
    if (totals.credit > 0 && !party && !sale.partyId) return bad(res, 'برای فروش نسیه، مشتری را انتخاب کنید.');

    reverseByRef(sale.id, req.user!, 'ویرایش فاکتور');
    revertSaleToStock(sale.items);

    sale.date = date;
    sale.partyId = party?.id || (body.partyId === null ? null : sale.partyId);
    sale.customerName = clean(body.customerName, 120) || party?.name || sale.customerName || 'مشتری نقدی';
    sale.items = items;
    sale.itemsTotal = totals.itemsTotal;
    sale.discount = totals.discount;
    sale.netTotal = totals.netTotal;
    sale.paid = totals.paid;
    sale.credit = totals.credit;
    sale.cogs = round2(items.reduce((s, i) => s + num(i.qty) * num(i.cost ?? 0), 0));
    sale.note = clean(body.note ?? sale.note, 300);
    sale.rev += 1;
    sale.updatedAt = new Date().toISOString();

    applySaleToStock(items);
    postSale(sale, req.user!);
    audit(req.user!, 'ویرایش فروش', 'sale', sale.id, sale.no);
    saveDb();
    res.json({ sale });
  });

  app.delete('/api/sales/:id', requireAuth, (req: AuthedRequest, res) => {
    const db = getDb();
    const sale = db.sales.find((s) => s.id === req.params.id && !s.deletedAt);
    if (!sale) return bad(res, 'فاکتور فروش یافت نشد.', 404);
    ensureRev(sale, req.query as { rev?: unknown });
    reverseByRef(sale.id, req.user!, 'حذف فاکتور فروش');
    revertSaleToStock(sale.items);
    sale.deletedAt = new Date().toISOString();
    sale.rev += 1;
    audit(req.user!, 'حذف فروش', 'sale', sale.id, sale.no);
    saveDb();
    res.json({ ok: true });
  });

  /* ---------------------- خرید ---------------------- */
  app.get('/api/purchases', requireAuth, (req, res) => {
    const db = getDb();
    const from = req.query.from ? validDate(req.query.from) : '0000-01-01';
    const to = req.query.to ? validDate(req.query.to) : '9999-12-31';
    const q = clean(req.query.q, 80);
    const type = clean(req.query.type, 20);
    let rows = db.purchases.filter((p) => !p.deletedAt && p.date >= from && p.date <= to);
    if (type === 'cash') rows = rows.filter((p) => num(p.credit) === 0);
    if (type === 'credit') rows = rows.filter((p) => num(p.credit) > 0);
    if (req.query.partyId) rows = rows.filter((p) => p.partyId === String(req.query.partyId));
    if (q) rows = rows.filter((p) => p.no.includes(q) || (p.companyName || '').includes(q) || (p.note || '').includes(q));
    rows = rows.slice().sort((a, b) => (a.date === b.date ? b.createdAt.localeCompare(a.createdAt) : b.date.localeCompare(a.date)));
    const limit = Math.min(500, Math.max(1, num(req.query.limit) || 100));
    const offset = Math.max(0, num(req.query.offset));
    res.json({
      total: rows.length,
      items: rows.slice(offset, offset + limit),
      sum: {
        netTotal: round2(rows.reduce((s, i) => s + num(i.netTotal), 0)),
        paid: round2(rows.reduce((s, i) => s + num(i.paid), 0)),
        credit: round2(rows.reduce((s, i) => s + num(i.credit), 0)),
        discount: round2(rows.reduce((s, i) => s + num(i.discount), 0)),
      },
    });
  });

  app.get('/api/purchases/:id', requireAuth, (req, res) => {
    const purchase = getDb().purchases.find((p) => p.id === req.params.id && !p.deletedAt);
    if (!purchase) return bad(res, 'فاکتور خرید یافت نشد.', 404);
    res.json({ purchase });
  });

  app.post('/api/purchases', requireAuth, (req: AuthedRequest, res) => {
    idempotent(req, res, () => {
      const db = getDb();
      const body: DocBody = req.body || {};
      const date = validDate(body.date);
      const items = buildItems(body.items, 'purchase');
      const party = body.partyId ? db.parties.find((p) => p.id === body.partyId && !p.deletedAt) : null;
      if (party && party.type !== 'company') throw new Error('برای خرید نسیه باید شرکت انتخاب شود.');
      const totals = totalsOf(items, body.discount, body.paid);
      if (totals.credit > 0 && !party) throw new Error('برای خرید نسیه، شرکت را انتخاب کنید.');

      const purchase: Purchase = {
        id: uid('pur_'),
        no: docNo('PR', 'purchase'),
        date,
        partyId: party?.id || null,
        companyName: clean(body.companyName, 120) || party?.name || 'خرید نقدی',
        items,
        ...totals,
        note: clean(body.note, 300),
        journalId: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: req.user!.name,
        rev: 1,
      };
      db.purchases.push(purchase);
      applyPurchaseToStock(items);
      postPurchase(purchase, req.user!);
      audit(req.user!, 'ثبت خرید', 'purchase', purchase.id, purchase.no);
      return { purchase };
    });
  });

  app.put('/api/purchases/:id', requireAuth, (req: AuthedRequest, res) => {
    const db = getDb();
    const purchase = db.purchases.find((p) => p.id === req.params.id && !p.deletedAt);
    if (!purchase) return bad(res, 'فاکتور خرید یافت نشد.', 404);
    ensureRev(purchase, req.body || {});
    const body: DocBody = req.body || {};
    const date = validDate(body.date ?? purchase.date);
    const items = buildItems(body.items ?? purchase.items, 'purchase');
    const party = body.partyId ? db.parties.find((p) => p.id === body.partyId && !p.deletedAt) : null;
    if (party && party.type !== 'company') return bad(res, 'برای خرید باید شرکت انتخاب شود.');
    const totals = totalsOf(items, body.discount ?? purchase.discount, body.paid ?? purchase.paid);
    if (totals.credit > 0 && !party && !purchase.partyId) return bad(res, 'برای خرید نسیه، شرکت را انتخاب کنید.');

    reverseByRef(purchase.id, req.user!, 'ویرایش فاکتور خرید');
    revertPurchaseFromStock(purchase.items);

    purchase.date = date;
    purchase.partyId = party?.id || (body.partyId === null ? null : purchase.partyId);
    purchase.companyName = clean(body.companyName, 120) || party?.name || purchase.companyName;
    purchase.items = items;
    purchase.itemsTotal = totals.itemsTotal;
    purchase.discount = totals.discount;
    purchase.netTotal = totals.netTotal;
    purchase.paid = totals.paid;
    purchase.credit = totals.credit;
    purchase.note = clean(body.note ?? purchase.note, 300);
    purchase.rev += 1;
    purchase.updatedAt = new Date().toISOString();

    applyPurchaseToStock(items);
    postPurchase(purchase, req.user!);
    audit(req.user!, 'ویرایش خرید', 'purchase', purchase.id, purchase.no);
    saveDb();
    res.json({ purchase });
  });

  app.delete('/api/purchases/:id', requireAuth, (req: AuthedRequest, res) => {
    const db = getDb();
    const purchase = db.purchases.find((p) => p.id === req.params.id && !p.deletedAt);
    if (!purchase) return bad(res, 'فاکتور خرید یافت نشد.', 404);
    ensureRev(purchase, req.query as { rev?: unknown });
    reverseByRef(purchase.id, req.user!, 'حذف فاکتور خرید');
    revertPurchaseFromStock(purchase.items);
    purchase.deletedAt = new Date().toISOString();
    purchase.rev += 1;
    audit(req.user!, 'حذف خرید', 'purchase', purchase.id, purchase.no);
    saveDb();
    res.json({ ok: true });
  });

  /* ---------------------- مصارف ---------------------- */
  app.get('/api/expenses', requireAuth, (req, res) => {
    const db = getDb();
    const from = req.query.from ? validDate(req.query.from) : '0000-01-01';
    const to = req.query.to ? validDate(req.query.to) : '9999-12-31';
    const q = clean(req.query.q, 80);
    const category = clean(req.query.category, 60);
    let rows = db.expenses.filter((e) => !e.deletedAt && e.date >= from && e.date <= to);
    if (category) rows = rows.filter((e) => e.category === category);
    if (q) rows = rows.filter((e) => e.no.includes(q) || (e.payee || '').includes(q) || (e.note || '').includes(q));
    rows = rows.slice().sort((a, b) => (a.date === b.date ? b.createdAt.localeCompare(a.createdAt) : b.date.localeCompare(a.date)));
    res.json({
      total: rows.length,
      items: rows.slice(0, 500),
      sum: round2(rows.reduce((s, e) => s + num(e.amount), 0)),
      byCategory: rows.reduce<Record<string, number>>((acc, e) => {
        acc[e.category] = round2((acc[e.category] || 0) + num(e.amount));
        return acc;
      }, {}),
    });
  });

  app.post('/api/expenses', requireAuth, (req: AuthedRequest, res) => {
    idempotent(req, res, () => {
      const db = getDb();
      const body = req.body || {};
      const amount = round2(num(body.amount));
      if (amount <= 0) throw new Error('مبلغ مصرف باید بیشتر از صفر باشد.');
      const expense: Expense = {
        id: uid('exp_'),
        no: docNo('EX', 'expense'),
        date: validDate(body.date),
        category: clean(body.category, 60) || 'متفرقه',
        amount,
        payee: clean(body.payee, 120),
        note: clean(body.note, 300),
        journalId: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: req.user!.name,
        rev: 1,
      };
      db.expenses.push(expense);
      const entry = postEntry({
        date: expense.date,
        description: `مصرف ${expense.category} ${expense.payee ? `— ${expense.payee}` : ''} (${expense.no})`,
        refType: 'expense',
        refId: expense.id,
        refNo: expense.no,
        lines: [
          { account: ACCOUNTS.EXPENSE, debit: amount, credit: 0, note: expense.category },
          { account: ACCOUNTS.CASH, debit: 0, credit: amount, note: 'پرداخت نقدی' },
        ],
        user: req.user!,
      });
      expense.journalId = entry.id;
      audit(req.user!, 'ثبت مصرف', 'expense', expense.id, `${expense.category} — ${amount}`);
      return { expense };
    });
  });

  app.put('/api/expenses/:id', requireAuth, (req: AuthedRequest, res) => {
    const db = getDb();
    const expense = db.expenses.find((e) => e.id === req.params.id && !e.deletedAt);
    if (!expense) return bad(res, 'مصرف یافت نشد.', 404);
    ensureRev(expense, req.body || {});
    const body = req.body || {};
    const amount = round2(num(body.amount ?? expense.amount));
    if (amount <= 0) return bad(res, 'مبلغ مصرف باید بیشتر از صفر باشد.');
    reverseByRef(expense.id, req.user!, 'ویرایش مصرف');
    expense.date = validDate(body.date ?? expense.date);
    expense.category = clean(body.category ?? expense.category, 60);
    expense.amount = amount;
    expense.payee = clean(body.payee ?? expense.payee, 120);
    expense.note = clean(body.note ?? expense.note, 300);
    expense.rev += 1;
    expense.updatedAt = new Date().toISOString();
    const entry = postEntry({
      date: expense.date,
      description: `مصرف ${expense.category} ${expense.payee ? `— ${expense.payee}` : ''} (${expense.no})`,
      refType: 'expense',
      refId: expense.id,
      refNo: expense.no,
      lines: [
        { account: ACCOUNTS.EXPENSE, debit: amount, credit: 0, note: expense.category },
        { account: ACCOUNTS.CASH, debit: 0, credit: amount, note: 'پرداخت نقدی' },
      ],
      user: req.user!,
    });
    expense.journalId = entry.id;
    audit(req.user!, 'ویرایش مصرف', 'expense', expense.id, expense.no);
    saveDb();
    res.json({ expense });
  });

  app.delete('/api/expenses/:id', requireAuth, (req: AuthedRequest, res) => {
    const db = getDb();
    const expense = db.expenses.find((e) => e.id === req.params.id && !e.deletedAt);
    if (!expense) return bad(res, 'مصرف یافت نشد.', 404);
    ensureRev(expense, req.query as { rev?: unknown });
    reverseByRef(expense.id, req.user!, 'حذف مصرف');
    expense.deletedAt = new Date().toISOString();
    expense.rev += 1;
    audit(req.user!, 'حذف مصرف', 'expense', expense.id, expense.no);
    saveDb();
    res.json({ ok: true });
  });

  /* ---------------------- دریافت و پرداخت ---------------------- */
  app.get('/api/settlements', requireAuth, (req, res) => {
    const db = getDb();
    const from = req.query.from ? validDate(req.query.from) : '0000-01-01';
    const to = req.query.to ? validDate(req.query.to) : '9999-12-31';
    const type = clean(req.query.type, 20);
    let rows = db.settlements.filter((s) => !s.deletedAt && s.date >= from && s.date <= to);
    if (type === 'receive' || type === 'pay') rows = rows.filter((s) => s.type === type);
    if (req.query.partyId) rows = rows.filter((s) => s.partyId === String(req.query.partyId));
    rows = rows.slice().sort((a, b) => (a.date === b.date ? b.createdAt.localeCompare(a.createdAt) : b.date.localeCompare(a.date)));
    res.json({
      total: rows.length,
      items: rows.slice(0, 500),
      sum: round2(rows.reduce((s, r) => s + num(r.amount), 0)),
    });
  });

  app.post('/api/settlements', requireAuth, (req: AuthedRequest, res) => {
    idempotent(req, res, () => {
      const db = getDb();
      const body = req.body || {};
      const amount = round2(num(body.amount));
      if (amount <= 0) throw new Error('مبلغ باید بیشتر از صفر باشد.');
      const type = body.type === 'pay' ? 'pay' : 'receive';
      const party = db.parties.find((p) => p.id === body.partyId && !p.deletedAt);
      if (!party) throw new Error('طرف حساب انتخاب نشده است.');
      if (type === 'receive' && party.type !== 'customer') throw new Error('دریافت پول فقط از مشتری ثبت می‌شود.');
      if (type === 'pay' && party.type !== 'company') throw new Error('پرداخت به شرکت باید برای شرکت ثبت شود.');

      const settlement: Settlement = {
        id: uid('set_'),
        no: docNo(type === 'receive' ? 'RC' : 'PY', type === 'receive' ? 'receipt' : 'payment'),
        date: validDate(body.date),
        type,
        partyId: party.id,
        partyName: party.name,
        amount,
        method: clean(body.method, 40) || 'نقدی',
        note: clean(body.note, 300),
        journalId: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: req.user!.name,
        rev: 1,
      };
      db.settlements.push(settlement);
      const entry = postEntry({
        date: settlement.date,
        description:
          type === 'receive'
            ? `دریافت از ${party.name} (${settlement.no})`
            : `پرداخت به ${party.name} (${settlement.no})`,
        refType: type,
        refId: settlement.id,
        refNo: settlement.no,
        lines:
          type === 'receive'
            ? [
                { account: ACCOUNTS.CASH, debit: amount, credit: 0, note: 'دریافت نقدی' },
                { account: ACCOUNTS.AR, debit: 0, credit: amount, partyId: party.id, note: 'تسویه قرض' },
              ]
            : [
                { account: ACCOUNTS.AP, debit: amount, credit: 0, partyId: party.id, note: 'تسویه بدهی' },
                { account: ACCOUNTS.CASH, debit: 0, credit: amount, note: 'پرداخت نقدی' },
              ],
        user: req.user!,
      });
      settlement.journalId = entry.id;
      audit(req.user!, type === 'receive' ? 'دریافت قرض' : 'پرداخت به شرکت', 'settlement', settlement.id, `${party.name} — ${amount}`);
      return { settlement };
    });
  });

  app.put('/api/settlements/:id', requireAuth, (req: AuthedRequest, res) => {
    const db = getDb();
    const st = db.settlements.find((s) => s.id === req.params.id && !s.deletedAt);
    if (!st) return bad(res, 'سند یافت نشد.', 404);
    ensureRev(st, req.body || {});
    const body = req.body || {};
    const amount = round2(num(body.amount ?? st.amount));
    if (amount <= 0) return bad(res, 'مبلغ باید بیشتر از صفر باشد.');
    const party = body.partyId ? db.parties.find((p) => p.id === body.partyId && !p.deletedAt) : db.parties.find((p) => p.id === st.partyId);
    if (!party) return bad(res, 'طرف حساب یافت نشد.');
    reverseByRef(st.id, req.user!, 'ویرایش سند دریافت/پرداخت');
    st.date = validDate(body.date ?? st.date);
    st.amount = amount;
    st.partyId = party.id;
    st.partyName = party.name;
    st.method = clean(body.method ?? st.method, 40);
    st.note = clean(body.note ?? st.note, 300);
    st.rev += 1;
    st.updatedAt = new Date().toISOString();
    const entry = postEntry({
      date: st.date,
      description:
        st.type === 'receive' ? `دریافت از ${party.name} (${st.no})` : `پرداخت به ${party.name} (${st.no})`,
      refType: st.type,
      refId: st.id,
      refNo: st.no,
      lines:
        st.type === 'receive'
          ? [
              { account: ACCOUNTS.CASH, debit: amount, credit: 0, note: 'دریافت نقدی' },
              { account: ACCOUNTS.AR, debit: 0, credit: amount, partyId: party.id, note: 'تسویه قرض' },
            ]
          : [
              { account: ACCOUNTS.AP, debit: amount, credit: 0, partyId: party.id, note: 'تسویه بدهی' },
              { account: ACCOUNTS.CASH, debit: 0, credit: amount, note: 'پرداخت نقدی' },
            ],
      user: req.user!,
    });
    st.journalId = entry.id;
    audit(req.user!, 'ویرایش دریافت/پرداخت', 'settlement', st.id, st.no);
    saveDb();
    res.json({ settlement: st });
  });

  app.delete('/api/settlements/:id', requireAuth, (req: AuthedRequest, res) => {
    const db = getDb();
    const st = db.settlements.find((s) => s.id === req.params.id && !s.deletedAt);
    if (!st) return bad(res, 'سند یافت نشد.', 404);
    ensureRev(st, req.query as { rev?: unknown });
    reverseByRef(st.id, req.user!, 'حذف سند دریافت/پرداخت');
    st.deletedAt = new Date().toISOString();
    st.rev += 1;
    audit(req.user!, 'حذف دریافت/پرداخت', 'settlement', st.id, st.no);
    saveDb();
    res.json({ ok: true });
  });

  /* ---------------------- اشخاص (مشتری / شرکت) ---------------------- */
  app.get('/api/parties', requireAuth, (req, res) => {
    const db = getDb();
    const type = clean(req.query.type, 20);
    const q = clean(req.query.q, 80);
    let rows = db.parties.filter((p) => !p.deletedAt);
    if (type === 'customer' || type === 'company') rows = rows.filter((p) => p.type === type);
    if (q) rows = rows.filter((p) => p.name.includes(q) || (p.phone || '').includes(q) || (p.note || '').includes(q));
    const items = rows
      .map((p) => ({
        ...p,
        balance: partyBalance(p.id),
        lastDate: [
          ...db.sales.filter((s) => !s.deletedAt && s.partyId === p.id).map((s) => s.date),
          ...db.purchases.filter((x) => !x.deletedAt && x.partyId === p.id).map((x) => x.date),
          ...db.settlements.filter((x) => !x.deletedAt && x.partyId === p.id).map((x) => x.date),
        ].sort().pop() || null,
      }))
      .sort((a, b) => b.balance - a.balance || a.name.localeCompare(b.name, 'fa'));
    res.json({
      items,
      totals: {
        customers: round2(items.filter((p) => p.type === 'customer').reduce((s, p) => s + Math.max(0, p.balance), 0)),
        companies: round2(items.filter((p) => p.type === 'company').reduce((s, p) => s + Math.max(0, p.balance), 0)),
      },
    });
  });

  app.post('/api/parties', requireAuth, (req: AuthedRequest, res) => {
    idempotent(req, res, () => {
      const db = getDb();
      const body = req.body || {};
      const name = clean(body.name, 100);
      if (!name) throw new Error('نام الزامی است.');
      const type = body.type === 'company' ? 'company' : 'customer';
      const party: Party = {
        id: uid('par_'),
        name,
        type,
        phone: clean(body.phone, 40),
        address: clean(body.address, 200),
        note: clean(body.note, 300),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        rev: 1,
      };
      db.parties.push(party);
      const opening = round2(num(body.openingBalance));
      if (opening !== 0) {
        postEntry({
          date: validDate(body.openingDate || today()),
          description: `باقی حساب اولیه ${type === 'customer' ? 'مشتری' : 'شرکت'} — ${name}`,
          refType: 'opening',
          refId: party.id,
          refNo: party.id.slice(-6).toUpperCase(),
          lines:
            type === 'customer'
              ? [
                  { account: ACCOUNTS.AR, debit: Math.abs(opening), credit: 0, partyId: party.id, note: 'قرض اولیه' },
                  { account: ACCOUNTS.CAPITAL, debit: 0, credit: Math.abs(opening), note: 'حساب افتتاحیه' },
                ]
              : [
                  { account: ACCOUNTS.CAPITAL, debit: Math.abs(opening), credit: 0, note: 'حساب افتتاحیه' },
                  { account: ACCOUNTS.AP, debit: 0, credit: Math.abs(opening), partyId: party.id, note: 'بدهی اولیه' },
                ],
          user: req.user!,
        });
      }
      audit(req.user!, 'ثبت طرف حساب', 'party', party.id, name);
      return { party, balance: opening };
    });
  });

  app.put('/api/parties/:id', requireAuth, (req: AuthedRequest, res) => {
    const db = getDb();
    const party = db.parties.find((p) => p.id === req.params.id && !p.deletedAt);
    if (!party) return bad(res, 'طرف حساب یافت نشد.', 404);
    ensureRev(party, req.body || {});
    const body = req.body || {};
    party.name = clean(body.name ?? party.name, 100) || party.name;
    party.phone = clean(body.phone ?? party.phone, 40);
    party.address = clean(body.address ?? party.address, 200);
    party.note = clean(body.note ?? party.note, 300);
    party.rev += 1;
    party.updatedAt = new Date().toISOString();
    audit(req.user!, 'ویرایش طرف حساب', 'party', party.id, party.name);
    saveDb();
    res.json({ party });
  });

  app.delete('/api/parties/:id', requireAuth, (req: AuthedRequest, res) => {
    const db = getDb();
    const party = db.parties.find((p) => p.id === req.params.id && !p.deletedAt);
    if (!party) return bad(res, 'طرف حساب یافت نشد.', 404);
    if (Math.abs(partyBalance(party.id)) > 0.009)
      return bad(res, 'این حساب دارای باقی‌مانده است؛ ابتدا تسویه کنید.');
    party.deletedAt = new Date().toISOString();
    audit(req.user!, 'حذف طرف حساب', 'party', party.id, party.name);
    saveDb();
    res.json({ ok: true });
  });

  app.get('/api/parties/:id/statement', requireAuth, (req, res) => {
    const db = getDb();
    const party = db.parties.find((p) => p.id === req.params.id);
    if (!party) return bad(res, 'طرف حساب یافت نشد.', 404);
    const from = req.query.from ? validDate(req.query.from) : '0000-01-01';
    const to = req.query.to ? validDate(req.query.to) : '9999-12-31';
    res.json(partyStatement(party, from, to));
  });

  /* ---------------------- ادویه / موجودی ---------------------- */
  app.get('/api/products', requireAuth, (req, res) => {
    const db = getDb();
    const q = clean(req.query.q, 80);
    let rows = db.products.filter((p) => !p.deletedAt);
    if (q) rows = rows.filter((p) => p.name.includes(q) || (p.barcode || '').includes(q) || (p.category || '').includes(q));
    if (req.query.low === '1') rows = rows.filter((p) => num(p.stock) <= num(p.minStock));
    const items = rows
      .map((p) => ({ ...p, stockValue: round2(num(p.stock) * num(p.avgCost)) }))
      .sort((a, b) => a.name.localeCompare(b.name, 'fa'));
    res.json({
      items,
      totals: {
        count: items.length,
        stockValue: round2(items.reduce((s, p) => s + p.stockValue, 0)),
        low: items.filter((p) => num(p.stock) <= num(p.minStock)).length,
      },
    });
  });

  app.post('/api/products', requireAuth, (req: AuthedRequest, res) => {
    idempotent(req, res, () => {
      const db = getDb();
      const body = req.body || {};
      const name = clean(body.name, 120);
      if (!name) throw new Error('نام ادویه الزامی است.');
      const dup = db.products.find((p) => !p.deletedAt && p.name === name);
      if (dup) throw new Error('ادویه با همین نام قبلاً ثبت شده است.');
      const product: Product = {
        id: uid('prd_'),
        name,
        unit: clean(body.unit, 20) || 'عدد',
        category: clean(body.category, 40),
        price: round2(num(body.price)),
        stock: round2(num(body.stock)),
        avgCost: round2(num(body.cost)),
        minStock: round2(num(body.minStock ?? db.settings.lowStockThreshold)),
        barcode: clean(body.barcode, 60),
        expiry: clean(body.expiry, 10),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        rev: 1,
      };
      db.products.push(product);
      if (product.stock > 0 && product.avgCost > 0) {
        postEntry({
          date: validDate(body.date || today()),
          description: `موجودی اولیه ادویه — ${product.name}`,
          refType: 'opening',
          refId: product.id,
          refNo: product.id.slice(-6).toUpperCase(),
          lines: [
            { account: ACCOUNTS.INVENTORY, debit: round2(product.stock * product.avgCost), credit: 0, note: 'موجودی اولیه' },
            { account: ACCOUNTS.CAPITAL, debit: 0, credit: round2(product.stock * product.avgCost), note: 'حساب افتتاحیه' },
          ],
          user: req.user!,
        });
      }
      audit(req.user!, 'ثبت ادویه', 'product', product.id, name);
      return { product };
    });
  });

  app.put('/api/products/:id', requireAuth, (req: AuthedRequest, res) => {
    const db = getDb();
    const product = db.products.find((p) => p.id === req.params.id && !p.deletedAt);
    if (!product) return bad(res, 'ادویه یافت نشد.', 404);
    ensureRev(product, req.body || {});
    const body = req.body || {};
    product.name = clean(body.name ?? product.name, 120) || product.name;
    product.unit = clean(body.unit ?? product.unit, 20) || product.unit;
    product.category = clean(body.category ?? product.category, 40);
    product.price = round2(num(body.price ?? product.price));
    product.minStock = round2(num(body.minStock ?? product.minStock));
    product.barcode = clean(body.barcode ?? product.barcode, 60);
    product.expiry = clean(body.expiry ?? product.expiry, 10);
    if (body.avgCost !== undefined) product.avgCost = round2(num(body.avgCost));
    product.rev += 1;
    product.updatedAt = new Date().toISOString();
    audit(req.user!, 'ویرایش ادویه', 'product', product.id, product.name);
    saveDb();
    res.json({ product });
  });

  app.delete('/api/products/:id', requireAuth, (req: AuthedRequest, res) => {
    const db = getDb();
    const product = db.products.find((p) => p.id === req.params.id && !p.deletedAt);
    if (!product) return bad(res, 'ادویه یافت نشد.', 404);
    const remainingValue = round2(num(product.stock) * num(product.avgCost));
    if (remainingValue > 0.009) {
      postEntry({
        date: today(),
        description: `حذف ادویه و تعدیل موجودی — ${product.name}`,
        refType: 'opening',
        refId: product.id,
        refNo: product.id.slice(-6).toUpperCase(),
        lines: [
          { account: ACCOUNTS.CAPITAL, debit: remainingValue, credit: 0, note: 'تعدیل حذف ادویه' },
          { account: ACCOUNTS.INVENTORY, debit: 0, credit: remainingValue, note: 'کاهش موجودی' },
        ],
        user: req.user!,
      });
      product.stock = 0;
    }
    product.deletedAt = new Date().toISOString();
    audit(req.user!, 'حذف ادویه', 'product', product.id, product.name);
    saveDb();
    res.json({ ok: true });
  });

  app.get('/api/products/:id/moves', requireAuth, (req, res) => {
    res.json({ rows: stockMoves(req.params.id) });
  });

  /* ---------------------- صندوق / دفتر کل / گزارش ---------------------- */
  app.get('/api/cashbook', requireAuth, (req, res) => {
    const date = req.query.date ? validDate(req.query.date) : today();
    const from = req.query.from ? validDate(req.query.from) : `${date.slice(0, 7)}-01`;
    const to = req.query.to ? validDate(req.query.to) : date;
    res.json({ ...cashBook(from, to), from, to });
  });

  app.get('/api/ledger', requireAuth, (req, res) => {
    const from = req.query.from ? validDate(req.query.from) : `${(req.query.to ? String(req.query.to) : today()).slice(0, 7)}-01`;
    const to = req.query.to ? validDate(req.query.to) : today();
    const result = ledger({
      from,
      to,
      account: clean(req.query.account, 10) || undefined,
      q: clean(req.query.q, 80),
      includeReversed: req.query.includeReversed === '1',
      limit: Math.min(1000, num(req.query.limit) || 300),
    });
    res.json({ ...result, from, to });
  });

  app.get('/api/reports/summary', requireAuth, (req, res) => {
    const to = req.query.to ? validDate(req.query.to) : today();
    const from = req.query.from ? validDate(req.query.from) : `${to.slice(0, 7)}-01`;
    res.json({ ...summary(from, to), series: dailySeries(from, to), productSales: productSales(from, to, 10) });
  });

  app.get('/api/reports/balances', requireAuth, (req, res) => {
    const asOf = req.query.asOf ? validDate(req.query.asOf) : today();
    res.json({
      asOf,
      accounts: ACCOUNT_LIST.map((a) => ({ ...a, balance: accountBalance(a.code, { to: asOf }) })),
      cash: cashBalance(asOf),
      receivables: totalReceivable(asOf),
      payables: totalPayable(asOf),
    });
  });

  /* ---------------------- سرمایه / افتتاحیه ---------------------- */
  app.post('/api/opening-cash', requireAuth, requireAdmin, (req: AuthedRequest, res) => {
    const body = req.body || {};
    const amount = round2(num(body.amount));
    if (amount <= 0) return bad(res, 'مبلغ باید بیشتر از صفر باشد.');
    const entry = postEntry({
      date: validDate(body.date || today()),
      description: clean(body.note, 200) || 'افزایش سرمایه نقدی / موجودی اولیه صندوق',
      refType: 'capital',
      refId: uid('cap_'),
      refNo: 'CAP',
      lines: [
        { account: ACCOUNTS.CASH, debit: amount, credit: 0, note: 'موجودی اولیه صندوق' },
        { account: ACCOUNTS.CAPITAL, debit: 0, credit: amount, note: 'سرمایه' },
      ],
      user: req.user!,
    });
    audit(req.user!, 'ثبت سرمایه/افتتاحیه', 'journal', entry.id, String(amount));
    saveDb();
    res.status(201).json({ entry, cashBalance: cashBalance() });
  });

  /* ---------------------- کاربران ---------------------- */
  app.get('/api/users', requireAuth, requireAdmin, (_req, res) => {
    res.json({ items: getDb().users.map((u) => ({ id: u.id, username: u.username, name: u.name, role: u.role, active: u.active, createdAt: u.createdAt })) });
  });

  app.post('/api/users', requireAuth, requireAdmin, (req: AuthedRequest, res) => {
    const db = getDb();
    const body = req.body || {};
    const username = clean(body.username, 40);
    const password = String(body.password || '');
    if (!username) return bad(res, 'نام کاربری الزامی است.');
    if (password.length < 6) return bad(res, 'رمز عبور باید حداقل ۶ حرف باشد.');
    if (db.users.some((u) => u.username.toLowerCase() === username.toLowerCase()))
      return bad(res, 'این نام کاربری قبلاً ثبت شده است.');
    const user = {
      id: uid('usr_'),
      username,
      name: clean(body.name, 80) || username,
      role: (body.role === 'accountant' ? 'accountant' : 'admin') as 'admin' | 'accountant',
      passwordHash: hashPassword(password),
      active: true,
      createdAt: new Date().toISOString(),
    };
    db.users.push(user);
    audit(req.user!, 'ثبت کاربر', 'user', user.id, username);
    saveDb();
    res.status(201).json({ user: { id: user.id, username: user.username, name: user.name, role: user.role, active: true } });
  });

  app.put('/api/users/:id', requireAuth, requireAdmin, (req: AuthedRequest, res) => {
    const db = getDb();
    const user = db.users.find((u) => u.id === req.params.id);
    if (!user) return bad(res, 'کاربر یافت نشد.', 404);
    const body = req.body || {};
    if (body.name !== undefined) user.name = clean(body.name, 80) || user.name;
    if (body.role !== undefined) user.role = body.role === 'accountant' ? 'accountant' : 'admin';
    if (body.active !== undefined) {
      if (user.id === req.user!.id && !body.active) return bad(res, 'نمی‌توانید حساب خود را غیرفعال کنید.');
      user.active = Boolean(body.active);
    }
    if (body.password) {
      if (String(body.password).length < 6) return bad(res, 'رمز عبور باید حداقل ۶ حرف باشد.');
      setPassword(user, String(body.password));
    }
    audit(req.user!, 'ویرایش کاربر', 'user', user.id, user.username);
    saveDb();
    res.json({ user: { id: user.id, username: user.username, name: user.name, role: user.role, active: user.active } });
  });

  app.delete('/api/users/:id', requireAuth, requireAdmin, (req: AuthedRequest, res) => {
    const db = getDb();
    if (req.params.id === req.user!.id) return bad(res, 'حساب خودتان را نمی‌توانید حذف کنید.');
    const user = db.users.find((u) => u.id === req.params.id);
    if (!user) return bad(res, 'کاربر یافت نشد.', 404);
    if (user.role === 'admin' && db.users.filter((u) => u.role === 'admin' && u.active).length <= 1)
      return bad(res, 'باید حداقل یک مدیر فعال باقی بماند.');
    db.users = db.users.filter((u) => u.id !== user.id);
    db.sessions = db.sessions.filter((s) => s.userId !== user.id);
    audit(req.user!, 'حذف کاربر', 'user', user.id, user.username);
    saveDb();
    res.json({ ok: true });
  });

  /* ---------------------- پشتیبان‌گیری ---------------------- */
  app.get('/api/backup', requireAuth, requireAdmin, (_req, res) => {
    const db = getDb();
    const payload = {
      app: 'frotan-pharmacy',
      schemaVersion: db.schemaVersion,
      exportedAt: new Date().toISOString(),
      data: { ...db, sessions: [], idempotency: {} },
    };
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="frotan-backup-${today()}.json"`);
    res.send(JSON.stringify(payload, null, 2));
  });

  app.post('/api/restore', requireAuth, requireAdmin, (req: AuthedRequest, res) => {
    const body = req.body || {};
    const data = (body.data || body) as Partial<Database>;
    if (!data || data.schemaVersion === undefined || !Array.isArray(data.users) || !Array.isArray(data.journals))
      return bad(res, 'فایل پشتیبان معتبر نیست.');
    if (typeof body.confirm !== 'string' || body.confirm !== 'RESTORE')
      return bad(res, 'برای بازیابی باید تأییدیه ارسال شود.');
    replaceDb({
      ...(data as Database),
      sessions: [],
      idempotency: {},
    });
    res.json({ ok: true, message: 'اطلاعات با موفقیت بازیابی شد. لطفاً دوباره وارد شوید.', users: getDb().users.length });
  });

  app.get('/api/audit', requireAuth, requireAdmin, (req, res) => {
    res.json({ items: getDb().audit.slice(0, Math.min(500, num(req.query.limit) || 100)) });
  });

  /* ---------------------- خطاها ---------------------- */
  app.use('/api', (req, res) => {
    res.status(404).json({ error: 'مسیر مورد نظر یافت نشد.' });
  });

  app.use((err: Error & { status?: number }, req: AuthedRequest, res: Response, next: NextFunction) => {
    if (!req.path.startsWith('/api')) return next(err);
    const status = err.status || 400;
    if (status >= 500) console.error('[api]', err);
    res.status(status).json({ error: err.message || 'خطای غیرمنتظره رخ داد.' });
  });
}
