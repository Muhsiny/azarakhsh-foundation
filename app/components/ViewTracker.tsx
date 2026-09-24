"use client";

import { useEffect } from "react";

export default function ViewTracker({ postId }: { postId: number }) {
  useEffect(() => {
    const key = `azarakhsh:view:${postId}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      // Private browsing/storage denial should not prevent the page from working.
    }

    void fetch(`/api/posts/${postId}/view`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      keepalive: true,
    }).catch(() => undefined);
  }, [postId]);

  return null;
}
