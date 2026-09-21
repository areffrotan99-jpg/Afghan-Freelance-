import React, { useState, useEffect } from 'react';
import { WifiOff, Check } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const OfflineBanner: React.FC = () => {
  const { dir } = useLanguage();
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div
      className="bg-amber-600 text-white text-xs py-2 px-4 flex items-center justify-center gap-2 sticky top-0 z-50 shadow-md font-medium"
      dir={dir}
    >
      <WifiOff className="w-4 h-4 shrink-0" />
      <span>
        شما در حالت آفلاین هستید. به لطف فناوری PWA، محتوای ذخیره شده در دسترس است و به محض اتصال مجدد، اطلاعات همگام خواهد شد.
      </span>
    </div>
  );
};
