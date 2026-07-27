import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  if (pathname === "/publications" && searchParams.get("topic") === "life") {
    const url = request.nextUrl.clone();
    url.pathname = "/beheshti";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/publications"],
};
