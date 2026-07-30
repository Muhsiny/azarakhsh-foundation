"use client";

import { useEffect, useState } from "react";

function targetForPath(pathname: string) {
  if (pathname.startsWith("/beheshti")) return "leader";
  if (pathname.startsWith("/archive")) return "archive";
  if (pathname.startsWith("/publications/")) return "content";
  if (pathname === "/") return "studio";
  return "content";
}

export default function AdminEditShortcut() {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    fetch("/api/admin/posts", { cache: "no-store" })
      .then((response) => setAllowed(response.ok))
      .catch(() => setAllowed(false));
  }, []);

  if (!allowed || typeof window === "undefined") return null;
  const target = targetForPath(window.location.pathname);

  return (
    <a
      href={`/admin?jump=${target}`}
      style={{
        position: "fixed",
        insetInlineEnd: 18,
        bottom: 18,
        zIndex: 9999,
        background: "#c99b3b",
        color: "#041b16",
        padding: "10px 16px",
        borderRadius: 6,
        fontWeight: 700,
        textDecoration: "none",
        boxShadow: "0 8px 24px rgba(0,0,0,.25)",
      }}
    >
      ویرایش این بخش
    </a>
  );
}
