"use client";
import { useState } from "react";
export default function ReadingTools() {
  const [large, setLarge] = useState(false);
  return <div className="az-reader-controls" data-inline-static><button type="button" aria-pressed={large} onClick={event => { const next = !large; setLarge(next); const article = event.currentTarget.closest("article"); if (article) article.style.setProperty("--reading-size", next ? "21px" : "17px"); }}>درشت‌کردن متن</button><button type="button" onClick={() => window.print()}>چاپ مطلب</button></div>;
}
