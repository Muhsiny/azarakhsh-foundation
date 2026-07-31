"use client";

import { useEffect, useState } from "react";

export default function PublicContributionLink() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    setShow(!location.pathname.startsWith("/admin") && !location.pathname.startsWith("/api") && location.pathname !== "/contribute");
  }, []);
  if (!show) return null;
  return (
    <a
      href="/contribute"
      aria-label="ثبت خاطره، روایت یا سند تاریخی"
      style={{
        position: "fixed", left: 18, bottom: 18, zIndex: 12000, padding: "11px 16px",
        borderRadius: 999, background: "#173f33", color: "#fff", textDecoration: "none",
        boxShadow: "0 10px 30px rgba(0,0,0,.22)", fontWeight: 700, direction: "rtl",
      }}
    >
      ثبت خاطره و سند
    </a>
  );
}
