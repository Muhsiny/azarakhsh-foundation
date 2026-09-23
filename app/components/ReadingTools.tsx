"use client";

import { useState, type MouseEvent } from "react";

export default function ReadingTools() {
  const [large, setLarge] = useState(false);

  function toggleSize(event: MouseEvent<HTMLButtonElement>) {
    const next = !large;
    setLarge(next);
    const article = event.currentTarget.closest("article");
    if (article) article.style.setProperty("--reading-size", next ? "20px" : "17.5px");
  }

  return (
    <div className="az-reader-controls" data-inline-static aria-label="ابزارهای مطالعه">
      <button type="button" aria-pressed={large} onClick={toggleSize}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 18 10 6h4l5 12M7.5 13h9" /></svg>
        <span>{large ? "اندازهٔ عادی" : "متن درشت"}</span>
      </button>
      <button type="button" onClick={() => window.print()}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 8V4h10v4M7 17H5v-7h14v7h-2M8 14h8v6H8z" /></svg>
        <span>چاپ</span>
      </button>
    </div>
  );
}
