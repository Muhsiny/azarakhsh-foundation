import { NextRequest, NextResponse } from "next/server";

const leaderTopicTargets: Record<string, string> = {
  life: "/beheshti",
  works: "/beheshti#section-6",
  speeches: "/beheshti",
  thought: "/beheshti#section-11",
  memories: "/beheshti",
  gallery: "/beheshti",
};

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  if (pathname === "/publications") {
    const topic = searchParams.get("topic");
    const target = topic ? leaderTopicTargets[topic] : undefined;

    if (target) {
      const [targetPath, hash] = target.split("#");
      const url = request.nextUrl.clone();
      url.pathname = targetPath;
      url.search = "";
      url.hash = hash ? `#${hash}` : "";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/publications"],
};
