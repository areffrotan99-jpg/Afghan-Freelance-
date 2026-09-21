import React, { useState } from 'react';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldCheck,
  CreditCard,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building,
  Smartphone,
  X,
  Lock,
  RefreshCw
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';
import { useMarketplace } from '../context/MarketplaceContext';

export const WalletPage: React.FC = () => {
  const { dir } = useLanguage();
  const { formatAmount, currency, exchangeRate } = useCurrency();
  const { wallet, transactions, depositFunds, requestWithdrawal } = useMarketplace();

  // Modals
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState(5000);
  const [depositPhone, setDepositPhone] = useState('0791234567');
  const [isDepositing, setIsDepositing] = useState(false);

  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState(3000);
  const [withdrawMethod, setWithdrawMethod] = useState<'hesabpay' | 'bank'>('hesabpay');
  const [withdrawDestination, setWithdrawDestination] = useState('0799887766');
  const [bankName, setBankName] = useState('Azizi Bank');
  const [bankAccount, setBankAccount] = useState('0011-223344-55');
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsDepositing(true);
    setTimeout(() => {
      depositFunds(depositAmount, 'AFN');
      setIsDepositing(false);
      setIsDepositOpen(false);
    }, 1200);
  };

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (withdrawAmount > wallet.balanceAFN) {
      setErrorMsg('مبلغ درخواستی بیشتر از موجودی قابل برداشت شماست.');
      return;
    }

    setIsWithdrawing(true);
    setTimeout(() => {
      const dest =
        withdrawMethod === 'hesabpay'
          ? `HesabPay: ${withdrawDestination}`
          : `${bankName} (${bankAccount})`;

      requestWithdrawal(withdrawAmount, 'AFN', dest);
      setIsWithdrawing(false);
      setIsWithdrawOpen(false);
    }, 1200);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8" dir={dir}>
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          کیف پول و مدیریت مالی (HesabPay Wallet)
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          تسویه حساب فوری، واریز وجه، برداشت به کیف پول HesabPay یا حساب‌های بانکی معتبر افغانستان
        </p>
      </div>

      {/* Balance Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Balance Box */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-blue-900/80 via-slate-900 to-indigo-950 border border-slate-750 text-white space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-blue-600/30 flex items-center justify-center text-blue-400">
                <Wallet className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-slate-300">موجودی در دسترس</span>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              فعال و آماده برداشت
            </span>
          </div>

          <div className="space-y-1">
            <div className="text-3xl font-black text-white font-mono">
              {wallet.balanceAFN.toLocaleString()} <span className="text-base text-blue-400 font-sans">افغانی</span>
            </div>
            <div className="text-xs font-mono text-slate-400">
              معادل تقریبی: ${(wallet.balanceAFN / exchangeRate).toFixed(2)} USD
            </div>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button
              onClick={() => setIsDepositOpen(true)}
              className="flex-1 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-md shadow-blue-600/20"
            >
              <ArrowDownLeft className="w-4 h-4" />
              <span>افزایش موجودی</span>
            </button>

            <button
              onClick={() => setIsWithdrawOpen(true)}
              className="flex-1 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition"
            >
              <ArrowUpRight className="w-4 h-4 text-emerald-400" />
              <span>برداشت وجه</span>
            </button>
          </div>
        </div>

        {/* Escrow Protected Funds Box */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 text-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-slate-300">سپرده در صندوق امانی</span>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Escrow
            </span>
          </div>

          <div className="space-y-1">
            <div className="text-3xl font-black text-purple-300 font-mono">
              {(18500).toLocaleString()} <span className="text-base font-sans">افغانی</span>
            </div>
            <div className="text-xs font-mono text-slate-400">
              معادل تقریبی: ${(18500 / exchangeRate).toFixed(2)} USD
            </div>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed">
            این مبالغ مربوط به پروژه‌های فعال است و پس از تحویل نهایی و رضایت طرفین آزاد خواهد شد.
          </p>
        </div>

        {/* Official Banking Integration Notice */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 text-slate-200 space-y-3">
          <div className="flex items-center gap-2">
            <Building className="w-5 h-5 text-blue-400" />
            <h4 className="font-bold text-xs text-white">پشتیبانی سیستم بانکی افغانستان</h4>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            سیستم افغان فریلنس با پروتکل‌های حساب‌پی به شبکه‌های بانکی شامل عزیزی بانک، کابل بانک، میوند بانک و بانک بین‌المللی افغانستان (AIB) متصل است.
          </p>

          <div className="pt-2 flex items-center gap-2 text-[11px] text-emerald-400">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>تسویه سریع ظرف ۲ الی ۲۴ ساعت کاری</span>
          </div>
        </div>
      </div>

      {/* Transaction History Ledger */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="font-bold text-sm text-white">تاریخچه تراکنش‌های مالی (Ledger)</h3>
          <span className="text-xs text-slate-400">{transactions.length} تراکنش ثبت شده</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-right">
            <thead>
              <tr className="text-slate-400 border-b border-slate-800/80">
                <th className="pb-3 font-semibold">شناسه تراکنش</th>
                <th className="pb-3 font-semibold">نوع عملیات</th>
                <th className="pb-3 font-semibold">شرح / مقصد</th>
                <th className="pb-3 font-semibold">تاریخ</th>
                <th className="pb-3 font-semibold">مبلغ</th>
                <th className="pb-3 font-semibold">وضعیت</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {transactions.map((tx) => (
                <tr key={tx.id} className="text-slate-300 hover:bg-slate-800/30 transition">
                  <td className="py-3.5 font-mono text-[11px] text-slate-400">{tx.id}</td>
                  <td className="py-3.5 font-medium">
                    {tx.type === 'deposit' && (
                      <span className="text-blue-400 flex items-center gap-1">
                        <ArrowDownLeft className="w-3.5 h-3.5" /> افزایش اعتبار
                      </span>
                    )}
                    {tx.type === 'freelancer_earnings' && (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> درآمد پروژه
                      </span>
                    )}
                    {tx.type === 'withdrawal' && (
                      <span className="text-amber-400 flex items-center gap-1">
                        <ArrowUpRight className="w-3.5 h-3.5" /> برداشت وجه
                      </span>
                    )}
                    {tx.type === 'payment' && (
                      <span className="text-slate-300 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" /> پرداخت امانی
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 text-slate-400 max-w-xs truncate">{tx.description}</td>
                  <td className="py-3.5 text-slate-500 font-mono text-[11px]">{tx.createdAt}</td>
                  <td className="py-3.5 font-mono font-bold">
                    <span className="text-emerald-400">
                      {tx.amount.toLocaleString()} {tx.currency === 'AFN' ? 'افغانی' : 'دالر'}
                    </span>
                  </td>
                  <td className="py-3.5">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                      {tx.status === 'completed' ? 'موفق' : tx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Deposit Modal */}
      {isDepositOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-750 p-6 sm:p-8 rounded-3xl max-w-md w-full space-y-4 shadow-2xl relative">
            <button
              onClick={() => setIsDepositOpen(false)}
              className="absolute top-4 left-4 p-1 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold">
                H
              </div>
              <h3 className="font-bold text-base text-white">افزایش موجودی از طریق حساب‌پی</h3>
            </div>

            <form onSubmit={handleDepositSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">مبلغ افزایش موجودی (افغانی):</label>
                <input
                  type="number"
                  min={500}
                  step={500}
                  required
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">شماره موبایل حساب‌پی (افغانستان):</label>
                <input
                  type="text"
                  dir="ltr"
                  required
                  value={depositPhone}
                  onChange={(e) => setDepositPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsDepositOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={isDepositing}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center gap-1.5 transition disabled:opacity-50"
                >
                  {isDepositing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>اتصال به HesabPay...</span>
                    </>
                  ) : (
                    <span>پرداخت و شارژ کیف پول</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      {isWithdrawOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-750 p-6 sm:p-8 rounded-3xl max-w-md w-full space-y-4 shadow-2xl relative">
            <button
              onClick={() => setIsWithdrawOpen(false)}
              className="absolute top-4 left-4 p-1 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-bold text-base text-white">برداشت وجه از حساب کاربری</h3>

            <form onSubmit={handleWithdrawSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">مبلغ برداشت (افغانی):</label>
                <input
                  type="number"
                  min={500}
                  max={wallet.balanceAFN}
                  step={500}
                  required
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-mono"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  موجودی قابل برداشت شما: {wallet.balanceAFN.toLocaleString()} افغانی
                </span>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">مقصد واریز وجه:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setWithdrawMethod('hesabpay')}
                    className={`p-2.5 rounded-xl border text-center font-medium ${
                      withdrawMethod === 'hesabpay'
                        ? 'border-blue-500 bg-blue-500/10 text-blue-300'
                        : 'border-slate-750 bg-slate-800 text-slate-400'
                    }`}
                  >
                    کیف پول HesabPay
                  </button>
                  <button
                    type="button"
                    onClick={() => setWithdrawMethod('bank')}
                    className={`p-2.5 rounded-xl border text-center font-medium ${
                      withdrawMethod === 'bank'
                        ? 'border-blue-500 bg-blue-500/10 text-blue-300'
                        : 'border-slate-750 bg-slate-800 text-slate-400'
                    }`}
                  >
                    حساب بانکی افغانستان
                  </button>
                </div>
              </div>

              {withdrawMethod === 'hesabpay' ? (
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">شماره حساب‌پی مقصد:</label>
                  <input
                    type="text"
                    dir="ltr"
                    required
                    value={withdrawDestination}
                    onChange={(e) => setWithdrawDestination(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-mono"
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-slate-300 mb-1 font-semibold">بانک مقصد:</label>
                    <select
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
                    >
                      <option value="Azizi Bank">عزیزی بانک (Azizi Bank)</option>
                      <option value="Kabul Bank">کابل بانک نو (New Kabul Bank)</option>
                      <option value="Afghanistan International Bank (AIB)">
                        بانک بین‌المللی افغانستان (AIB)
                      </option>
                      <option value="Maiwand Bank">میوند بانک (Maiwand Bank)</option>
                      <option value="Islamic Bank of Afghanistan">بانک اسلامی افغانستان</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1 font-semibold">شماره حساب بانکی:</label>
                    <input
                      type="text"
                      dir="ltr"
                      required
                      value={bankAccount}
                      onChange={(e) => setBankAccount(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-mono"
                    />
                  </div>
                </div>
              )}

              {errorMsg && (
                <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsWithdrawOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={isWithdrawing}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isWithdrawing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>در حال ثبت تسویه...</span>
                    </>
                  ) : (
                    <span>تأیید و درخواست برداشت</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
