import React from 'react';
import { motion } from 'motion/react';
import {
  Search,
  ShieldCheck,
  Zap,
  Award,
  Users,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Globe2,
  ChevronLeft,
  DollarSign,
  Lock,
  Compass
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';
import { useMarketplace } from '../context/MarketplaceContext';
import { CATEGORIES } from '../data/categories';
import { ServiceCard } from '../components/cards/ServiceCard';
import { FreelancerCard } from '../components/cards/FreelancerCard';
import { ProjectCard } from '../components/cards/ProjectCard';
import { Service, FreelancerProfile, Project } from '../types';

interface HomeProps {
  setCurrentTab: (tab: string) => void;
  onSelectService: (service: Service) => void;
  onSelectFreelancer: (freelancer: FreelancerProfile) => void;
  onSelectProject: (project: Project) => void;
  onOpenChatWith: (freelancer: FreelancerProfile) => void;
  onSubmitProposal: (project: Project) => void;
}

export const Home: React.FC<HomeProps> = ({
  setCurrentTab,
  onSelectService,
  onSelectFreelancer,
  onSelectProject,
  onOpenChatWith,
  onSubmitProposal,
}) => {
  const { t, language, dir } = useLanguage();
  const { formatAmount } = useCurrency();
  const { services, freelancers, projects } = useMarketplace();

  const featuredServices = services.slice(0, 4);
  const topFreelancers = freelancers.slice(0, 3);
  const openProjects = projects.slice(0, 2);

  return (
    <div className="space-y-16 pb-16" dir={dir}>
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-16 md:pt-14 md:pb-24 border-b border-slate-800/60 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950">
        {/* Subtle geometric background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-blue-600/10 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Tagline Badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-300 text-xs font-semibold shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>بازار رسمی فریلنسینگ متخصصان افغانستان</span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight sm:leading-tight"
            >
              {t('heroTitle')}
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto"
            >
              {t('heroSubtitle')}
            </motion.p>

            {/* Search Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="pt-2 max-w-2xl mx-auto"
            >
              <div className="relative flex items-center bg-slate-800/90 border border-slate-700 p-2 rounded-2xl shadow-xl shadow-black/40 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
                <input
                  type="text"
                  placeholder={t('heroSearchPlaceholder')}
                  className="w-full bg-transparent px-4 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') setCurrentTab('services');
                  }}
                />
                <button
                  onClick={() => setCurrentTab('services')}
                  className="py-2.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 transition shadow-md shadow-blue-600/30 shrink-0"
                >
                  <Search className="w-4 h-4" />
                  <span>{t('heroSearchBtn')}</span>
                </button>
              </div>

              {/* Quick Tags */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-3 text-xs text-slate-400">
                <span className="text-slate-500">{t('heroPopularTags')}</span>
              </div>
            </motion.div>

            {/* CTA Dual Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
              <button
                onClick={() => setCurrentTab('freelancers')}
                className="py-3 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-600/25 transition"
              >
                <span>{t('heroBtnFind')}</span>
                <ChevronLeft className="w-4 h-4 rtl:rotate-0 ltr:rotate-180" />
              </button>
              <button
                onClick={() => setCurrentTab('services')}
                className="py-3 px-6 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 font-bold text-xs flex items-center gap-2 transition"
              >
                <span>{t('heroBtnWork')}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Key Pillars Stats Ribbon */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-sm">
          <div className="flex items-center gap-3 p-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="text-base sm:text-lg font-black text-white font-mono">۲,۵۰۰+</div>
              <div className="text-xs text-slate-400">متخصص تأیید هویت شده</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-base sm:text-lg font-black text-white font-mono">۱۲,۰۰۰+</div>
              <div className="text-xs text-slate-400">سفارش موفق بین‌المللی</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="text-base sm:text-lg font-black text-white font-mono">۹۹.۴٪</div>
              <div className="text-xs text-slate-400">رضایت کامل کارفرمایان</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3">
            <div className="w-11 h-11 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="text-base sm:text-lg font-black text-white font-mono">HesabPay</div>
              <div className="text-xs text-slate-400">صندوق امانی ۱۰۰٪ امن</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Explore Categories (Visual Cards) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {t('secCategoriesTitle')}
            </h2>
            <p className="text-xs text-slate-400 mt-1">{t('secCategoriesSub')}</p>
          </div>
          <button
            onClick={() => setCurrentTab('categories')}
            className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 transition"
          >
            <span>{t('viewAll')} (۱۹ دسته‌بندی)</span>
            <ChevronLeft className="w-3.5 h-3.5 rtl:rotate-0 ltr:rotate-180" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {CATEGORIES.slice(0, 6).map((cat) => (
            <div
              key={cat.id}
              onClick={() => setCurrentTab('services')}
              className="group relative bg-slate-900 border border-slate-800 hover:border-blue-500/60 rounded-2xl p-4 transition-all duration-300 cursor-pointer overflow-hidden text-center flex flex-col items-center justify-center space-y-2 hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/10"
            >
              <div className="w-12 h-12 rounded-xl bg-slate-800 group-hover:bg-blue-600/20 text-slate-300 group-hover:text-blue-400 flex items-center justify-center transition">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-xs text-white group-hover:text-blue-400 transition line-clamp-1">
                {language === 'ps' ? cat.namePs : language === 'en' ? cat.nameEn : cat.nameFa}
              </h3>
              <span className="text-[10px] text-slate-500">{cat.serviceCount} خدمت فعال</span>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Featured Services (Ready-to-Order Gigs) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-bold">
                انتخاب برتر
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {t('secFeaturedServicesTitle')}
            </h2>
            <p className="text-xs text-slate-400 mt-1">{t('secFeaturedServicesSub')}</p>
          </div>
          <button
            onClick={() => setCurrentTab('services')}
            className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 transition"
          >
            <span>{t('viewAll')}</span>
            <ChevronLeft className="w-3.5 h-3.5 rtl:rotate-0 ltr:rotate-180" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {featuredServices.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onClick={() => onSelectService(service)}
            />
          ))}
        </div>
      </section>

      {/* 5. Afghan Cultural & Economic Empowerment Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden border border-slate-750 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 p-8 sm:p-12 text-slate-200">
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="text-amber-400 text-xs font-bold tracking-wider uppercase flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> ماموریت ما
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-white leading-snug">
              {t('secCultureBannerTitle')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {t('secCultureBannerDesc')}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 text-xs">
              <div className="flex items-center gap-2 text-slate-200 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>تسویه حساب سریع به افغانی یا دالر</span>
              </div>
              <div className="flex items-center gap-2 text-slate-200 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>حفظ هویت و مالکیت معنوی پروژه‌ها</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Top Verified Freelancers */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {t('secTopFreelancersTitle')}
            </h2>
            <p className="text-xs text-slate-400 mt-1">{t('secTopFreelancersSub')}</p>
          </div>
          <button
            onClick={() => setCurrentTab('freelancers')}
            className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 transition"
          >
            <span>{t('viewAll')}</span>
            <ChevronLeft className="w-3.5 h-3.5 rtl:rotate-0 ltr:rotate-180" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {topFreelancers.map((fl) => (
            <FreelancerCard
              key={fl.id}
              freelancer={fl}
              onSelect={() => onSelectFreelancer(fl)}
              onMessage={() => onOpenChatWith(fl)}
            />
          ))}
        </div>
      </section>

      {/* 7. Open Projects (Jobs) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {t('secLatestProjectsTitle')}
            </h2>
            <p className="text-xs text-slate-400 mt-1">{t('secLatestProjectsSub')}</p>
          </div>
          <button
            onClick={() => setCurrentTab('projects')}
            className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 transition"
          >
            <span>{t('viewAll')}</span>
            <ChevronLeft className="w-3.5 h-3.5 rtl:rotate-0 ltr:rotate-180" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {openProjects.map((prj) => (
            <ProjectCard
              key={prj.id}
              project={prj}
              onSelect={() => onSelectProject(prj)}
              onSubmitProposal={() => onSubmitProposal(prj)}
            />
          ))}
        </div>
      </section>

      {/* 8. How HesabPay Escrow Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-12 space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-xl sm:text-2xl font-black text-white">
              امنیت کامل با صندوق امانت (Escrow) و حساب‌پی
            </h2>
            <p className="text-xs text-slate-400">چهار گام شفاف تا تحویل بی‌دغدغه پروژه شما</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-750 space-y-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-black text-sm flex items-center justify-center">
                ۱
              </div>
              <h4 className="font-bold text-sm text-white">ثبت سفارش یا پروژه</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                خدمت دلخواه را انتخاب کرده یا پروژه خود را با شرایط و بودجه موردنظر منتشر کنید.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-750 space-y-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-black text-sm flex items-center justify-center">
                ۲
              </div>
              <h4 className="font-bold text-sm text-white">سپرده‌گذاری در HesabPay</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                مبلغ در درگاه رسمی حساب‌پی پرداخت شده و نزد افغان فریلنس تا پایان کار امانت می‌ماند.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-750 space-y-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-black text-sm flex items-center justify-center">
                ۳
              </div>
              <h4 className="font-bold text-sm text-white">انجام و تحویل کار</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                فریلنسر با کیفیت بالا پروژه را انجام داده و فایل‌های نهایی را برای بررسی ارسال می‌کند.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-750 space-y-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-black text-sm flex items-center justify-center">
                ۴
              </div>
              <h4 className="font-bold text-sm text-white">تأیید و آزادسازی وجه</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                پس از رضایت شما از نتیجه، وجه بلافاصله به کیف پول فریلنسر منتقل می‌گردد.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
