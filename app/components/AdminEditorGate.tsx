"use client";

import { useEffect, useState, type ReactNode } from "react";

export default function AdminEditorGate() {
  const [editor, setEditor] = useState<ReactNode>(null);

  useEffect(() => {
    if (location.pathname.startsWith("/admin")) return;
    let cancelled = false;
    fetch("/api/admin/session", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok || cancelled) return;
        document.dispatchEvent(new CustomEvent("azarakhsh-admin-editor"));
        const { default: Editor } = await import("./UniversalInlineEditorV2");
        if (!cancelled) setEditor(<Editor />);
      })
      .catch(() => undefined);
    return () => { cancelled = true; };
  }, []);

  return editor;
}