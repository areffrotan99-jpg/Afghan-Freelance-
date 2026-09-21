import React, { useState, useEffect } from 'react';
import {
  Shield,
  CreditCard,
  Settings,
  Users,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Save,
  Lock,
  DollarSign,
  Briefcase
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';
import { useMarketplace } from '../context/MarketplaceContext';

export const AdminDashboard: React.FC = () => {
  const { dir } = useLanguage();
  const { formatAmount } = useCurrency();
  const { orders, freelancers, completeOrder } = useMarketplace();

  const [activeTab, setActiveTab] = useState<'overview' | 'hesabpay' | 'disputes' | 'users'>('overview');

  // HesabPay backend settings
  const [hesabPayConfig, setHesabPayConfig] = useState({
    configured: true,
    merchantId: 'HESABPAY-AF-MERCH-88992',
    mode: 'sandbox',
    platformFeePercent: 8,
  });

  const [apiKeyInput, setApiKeyInput] = useState('');
  const [merchantIdInput, setMerchantIdInput] = useState(hesabPayConfig.merchantId);
  const [modeInput, setModeInput] = useState(hesabPayConfig.mode);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    // Fetch current settings from backend
    fetch('/api/admin/settings')
      .then((res) => res.json())
      .then((data) => {
        setHesabPayConfig(data);
        setMerchantIdInput(data.merchantId || '');
        setModeInput(data.mode || 'sandbox');
      })
      .catch(() => {});
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merchantId: merchantIdInput,
          mode: modeInput,
          apiKey: apiKeyInput || undefined,
        }),
      });
      const data = await res.json();
      setHesabPayConfig(data.settings);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch {
      alert('خطا در ذخیره تنظیمات درگاه.');
    }
  };

  const totalVolumeAFN = orders.reduce((sum, o) => sum + o.amountAFN, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8" dir={dir}>
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" />
              کنترل پنل مدیریت ارشد
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            مرکز مدیریت پلتفرم افغان فریلنس
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            پیکربندی درگاه حساب‌پی، داوری و حل اختلاف، نظارت بر تراکنش‌های مالی و احراز هویت
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 gap-4 text-xs font-bold">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 border-b-2 transition ${
            activeTab === 'overview'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          نمای کلی و آمار سیستم
        </button>
        <button
          onClick={() => setActiveTab('hesabpay')}
          className={`pb-3 border-b-2 transition ${
            activeTab === 'hesabpay'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          تنظیمات درگاه HesabPay
        </button>
        <button
          onClick={() => setActiveTab('disputes')}
          className={`pb-3 border-b-2 transition ${
            activeTab === 'disputes'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          مرکز داوری و اختلافات ({orders.filter((o) => o.status === 'disputed').length})
        </button>
      </div>

      {/* Tab: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
              <span className="text-xs text-slate-400 block">گردش مالی کل در حساب‌پی</span>
              <span className="text-xl font-black text-emerald-400 font-mono mt-1 block">
                {formatAmount(totalVolumeAFN, Math.round(totalVolumeAFN / 70.5))}
              </span>
            </div>

            <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
              <span className="text-xs text-slate-400 block">سفارشات ثبت شده</span>
              <span className="text-xl font-black text-white font-mono mt-1 block">{orders.length} سفارش</span>
            </div>

            <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
              <span className="text-xs text-slate-400 block">فریلنسرهای فعال</span>
              <span className="text-xl font-black text-blue-400 font-mono mt-1 block">{freelancers.length} نفر</span>
            </div>

            <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
              <span className="text-xs text-slate-400 block">کارمزد پلتفرم</span>
              <span className="text-xl font-black text-amber-400 font-mono mt-1 block">۸٪</span>
            </div>
          </div>

          {/* Quick Orders Monitor */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="font-bold text-sm text-white">آخرین سفارشات در جریان پلتفرم</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-right">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-800">
                    <th className="pb-3">شماره سفارش</th>
                    <th className="pb-3">خدمت</th>
                    <th className="pb-3">کارفرما</th>
                    <th className="pb-3">فریلنسر</th>
                    <th className="pb-3">مبلغ</th>
                    <th className="pb-3">وضعیت</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {orders.map((o) => (
                    <tr key={o.id} className="text-slate-300">
                      <td className="py-3 font-mono text-[11px] text-slate-400">{o.orderNumber}</td>
                      <td className="py-3 font-medium text-white">{o.serviceTitle}</td>
                      <td className="py-3 text-slate-400">{o.clientName}</td>
                      <td className="py-3 text-blue-400">{o.freelancerName}</td>
                      <td className="py-3 font-mono text-emerald-400 font-bold">
                        {formatAmount(o.amountAFN, o.amountUSD)}
                      </td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] text-slate-300">
                          {o.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab: HesabPay Config */}
      {activeTab === 'hesabpay' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-2xl space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold">
              H
            </div>
            <div>
              <h3 className="font-bold text-base text-white">تنظیمات درگاه رسمی حساب‌پی (HesabPay)</h3>
              <p className="text-xs text-slate-400">
                اتصال مستقیم به API پرداخت و صندوق امانت حساب‌پی برای پردازش تراکنش‌ها در افغانستان
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 mb-1 font-semibold">شناسه پذیرنده (Merchant ID):</label>
              <input
                type="text"
                dir="ltr"
                value={merchantIdInput}
                onChange={(e) => setMerchantIdInput(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1 font-semibold">
                کلید امنیتی API Key (در Backend محفوظ است):
              </label>
              <input
                type="password"
                dir="ltr"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="برای تغییر کلید، مقدار جدید را وارد کنید..."
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                کلید در فایل محیطی سرور نگهداری شده و هرگز به سمت کلاینت ارسال نمی‌گردد.
              </span>
            </div>

            <div>
              <label className="block text-slate-300 mb-1 font-semibold">محیط پردازش:</label>
              <select
                value={modeInput}
                onChange={(e) => setModeInput(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-medium"
              >
                <option value="sandbox">Sandbox (تست و ارزیابی شبیه‌سازی شده)</option>
                <option value="live">Live (محیط عملیاتی و پول واقعی)</option>
              </select>
            </div>

            {saveSuccess && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>تنظیمات حساب‌پی در سرور Express با موفقیت بروزرسانی شد!</span>
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                className="py-2.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 transition"
              >
                <Save className="w-4 h-4" />
                <span>ذخیره و اعمال تنظیمات</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab: Disputes */}
      {activeTab === 'disputes' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <h3 className="font-bold text-sm text-white">حل اختلاف و داوری صندوق امانی (Escrow Arbitration)</h3>
          <p className="text-xs text-slate-400">
            در صورت بروز اختلاف میان کارفرما و فریلنسر، تیم داوری افغان فریلنس با بررسی مستندات وجه را آزاد یا عودت می‌دهد.
          </p>

          <div className="p-6 text-center bg-slate-800/40 rounded-2xl border border-slate-750 space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <h4 className="font-bold text-xs text-white">تمامی سفارشات در وضعیت سالم و رضایت‌بخش هستند.</h4>
            <p className="text-[11px] text-slate-400">هیچ پرونده اختلاف یا شکایت معلقی وجود ندارد.</p>
          </div>
        </div>
      )}
    </div>
  );
};
