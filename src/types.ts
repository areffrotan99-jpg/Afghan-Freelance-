export interface Settings {
  pharmacyName: string;
  ownerName: string;
  address: string;
  phone: string;
  currency: string;
  lowStockThreshold: number;
  footerNote: string;
}

export interface MetaParty {
  id: string;
  name: string;
  type: 'customer' | 'company';
}

export interface MetaProduct {
  id: string;
  name: string;
  unit: string;
  price: number;
  stock: number;
  avgCost: number;
}

export interface Meta {
  settings: Settings;
  accounts: { code: string; name: string; type: string }[];
  expenseCategories: string[];
  parties: MetaParty[];
  products: MetaProduct[];
  user: { id: string; name: string; username: string; role: string };
  serverTime: string;
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
  profit?: number;
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
}

export interface Settlement {
  id: string;
  no: string;
  date: string;
  type: 'receive' | 'pay';
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
}

export interface PartyRow {
  id: string;
  name: string;
  type: 'customer' | 'company';
  phone?: string;
  address?: string;
  note?: string;
  balance: number;
  lastDate: string | null;
  rev: number;
}

export interface ProductRow {
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
  stockValue: number;
  rev: number;
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
  refType: string;
  refId: string;
  refNo: string;
  lines: JournalLine[];
  status: 'active' | 'reversed';
  amount: number;
  createdAt: string;
  createdBy: string;
  reversedAt?: string | null;
  revokedNote?: string;
  debitTotal?: number;
  creditTotal?: number;
}

export interface Summary {
  from: string;
  to: string;
  salesGross: number;
  salesDiscount: number;
  netSales: number;
  cogs: number;
  grossProfit: number;
  expensesTotal: number;
  expenseByCategory: Record<string, number>;
  netProfit: number;
  cashIn: number;
  cashOut: number;
  cashNet: number;
  cashBalance: number;
  receivables: number;
  payables: number;
  inventoryValue: number;
  salesCount: number;
  purchaseCount: number;
  creditSales: number;
  creditPurchases: number;
  purchasesTotal: number;
  expenseCount: number;
}

export interface StatementRow {
  id: string;
  date: string;
  no: number;
  refNo: string;
  refType: string;
  description: string;
  charge: number;
  payment: number;
  balance: number;
}

export interface Statement {
  party: PartyRow;
  opening: number;
  closing: number;
  rows: StatementRow[];
}
