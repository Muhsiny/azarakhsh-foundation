"use client";

import { useEffect } from "react";

export default function OfflineBootstrap() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      void navigator.serviceWorker
        .register("/sw.js", { updateViaCache: "none" })
        .then((registration) => registration.update())
        .catch(() => undefined);
    }
  }, []);
  return null;
}
