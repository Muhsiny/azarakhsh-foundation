"use client";

import { useEffect } from "react";

export default function OfflineBootstrap() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      void navigator.serviceWorker.register("/sw.js");
    }
  }, []);
  return null;
}
