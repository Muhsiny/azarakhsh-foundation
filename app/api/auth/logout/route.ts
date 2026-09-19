import { expiredSessionCookies } from "../../../admin-auth";

export async function POST(request: Request) {
  const headers = new Headers({
    Location: new URL("/", request.url).toString(),
    "Cache-Control": "no-store, private",
  });
  for (const cookie of expiredSessionCookies()) {
    headers.append("Set-Cookie", cookie);
  }
  return new Response(null, { status: 303, headers });
}

export async function GET(request: Request) {
  // Backward-compatible logout link. It only clears cookies and never mutates data.
  return POST(request);
}
