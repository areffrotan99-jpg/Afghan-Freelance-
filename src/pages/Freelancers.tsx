import React, { useState } from 'react';
import {
  Search,
  Filter,
  MapPin,
  Star,
  CheckCircle2,
  X,
  MessageSquare,
  Award,
  Zap,
  Globe,
  Briefcase
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';
import { useMarketplace } from '../context/MarketplaceContext';
import { FreelancerCard } from '../components/cards/FreelancerCard';
import { FreelancerProfile } from '../types';

interface FreelancersProps {
  onOpenChatWith: (freelancer: FreelancerProfile) => void;
}

export const Freelancers: React.FC<FreelancersProps> = ({ onOpenChatWith }) => {
  const { t, dir } = useLanguage();
  const { formatAmount } = useCurrency();
  const { freelancers } = useMarketplace();

  const [search, setSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [activeFreelancer, setActiveFreelancer] = useState<FreelancerProfile | null>(null);

  const allSkills = Array.from(new Set(freelancers.flatMap((f) => f.skills)));
  const allCities = Array.from(new Set(freelancers.map((f) => f.location?.city).filter(Boolean)));

  const filteredFreelancers = freelancers.filter((fl) => {
    const matchSearch =
      search === '' ||
      fl.name.toLowerCase().includes(search.toLowerCase()) ||
      fl.headline.toLowerCase().includes(search.toLowerCase()) ||
      fl.bio.toLowerCase().includes(search.toLowerCase()) ||
      fl.skills.some((s) => s.toLowerCase().includes(search.toLowerCase()));

    const matchCity = selectedCity === '' || fl.location?.city === selectedCity;
    const matchSkill = selectedSkill === '' || fl.skills.includes(selectedSkill);

    return matchSearch && matchCity && matchSkill;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8" dir={dir}>
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          فریلنسرها و متخصصان افغانستان
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          ارتباط مستقیم با کاربلدترین متخصصان دارای هویت تأیید شده، رتبه‌بندی کیفی و سوابق بین‌المللی
        </p>
      </div>

      {/* Filter and Search Box */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="جستجوی نام متخصص یا تخصص..."
              className="w-full pl-9 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          <div>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="">همه شهرها / ولایات</option>
              {allCities.map((city, i) => (
                <option key={i} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="">همه مهارت‌ها ({allSkills.length})</option>
              {allSkills.map((s, i) => (
                <option key={i} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Popular Skills Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
          <button
            onClick={() => setSelectedSkill('')}
            className={`px-3 py-1 rounded-xl shrink-0 transition font-medium ${
              selectedSkill === '' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300'
            }`}
          >
            همه مهارت‌ها
          </button>
          {allSkills.slice(0, 10).map((skill, i) => (
            <button
              key={i}
              onClick={() => setSelectedSkill(skill)}
              className={`px-3 py-1 rounded-xl shrink-0 transition font-medium ${
                selectedSkill === skill ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300'
              }`}
            >
              {skill}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFreelancers.map((fl) => (
          <FreelancerCard
            key={fl.id}
            freelancer={fl}
            onSelect={() => setActiveFreelancer(fl)}
            onMessage={() => onOpenChatWith(fl)}
          />
        ))}
      </div>

      {/* Freelancer Profile Modal */}
      {activeFreelancer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-750 rounded-3xl max-w-2xl w-full p-6 sm:p-8 text-slate-200 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setActiveFreelancer(null)}
              className="absolute top-4 left-4 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Profile Top Card */}
            <div className="flex items-start gap-4">
              <img
                src={activeFreelancer.avatar}
                alt={activeFreelancer.name}
                className="w-20 h-20 rounded-2xl object-cover border border-slate-700 shadow-md"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-white">{activeFreelancer.name}</h3>
                  <CheckCircle2 className="w-5 h-5 text-blue-400" />
                </div>
                <p className="text-xs text-blue-400 font-medium">{activeFreelancer.headline}</p>
                <div className="flex items-center gap-3 text-xs text-slate-400 mt-2">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {activeFreelancer.location?.city}، {activeFreelancer.location?.country}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    {activeFreelancer.rating.toFixed(2)} ({activeFreelancer.reviewCount} نظر)
                  </span>
                </div>
              </div>
            </div>

            {/* Rates & Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 bg-slate-800/60 rounded-2xl border border-slate-750 text-center">
              <div>
                <span className="text-[10px] text-slate-400 block">نرخ ساعتی:</span>
                <span className="text-xs font-mono font-bold text-emerald-400">
                  {formatAmount(activeFreelancer.hourlyRateAFN, activeFreelancer.hourlyRateUSD)}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">سفارشات موفق:</span>
                <span className="text-xs font-bold text-white">{activeFreelancer.completedOrders}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">زمان پاسخ:</span>
                <span className="text-xs font-bold text-white">{activeFreelancer.responseTime}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">وضعیت:</span>
                <span className="text-xs font-bold text-emerald-400">آماده به کار</span>
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <h4 className="font-bold text-xs text-slate-300">درباره متخصص:</h4>
              <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                {activeFreelancer.bio}
              </p>
            </div>

            {/* Skills */}
            <div className="space-y-2">
              <h4 className="font-bold text-xs text-slate-300">مهارت‌های تخصصی:</h4>
              <div className="flex flex-wrap gap-1.5">
                {activeFreelancer.skills.map((s, i) => (
                  <span
                    key={i}
                    className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200 border border-slate-700"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Languages */}
            <div className="space-y-2">
              <h4 className="font-bold text-xs text-slate-300">زبان‌های مسلط:</h4>
              <div className="flex flex-wrap gap-2 text-xs text-slate-300">
                {activeFreelancer.languages.map((l, i) => (
                  <span key={i} className="flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5 text-slate-500" />
                    {l}
                  </span>
                ))}
              </div>
            </div>

            {/* Portfolio Showcase */}
            {activeFreelancer.portfolio && activeFreelancer.portfolio.length > 0 && (
              <div className="space-y-3 pt-3 border-t border-slate-800">
                <h4 className="font-bold text-xs text-slate-300">نمونه کارهای برگزیده (Portfolio):</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {activeFreelancer.portfolio.map((p) => (
                    <div
                      key={p.id}
                      className="p-3 bg-slate-800/60 rounded-xl border border-slate-750 space-y-2"
                    >
                      <img src={p.image} alt={p.title} className="w-full h-28 object-cover rounded-lg" />
                      <h5 className="font-bold text-xs text-white line-clamp-1">{p.title}</h5>
                      <p className="text-[11px] text-slate-400 line-clamp-2">{p.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2 flex gap-3">
              <button
                onClick={() => {
                  onOpenChatWith(activeFreelancer);
                  setActiveFreelancer(null);
                }}
                className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition"
              >
                <MessageSquare className="w-4 h-4" />
                <span>گفتگو و توافق پروژه</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
