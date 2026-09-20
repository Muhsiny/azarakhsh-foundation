const ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="14" fill="#173f33"/>
  <path d="M18 45 31.5 15 46 45h-7l-3-7H27l-3 7h-6Zm11.5-13h4L31.5 27l-2 5Z" fill="#e2c672"/>
</svg>`;

export function GET() {
  return new Response(ICON, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=604800",
    },
  });
}