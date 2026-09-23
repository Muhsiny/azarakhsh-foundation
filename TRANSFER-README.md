# بنیاد آذرخش — راهنمای انتقال پروژه

## منبع کد
- GitHub: Muhsiny/azarakhsh-foundation
- Branch اصلی: `main`
- repository منبع اصلی کد، APIها، پنل مدیریت، پایگاه داده، Worker و assets است.

## فناوری
- React / TypeScript
- Vite / Vinext
- Drizzle ORM
- Cloudflare Workers
- Cloudflare D1
- Cloudflare KV

## استقرار
- Worker: `azarakhsh-foundation`
- Entry point: `worker/index.ts`
- bindingها و تنظیمات: `wrangler.jsonc`

## اجرای محلی
```
npm ci
npm run dev
```

## بررسی
```
npm run verify
```

## انتشار
```
npm run deploy
```

credentialهای Cloudflare باید در محیط deployment یا GitHub Secrets قرار گیرند و نباید در کد ذخیره شوند.

## قاعدهٔ بازطراحی
برای هر تغییر، فایل واقعی repository مبنا است. کد، asset یا تنظیمات از روی اسکرین‌شات یا حدس بازسازی نمی‌شوند.
