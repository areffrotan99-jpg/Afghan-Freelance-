import { useState } from 'react';
import { Lock, User as UserIcon, Loader2 } from 'lucide-react';
import { useAuth } from '../lib/session';

export function Login() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(username.trim(), password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ورود ناموفق بود.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-900 px-4 py-10">
      <div className="pointer-events-none absolute -top-32 right-1/4 h-80 w-80 rounded-full bg-emerald-600/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 left-1/4 h-80 w-80 rounded-full bg-teal-500/20 blur-3xl" />

      <div className="relative w-full max-w-sm">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-900/40">
            <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </div>
          <h1 className="text-xl font-extrabold text-white">فروتن درملتون</h1>
          <p className="mt-1 text-xs text-slate-400">سیستم حسابداری و مدیریت مالی داروخانه</p>
        </div>

        <form onSubmit={submit} className="card space-y-4 p-6">
          <div>
            <label className="label">نام کاربری</label>
            <div className="relative">
              <UserIcon size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                className="input pr-9"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                placeholder="admin"
                required
                dir="ltr"
              />
            </div>
          </div>
          <div>
            <label className="label">رمز عبور</label>
            <div className="relative">
              <Lock size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                className="input pr-9"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                placeholder="••••••••"
                required
                dir="ltr"
              />
            </div>
          </div>

          {error ? <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">{error}</p> : null}

          <button type="submit" className="btn-primary w-full py-2.5" disabled={busy}>
            {busy ? <Loader2 size={16} className="animate-spin" /> : null}
            {busy ? 'در حال ورود…' : 'ورود به سیستم'}
          </button>

          <div className="rounded-xl bg-slate-50 p-3 text-center text-[11px] leading-5 text-slate-500">
            ورود پیش‌فرض مدیر: نام کاربری <span className="font-bold text-slate-700">admin</span> و رمز عبور{' '}
            <span className="font-bold text-slate-700">admin123</span>
            <br />
            پس از اولین ورود، رمز را از بخش تنظیمات تغییر دهید.
          </div>
        </form>

        <p className="mt-5 text-center text-[11px] text-slate-500">اطلاعات شما به‌صورت محلی و امن ذخیره می‌گردد.</p>
      </div>
    </div>
  );
}
