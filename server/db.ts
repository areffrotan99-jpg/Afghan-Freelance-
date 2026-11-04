import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

/** محل ذخیره‌سازی: خارج از سورس در محیط داکر (volume) */
const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), '.data');
const DB_FILE = path.join(DATA_DIR, 'frotan-db.json');

export type Role = 'admin' | 'accountant';

export interface User {
  id: string;
  username: string;
  name: string;
  role: Role;
  passwordHash: string;
  active: boolean;
  createdAt: string;
}

export interface Session {
  token: string; // sha256 hash
  userId: string;
  createdAt: string;
  expiresAt: string;
}

export interface Party {
  id: string;
  name: string;
  type: 'customer' | 'company';
  phone?: string;
  address?: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
  rev: number;
  deletedAt?: string | null;
}

export interface Product {
  id: string;
  name: string;
  unit: string;
  category?: string;
  price: number;
  stock: number;
  avgCost: number;
  minStock: number;
  barcode?: string;
  expiry?: string;
  createdAt: string;
  updatedAt: string;
  rev: number;
  deletedAt?: string | null;
}

export interface DocItem {
  productId?: string | null;
  name: string;
  qty: number;
  unitPrice: number;
  cost?: number;
}

export interface Sale {
  id: string;
  no: string;
  date: string;
  partyId?: string | null;
  customerName: string;
  items: DocItem[];
  itemsTotal: number;
  discount: number;
  netTotal: number;
  paid: number;
  credit: number;
  cogs: number;
  note?: string;
  journalId: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  rev: number;
  deletedAt?: string | null;
}

export interface Purchase {
  id: string;
  no: string;
  date: string;
  partyId?: string | null;
  companyName: string;
  items: DocItem[];
  itemsTotal: number;
  discount: number;
  netTotal: number;
  paid: number;
  credit: number;
  note?: string;
  journalId: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  rev: number;
  deletedAt?: string | null;
}

export interface Expense {
  id: string;
  no: string;
  date: string;
  category: string;
  amount: number;
  payee: string;
  note?: string;
  journalId: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  rev: number;
  deletedAt?: string | null;
}

export interface Settlement {
  id: string;
  no: string;
  date: string;
  type: 'receive' | 'pay'; // دریافت از مشتری / پرداخت به شرکت
  partyId: string;
  partyName: string;
  amount: number;
  method: string;
  note?: string;
  journalId: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  rev: number;
  deletedAt?: string | null;
}

export interface JournalLine {
  account: string;
  debit: number;
  credit: number;
  partyId?: string | null;
  note?: string;
}

export interface JournalEntry {
  id: string;
  no: number;
  date: string;
  description: string;
  refType: 'sale' | 'purchase' | 'expense' | 'receive' | 'pay' | 'capital' | 'opening';
  refId: string;
  refNo: string;
  lines: JournalLine[];
  status: 'active' | 'reversed';
  amount: number;
  createdAt: string;
  createdBy: string;
  reversedAt?: string | null;
  revokedNote?: string;
}

export interface AuditEntry {
  id: string;
  at: string;
  userId: string;
  userName: string;
  action: string;
  entity: string;
  entityId: string;
  details?: string;
}

export interface Settings {
  pharmacyName: string;
  ownerName: string;
  address: string;
  phone: string;
  currency: string;
  lowStockThreshold: number;
  footerNote: string;
}

export interface Database {
  schemaVersion: number;
  users: User[];
  sessions: Session[];
  parties: Party[];
  products: Product[];
  sales: Sale[];
  purchases: Purchase[];
  expenses: Expense[];
  settlements: Settlement[];
  journals: JournalEntry[];
  audit: AuditEntry[];
  idempotency: Record<string, { at: string; status: number; body: unknown }>;
  seq: Record<string, number>;
  settings: Settings;
}

export const uid = (prefix = '') => prefix + crypto.randomBytes(8).toString('hex');

const emptyDb = (): Database => ({
  schemaVersion: 1,
  users: [],
  sessions: [],
  parties: [],
  products: [],
  sales: [],
  purchases: [],
  expenses: [],
  settlements: [],
  journals: [],
  audit: [],
  idempotency: {},
  seq: {},
  settings: {
    pharmacyName: 'فروتن درملتون',
    ownerName: '',
    address: '',
    phone: '',
    currency: 'AFN',
    lowStockThreshold: 5,
    footerNote: 'با تشکر از معامله شما — فروتن درملتون',
  },
});

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  try {
    const [salt, hash] = stored.split(':');
    const candidate = crypto.scryptSync(password, salt, 64);
    const expected = Buffer.from(hash, 'hex');
    return candidate.length === expected.length && crypto.timingSafeEqual(candidate, expected);
  } catch {
    return false;
  }
}

let db: Database = emptyDb();
let loaded = false;

function seed(database: Database) {
  if (database.users.length === 0) {
    database.users.push({
      id: uid('usr_'),
      username: 'admin',
      name: 'مدیر سیستم',
      role: 'admin',
      passwordHash: hashPassword('admin123'),
      active: true,
      createdAt: new Date().toISOString(),
    });
  }
}

export function loadDb(): Database {
  if (loaded) return db;
  loaded = true;
  fs.mkdirSync(DATA_DIR, { recursive: true });
  if (fs.existsSync(DB_FILE)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(DB_FILE, 'utf8')) as Database;
      db = { ...emptyDb(), ...parsed };
      seed(db);
    } catch (err) {
      const broken = `${DB_FILE}.broken-${Date.now()}`;
      console.error('[db] فایل داده خراب بود، نسخه پشتیبان گرفته شد:', broken, err);
      try {
        fs.renameSync(DB_FILE, broken);
      } catch {
        /* ignore */
      }
      db = emptyDb();
      seed(db);
      saveDb();
    }
  } else {
    db = emptyDb();
    seed(db);
    saveDb();
  }
  return db;
}

export function getDb(): Database {
  return loaded ? db : loadDb();
}

export function saveDb() {
  const tmp = `${DB_FILE}.tmp`;
  const payload = JSON.stringify(db);
  fs.writeFileSync(tmp, payload, 'utf8');
  fs.renameSync(tmp, DB_FILE);
}

export function replaceDb(next: Database) {
  db = { ...emptyDb(), ...next };
  loaded = true;
  seed(db);
  saveDb();
}

export function nextSeq(key: string): number {
  const database = getDb();
  database.seq[key] = (database.seq[key] || 0) + 1;
  return database.seq[key];
}

export function docNo(prefix: string, key: string): string {
  return `${prefix}-${String(nextSeq(key)).padStart(5, '0')}`;
}

export function audit(user: { id: string; name: string }, action: string, entity: string, entityId: string, details?: string) {
  const database = getDb();
  database.audit.unshift({
    id: uid('aud_'),
    at: new Date().toISOString(),
    userId: user?.id || '',
    userName: user?.name || '',
    action,
    entity,
    entityId,
    details,
  });
  if (database.audit.length > 3000) database.audit.length = 3000;
}

export const round2 = (n: number) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;
export const num = (v: unknown): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

export { DB_FILE, DATA_DIR };
