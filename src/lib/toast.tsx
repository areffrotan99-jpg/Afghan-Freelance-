import { useSyncExternalStore } from 'react';

export type ToastKind = 'success' | 'error' | 'info' | 'warning';
export interface ToastItem {
  id: string;
  message: string;
  kind: ToastKind;
}

let items: ToastItem[] = [];
const listeners = new Set<() => void>();
let snapshot = '[]';

function publish() {
  snapshot = JSON.stringify(items);
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function toast(message: string, kind: ToastKind = 'success') {
  const id = Math.random().toString(36).slice(2);
  items = [...items, { id, message, kind }];
  publish();
  window.setTimeout(() => {
    items = items.filter((t) => t.id !== id);
    publish();
  }, kind === 'error' ? 6000 : 3500);
}

export function Toaster() {
  useSyncExternalStore(subscribe, () => snapshot, () => snapshot);
  const list: ToastItem[] = JSON.parse(snapshot);
  const tone: Record<ToastKind, string> = {
    success: 'bg-emerald-600',
    error: 'bg-rose-600',
    info: 'bg-slate-800',
    warning: 'bg-amber-600',
  };
  return (
    <div className="fixed bottom-5 left-5 z-[100] flex flex-col gap-2 no-print" dir="rtl">
      {list.map((t) => (
        <div
          key={t.id}
          className={`${tone[t.kind]} max-w-sm rounded-xl px-4 py-3 text-sm font-medium text-white shadow-lg shadow-black/20`}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
