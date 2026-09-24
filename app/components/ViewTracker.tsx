"use client";

import { useEffect } from "react";

export default function ViewTracker({ postId }: { postId: number }) {
  useEffect(() => {
    const controller = new AbortController();
    void fetch(`/api/posts/${postId}/view`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
      keepalive: true,
      signal: controller.signal,
    }).catch(() => undefined);
    return () => controller.abort();
  }, [postId]);

  return null;
}
