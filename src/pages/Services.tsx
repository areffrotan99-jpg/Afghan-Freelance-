import React, { useState } from 'react';
import {
  Search,
  Filter,
  Star,
  CheckCircle2,
  Clock,
  RotateCcw,
  ShieldCheck,
  PlusCircle,
  X,
  MessageSquare,
  DollarSign
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';
import { useAuth } from '../context/AuthContext';
import { useMarketplace } from '../context/MarketplaceContext';
import { CATEGORIES } from '../data/categories';
import { ServiceCard } from '../components/cards/ServiceCard';
import { Service } from '../types';

interface ServicesProps {
  initialSearchQuery?: string;
  selectedCategorySlug?: string;
  onOpenChatWithSeller: (freelancerId: string, freelancerName: string) => void;
}

export const Services: React.FC<ServicesProps> = ({
  initialSearchQuery = '',
  selectedCategorySlug = '',
  onOpenChatWithSeller,
}) => {
  const { t, language, dir } = useLanguage();
  const { formatAmount } = useCurrency();
  const { role } = useAuth();
  const { services, placeOrder, createService } = useMarketplace();

  const [search, setSearch] = useState(initialSearchQuery);
  const [selectedCat, setSelectedCat] = useState<string>(selectedCategorySlug);
  const [sortBy, setSortBy] = useState<'rating' | 'price_asc' | 'price_desc' | 'popular'>('rating');

  // Detail Modal State
  const [activeService, setActiveService] = useState<Service | null>(null);
  const [selectedPackageTier, setSelectedPackageTier] = useState<'basic' | 'standard' | 'premium'>('standard');

  // Create Service Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCatId, setNewCatId] = useState('cat-web');
  const [newDesc, setNewDesc] = useState('');
  const [newPriceBasic, setNewPriceBasic] = useState(4000);

  // Filter logic
  const filteredServices = services
    .filter((s) => {
      const matchSearch =
        search === '' ||
        s.title.toLowerCase().includes(search.toLowerCase()) ||
        s.description.toLowerCase().includes(search.toLowerCase()) ||
        s.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));

      const matchCat =
        selectedCat === '' || s.categoryId === selectedCat || s.categoryName === selectedCat;

      return matchSearch && matchCat;
    })
    .sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'price_asc') return a.packages.basic.priceAFN - b.packages.basic.priceAFN;
      if (sortBy === 'price_desc') return b.packages.basic.priceAFN - a.packages.basic.priceAFN;
      return b.reviewCount - a.reviewCount;
    });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    createService({
      title: newTitle,
      categoryId: newCatId,
      categoryName: CATEGORIES.find((c) => c.id === newCatId)?.nameFa || 'خدمات عمومی',
      description: newDesc,
      packages: {
        basic: {
          name: 'basic',
          title: 'بسته پایه',
          description: 'تحویل اولیه مطابق سفارش',
          deliveryDays: 3,
          revisions: 2,
          priceAFN: newPriceBasic,
          priceUSD: Math.round(newPriceBasic / 70.5),
          features: ['تحویل با کیفیت عالی', 'پشتیبانی اولیه'],
        },
        standard: {
          name: 'standard',
          title: 'بسته استاندارد',
          description: 'کامل با امکانات پیشرفته',
          deliveryDays: 6,
          revisions: 4,
          priceAFN: Math.round(newPriceBasic * 2.2),
          priceUSD: Math.round((newPriceBasic * 2.2) / 70.5),
          features: ['فایل‌های سورس کامل', 'پشتیبانی اختصاصی'],
        },
        premium: {
          name: 'premium',
          title: 'بسته VIP حرفه‌ای',
          description: 'جامع‌ترین پکیج با اصلاح نامحدود',
          deliveryDays: 10,
          revisions: 999,
          priceAFN: Math.round(newPriceBasic * 4.5),
          priceUSD: Math.round((newPriceBasic * 4.5) / 70.5),
          features: ['ویرایش نامحدود', 'اولویت تحویل', 'مشاوره اختصاصی'],
        },
      },
    });

    setIsCreateOpen(false);
    setNewTitle('');
    setNewDesc('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8" dir={dir}>
      {/* Top Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            کاتالوگ خدمات تخصصی (Gigs)
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            مشاهده، مقایسه بسته‌ها و سفارش مستقیم پروژه‌ها با تضمین پرداخت حساب‌پی
          </p>
        </div>

        {/* Freelancer Action: Create new Gig */}
        {role === 'freelancer' && (
          <button
            onClick={() => setIsCreateOpen(true)}
            className="py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-md transition self-start md:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            <span>ایجاد خدمت جدید</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="جستجوی عنوان خدمت، مهارت..."
              className="w-full pl-9 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          {/* Category Dropdown */}
          <div>
            <select
              value={selectedCat}
              onChange={(e) => setSelectedCat(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="">همه دسته‌بندی‌ها ({CATEGORIES.length})</option>
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {language === 'ps' ? c.namePs : language === 'en' ? c.nameEn : c.nameFa}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="rating">مرتب‌سازی: بالاترین امتیاز</option>
              <option value="popular">مرتب‌سازی: پرفروش‌ترین</option>
              <option value="price_asc">مرتب‌سازی: ارزان‌ترین</option>
              <option value="price_desc">مرتب‌سازی: گران‌ترین</option>
            </select>
          </div>
        </div>

        {/* Category Pills Slider */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar text-xs">
          <button
            onClick={() => setSelectedCat('')}
            className={`px-3 py-1.5 rounded-xl shrink-0 font-medium transition ${
              selectedCat === ''
                ? 'bg-blue-600 text-white font-bold'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
            }`}
          >
            همه
          </button>
          {CATEGORIES.slice(0, 10).map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCat(c.id)}
              className={`px-3 py-1.5 rounded-xl shrink-0 font-medium transition ${
                selectedCat === c.id
                  ? 'bg-blue-600 text-white font-bold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
              }`}
            >
              {language === 'ps' ? c.namePs : language === 'en' ? c.nameEn : c.nameFa}
            </button>
          ))}
        </div>
      </div>

      {/* Services Grid */}
      {filteredServices.length === 0 ? (
        <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-3xl space-y-3">
          <p className="text-slate-400 text-sm">هیچ خدمتی با فیلترهای مشخص شده یافت نشد.</p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedCat('');
            }}
            className="text-xs text-blue-400 font-semibold"
          >
            پاک کردن فیلترها
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredServices.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onClick={() => setActiveService(service)}
            />
          ))}
        </div>
      )}

      {/* Service Detail Modal */}
      {activeService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-750 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto text-slate-200 shadow-2xl relative">
            {/* Close Button */}
            <button
              onClick={() => setActiveService(null)}
              className="absolute top-4 left-4 z-10 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 sm:p-8">
              {/* Left 2 Cols: Main Content */}
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      {activeService.categoryName}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      {activeService.rating.toFixed(2)} ({activeService.reviewCount} نظر)
                    </span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-black text-white leading-snug">
                    {activeService.title}
                  </h2>
                </div>

                {/* Cover Image */}
                <div className="aspect-[16/10] rounded-2xl overflow-hidden bg-slate-800 border border-slate-750">
                  <img
                    src={activeService.coverImage}
                    alt={activeService.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Freelancer Info Bar */}
                <div className="flex items-center justify-between p-4 bg-slate-800/60 rounded-2xl border border-slate-750">
                  <div className="flex items-center gap-3">
                    <img
                      src={activeService.freelancerAvatar}
                      alt={activeService.freelancerName}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-700"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-sm text-white">{activeService.freelancerName}</h4>
                        <CheckCircle2 className="w-4 h-4 text-blue-400" />
                      </div>
                      <p className="text-xs text-slate-400">@{activeService.freelancerUsername}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onOpenChatWithSeller(activeService.freelancerId, activeService.freelancerName);
                      setActiveService(null);
                    }}
                    className="py-2 px-3.5 rounded-xl bg-slate-700 hover:bg-slate-650 text-white text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
                    <span>ارسال پیام</span>
                  </button>
                </div>

                {/* Description */}
                <div className="space-y-3">
                  <h3 className="font-bold text-sm text-white">درباره این خدمت:</h3>
                  <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                    {activeService.description}
                  </p>
                </div>

                {/* FAQs */}
                {activeService.faq && activeService.faq.length > 0 && (
                  <div className="space-y-3 pt-3 border-t border-slate-800">
                    <h3 className="font-bold text-sm text-white">پرسش‌های متداول (FAQ):</h3>
                    <div className="space-y-2">
                      {activeService.faq.map((f, i) => (
                        <div key={i} className="p-3.5 bg-slate-800/40 rounded-xl border border-slate-800 space-y-1">
                          <h5 className="font-bold text-xs text-blue-300">{f.question}</h5>
                          <p className="text-xs text-slate-400 leading-relaxed">{f.answer}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Col: Package Selector & Checkout Trigger */}
              <div className="space-y-4">
                {/* Package Tabs */}
                <div className="grid grid-cols-3 p-1 bg-slate-800 rounded-xl border border-slate-700 text-xs font-bold text-center">
                  {(['basic', 'standard', 'premium'] as const).map((tier) => (
                    <button
                      key={tier}
                      onClick={() => setSelectedPackageTier(tier)}
                      className={`py-2 rounded-lg transition capitalize ${
                        selectedPackageTier === tier
                          ? 'bg-blue-600 text-white shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {tier}
                    </button>
                  ))}
                </div>

                {/* Active Package Box */}
                {activeService.packages[selectedPackageTier] && (
                  <div className="p-6 bg-slate-800/90 border border-slate-750 rounded-2xl space-y-5">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-sm text-white">
                          {activeService.packages[selectedPackageTier].title}
                        </h4>
                        <p className="text-xs text-slate-400 mt-1">
                          {activeService.packages[selectedPackageTier].description}
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-750 flex items-baseline justify-between">
                      <span className="text-xs text-slate-400">قیمت پکیج:</span>
                      <span className="text-xl font-black text-emerald-400 font-mono">
                        {formatAmount(
                          activeService.packages[selectedPackageTier].priceAFN,
                          activeService.packages[selectedPackageTier].priceUSD
                        )}
                      </span>
                    </div>

                    {/* Delivery & Revisions metadata */}
                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 py-2 border-y border-slate-750">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-blue-400" />
                        <span>تحویل {activeService.packages[selectedPackageTier].deliveryDays} روزه</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <RotateCcw className="w-4 h-4 text-amber-400" />
                        <span>
                          {activeService.packages[selectedPackageTier].revisions >= 999
                            ? 'ویرایش نامحدود'
                            : `${activeService.packages[selectedPackageTier].revisions} بار ویرایش`}
                        </span>
                      </div>
                    </div>

                    {/* Features checklist */}
                    <ul className="space-y-2 text-xs text-slate-300">
                      {activeService.packages[selectedPackageTier].features.map((feat, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Order & Checkout Button */}
                    <button
                      onClick={() => {
                        placeOrder(activeService, selectedPackageTier);
                        setActiveService(null);
                      }}
                      className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>سفارش با پرداخت امن حساب‌پی</span>
                    </button>

                    <p className="text-[11px] text-center text-slate-400 flex items-center justify-center gap-1">
                      <span>ضمانت ۱۰۰٪ بازگشت وجه در صورت عدم رضایت</span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create New Gig Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-750 p-6 rounded-3xl max-w-lg w-full text-slate-200 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="font-bold text-base text-white">افزودن خدمت تخصصی جدید</h3>
              <button onClick={() => setIsCreateOpen(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">عنوان خدمت (Gig Title):</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="مثلاً: طراحی وبسایت فروشگاهی با درگاه HesabPay..."
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">دسته‌بندی:</label>
                <select
                  value={newCatId}
                  onChange={(e) => setNewCatId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-blue-500"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nameFa}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">قیمت پایه بسته Basic (به افغانی):</label>
                <input
                  type="number"
                  required
                  min={500}
                  step={500}
                  value={newPriceBasic}
                  onChange={(e) => setNewPriceBasic(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">توضیحات و نمونه کار:</label>
                <textarea
                  rows={4}
                  required
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="توضیح دهید کارفرما چه چیزی دریافت می‌کند و چرا شما بهترین انتخاب هستید..."
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-750"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold"
                >
                  انتشار خدمت
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
