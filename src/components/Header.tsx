import React, { useState } from 'react';
import {
  Search,
  Bell,
  Wallet,
  Globe,
  Sun,
  Moon,
  Menu,
  X,
  Shield,
  Briefcase,
  UserCheck,
  ChevronDown,
  Layers,
  Sparkles,
  DollarSign,
  Heart,
  MessageSquare,
  Package,
  PlusCircle,
  ExternalLink,
  Settings
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useMarketplace } from '../context/MarketplaceContext';
import { PWAInstallButton } from './PWAInstallButton';
import { UserRole } from '../types';

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenSearch?: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentTab, setCurrentTab, onOpenSearch }) => {
  const { language, setLanguage, t, dir } = useLanguage();
  const { currency, setCurrency, formatAmount } = useCurrency();
  const { theme, toggleTheme } = useTheme();
  const { currentUser, role, switchRole, logout } = useAuth();
  const { notifications, wallet, markNotificationAsRead } = useMarketplace();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const unreadNotifs = notifications.filter((n) => !n.isRead);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setCurrentTab('services');
      if (onOpenSearch) onOpenSearch(searchQuery);
    }
  };

  const navLinks = [
    { id: 'home', label: t('navHome') },
    { id: 'services', label: t('navServices') },
    { id: 'freelancers', label: t('navFreelancers') },
    { id: 'projects', label: t('navProjects') },
    { id: 'categories', label: t('navCategories') },
    { id: 'how-it-works', label: t('navHowItWorks') },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-md transition-colors">
      {/* Top Banner: Currency, Slogan & Quick Role Switcher */}
      <div className="bg-slate-950/70 border-b border-slate-800/40 px-4 py-1.5 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-blue-400 font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t('slogan')}</span>
            </span>
            <span className="hidden md:inline text-slate-600">|</span>
            <span className="hidden md:inline text-emerald-400 font-mono text-[11px]">
              درگاه حساب‌پی (HesabPay) فعال است
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Role Tester Selector */}
            <div className="relative">
              <button
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-[11px] transition"
                title="تغییر نقش کاربری جهت تست آسان تمام امکانات"
              >
                {role === 'client' && <Briefcase className="w-3 h-3 text-cyan-400" />}
                {role === 'freelancer' && <UserCheck className="w-3 h-3 text-emerald-400" />}
                {role === 'admin' && <Shield className="w-3 h-3 text-amber-400" />}
                <span>
                  {role === 'client' ? 'نقش: کارفرما' : role === 'freelancer' ? 'نقش: فریلنسر' : 'نقش: ادمین'}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {roleMenuOpen && (
                <div
                  className="absolute top-full mt-1 left-0 sm:right-0 w-44 bg-slate-800 border border-slate-700 rounded-xl shadow-xl py-1 z-50 text-slate-200"
                  onClick={() => setRoleMenuOpen(false)}
                >
                  <div className="px-3 py-1 text-[10px] text-slate-400 font-bold border-b border-slate-700">
                    تغییر سریع نقش (تست زنده):
                  </div>
                  <button
                    onClick={() => switchRole('client')}
                    className="w-full text-right px-3 py-1.5 text-xs hover:bg-slate-700 flex items-center gap-2 text-cyan-300"
                  >
                    <Briefcase className="w-3.5 h-3.5" /> کارفرما (Client)
                  </button>
                  <button
                    onClick={() => switchRole('freelancer')}
                    className="w-full text-right px-3 py-1.5 text-xs hover:bg-slate-700 flex items-center gap-2 text-emerald-300"
                  >
                    <UserCheck className="w-3.5 h-3.5" /> فریلنسر (Freelancer)
                  </button>
                  <button
                    onClick={() => switchRole('admin')}
                    className="w-full text-right px-3 py-1.5 text-xs hover:bg-slate-700 flex items-center gap-2 text-amber-300"
                  >
                    <Shield className="w-3.5 h-3.5" /> مدیریت ارشد (Admin)
                  </button>
                </div>
              )}
            </div>

            {/* Currency Switcher */}
            <div className="flex items-center rounded-lg bg-slate-800/80 p-0.5 border border-slate-700">
              <button
                onClick={() => setCurrency('AFN')}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
                  currency === 'AFN' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                AFN ؋
              </button>
              <button
                onClick={() => setCurrency('USD')}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
                  currency === 'USD' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                USD $
              </button>
            </div>

            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="flex items-center gap-1 text-[11px] text-slate-300 hover:text-white px-2 py-0.5 rounded bg-slate-800/60 border border-slate-700"
              >
                <Globe className="w-3 h-3 text-slate-400" />
                <span>{language === 'fa' ? 'دری' : language === 'ps' ? 'پښتو' : 'EN'}</span>
                <ChevronDown className="w-2.5 h-2.5" />
              </button>
              {langMenuOpen && (
                <div
                  className="absolute top-full mt-1 left-0 w-24 bg-slate-800 border border-slate-700 rounded-lg shadow-xl py-1 z-50"
                  onClick={() => setLangMenuOpen(false)}
                >
                  <button
                    onClick={() => setLanguage('fa')}
                    className={`w-full text-right px-3 py-1 text-xs hover:bg-slate-700 ${
                      language === 'fa' ? 'text-blue-400 font-bold' : 'text-slate-300'
                    }`}
                  >
                    دری
                  </button>
                  <button
                    onClick={() => setLanguage('ps')}
                    className={`w-full text-right px-3 py-1 text-xs hover:bg-slate-700 ${
                      language === 'ps' ? 'text-blue-400 font-bold' : 'text-slate-300'
                    }`}
                  >
                    پښتو
                  </button>
                  <button
                    onClick={() => setLanguage('en')}
                    className={`w-full text-right px-3 py-1 text-xs hover:bg-slate-700 ${
                      language === 'en' ? 'text-blue-400 font-bold' : 'text-slate-300'
                    }`}
                  >
                    English
                  </button>
                </div>
              )}
            </div>

            {/* Dark / Light Toggle */}
            <button
              onClick={toggleTheme}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
              title="تغییر تم"
            >
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-300" />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Brand Name */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setCurrentTab('home')}
              className="flex items-center gap-2.5 text-left transition group"
            >
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 p-0.5 shadow-md shadow-blue-500/20 group-hover:scale-105 transition transform">
                <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center overflow-hidden">
                  <img src="/icon.svg" alt="Afghan Freelance" className="w-8 h-8 object-contain" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-base tracking-tight text-white group-hover:text-blue-400 transition">
                  {t('brandName')}
                </span>
                <span className="text-[10px] text-slate-400 font-medium tracking-wide">
                  {t('brandNameEn')}
                </span>
              </div>
            </button>
          </div>

          {/* Search Bar (Desktop) */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden lg:flex flex-1 max-w-md mx-2 relative items-center"
          >
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('heroSearchPlaceholder')}
                className="w-full pl-10 pr-4 py-2 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
              />
              <button
                type="submit"
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Center Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-1 text-xs font-medium text-slate-300">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => setCurrentTab(link.id)}
                className={`px-3 py-2 rounded-xl transition ${
                  currentTab === link.id
                    ? 'text-white bg-slate-800 font-semibold shadow-inner'
                    : 'hover:text-white hover:bg-slate-800/50'
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Action Buttons & User Menu */}
          <div className="flex items-center gap-2">
            {/* PWA Install */}
            <PWAInstallButton />

            {/* Wallet Quick Button */}
            <button
              onClick={() => setCurrentTab('wallet')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-mono transition"
              title={t('navWallet')}
            >
              <Wallet className="w-3.5 h-3.5 text-emerald-400" />
              <span>{formatAmount(wallet.balanceAFN, wallet.balanceUSD)}</span>
            </button>

            {/* Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifs.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                )}
              </button>

              {notifOpen && (
                <div
                  className="absolute top-full mt-2 left-0 sm:right-0 w-80 bg-slate-900 border border-slate-750 rounded-2xl shadow-2xl p-3 z-50 space-y-2 text-slate-200"
                  dir={dir}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="font-bold text-xs">اعلانات و پیام‌ها</span>
                    <span className="text-[11px] text-blue-400 font-medium">
                      {unreadNotifs.length} پیام خوانده نشده
                    </span>
                  </div>
                  <div className="max-h-60 overflow-y-auto space-y-1.5 divide-y divide-slate-800/50">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => {
                          markNotificationAsRead(n.id);
                          if (n.link) setCurrentTab(n.link.replace('/', ''));
                          setNotifOpen(false);
                        }}
                        className={`p-2 rounded-xl cursor-pointer text-xs transition ${
                          n.isRead ? 'opacity-70 hover:bg-slate-800/40' : 'bg-slate-800/70 hover:bg-slate-800'
                        }`}
                      >
                        <div className="font-semibold text-white">{n.title}</div>
                        <p className="text-[11px] text-slate-400 mt-0.5">{n.message}</p>
                        <span className="text-[10px] text-slate-500 mt-1 block">{n.createdAt}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Dashboard / User Avatar */}
            {currentUser && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (role === 'admin') setCurrentTab('admin');
                    else if (role === 'freelancer') setCurrentTab('dashboard-freelancer');
                    else setCurrentTab('dashboard-client');
                  }}
                  className="flex items-center gap-2 p-1 pl-2 sm:pl-3 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 transition"
                >
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-7 h-7 rounded-lg object-cover"
                  />
                  <div className="hidden sm:flex flex-col text-right">
                    <span className="text-xs font-semibold text-white leading-tight max-w-[100px] truncate">
                      {currentUser.name}
                    </span>
                    <span className="text-[10px] text-slate-400 capitalize">{role}</span>
                  </div>
                </button>
              </div>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-900 px-4 py-4 space-y-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('heroSearchPlaceholder')}
              className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
            />
            <button type="submit" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <Search className="w-4 h-4" />
            </button>
          </form>

          <div className="grid grid-cols-2 gap-2 pt-2">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => {
                  setCurrentTab(link.id);
                  setMobileMenuOpen(false);
                }}
                className={`p-2.5 rounded-xl text-right text-xs font-medium ${
                  currentTab === link.id ? 'bg-blue-600 text-white font-bold' : 'bg-slate-800 text-slate-300'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
            <button
              onClick={() => {
                setCurrentTab('wallet');
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-1.5 text-emerald-400 font-mono"
            >
              <Wallet className="w-4 h-4" />
              <span>کیف پول: {formatAmount(wallet.balanceAFN, wallet.balanceUSD)}</span>
            </button>

            <button
              onClick={() => {
                if (role === 'admin') setCurrentTab('admin');
                else if (role === 'freelancer') setCurrentTab('dashboard-freelancer');
                else setCurrentTab('dashboard-client');
                setMobileMenuOpen(false);
              }}
              className="text-blue-400 font-medium"
            >
              مشاهده داشبورد →
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
