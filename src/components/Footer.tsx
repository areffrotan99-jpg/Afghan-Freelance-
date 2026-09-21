import React from 'react';
import {
  ShieldCheck,
  Lock,
  Heart,
  Globe2,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  Sparkles,
  ArrowUp
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { CATEGORIES } from '../data/categories';

interface FooterProps {
  setCurrentTab: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ setCurrentTab }) => {
  const { t, language, setLanguage, dir } = useLanguage();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="w-full bg-slate-950 border-t border-slate-800 text-slate-400 text-xs transition-colors" dir={dir}>
      {/* Afghan Geometric Motif Header Accent */}
      <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-amber-500 via-emerald-600 to-indigo-600 opacity-90" />

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 p-0.5 shadow-md">
                <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
                  <img src="/icon.svg" alt="Afghan Freelance" className="w-7 h-7 object-contain" />
                </div>
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white tracking-tight">{t('brandName')}</h3>
                <p className="text-[10px] text-blue-400 font-medium">{t('brandNameEn')}</p>
              </div>
            </div>

            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              {t('sloganDesc')}
            </p>

            {/* Escrow & Payment Trust Badge */}
            <div className="p-3.5 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-white font-semibold text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>تسویه و پرداخت ۱۰۰٪ امن درگاه حساب‌پی (HesabPay)</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                وجوه پرداختی کارفرمایان تا اتمام پروژه و رضایت کامل در صندوق امانت محفوظ می‌ماند.
              </p>
            </div>

            <div className="flex items-center gap-4 text-slate-400 pt-2 text-[11px]">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-400" /> کابل، هرات، مزارشریف و سراسر جهان
              </span>
            </div>
          </div>

          {/* Quick Categories */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-sm">دسته‌بندی‌های پرطرفدار</h4>
            <ul className="space-y-2 text-xs">
              {CATEGORIES.slice(0, 6).map((c) => (
                <li key={c.id}>
                  <button
                    onClick={() => setCurrentTab('services')}
                    className="hover:text-blue-400 transition"
                  >
                    {language === 'ps' ? c.namePs : language === 'en' ? c.nameEn : c.nameFa}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* For Clients & Freelancers */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-sm">فرصت‌ها و امکانات</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => setCurrentTab('services')} className="hover:text-blue-400 transition">
                  خرید خدمات آماده (Gigs)
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('freelancers')} className="hover:text-blue-400 transition">
                  مشاهده فریلنسرهای برتر
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('projects')} className="hover:text-blue-400 transition">
                  ثبت پروژه و آگهی کار
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('how-it-works')} className="hover:text-blue-400 transition">
                  راهنمای گام‌به‌گام کارفرما
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('wallet')} className="hover:text-blue-400 transition">
                  تسویه مالی با HesabPay
                </button>
              </li>
            </ul>
          </div>

          {/* Trust & Links */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-sm">پشتیبانی و شرایط</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => setCurrentTab('how-it-works')} className="hover:text-blue-400 transition">
                  مرکز قوانین و حل اختلاف
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('how-it-works')} className="hover:text-blue-400 transition">
                  امنیت حساب‌پی و سیاست Escrow
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('how-it-works')} className="hover:text-blue-400 transition">
                  حریم خصوصی و راستی‌آزمایی
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('admin')} className="text-amber-400 hover:text-amber-300 font-medium transition">
                  ورود به پنل مدیریت پلتفرم
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('system-status')} className="text-cyan-400 hover:text-cyan-300 font-medium transition">
                  وضعیت سلامت سرور و APIها
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div className="flex items-center gap-2">
            <span>© {new Date().getFullYear()} افغان فریلنس (Afghan Freelance). تمامی حقوق محفوظ است.</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-slate-400">
              با افتخار برای متخصصان افغانستان <Heart className="w-3 h-3 text-rose-500 inline fill-rose-500" />
            </span>
            <button
              onClick={scrollToTop}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition"
              title="بازگشت به بالا"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
