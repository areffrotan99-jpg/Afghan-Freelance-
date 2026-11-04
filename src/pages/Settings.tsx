import { useRef, useState } from 'react';
import { Save, Download, Upload, ShieldCheck, UserPlus, Trash2, KeyRound, Store, Database, History, Smartphone } from 'lucide-react';
import { api, useFetch } from '../lib/api';
import { toast } from '../lib/toast';
import { formatDate, formatMoney, todayISO } from '../lib/format';
import type { Meta, Settings } from '../types';
import { PageHeader } from '../components/PageHeader';
import { Card, CardHeader, Confirm, Field, Modal, Spinner, Badge } from '../components/ui';
import { useAuth } from '../lib/session';
import { JalaliDateInput } from '../components/JalaliDateInput';
import { navigate } from '../lib/router';

interface UserRow {
  id: string;
  username: string;
  name: string;
  role: 'admin' | 'accountant';
  active: boolean;
  createdAt: string;
}

export function SettingsPage() {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'admin';
  const { data: meta, reload: reloadMeta } = useFetch<Meta>('/api/meta');
  const users = useFetch<{ items: UserRow[] }>(isAdmin ? '/api/users' : null);
  const audit = useFetch<{ items: { id: string; at: string; userName: string; action: string; entity: string; details?: string }[] }>(
    isAdmin ? '/api/audit?limit=25' : null,
  );

  const [form, setForm] = useState<Settings | null>(null);
  const settings = form || meta?.settings || null;
  const [savingSettings, setSavingSettings] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  const [userModal, setUserModal] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', name: '', password: '', role: 'accountant' as 'admin' | 'accountant' });
  const [userBusy, setUserBusy] = useState(false);
  const [resetFor, setResetFor] = useState<UserRow | null>(null);
  const [resetPassword, setResetPassword] = useState('');
  const [deleteUser, setDeleteUser] = useState<UserRow | null>(null);

  const [restoreData, setRestoreData] = useState<unknown | null>(null);
  const [restoreConfirm, setRestoreConfirm] = useState('');
  const [capitalOpen, setCapitalOpen] = useState(false);
  const [capital, setCapital] = useState({ amount: '', date: todayISO(), note: '' });
  const fileRef = useRef<HTMLInputElement>(null);

  const patch = (key: keyof Settings, value: string | number) => {
    if (!settings) return;
    setForm({ ...settings, [key]: value });
  };

  const saveSettings = async () => {
    if (!settings) return;
    setSavingSettings(true);
    try {
      await api.put('/api/settings', settings, 'ویرایش تنظیمات');
      toast('تنظیمات ذخیره شد.');
      setForm(null);
      reloadMeta();
    } catch (err) {
      toast(err instanceof Error ? err.message : 'ذخیره ناموفق بود.', 'error');
    } finally {
      setSavingSettings(false);
    }
  };

  const savePassword = async () => {
    if (newPassword.length < 6) {
      toast('رمز جدید باید حداقل ۶ حرف باشد.', 'error');
      return;
    }
    setSavingPassword(true);
    try {
      await api.post('/api/auth/password', { currentPassword, newPassword });
      toast('رمز عبور تغییر کرد.');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'تغییر رمز ناموفق بود.', 'error');
    } finally {
      setSavingPassword(false);
    }
  };

  const createUser = async () => {
    setUserBusy(true);
    try {
      await api.post('/api/users', newUser, 'ثبت کاربر');
      toast('کاربر جدید ثبت شد.');
      setUserModal(false);
      setNewUser({ username: '', name: '', password: '', role: 'accountant' });
      users.reload();
    } catch (err) {
      toast(err instanceof Error ? err.message : 'ثبت ناموفق بود.', 'error');
    } finally {
      setUserBusy(false);
    }
  };

  const toggleUser = async (row: UserRow) => {
    try {
      await api.put(`/api/users/${row.id}`, { active: !row.active }, 'تغییر وضعیت کاربر');
      users.reload();
    } catch (err) {
      toast(err instanceof Error ? err.message : 'عملیات ناموفق بود.', 'error');
    }
  };

  const submitReset = async () => {
    if (!resetFor) return;
    try {
      await api.put(`/api/users/${resetFor.id}`, { password: resetPassword }, 'تغییر رمز کاربر');
      toast('رمز عبور کاربر تغییر کرد.');
      setResetFor(null);
      setResetPassword('');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'عملیات ناموفق بود.', 'error');
    }
  };

  const removeUser = async () => {
    if (!deleteUser) return;
    try {
      await api.del(`/api/users/${deleteUser.id}`);
      toast('کاربر حذف شد.');
      setDeleteUser(null);
      users.reload();
    } catch (err) {
      toast(err instanceof Error ? err.message : 'حذف ناموفق بود.', 'error');
    }
  };

  const onPickBackup = async (file: File) => {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      setRestoreData(parsed?.data ?? parsed);
      setRestoreConfirm('');
    } catch {
      toast('فایل پشتیبان قابل خواندن نیست.', 'error');
    }
  };

  const doRestore = async () => {
    if (restoreConfirm !== 'تایید') {
      toast('برای تأیید عبارت «تایید» را وارد کنید.', 'error');
      return;
    }
    try {
      await api.post('/api/restore', { data: restoreData, confirm: 'RESTORE' });
      toast('اطلاعات بازیابی شد. لطفاً دوباره وارد شوید.');
      await logout();
      window.location.href = '/';
    } catch (err) {
      toast(err instanceof Error ? err.message : 'بازیابی ناموفق بود.', 'error');
    }
  };

  const addCapital = async () => {
    const value = Number(capital.amount);
    if (!value || value <= 0) {
      toast('مبلغ را وارد کنید.', 'error');
      return;
    }
    try {
      await api.post('/api/opening-cash', { amount: value, date: capital.date, note: capital.note }, 'ثبت سرمایه');
      toast('مبلغ به صندوق اضافه شد.');
      setCapitalOpen(false);
      setCapital({ amount: '', date: todayISO(), note: '' });
    } catch (err) {
      toast(err instanceof Error ? err.message : 'ثبت ناموفق بود.', 'error');
    }
  };

  return (
    <div dir="rtl">
      <PageHeader title="تنظیمات و پشتیبان‌گیری" subtitle={`حساب شما: ${user?.name} (${isAdmin ? 'مدیر سیستم' : 'حسابدار'})`} />

      {!settings ? (
        <Spinner />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader title="معلومات داروخانه" subtitle="این معلومات در سر فاکتورهای چاپی نمایش داده می‌شود" icon={<Store size={16} />} />
            <div className="card-pad grid gap-3 sm:grid-cols-2">
              <Field label="نام داروخانه" className="sm:col-span-2">
                <input className="input" value={settings.pharmacyName} onChange={(e) => patch('pharmacyName', e.target.value)} disabled={!isAdmin} />
              </Field>
              <Field label="نام مالک / مسئول">
                <input className="input" value={settings.ownerName} onChange={(e) => patch('ownerName', e.target.value)} disabled={!isAdmin} />
              </Field>
              <Field label="شماره تلفون">
                <input className="input" dir="ltr" value={settings.phone} onChange={(e) => patch('phone', e.target.value)} disabled={!isAdmin} />
              </Field>
              <Field label="آدرس" className="sm:col-span-2">
                <input className="input" value={settings.address} onChange={(e) => patch('address', e.target.value)} disabled={!isAdmin} />
              </Field>
              <Field label="متن پایین فاکتور">
                <input className="input" value={settings.footerNote} onChange={(e) => patch('footerNote', e.target.value)} disabled={!isAdmin} />
              </Field>
              <Field label="حد هشدار موجودی (پیش‌فرض)">
                <input
                  className="input"
                  type="number"
                  dir="ltr"
                  value={settings.lowStockThreshold}
                  onChange={(e) => patch('lowStockThreshold', Number(e.target.value))}
                  disabled={!isAdmin}
                />
              </Field>
              <div className="sm:col-span-2 flex flex-wrap items-center justify-between gap-2">
                <p className="text-[11px] text-slate-500">واحد پول برنامه: افغانی (AFN)</p>
                {isAdmin ? (
                  <button className="btn-primary btn-sm" onClick={saveSettings} disabled={savingSettings || !form}>
                    <Save size={14} /> {savingSettings ? 'در حال ذخیره…' : 'ذخیره تنظیمات'}
                  </button>
                ) : (
                  <span className="text-[11px] text-slate-400">ویرایش تنها توسط مدیر سیستم</span>
                )}
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader title="تغییر رمز عبور" subtitle="رمز خود را دوره‌ای تغییر دهید" icon={<ShieldCheck size={16} />} />
            <div className="card-pad grid gap-3 sm:grid-cols-2">
              <Field label="رمز فعلی">
                <input className="input" type="password" dir="ltr" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
              </Field>
              <Field label="رمز جدید">
                <input className="input" type="password" dir="ltr" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              </Field>
              <div className="sm:col-span-2">
                <button className="btn-outline btn-sm" onClick={savePassword} disabled={savingPassword || !currentPassword || !newPassword}>
                  <KeyRound size={14} /> تغییر رمز
                </button>
              </div>
            </div>
          </Card>

          {isAdmin ? (
            <>
              <Card>
                <CardHeader
                  title="کاربران سیستم"
                  subtitle="دسترسی مدیر و حسابدار"
                  icon={<UserPlus size={16} />}
                  action={
                    <button className="btn-outline btn-sm" onClick={() => setUserModal(true)}>
                      <UserPlus size={14} /> کاربر جدید
                    </button>
                  }
                />
                {users.loading && !users.data ? <Spinner /> : null}
                <div className="overflow-x-auto">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>نام</th>
                        <th>نام کاربری</th>
                        <th>نقش</th>
                        <th>وضعیت</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {(users.data?.items || []).map((row) => (
                        <tr key={row.id}>
                          <td className="font-semibold">{row.name}</td>
                          <td className="num text-xs" dir="ltr">
                            {row.username}
                          </td>
                          <td>
                            <Badge tone={row.role === 'admin' ? 'green' : 'slate'}>{row.role === 'admin' ? 'مدیر' : 'حسابدار'}</Badge>
                          </td>
                          <td>
                            <button
                              type="button"
                              onClick={() => toggleUser(row)}
                              className={`badge ${row.active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}
                            >
                              {row.active ? 'فعال' : 'غیرفعال'}
                            </button>
                          </td>
                          <td>
                            <div className="flex gap-1">
                              <button className="rounded-lg p-1.5 text-sky-600 hover:bg-sky-50" title="تغییر رمز" onClick={() => setResetFor(row)}>
                                <KeyRound size={14} />
                              </button>
                              <button className="rounded-lg p-1.5 text-rose-600 hover:bg-rose-50" title="حذف" onClick={() => setDeleteUser(row)}>
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              <Card>
                <CardHeader title="پشتیبان‌گیری و بازیابی" subtitle="ذخیره کامل اطلاعات در یک فایل" icon={<Database size={16} />} />
                <div className="card-pad space-y-3">
                  <div className="rounded-xl bg-emerald-50 p-3">
                    <p className="text-xs font-bold text-emerald-800">دانلود نسخه پشتیبان</p>
                    <p className="mt-1 text-[11px] text-emerald-700">
                      تمام معاملات، حساب‌ها، ادویه و کاربران در یک فایل JSON ذخیره می‌شود. پیشنهاد می‌شود هفته‌ای یک‌بار نسخه پشتیبان بگیرید.
                    </p>
                    <a href="/api/backup" className="btn-primary btn-sm mt-2 inline-flex" download>
                      <Download size={14} /> دریافت فایل پشتیبان
                    </a>
                  </div>

                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                    <p className="text-xs font-bold text-amber-800">بازیابی از فایل پشتیبان</p>
                    <p className="mt-1 text-[11px] text-amber-700">
                      هشدار: بازیابی، تمام اطلاعات فعلی را با فایل پشتیبان جایگزین می‌کند. پیش از بازیابی از اطلاعات فعلی نسخه پشتیبان بگیرید.
                    </p>
                    <input
                      ref={fileRef}
                      type="file"
                      accept="application/json,.json"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) void onPickBackup(file);
                        e.target.value = '';
                      }}
                    />
                    <button className="btn-outline btn-sm mt-2" onClick={() => fileRef.current?.click()}>
                      <Upload size={14} /> انتخاب فایل پشتیبان
                    </button>
                  </div>

                  <div className="rounded-xl border border-slate-200 p-3">
                    <p className="text-xs font-bold text-slate-700">موجودی اولیه صندوق / سرمایه</p>
                    <p className="mt-1 text-[11px] text-slate-500">اگر صندوق موجودی اولیه دارد یا مالک پول به داروخانه می‌آورد، اینجا ثبت کنید.</p>
                    <button className="btn-outline btn-sm mt-2" onClick={() => setCapitalOpen(true)}>
                      ثبت سرمایه / موجودی اولیه
                    </button>
                  </div>
                </div>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader title="آخرین فعالیت‌ها" subtitle="برای پیگیری تغییرات و جلوگیری از حذف ناخواسته" icon={<History size={16} />} />
                {audit.data && audit.data.items.length > 0 ? (
                  <div className="max-h-72 overflow-auto">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>زمان</th>
                          <th>کاربر</th>
                          <th>عملیات</th>
                          <th>جزئیات</th>
                        </tr>
                      </thead>
                      <tbody>
                        {audit.data.items.map((row) => (
                          <tr key={row.id}>
                            <td className="num whitespace-nowrap text-[11px] text-slate-500">
                              {formatDate(row.at.slice(0, 10))} {row.at.slice(11, 16)}
                            </td>
                            <td className="text-xs font-semibold">{row.userName}</td>
                            <td className="text-xs">{row.action}</td>
                            <td className="max-w-[280px] truncate text-[11px] text-slate-500">{row.details || row.entity}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="px-4 py-4 text-xs text-slate-500">فعالیتی ثبت نشده است.</p>
                )}
              </Card>
            </>
          ) : null}

          <Card className="lg:col-span-2">
            <CardHeader title="نصب روی کمپیوتر، آیفون و آیپد" subtitle="برنامه قابل نصب و استفاده به‌صورت آفلاین است" icon={<Smartphone size={16} />} />
            <div className="card-pad grid gap-3 text-xs leading-6 text-slate-600 sm:grid-cols-3">
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="font-bold text-slate-800">اندروید / کروم</p>
                <p>از منوی مرورگر «افزودن به صفحه اصلی» یا Install App را انتخاب کنید.</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="font-bold text-slate-800">آیفون و آیپد (Safari)</p>
                <p>دکمه اشتراک‌گذاری را بزنید و «Add to Home Screen» را انتخاب کنید.</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="font-bold text-slate-800">ویندوز / کمپیوتر</p>
                <p>در کروم یا Edge آیکون نصب در نوار آدرس را بزنید تا برنامه مثل یک نرم‌افزار باز شود.</p>
              </div>
              <div className="sm:col-span-3">
                <button className="btn-ghost btn-sm text-emerald-700" onClick={() => navigate('/guide')}>
                  مطالعه راهنمای کامل استفاده →
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}

      <Modal
        open={userModal}
        onClose={() => setUserModal(false)}
        size="sm"
        title="کاربر جدید"
        footer={
          <>
            <button className="btn-outline" onClick={() => setUserModal(false)}>
              انصراف
            </button>
            <button className="btn-primary" onClick={createUser} disabled={userBusy}>
              {userBusy ? 'در حال ثبت…' : 'ثبت کاربر'}
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <Field label="نام کامل">
            <input className="input" value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} />
          </Field>
          <Field label="نام کاربری" required>
            <input className="input" dir="ltr" value={newUser.username} onChange={(e) => setNewUser({ ...newUser, username: e.target.value })} />
          </Field>
          <Field label="رمز عبور" required hint="حداقل ۶ حرف">
            <input className="input" dir="ltr" type="password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} />
          </Field>
          <Field label="نقش">
            <select className="input" value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value as 'admin' | 'accountant' })}>
              <option value="accountant">حسابدار (بدون تنظیمات و پشتیبان‌گیری)</option>
              <option value="admin">مدیر سیستم (دسترسی کامل)</option>
            </select>
          </Field>
        </div>
      </Modal>

      <Modal
        open={Boolean(resetFor)}
        onClose={() => setResetFor(null)}
        size="sm"
        title={`تغییر رمز ${resetFor?.name || ''}`}
        footer={
          <>
            <button className="btn-outline" onClick={() => setResetFor(null)}>
              انصراف
            </button>
            <button className="btn-primary" onClick={submitReset}>
              ذخیره
            </button>
          </>
        }
      >
        <Field label="رمز جدید" hint="حداقل ۶ حرف">
          <input className="input" dir="ltr" type="password" value={resetPassword} onChange={(e) => setResetPassword(e.target.value)} />
        </Field>
      </Modal>

      <Modal
        open={capitalOpen}
        onClose={() => setCapitalOpen(false)}
        size="sm"
        title="ثبت سرمایه / موجودی اولیه صندوق"
        footer={
          <>
            <button className="btn-outline" onClick={() => setCapitalOpen(false)}>
              انصراف
            </button>
            <button className="btn-primary" onClick={addCapital}>
              ثبت
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <Field label="مبلغ (افغانی)" required>
            <input
              className="input"
              type="number"
              dir="ltr"
              value={capital.amount}
              onChange={(e) => setCapital({ ...capital, amount: e.target.value })}
              placeholder="0"
            />
          </Field>
          <Field label="تاریخ">
            <JalaliDateInput value={capital.date} onChange={(date) => setCapital({ ...capital, date })} />
          </Field>
          <Field label="شرح">
            <input className="input" value={capital.note} onChange={(e) => setCapital({ ...capital, note: e.target.value })} placeholder="موجودی اولیه صندوق" />
          </Field>
        </div>
      </Modal>

      <Modal
        open={Boolean(restoreData)}
        onClose={() => setRestoreData(null)}
        size="sm"
        title="تأیید بازیابی اطلاعات"
        footer={
          <>
            <button className="btn-outline" onClick={() => setRestoreData(null)}>
              انصراف
            </button>
            <button className="btn-danger" onClick={doRestore} disabled={restoreConfirm !== 'تایید'}>
              بازیابی اطلاعات
            </button>
          </>
        }
      >
        <p className="mb-3 text-sm text-slate-700">
          تمام اطلاعات فعلی حذف و با محتوای فایل پشتیبان جایگزین می‌شود. برای تأیید، کلمه <b>تایید</b> را وارد کنید.
        </p>
        <input className="input" value={restoreConfirm} onChange={(e) => setRestoreConfirm(e.target.value)} placeholder="تایید" />
      </Modal>

      <Confirm
        open={Boolean(deleteUser)}
        title="حذف کاربر"
        message={<>آیا کاربر <b>{deleteUser?.username}</b> حذف شود؟ دسترسی این کاربر به برنامه قطع می‌شود.</>}
        onCancel={() => setDeleteUser(null)}
        onConfirm={removeUser}
      />
    </div>
  );
}
