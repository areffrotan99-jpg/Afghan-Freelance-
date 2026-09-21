import React, { useState } from 'react';
import {
  ShieldCheck,
  CreditCard,
  Lock,
  CheckCircle2,
  Users,
  Briefcase,
  HelpCircle,
  FileCheck,
  ChevronDown
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const HowItWorks: React.FC = () => {
  const { dir } = useLanguage();
  const [activeTab, setActiveTab] = useState<'client' | 'freelancer' | 'escrow'>('escrow');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12" dir={dir}>
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-semibold border border-blue-500/20">
          <ShieldCheck className="w-4 h-4" />
          <span>امنیت و اعتماد ۱۰۰٪ تضمین شده</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
          چگونه در افغان فریلنس با خیال آسوده کار کنیم؟
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          راهنمای جامع صندوق امانی (Escrow)، درگاه حساب‌پی، حقوق کارفرما و فریلنسر
        </p>

        {/* Tab switcher */}
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setActiveTab('escrow')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'escrow'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
            }`}
          >
            سیستم امانی HesabPay
          </button>
          <button
            onClick={() => setActiveTab('client')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'client'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
            }`}
          >
            راهنمای کارفرمایان
          </button>
          <button
            onClick={() => setActiveTab('freelancer')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'freelancer'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
            }`}
          >
            راهنمای فریلنسرها
          </button>
        </div>
      </div>

      {/* Escrow Tab */}
      {activeTab === 'escrow' && (
        <div className="space-y-8">
          <div className="p-8 bg-slate-900 border border-slate-800 rounded-3xl space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">سازوکار صندوق امانی حساب‌پی (Escrow)</h3>
                <p className="text-xs text-slate-400">هیچ پولی مستقیماً جابجا نمی‌شود تا زمانی که کار تأیید شود</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              <div className="p-5 bg-slate-800/50 rounded-2xl border border-slate-750 space-y-2">
                <div className="text-blue-400 font-black text-sm">مرحله ۱: واریز امن</div>
                <h4 className="font-bold text-sm text-white">قفل شدن مبلغ در صندوق</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  کارفرما هنگام ثبت سفارش، هزینه را از طریق اپ حساب‌پی یا کارت بانکی واریز می‌کند. پول نزد پلتفرم قفل می‌گردد.
                </p>
              </div>

              <div className="p-5 bg-slate-800/50 rounded-2xl border border-slate-750 space-y-2">
                <div className="text-blue-400 font-black text-sm">مرحله ۲: اطمینان فریلنسر</div>
                <h4 className="font-bold text-sm text-white">شروع کار با خیال راحت</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  فریلنسر مطمئن است وجه در صندوق موجود است و با انگیزه کامل کار باکیفیت را در مهلت تعیین‌شده انجام می‌دهد.
                </p>
              </div>

              <div className="p-5 bg-slate-800/50 rounded-2xl border border-slate-750 space-y-2">
                <div className="text-emerald-400 font-black text-sm">مرحله ۳: آزادسازی</div>
                <h4 className="font-bold text-sm text-white">تأیید و پرداخت نهایی</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  پس از بررسی کار توسط کارفرما و رضایت کامل، مبلغ فوراً به کیف پول فریلنسر واریز و قابل تسویه بانکی می‌شود.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Client Tab */}
      {activeTab === 'client' && (
        <div className="space-y-6">
          <div className="p-8 bg-slate-900 border border-slate-800 rounded-3xl space-y-6">
            <h3 className="text-lg font-bold text-white">مزایای کارفرمایان در افغان فریلنس</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-750 space-y-1">
                <h4 className="font-bold text-blue-400">تنوع خدمات و پکیج‌های شفاف</h4>
                <p className="text-slate-400">قیمت و مشخصات بسته‌ها از قبل معین است؛ بدون هزینه‌های پنهان.</p>
              </div>
              <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-750 space-y-1">
                <h4 className="font-bold text-blue-400">گارانتی بازگشت وجه</h4>
                <p className="text-slate-400">در صورت عدم انطباق کار با نیازمندی‌ها، کل وجه بازگردانده می‌شود.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Freelancer Tab */}
      {activeTab === 'freelancer' && (
        <div className="space-y-6">
          <div className="p-8 bg-slate-900 border border-slate-800 rounded-3xl space-y-6">
            <h3 className="text-lg font-bold text-white">چرا متخصصان افغان این پلتفرم را ترجیح می‌دهند؟</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-750 space-y-1">
                <h4 className="font-bold text-emerald-400">درآمد مستقیم بدون واسطه‌های غیررسمی</h4>
                <p className="text-slate-400">دسترسی به درگاه بومی حساب‌پی و واریز مستقیم به تمام بانک‌های افغانستان.</p>
              </div>
              <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-750 space-y-1">
                <h4 className="font-bold text-emerald-400">حفاظت از زحمات شما</h4>
                <p className="text-slate-400">کارفرما موظف به پرداخت از قبل در صندوق است و بدقولی مالی وجود ندارد.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
