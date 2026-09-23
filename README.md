# بنیاد آذرخش

وب‌سایت رسمی بنیاد آذرخش، مستقر بر Cloudflare Workers.

## اجرای پروژه

- نصب: `npm ci`
- توسعه: `npm run dev`
- بررسی کامل: `npm run verify`
- ساخت production: `npm run build`
- انتشار: `npm run deploy`

## زیرساخت

- Cloudflare Workers
- Cloudflare D1 با binding `DB`
- Cloudflare KV با binding `MEDIA`
- Vite / Vinext
- React / TypeScript
- Drizzle ORM

تنظیمات Cloudflare فقط در `wrangler.jsonc` و محیط deployment نگه‌داری می‌شوند. رمزها و tokenها نباید داخل repository قرار گیرند.
