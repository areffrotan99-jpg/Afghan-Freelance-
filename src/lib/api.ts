import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';

/* ------------------------------------------------------------------ */
/*  لایه ارتباط با سرور + کش محلی + صف ارسال در حالت آفلاین            */
/* ------------------------------------------------------------------ */
const CACHE_KEY = 'frotan.cache.v2';
const OUTBOX_KEY = 'frotan.outbox.v2';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export class OfflineQueuedError extends Error {
  constructor(message = 'اینترنت قطع است؛ اطلاعات در حافظه دستگاه ذخیره شد و پس از اتصال دوباره به‌طور خودکار ارسال می‌شود.') {
    super(message);
  }
}

type Listener = () => void;
const listeners = new Set<Listener>();
let syncVersion = 0;
export const syncState = { online: typeof navigator === 'undefined' ? true : navigator.onLine, pending: 0, flushing: false, lastSync: '' };

export function subscribeSync(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
function emit() {
  syncVersion += 1;
  listeners.forEach((l) => l());
}
export function getSyncSnapshot() {
  return `${syncVersion}|${syncState.online}|${syncState.pending}|${syncState.flushing}`;
}
export function useSync() {
  useSyncExternalStore(subscribeSync, getSyncSnapshot, getSyncSnapshot);
  return { ...syncState, version: syncVersion };
}

/* ------------------------------ کش ------------------------------ */
function readCache(): Record<string, { at: number; data: unknown }> {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
  } catch {
    return {};
  }
}
export function getCached<T>(path: string): T | null {
  const all = readCache();
  return (all[path]?.data as T) ?? null;
}
function writeCacheEntry(path: string, data: unknown) {
  const all = readCache();
  all[path] = { at: Date.now(), data };
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(all));
  } catch {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ [path]: all[path] }));
    } catch {
      /* storage full — ignore */
    }
  }
}
export function clearCache() {
  localStorage.removeItem(CACHE_KEY);
}

/* ------------------------------ صف آفلاین ------------------------------ */
export interface OutboxItem {
  id: string;
  method: 'POST' | 'PUT' | 'DELETE';
  path: string;
  body?: unknown;
  key: string;
  at: string;
  label: string;
}

export function readOutbox(): OutboxItem[] {
  try {
    return JSON.parse(localStorage.getItem(OUTBOX_KEY) || '[]');
  } catch {
    return [];
  }
}
function writeOutbox(items: OutboxItem[]) {
  localStorage.setItem(OUTBOX_KEY, JSON.stringify(items));
  syncState.pending = items.length;
  emit();
}
function enqueue(item: Omit<OutboxItem, 'id' | 'at'>) {
  const queued: OutboxItem = { ...item, id: Math.random().toString(36).slice(2), at: new Date().toISOString() };
  writeOutbox([...readOutbox(), queued]);
}

/* ------------------------------ درخواست ------------------------------ */
async function rawRequest(method: string, path: string, body?: unknown, headers: Record<string, string> = {}) {
  const res = await fetch(path, {
    method,
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  let payload: unknown = null;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = null;
  }
  if (!res.ok) {
    const message = (payload as { error?: string })?.error || `خطای سرور (${res.status})`;
    throw new ApiError(message, res.status);
  }
  return payload;
}

export const api = {
  async get<T>(path: string): Promise<T> {
    try {
      const data = await rawRequest('GET', path);
      writeCacheEntry(path, data);
      return data as T;
    } catch (err) {
      if (err instanceof ApiError) throw err;
      const cached = getCached<T>(path);
      if (cached) return cached;
      throw new ApiError('اتصال به سرور برقرار نشد و اطلاعات ذخیره‌شده‌ای برای این بخش وجود ندارد.', 0);
    }
  },

  async write<T>(method: 'POST' | 'PUT' | 'DELETE', path: string, body?: unknown, label = 'تغییر اطلاعات'): Promise<T> {
    const key = `${method}-${path}-${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
    if (!navigator.onLine) {
      enqueue({ method, path, body, key, label });
      throw new OfflineQueuedError();
    }
    try {
      const data = await rawRequest(method, path, body, { 'Idempotency-Key': key });
      clearCache();
      emit();
      return data as T;
    } catch (err) {
      if (err instanceof ApiError) throw err;
      enqueue({ method, path, body, key, label });
      throw new OfflineQueuedError();
    }
  },

  post<T>(path: string, body?: unknown, label?: string) {
    return this.write<T>('POST', path, body, label);
  },
  put<T>(path: string, body?: unknown, label?: string) {
    return this.write<T>('PUT', path, body, label);
  },
  del<T>(path: string) {
    return this.write<T>('DELETE', path);
  },
};

export async function flushOutbox() {
  if (syncState.flushing) return;
  const items = readOutbox();
  if (items.length === 0) {
    syncState.pending = 0;
    return;
  }
  syncState.flushing = true;
  emit();
  const remaining: OutboxItem[] = [];
  for (let i = 0; i < items.length; i += 1) {
    const item = items[i];
    try {
      await rawRequest(item.method, item.path, item.body, { 'Idempotency-Key': item.key });
      clearCache();
    } catch (err) {
      if (err instanceof ApiError && err.status >= 400 && err.status < 500) {
        // خطای منطقی: این مورد قابل ارسال دوباره نیست و کنار گذاشته می‌شود
        continue;
      }
      remaining.push(...items.slice(i));
      break;
    }
  }
  syncState.flushing = false;
  syncState.lastSync = new Date().toISOString();
  writeOutbox(remaining);
  emit();
}

if (typeof window !== 'undefined') {
  syncState.pending = readOutbox().length;
  window.addEventListener('online', () => {
    syncState.online = true;
    emit();
    void flushOutbox();
  });
  window.addEventListener('offline', () => {
    syncState.online = false;
    emit();
  });
  window.setInterval(() => {
    if (navigator.onLine && readOutbox().length > 0) void flushOutbox();
  }, 20000);
}

/* ------------------------------ هوک‌ها ------------------------------ */
export function useFetch<T>(path: string | null) {
  const { version } = useSync();
  const [data, setData] = useState<T | null>(() => (path ? getCached<T>(path) : null));
  const [loading, setLoading] = useState(Boolean(path));
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!path) {
      setData(null);
      setLoading(false);
      return;
    }
    let alive = true;
    setLoading(true);
    api
      .get<T>(path)
      .then((result) => {
        if (!alive) return;
        setData(result);
        setError(null);
      })
      .catch((err: Error) => {
        if (alive) setError(err.message);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [path, tick, version]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { data, loading, error, reload };
}
