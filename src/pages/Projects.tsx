import React, { useState } from 'react';
import {
  Search,
  Filter,
  Send,
  PlusCircle,
  Clock,
  Users,
  X,
  CheckCircle2,
  DollarSign
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';
import { useAuth } from '../context/AuthContext';
import { useMarketplace } from '../context/MarketplaceContext';
import { CATEGORIES } from '../data/categories';
import { ProjectCard } from '../components/cards/ProjectCard';
import { Project } from '../types';

export const Projects: React.FC = () => {
  const { t, language, dir } = useLanguage();
  const { formatAmount } = useCurrency();
  const { role } = useAuth();
  const { projects, proposals, createProject, submitProposal } = useMarketplace();

  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('');

  // Post Project Modal
  const [isPostOpen, setIsPostOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [catId, setCatId] = useState('cat-web');
  const [budgetMin, setBudgetMin] = useState(15000);
  const [budgetMax, setBudgetMax] = useState(30000);
  const [deadline, setDeadline] = useState('۱۴ روز کاری');
  const [description, setDescription] = useState('');
  const [skillsStr, setSkillsStr] = useState('React, TypeScript, HesabPay');

  // Submit Proposal Modal
  const [activeProjectForProposal, setActiveProjectForProposal] = useState<Project | null>(null);
  const [bidAmount, setBidAmount] = useState(20000);
  const [deliveryDays, setDeliveryDays] = useState(7);
  const [coverLetter, setCoverLetter] = useState('');
  const [proposalSuccess, setProposalSuccess] = useState(false);

  const filteredProjects = projects.filter((p) => {
    const matchSearch =
      search === '' ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());

    const matchCat = selectedCat === '' || p.categoryId === selectedCat;
    return matchSearch && matchCat;
  });

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    createProject({
      title,
      categoryId: catId,
      categoryName: CATEGORIES.find((c) => c.id === catId)?.nameFa || 'طراحی و نرم‌افزار',
      budgetMinAFN: Number(budgetMin),
      budgetMaxAFN: Number(budgetMax),
      budgetMinUSD: Math.round(budgetMin / 70.5),
      budgetMaxUSD: Math.round(budgetMax / 70.5),
      deadline,
      description,
      skillsRequired: skillsStr.split(',').map((s) => s.trim()),
    });

    setIsPostOpen(false);
    setTitle('');
    setDescription('');
  };

  const handleSendProposal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProjectForProposal || !coverLetter.trim()) return;

    submitProposal({
      projectId: activeProjectForProposal.id,
      bidAmountAFN: Number(bidAmount),
      bidAmountUSD: Math.round(bidAmount / 70.5),
      deliveryDays: Number(deliveryDays),
      coverLetter,
    });

    setProposalSuccess(true);
    setTimeout(() => {
      setProposalSuccess(false);
      setActiveProjectForProposal(null);
      setCoverLetter('');
    }, 1500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8" dir={dir}>
      {/* Title & Post Project button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            تابلوی پروژه‌ها و فرصت‌های همکاری
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            آگهی‌های ثبت شده توسط کارفرمایان داخلی و بین‌المللی — پیشنهاد قیمت بدهید و کار را تحویل بگیرید
          </p>
        </div>

        <button
          onClick={() => setIsPostOpen(true)}
          className="py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-md transition self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>ثبت پروژه جدید (کارفرما)</span>
        </button>
      </div>

      {/* Filter / Search */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="جستجو در پروژه‌ها..."
              className="w-full pl-9 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          <div>
            <select
              value={selectedCat}
              onChange={(e) => setSelectedCat(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="">همه دسته‌بندی‌ها</option>
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {language === 'ps' ? c.namePs : language === 'en' ? c.nameEn : c.nameFa}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Projects List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredProjects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onSelect={() => {}}
            onSubmitProposal={() => {
              setActiveProjectForProposal(project);
              setBidAmount(project.budgetMinAFN);
            }}
          />
        ))}
      </div>

      {/* Post Project Modal */}
      {isPostOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-750 p-6 sm:p-8 rounded-3xl max-w-lg w-full text-slate-200 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="font-bold text-base text-white">ثبت پروژه جدید (آگهی استخدام فریلنسر)</h3>
              <button onClick={() => setIsPostOpen(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">عنوان پروژه:</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثلاً: طراحی اپلیکیشن صرافی با فلاتر و درگاه HesabPay..."
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">دسته‌بندی:</label>
                <select
                  value={catId}
                  onChange={(e) => setCatId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-blue-500"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nameFa}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">حداقل بودجه (AFN):</label>
                  <input
                    type="number"
                    min={1000}
                    step={1000}
                    value={budgetMin}
                    onChange={(e) => setBudgetMin(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">حداکثر بودجه (AFN):</label>
                  <input
                    type="number"
                    min={budgetMin}
                    step={1000}
                    value={budgetMax}
                    onChange={(e) => setBudgetMax(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">مهلت اجرا:</label>
                <input
                  type="text"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  placeholder="مثلاً: ۱۵ روز کاری"
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">مهارت‌های مورد نیاز (با کاما جدا کنید):</label>
                <input
                  type="text"
                  value={skillsStr}
                  onChange={(e) => setSkillsStr(e.target.value)}
                  placeholder="React, Next.js, Python..."
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">شرح کامل نیازمندی‌های پروژه:</label>
                <textarea
                  rows={4}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="جزئیات اهداف، ابزارها و شرایط تحویل پروژه..."
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPostOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold"
                >
                  انتشار پروژه
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Submit Proposal Modal */}
      {activeProjectForProposal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-750 p-6 sm:p-8 rounded-3xl max-w-lg w-full text-slate-200 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setActiveProjectForProposal(null)}
              className="absolute top-4 left-4 p-1 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-bold text-base text-white">
              ارسال پیشنهاد برای: {activeProjectForProposal.title}
            </h3>

            {proposalSuccess ? (
              <div className="p-6 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h4 className="font-bold text-white">پیشنهاد شما با موفقیت ارسال گردید!</h4>
                <p className="text-xs text-slate-400">کارفرما آن را بررسی و در صورت توافق پاسخ خواهد داد.</p>
              </div>
            ) : (
              <form onSubmit={handleSendProposal} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 mb-1 font-semibold">مبلغ پیشنهادی (AFN):</label>
                    <input
                      type="number"
                      required
                      min={1000}
                      step={1000}
                      value={bidAmount}
                      onChange={(e) => setBidAmount(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1 font-semibold">مدت تحویل (روز):</label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={90}
                      value={deliveryDays}
                      onChange={(e) => setDeliveryDays(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">متن پیشنهاد و سوابق شما (Cover Letter):</label>
                  <textarea
                    rows={4}
                    required
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    placeholder="توضیح دهید چگونه پروژه را به بهترین نحو انجام می‌دهید..."
                    className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveProjectForProposal(null)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                  >
                    انصراف
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>ثبت نهایی پیشنهاد</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
