"use client";

import { useState } from "react";
import { siteSettings } from "../site-settings";

const historicalColorEmblem = siteSettings.media.councilEmblemUrl;
const localFallback = "/media/council-emblem.webp";

export default function HistoricalCouncilEmblem({
  alt,
  className = "",
  width = 1075,
  height = 1100,
}: {
  alt: string;
  className?: string;
  width?: number;
  height?: number;
}) {
  const [src, setSrc] = useState(historicalColorEmblem);

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      width={width}
      height={height}
      loading="lazy"
      onError={() => {
        if (src !== localFallback) setSrc(localFallback);
      }}
    />
  );
}
