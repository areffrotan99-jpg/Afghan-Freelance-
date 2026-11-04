import { useEffect, useState } from 'react';

/* مسیریابی سبک بر پایه History API */
const NAV_EVENT = 'frotan:navigate';

export function navigate(to: string) {
  if (typeof window === 'undefined') return;
  if (window.location.pathname === to) return;
  window.history.pushState({}, '', to);
  window.dispatchEvent(new Event(NAV_EVENT));
  window.scrollTo({ top: 0 });
}

export function usePath(): string {
  const [path, setPath] = useState(() => (typeof window === 'undefined' ? '/' : window.location.pathname));
  useEffect(() => {
    const onChange = () => setPath(window.location.pathname);
    window.addEventListener('popstate', onChange);
    window.addEventListener(NAV_EVENT, onChange);
    return () => {
      window.removeEventListener('popstate', onChange);
      window.removeEventListener(NAV_EVENT, onChange);
    };
  }, []);
  return path;
}
