"use client";

import { useEffect, useState } from "react";

export default function PublicContributionLink() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    setShow(
      location.pathname !== "/" &&
      !location.pathname.startsWith("/admin") &&
      !location.pathname.startsWith("/api") &&
      location.pathname !== "/contribute",
    );
  }, []);
  if (!show) return null;
  return (
    <a
      href="/contribute"
      aria-label="ثبت خاطره، روایت یا سند تاریخی"
      className="public-contribution-link"
    >
      ثبت خاطره و سند
    </a>
  );
}
