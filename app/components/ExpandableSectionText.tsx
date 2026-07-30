"use client";

import { useState } from "react";

export default function ExpandableSectionText({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <p
        style={
          expanded
            ? undefined
            : {
                display: "-webkit-box",
                WebkitBoxOrient: "vertical",
                WebkitLineClamp: 3,
                overflow: "hidden",
              }
        }
      >
        {text}
      </p>
      <button
        type="button"
        onClick={() => setExpanded((current) => !current)}
        aria-expanded={expanded}
        style={{
          marginTop: 8,
          padding: 0,
          border: 0,
          background: "transparent",
          color: "var(--gold-500, #c7a45b)",
          font: "inherit",
          fontWeight: 700,
          cursor: "pointer",
        }}
      >
        {expanded ? "کمتر" : "بیشتر"}
      </button>
    </>
  );
}
