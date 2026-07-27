import { NextRequest, NextResponse } from "next/server";

const leaderTopicTargets: Record<string, string> = {
  life: "/beheshti",
  works: "/beheshti#section-4",
  speeches: "/beheshti#section-5",
  thought: "/beheshti#section-3",
  memories: "/beheshti#section-7",
  gallery: "/beheshti#section-6",
};

export function proxy(request: NextRequest) {
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

export default proxy;

export const config = {
  matcher: ["/publications"],
};
