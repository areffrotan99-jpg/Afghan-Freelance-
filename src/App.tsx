import { AuthProvider, useAuth } from './lib/session';
import { usePath } from './lib/router';
import { Toaster } from './lib/toast';
import { Layout } from './components/Layout';
import { navigate } from './lib/router';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { SalesPage } from './pages/Sales';
import { PurchasesPage } from './pages/Purchases';
import { ExpensesPage } from './pages/Expenses';
import { CashboxPage } from './pages/Cashbox';
import { PartiesPage } from './pages/Parties';
import { ProductsPage } from './pages/Products';
import { LedgerPage } from './pages/Ledger';
import { ReportsPage } from './pages/Reports';
import { SettingsPage } from './pages/Settings';
import { GuidePage } from './pages/Guide';

function NotFound() {
  return (
    <div className="card card-pad mx-auto mt-10 max-w-md text-center">
      <p className="text-base font-bold text-slate-800">صفحه مورد نظر پیدا نشد</p>
      <p className="mt-1 text-sm text-slate-500">آدرس وارد شده در برنامه وجود ندارد.</p>
      <button className="btn-primary mt-4" onClick={() => navigate('/')}>
        بازگشت به داشبورد
      </button>
    </div>
  );
}

function Routes() {
  const path = usePath();
  switch (path) {
    case '/':
      return <Dashboard />;
    case '/sales':
      return <SalesPage />;
    case '/purchases':
      return <PurchasesPage />;
    case '/expenses':
      return <ExpensesPage />;
    case '/cashbox':
      return <CashboxPage />;
    case '/customers':
      return <PartiesPage type="customer" />;
    case '/companies':
      return <PartiesPage type="company" />;
    case '/products':
      return <ProductsPage />;
    case '/ledger':
      return <LedgerPage />;
    case '/reports':
      return <ReportsPage />;
    case '/settings':
      return <SettingsPage />;
    case '/guide':
      return <GuidePage />;
    default:
      return <NotFound />;
  }
}

function Shell() {
  const { user, ready } = useAuth();
  if (!ready) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-100">
        <div className="flex flex-col items-center gap-3">
          <span className="h-8 w-8 animate-spin rounded-full border-3 border-emerald-600 border-t-transparent" />
          <p className="text-sm font-semibold text-slate-600">فروتن درملتون</p>
        </div>
      </div>
    );
  }
  if (!user) return <Login />;
  return (
    <Layout>
      <Routes />
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Shell />
      <Toaster />
    </AuthProvider>
  );
}
