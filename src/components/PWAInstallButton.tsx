import React, { useState, useEffect } from 'react';
import { Download, Check, Share, PlusSquare, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const PWAInstallButton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { t, dir } = useLanguage();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const isIos = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (isInstalled) return;

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setIsInstalled(true);
      }
    } else if (isIos) {
      setShowIosGuide(true);
    } else {
      // Direct instruction fallback
      alert(dir === 'rtl' ? 'برای نصب اپلیکیشن، در مرورگر خود گزینه "Install" یا "Add to Home screen" را انتخاب فرمایید.' : 'To install, click your browser menu and choose "Install App" or "Add to Home screen".');
    }
  };

  if (isInstalled) {
    return (
      <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
        <Check className="w-3.5 h-3.5" />
        <span className="text-[11px] font-medium">{dir === 'rtl' ? 'اپلیکیشن نصب شده' : 'App Installed'}</span>
      </span>
    );
  }

  return (
    <>
      <button
        onClick={handleInstallClick}
        title={t('pwaInstallTitle')}
        className={`inline-flex items-center gap-2 rounded-xl transition font-medium ${
          compact
            ? 'p-2 text-slate-300 hover:text-white hover:bg-slate-800'
            : 'px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-750'
        }`}
      >
        <Download className="w-4 h-4 text-cyan-400" />
        {!compact && <span>{t('installApp')}</span>}
      </button>

      {/* iOS Safari Guide Modal */}
      {showIosGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" dir={dir}>
          <div className="bg-slate-900 border border-slate-750 p-6 rounded-2xl max-w-sm w-full text-slate-200 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-base text-white">{t('pwaInstallTitle')}</h4>
              <button onClick={() => setShowIosGuide(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              برای نصب اپلیکیشن در آیفون یا آیپد:
            </p>
            <ol className="text-xs space-y-3 text-slate-300 list-decimal list-inside bg-slate-800/60 p-3.5 rounded-xl border border-slate-700">
              <li className="flex items-center gap-2">
                <span>۱. روی دکمه اشتراک‌گذاری</span>
                <Share className="w-4 h-4 text-blue-400 inline" />
                <span>در نوار سافاری ضربه بزنید.</span>
              </li>
              <li className="flex items-center gap-2">
                <span>۲. به پایین اسکرول کرده و گزینه</span>
                <PlusSquare className="w-4 h-4 text-blue-400 inline" />
                <span>«Add to Home Screen» را بزنید.</span>
              </li>
              <li>۳. گزینه «Add» را در بالا انتخاب فرمایید.</li>
            </ol>
            <button
              onClick={() => setShowIosGuide(false)}
              className="w-full py-2.5 rounded-xl bg-blue-600 text-white font-medium text-xs hover:bg-blue-500"
            >
              متوجه شدم
            </button>
          </div>
        </div>
      )}
    </>
  );
};
