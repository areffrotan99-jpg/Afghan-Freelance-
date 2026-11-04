# فروتن درملتون — یادداشت‌های محیط توسعه (Base44)

## این برنامه چیست
سیستم حسابداری داروخانه: React 19 + Vite (SPA، RTL، فارسی/دری) و بک‌اند Express در `server.ts` با ماژول‌های `server/*`.
تمام داده‌ها در یک فایل JSON پایدار (`DATA_DIR/frotan-db.json`) با نوشتن اتمیک ذخیره می‌شوند؛ هیچ سرویس خارجی لازم نیست.

## اجرا
```
docker compose -f docker-compose.base44.yml up -d --build
```
- سرویس `app`: `node:22-slim`، bind-mount سورس، `npm install --legacy-peer-deps` سپس `npm run dev` (`tsx server.ts`) روی پورت ۳۰۰۰.
- داده‌ها در volume `frotan-data` روی `/data` (`DATA_DIR=/data`) — خارج از سورس تا در گیت ثبت نشود.
- `npm install --legacy-peer-deps` لازم است چون Vite 8 به esbuild بالاتر از نسخه pin‌شده در package.json نیاز دارد.

## نکات مهم
- **ورود پیش‌فرض:** `admin` / `admin123` (کاربر در اولین بوت ساخته می‌شود). تغییر رمز از تنظیمات.
- **بدون Secret:** برنامه با صفر اعتبارنامه بالا می‌آید. `.base44/environment.json` هیچ secret الزامی ندارد؛ `env_file` با `required: false` وصل شده است.
- **Vite middleware mode:** HMR و دارایی‌ها از طریق همان سرور Express سرو می‌شوند؛ `__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS` به‌صورت خالی پاس داده می‌شود تا میزبان پیش‌نمایش پذیرفته شود.
- **حسابداری:** هر سند دوطرفه است و در `server/accounting.ts` اعتبارسنجی توازن انجام می‌شود. حذف/ویرایش = ابطال سند (`status: 'reversed'`)؛ مانده‌ها فقط از اسناد `active` محاسبه می‌شوند.
- **موجودی/بهای تمام‌شده:** خرید ⇒ میانگین موزون؛ فروش ⇒ کاهش موجودی و ثبت COGS در همان سند.
- **همگام‌سازی آفلاین:** صف در localStorage (`frotan.outbox.v2`)، کلید Idempotency برای هر نوشتن، و `rev` برای تشخیص تعارض.
- **healthcheck:** `GET /api/health` → `{status:'ok'}`.
- **تاریخ:** ذخیره میلادی (`YYYY-MM-DD`)، نمایش و ورود شمسی (افغانی: حمل…حوت) از `src/lib/format.ts`.

## بررسی درستی
```
curl http://localhost:3000/api/health
curl -c /tmp/c.txt -H 'Content-Type: application/json' -d '{"username":"admin","password":"admin123"}' http://localhost:3000/api/auth/login
curl -b /tmp/c.txt http://localhost:3000/api/dashboard
```
گردش کامل: ورود → ثبت ادویه → خرید → فروش نقدی/نسیه → دریافت قرض → مصرف → گزارش سود و زیان → دفتر کل.

## تست و لینت
```
docker compose -f docker-compose.base44.yml exec -T app npx tsc --noEmit
```
