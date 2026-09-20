# بنیاد آذرخش — راهنمای انتقال پروژه

این فایل همراه با کد پروژه نگهداری می‌شود تا بازطراحی در گفت‌وگوی دیگر بدون حدس‌زدن یا بازسازی از روی اسکرین‌شات انجام شود.

## منبع کد
- GitHub: Muhsiny/azarakhsh-foundation
- Branch: main
- فایل‌های کامل کد، APIها، پنل مدیریت، پایگاه داده، Worker و تمام assets در همین repository هستند.

## فناوری
- React / TypeScript
- Vite / Vinext
- Drizzle ORM
- Cloudflare Workers
- Cloudflare D1
- Cloudflare KV

## سرویس میزبانی
- Provider: Cloudflare Workers
- Worker/service name: azarakhsh-foundation
- Entry point: worker/index.ts
- تنظیمات و bindingها: wrangler.jsonc

## اجرای محلی
Node.js 22.13+:
`npm ci`
`npm run dev`

تست کامل:
`npm run verify`

Build:
`npm run build`

## انتشار
پس از احراز هویت Wrangler با حساب Cloudflare مقصد:
`npm run deploy`
یا:
`npx wrangler deploy`

برای GitHub Actions نیز credentialها باید در Secrets/Variables محیط مربوط تنظیم شوند، نه داخل کد.

## محرمانه‌ها
هیچ رمز، API token، private key، فایل .env یا credential محرمانه‌ای عمداً در این پروژه/بسته قرار داده نشده است. رمزها و کلیدها باید جداگانه در محیط مقصد تنظیم شوند.

## تصاویر
تمام تصاویر و assets موجود در `public/` بخشی از نسخه واقعی پروژه‌اند؛ از جمله لوگو، تصاویر آرشیوی، تصاویر رهبر، تصاویر پرونده شورای اتفاق، آیکون‌ها و reference assets.

## قاعده بازطراحی
این repository منبع اصلی کد است. فایل ناقص را از روی تصویر، حافظه یا حدس بازسازی نکنید؛ ابتدا فایل واقعی همین repository را بررسی کنید.
