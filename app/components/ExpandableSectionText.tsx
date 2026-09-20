"use client";

import { useState } from "react";

export default function ExpandableSectionText({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <p
        className="az-expanded-copy"
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
        className="az-expand-button"
        type="button"
        onClick={() => setExpanded((current) => !current)}
        aria-expanded={expanded}

      >
        {expanded ? "کمتر" : "بیشتر"}
      </button>
    </>
  );
}
