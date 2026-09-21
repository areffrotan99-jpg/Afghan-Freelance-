import React, { useState } from 'react';
import {
  Code,
  Palette,
  FileText,
  Video,
  Languages,
  TrendingUp,
  Brain,
  Building,
  GraduationCap,
  Scale,
  Music,
  Briefcase,
  Search,
  ArrowRight,
  Layers,
  ChevronLeft
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { CATEGORIES } from '../data/categories';

interface CategoriesProps {
  onSelectCategory: (categoryId: string) => void;
}

export const Categories: React.FC<CategoriesProps> = ({ onSelectCategory }) => {
  const { language, dir } = useLanguage();
  const [search, setSearch] = useState('');

  const filtered = CATEGORIES.filter((c) => {
    const term = search.toLowerCase();
    return (
      c.nameFa.toLowerCase().includes(term) ||
      c.namePs.toLowerCase().includes(term) ||
      c.nameEn.toLowerCase().includes(term) ||
      c.descriptionFa.toLowerCase().includes(term) ||
      c.descriptionEn.toLowerCase().includes(term)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8" dir={dir}>
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          دسته‌بندی‌های تخصصی بازار افغان فریلنس
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          ۱۹ حوزه تخصصی جامع با بیش از ۱۵۰ زیرشاخه مهارتی برای پاسخگویی به تمام نیازهای پروژه‌ای شما
        </p>

        {/* Search */}
        <div className="relative max-w-md mx-auto pt-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="جستجوی دسته‌بندی یا مهارت خاص..."
            className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((cat) => (
          <div
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className="group bg-slate-900 border border-slate-800 hover:border-blue-500/60 rounded-2xl p-6 transition-all duration-300 cursor-pointer flex flex-col justify-between hover:shadow-xl hover:shadow-blue-500/10"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-blue-600/10 text-blue-400 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center transition">
                  <Layers className="w-6 h-6" />
                </div>
                <span className="text-xs text-slate-400 font-mono bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-750">
                  {cat.serviceCount} خدمت فعال
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition">
                  {language === 'ps' ? cat.namePs : language === 'en' ? cat.nameEn : cat.nameFa}
                </h3>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  {language === 'en' ? cat.descriptionEn : cat.descriptionFa}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-blue-400 group-hover:text-blue-300 font-medium">
              <span>مشاهده همه خدمات این بخش</span>
              <ChevronLeft className="w-4 h-4 rtl:rotate-0 ltr:rotate-180" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
